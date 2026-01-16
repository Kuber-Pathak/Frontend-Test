"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChatList } from "@/src/components/ChatList";
import { ChatMessage } from "@/src/components/ChatMessage";
import { chatService, ChatSession, Message } from "@/src/services/chat.service";
import { roadmapService } from "@/src/services/roadmap.service";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { Sparkles, ChevronRight, ArrowUp } from "lucide-react";
import {
  isContentEvent,
  isStatusEvent,
  isErrorEvent,
} from "@/src/types/stream.types";

export default function ChatPage() {
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [strictMode, setStrictMode] = useState(true); // Default to strict
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { user } = useAuth();
  const userId = user?.id;

  useEffect(() => {
    if (userId) {
      loadChats();
    }
  }, [userId]);

  useEffect(() => {
    if (selectedChatId) {
      loadMessages(selectedChatId);
      loadChatDetails(selectedChatId);
    }
  }, [selectedChatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadChats = async () => {
    if (!userId) return;
    try {
      setIsLoading(true);
      const fetchedChats = await chatService.getChats(userId);
      // Ensure we always have an array
      setChats(Array.isArray(fetchedChats) ? fetchedChats : []);

      if (!selectedChatId && fetchedChats.length > 0) {
        setSelectedChatId(fetchedChats[0].id);
      }
    } catch (error: any) {
      // Handle 401 errors silently (user not authenticated)
      if (error?.response?.status === 401) {
        console.log("User not authenticated, please log in");
        setChats([]);
      } else {
        console.error("Failed to load chats:", error);
        setChats([]); // Set empty array on error
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (chatId: string) => {
    try {
      const fetchedMessages = await chatService.getChatMessages(chatId);
      setMessages(fetchedMessages);
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };

  const loadChatDetails = async (chatId: string) => {
    try {
      const chat = await chatService.getChat(chatId);
      // We could update the chats list or just log it for now
      // This ensures we have the freshest data for the current chat
      console.log("Loaded chat details:", chat);
    } catch (error) {
      console.error("Failed to load chat details:", error);
    }
  };

  const handleNewChat = () => {
    setSelectedChatId(null);
    setMessages([]);
    setInputMessage("");
  };

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
  };

  const handleDeleteChat = async (chatId: string) => {
    if (!confirm("Are you sure you want to delete this chat?")) return;

    try {
      await chatService.deleteChat(chatId);
      setChats(chats.filter((c) => c.id !== chatId));

      if (selectedChatId === chatId) {
        setSelectedChatId(chats[0]?.id || null);
      }
    } catch (error) {
      console.error("Failed to delete chat:", error);
    }
  };

  const isSendingRef = useRef(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputMessage.trim() || isSendingRef.current) return;

    const messageText = inputMessage.trim();
    setInputMessage("");
    setIsSending(true);
    setIsGenerating(true);
    isSendingRef.current = true;

    console.log("[ChatPage] ===== handleSendMessage START =====");
    console.log("[ChatPage] selectedChatId:", selectedChatId);
    console.log("[ChatPage] userId:", userId);

    try {
      let currentChatId = selectedChatId;
      let userMessage;

      console.log("[ChatPage] handleSendMessage - Initial state:", {
        selectedChatId,
        userId,
        messageText: messageText.substring(0, 50),
      });

      // 1. Create a new chat if one doesn't exist
      if (!currentChatId) {
        if (!userId) {
          console.warn("User not authenticated - attempting to send message");
          throw new Error("User not authenticated");
        }

        console.log("[ChatPage] No chat selected, creating new chat...");

        // Pass initialMessage to generate title and create first message
        const newChat = await chatService.createChat({
          userId,
          initialMessage: messageText,
        });

        console.log("[ChatPage] New chat created:", newChat.id);

        // Update state immediately with new chat
        setChats((prev) => [newChat, ...prev]);
        setSelectedChatId(newChat.id);
        currentChatId = newChat.id;

        console.log("[ChatPage] currentChatId set to:", currentChatId);

        // Wait a bit to ensure state is updated
        await new Promise((resolve) => setTimeout(resolve, 100));

        // The new chat object includes the message we just sent
        if (newChat.messages && newChat.messages.length > 0) {
          userMessage = newChat.messages[0];
        } else {
          userMessage = {
            id: `temp-${crypto.randomUUID()}`,
            role: "user" as const,
            content: messageText,
            createdAt: new Date().toISOString(),
            chatSessionId: newChat.id,
          };
        }
      } else {
        console.log("[ChatPage] Using existing chat:", currentChatId);
        // 2. Add user message to existing chat
        userMessage = await chatService.addMessage(currentChatId, {
          role: "user",
          content: messageText,
        });
      }

      setMessages((prev) => {
        if (prev.some((msg) => msg.id === userMessage.id)) return prev;
        return [...prev, userMessage];
      });

      // Create conversation history
      const conversationHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Stream roadmap generation
      // 3. Stream roadmap generation
      let generatedRoadmapId: string | null = null;

      console.log(
        "[ChatPage] About to start stream. currentChatId:",
        currentChatId,
      );
      console.log(
        "[ChatPage] Starting roadmap stream with chatId:",
        currentChatId,
      );

      const stream = roadmapService.streamRoadmapGeneration(
        {
          message: messageText,
          conversation_history: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          chatSessionId: currentChatId, // Pass the chat session ID
          strictMode: strictMode, // Pass strict mode setting
        },
        (roadmapId) => {
          console.log("[ChatPage] Roadmap created callback:", roadmapId);
          generatedRoadmapId = roadmapId;

          // Immediately update the temporary message with roadmap metadata
          setMessages((prev) =>
            prev.map((m) =>
              m.id === tempMessageId
                ? {
                    ...m,
                    roadmapId,
                    roadmap: {
                      id: roadmapId,
                      title: "Generated Roadmap",
                      goal: messageText,
                    },
                  }
                : m,
            ),
          );
        },
      );

      // Create temporary assistant message
      const tempMessageId = `temp-${crypto.randomUUID()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: tempMessageId,
          chatSessionId: currentChatId!,
          role: "assistant",
          content: "⏳ Generating...",
          createdAt: new Date().toISOString(),
        },
      ]);

      let fullResponse = "";
      let updatePending = false;

      // Throttled update mechanism - batch updates every 100ms
      const updateInterval = setInterval(() => {
        if (updatePending) {
          console.log(
            `[ChatPage] 🔄 Throttled update fired. Content length: ${fullResponse.length}`,
          );
          setMessages((prev) =>
            prev.map((m) =>
              m.id === tempMessageId ? { ...m, content: fullResponse } : m,
            ),
          );
          updatePending = false;
        }
      }, 100);

      try {
        for await (const chunk of stream) {
          // Log each chunk received
          console.log("[ChatPage] Received chunk:", {
            type: typeof chunk === "string" ? "string" : chunk.type,
            preview:
              typeof chunk === "string"
                ? chunk.substring(0, 50)
                : chunk.data?.substring(0, 50),
          });

          if (typeof chunk === "string") {
            fullResponse += chunk;
            updatePending = true;
          } else if (isContentEvent(chunk)) {
            fullResponse += chunk.data;
            updatePending = true;
            console.log(
              `[ChatPage] Content accumulated. Total length: ${fullResponse.length}`,
            );
          } else if (isStatusEvent(chunk)) {
            console.log("[ChatPage] Stream status:", chunk.data);
          } else if (isErrorEvent(chunk)) {
            console.error("[ChatPage] Stream error:", chunk.data);
            const errorMsg = "> **Error during generation:** " + chunk.data;
            fullResponse = fullResponse
              ? fullResponse + "\n\n" + errorMsg
              : errorMsg;
            if (chunk.data.includes("402")) {
              fullResponse +=
                "\n\n*Hint: The AI provider quota has been exceeded. Please check your API key or switch models in .env*";
            }
            updatePending = true;
          }
        }
      } finally {
        clearInterval(updateInterval);

        // Small delay to ensure clean state transition
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Final update with complete content
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempMessageId ? { ...m, content: fullResponse } : m,
          ),
        );
      }

      console.log(
        "[ChatPage] Stream complete. Total response length:",
        fullResponse.length,
      );
      console.log("[ChatPage] currentChatId before saving:", currentChatId);
      console.log("[ChatPage] generatedRoadmapId:", generatedRoadmapId);

      // Save the complete assistant message with link to roadmap if available
      try {
        // Verify chat exists before trying to add message
        if (currentChatId) {
          console.log(
            "[ChatPage] Saving assistant message to chat:",
            currentChatId,
          );
          const assistantMessage = await chatService.addMessage(currentChatId, {
            role: "assistant",
            content: fullResponse,
            roadmapId: generatedRoadmapId || undefined,
          });

          // Replace temp message with real one
          // Defensive: If assistantMessage (from backend) doesn't have roadmapId despite us sending it,
          // preserve the one we got from the stream event.
          setMessages((prev) =>
            prev.map((m) => {
              if (m.id === tempMessageId) {
                return {
                  ...assistantMessage,
                  roadmapId: assistantMessage.roadmapId || m.roadmapId,
                  roadmap: assistantMessage.roadmap || m.roadmap,
                };
              }
              return m;
            }),
          );
        } else {
          console.warn("No chat ID available, keeping temporary message");
        }
      } catch (messageError) {
        console.error("Failed to save assistant message:", messageError);
        // Keep the temporary message in the UI even if save fails
      }

      setIsGenerating(false);
      setIsSending(false);
      isSendingRef.current = false;
      loadChats(); // Refresh chat list
    } catch (error) {
      console.error("Failed to send message:", error);
      setIsGenerating(false);
      setIsSending(false);
      isSendingRef.current = false;
    }
  };

  const handleSelectRoadmap = async (roadmapId: string) => {
    try {
      await roadmapService.selectRoadmap(roadmapId);
      router.push(`/roadmap/${roadmapId}`);
    } catch (error) {
      console.error("Failed to select roadmap:", error);
      // Optional: show toast/alert
    }
  };

  const handleViewRoadmap = (roadmapId: string) => {
    handleSelectRoadmap(roadmapId); // Use selection handler for now
  };

  return (
    <div className="chat-page">
      <ChatList
        chats={chats}
        selectedChatId={selectedChatId}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        onNewChat={handleNewChat}
      />

      <div className="chat-main">
        <div className="messages-container">
          {!selectedChatId || messages.length === 0 ? (
            <div className="empty-chat-hero">
              <div className="hero-content">
                <h2 className="hero-title">
                  Ready to Learn{" "}
                  <span className="gradient-text">Something New?</span>
                </h2>

                {/* Hero Input - Centered */}
                <form className="hero-search-form" onSubmit={handleSendMessage}>
                  <div className="input-container-centered">
                    <div className="controls-bar">
                      <label
                        className="strict-toggle"
                        title="Only use uploaded documents (prevents AI hallucination)"
                      >
                        <input
                          type="checkbox"
                          checked={strictMode}
                          onChange={(e) => setStrictMode(e.target.checked)}
                        />
                        <span>Strict Mode</span>
                      </label>
                    </div>
                    <div style={{ position: "relative", width: "100%" }}>
                      <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Ask me a Roadmap..."
                        disabled={isSending}
                        className="message-input hero-input-style"
                        autoFocus
                      />
                      <button
                        type="submit"
                        disabled={!inputMessage.trim() || isSending}
                        className="btn-send-icon"
                      >
                        {isSending ? (
                          <div
                            className="typing-dots"
                            style={{ transform: "scale(0.5)" }}
                          >
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                        ) : (
                          <ArrowUp size={20} />
                        )}
                      </button>
                    </div>
                  </div>
                </form>

                <div className="suggestions">
                  <button
                    onClick={() => setInputMessage("I want to learn React")}
                  >
                    Learn React
                  </button>
                  <button
                    onClick={() =>
                      setInputMessage("Build a full-stack app with Next.js")
                    }
                  >
                    Next.js App
                  </button>
                  <button
                    onClick={() =>
                      setInputMessage("Master Python for data science")
                    }
                  >
                    Python Data Science
                  </button>
                  <button
                    onClick={() =>
                      setInputMessage("Network Programming Roadmap")
                    }
                  >
                    Network Programming
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Deduplicate messages by ID to prevent "Duplicate key" errors
            Array.from(
              new Map(messages.map((msg) => [msg.id, msg])).values(),
            ).map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onViewRoadmap={handleViewRoadmap}
              />
            ))
          )}
          {isGenerating && (
            <div className="generating-indicator">
              <div className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span>Generating roadmap...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Input - Only visible when there are messages */}
        {(messages.length > 0 || selectedChatId) && (
          <form className="message-input-form" onSubmit={handleSendMessage}>
            {!isGenerating && !isLoading && (
              <div className="input-container-centered">
                <div className="controls-bar">
                  <label
                    className="strict-toggle"
                    title="Only use uploaded documents (prevents AI hallucination)"
                  >
                    <input
                      type="checkbox"
                      checked={strictMode}
                      onChange={(e) => setStrictMode(e.target.checked)}
                    />
                    <span>Strict Mode</span>
                  </label>
                </div>
                <div style={{ position: "relative", width: "100%" }}>
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Describe your learning goal..."
                    className="message-input"
                    disabled={isSending || isGenerating}
                  />
                  <button
                    type="submit"
                    className="btn-send-icon"
                    disabled={!inputMessage.trim() || isSending || isGenerating}
                  >
                    <ArrowUp size={20} />
                  </button>
                </div>
              </div>
            )}
          </form>
        )}
      </div>

      <style jsx>{`
        .chat-page {
          display: flex;
          height: 100vh;
          background: var(--bg-primary);
        }

        .chat-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: relative;
        }

        .messages-container {
          flex: 1;
          display: flex; /* Flex to center hero vertically */
          flex-direction: column;
          overflow-y: auto;
          position: relative;
        }

        .empty-chat-hero {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          width: 100%;
        }

        .hero-content {
          max-width: 48rem;
          width: 100%;
          text-align: center;
          margin-top: -10vh; /* Slight offset upwards for visual balance */
        }

        .hero-title {
          font-size: 2rem;
          font-weight: 600;
          text-align: center;
          margin-bottom: 2.5rem;
          color: var(--text-primary);
        }

        .gradient-text {
          background: linear-gradient(to right, #ef4444, #f97316);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .hero-search-form {
          width: 100%;
          display: flex;
          justify-content: center;
          margin-bottom: 2rem;
        }

        .suggestions {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.75rem;
          max-width: 40rem;
          margin: 0 auto;
        }

        .suggestions button {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          padding: 0.5rem 1rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          transition: all 0.2s;
          cursor: pointer;
        }

        .suggestions button:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
          border-color: var(--text-muted);
        }

        /* Shared Input Styles */
        .message-input-form {
          padding: 1.5rem;
          background: transparent;
          display: flex;
          justify-content: center;
          /* Fixed bottom bar logic handled by flex layout */
        }

        .input-container-centered {
          width: 100%;
          max-width: 42rem; /* Optimal reading width */
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          position: relative;
        }

        .controls-bar {
          width: 100%;
          display: flex;
          justify-content: flex-end;
          padding-right: 1rem;
        }

        .strict-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: var(--text-secondary);
          cursor: pointer;
          user-select: none;
        }

        .strict-toggle input {
          width: 1rem;
          height: 1rem;
          accent-color: var(--primary-color);
        }

        .message-input {
          width: 100%;
          padding: 1rem 1.5rem;
          padding-right: 3.5rem;
          border: 1px solid var(--border-color);
          border-radius: 9999px;
          font-size: 1rem;
          background: var(--bg-secondary);
          color: var(--text-primary);
          transition: all 0.2s;
          height: 3.5rem; /* Explicit height for consistency */
        }

        .message-input:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 2px var(--primary-light);
        }

        .btn-send-icon {
          position: absolute;
          right: 0.5rem;
          top: 50%;
          transform: translateY(-50%);
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 50%;
          background: var(--primary-color);
          color: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          z-index: 10;
        }

        .btn-send-icon:hover:not(:disabled) {
          background: var(--primary-hover);
        }

        .btn-send-icon:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .generating-indicator {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          justify-content: center; /* Center indicator too */
          color: var(--text-muted);
          font-size: 0.875rem;
        }

        .typing-dots {
          display: flex;
          gap: 0.25rem;
        }

        .typing-dots span {
          width: 8px;
          height: 8px;
          background: var(--primary-color);
          border-radius: 50%;
          animation: typing 1.4s infinite;
        }

        .typing-dots span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-dots span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typing {
          0%,
          60%,
          100% {
            transform: translateY(0);
            opacity: 0.7;
          }
          30% {
            transform: translateY(-10px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
