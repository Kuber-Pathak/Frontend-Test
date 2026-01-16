import { useState } from "react";
import Cookies from "js-cookie";
import {
  ChatRequest,
  ChatResponse,
  Message,
  ClarificationRequest,
  Roadmap,
} from "@/types";

export type LoadingStatus = "idle" | "analyzing" | "generating" | "done";

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState<LoadingStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (content: string) => {
    setIsLoading(true);
    setLoadingStatus("analyzing");
    setError(null);

    // Add user message immediately
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      type: "text",
    };
    setMessages((prev) => [...prev, userMsg]);

    // Add initial assistant message placeholder for streaming
    const assistantId = (Date.now() + 1).toString();
    const assistantMsg: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
      type: "text", // Start as text, might upgrade to roadmap later
    };
    setMessages((prev) => [...prev, assistantMsg]);

    try {
      // 1. Prepare Payload
      const conversationHistory = messages.map((m) => {
        let msgContent: string;
        if (typeof m.content === "string") {
          msgContent = m.content;
        } else if (
          m.content &&
          typeof m.content === "object" &&
          "question" in m.content
        ) {
          msgContent = (m.content as { question: string }).question;
        } else {
          msgContent = "";
        }
        return { role: m.role, content: msgContent };
      });
      conversationHistory.push({ role: "user", content });

      const payload: ChatRequest = {
        message: content,
        conversation_history: conversationHistory,
      };

      // 2. Call Streaming API using Node.js proxy
      // Note: Using fetch for streaming
      const response = await fetch("http://localhost:4000/api/roadmap/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token") || ""}`, // Ensure auth
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";
      let fullContent = "";

      // 3. Process Stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        // Process line by line for SSE
        const lines = buffer.split("\n");
        // Keep the last partial line in buffer
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;

          // SSE format often is "data: {...}" but raw bytes output might be simple json objects per line if not strictly SSE formatted by the server code I reviewed earlier.
          // Wait, the node controller used res.write without "data: " prefix effectively for chunks?
          // Let's check the Node controller implementation:
          // `res.write(chunk)` where chunk came from FastAPI stream.
          // FastAPI `process_chat_stream` yields `json.dumps({...}) + "\n"`.
          // So the stream contains raw JSON objects separate by newlines?
          // Wait, FastAPI `StreamingResponse` with `media_type="text/event-stream"` usually expects standard SSE format `data: ...\n\n`.
          // But `process_chat_stream` yields `json.dumps({"event":..., "data":...}) + "\n"`.
          // This creates a stream of JSON lines. Node simply proxies it.
          // So we should parse each line as JSON.

          try {
            const cleanedLine = line.startsWith("data:")
              ? line.slice(5).trim()
              : line;
            if (!cleanedLine) continue;
            const eventData = JSON.parse(cleanedLine);

            if (eventData.event === "status") {
              setLoadingStatus("analyzing"); // or custom status text if supported
              // Could visualize status update if UI supported it
            } else if (eventData.event === "token") {
              const token = eventData.data;
              fullContent += token;

              setLoadingStatus("generating");

              // Update message content incrementally
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantId
                    ? { ...msg, content: fullContent }
                    : msg
                )
              );
            } else if (eventData.event === "error") {
              throw new Error(eventData.data);
            }
          } catch (e) {
            console.error("[useChat] JSON Parse Error:", e, "Line:", line);
            // Sometimes chunk boundaries split a JSON line?
            // We rely on buffering, but "json + \n" should work with line split unless chunk splits the line itself.
            // Buffer logic handles splitting.
          }
        }
      }

      // 4. Finalize
      setLoadingStatus("done");

      // Try to parse full content as roadmap to switch type
      try {
        // Remove Markdown code blocks
        let jsonStr = fullContent.trim();
        if (jsonStr.startsWith("```json")) jsonStr = jsonStr.slice(7);
        if (jsonStr.startsWith("```")) jsonStr = jsonStr.slice(3);
        if (jsonStr.endsWith("```")) jsonStr = jsonStr.slice(0, -3);

        const roadmapData = JSON.parse(jsonStr.trim());
        if (roadmapData.phases) {
          // Switch message type to roadmap
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantId
                ? {
                    ...msg,
                    type: "roadmap",
                    roadmap: {
                      title: roadmapData.goal,
                      goal: roadmapData.goal,
                      proficiency: roadmapData.proficiency,
                      phases: roadmapData.phases,
                    },
                  }
                : msg
            )
          );
        }
      } catch (e) {
        // Keep as text if not valid roadmap JSON
        console.log("Response was not a valid roadmap JSON, keeping as text");
      }
    } catch (err: any) {
      setError(err.message || "Failed to send message");
      console.error(err);
      // Remove the temp assistant message or show error in it?
    } finally {
      setIsLoading(false);
      setLoadingStatus("idle");
    }
  };

  const loadRoadmapConversation = (roadmap: any) => {
    console.log("[useChat] Loading roadmap:", roadmap);

    // Clear existing messages
    setMessages([]);

    // Add the original user query
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: roadmap.goal || roadmap.message || "Show me a roadmap",
      type: "text",
    };

    // Get roadmap data - it's stored in roadmapData field
    let roadmapContent = roadmap.roadmapData || roadmap.content;

    console.log("[useChat] Raw roadmapData:", roadmapContent);
    console.log("[useChat] Type:", typeof roadmapContent);

    // Parse if it's a JSON string
    if (typeof roadmapContent === "string") {
      try {
        // Clean markdown code blocks if present
        const cleanedContent = roadmapContent
          .replace(/^```json\s*/, "")
          .replace(/^```\s*/, "")
          .replace(/\s*```$/, "");

        roadmapContent = JSON.parse(cleanedContent);
        console.log("[useChat] Parsed roadmap content:", roadmapContent);
      } catch (e) {
        console.error("[useChat] Failed to parse roadmap content:", e);
        // Try parsing assuming it might be just unescaped
        try {
          roadmapContent = JSON.parse(
            roadmapContent
              .replace(/\\n/g, "\\n")
              .replace(/\\'/g, "\\'")
              .replace(/\\"/g, '\\"')
              .replace(/\\&/g, "\\&")
              .replace(/\\r/g, "\\r")
              .replace(/\\t/g, "\\t")
              .replace(/\\b/g, "\\b")
              .replace(/\\f/g, "\\f")
          );
        } catch (e2) {
          roadmapContent = {};
        }
      }
    }

    // The roadmapData contains the full FastAPI response
    // Extract phases from it
    const phases = Array.isArray(roadmapContent?.phases)
      ? roadmapContent.phases
      : [];

    console.log("[useChat] Extracted phases:", phases);
    console.log("[useChat] Number of phases:", phases.length);

    // Add the roadmap response
    const roadmapMessage: Message = {
      id: `roadmap-${Date.now()}`,
      role: "assistant",
      content: "",
      type: "roadmap",
      roadmap: {
        title: roadmap.title || roadmapContent?.goal || "Roadmap",
        goal: roadmap.goal || roadmapContent?.goal || "",
        proficiency:
          roadmap.proficiency || roadmapContent?.proficiency || "beginner",
        phases: phases,
        // Include other fields from FastAPI response
        total_estimated_hours: roadmapContent?.total_estimated_hours,
        key_technologies: roadmapContent?.key_technologies,
        prerequisites: roadmapContent?.prerequisites,
        next_steps: roadmapContent?.next_steps,
      },
    };

    console.log("[useChat] Created roadmap message:", roadmapMessage);
    console.log(
      "[useChat] Roadmap phases in message:",
      roadmapMessage.roadmap?.phases
    );
    setMessages([userMessage, roadmapMessage]);
  };

  return {
    messages,
    isLoading,
    loadingStatus,
    error,
    sendMessage,
    loadRoadmapConversation,
  };
}
