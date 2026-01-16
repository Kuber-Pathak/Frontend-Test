import axios from "axios";
import type { StreamChunk } from "../types/stream.types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://bato-backend-a9x8.onrender.com";

export interface Roadmap {
  id: string;
  userId: string;
  chatSessionId?: string;
  title: string;
  goal: string;
  intent: string;
  proficiency: string;
  roadmapData: any;
  message?: string;
  isSelected: boolean;
  createdAt: string;
  updatedAt: string;
  // Python backend fields
  docs_retrieved_count?: number;
  retrieval_confidence?: number;
  sources_used?: string[];
}

export interface GenerateRoadmapRequest {
  message: string;
  conversation_history: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
  chatSessionId?: string;
  strictMode?: boolean;
}

class RoadmapService {
  private getAuthHeaders() {
    return {
      "Content-Type": "application/json",
    };
  }

  /**
   * Get user's roadmaps
   */
  async getRoadmaps(userId: string): Promise<Roadmap[]> {
    const response = await axios.get(`${API_BASE_URL}/api/roadmap`, {
      headers: this.getAuthHeaders(),
      withCredentials: true,
    });
    return response.data;
  }

  /**
   * Get roadmap by ID
   */
  async getRoadmapById(roadmapId: string): Promise<Roadmap> {
    const response = await axios.get(
      `${API_BASE_URL}/api/roadmap/${roadmapId}`,
      {
        headers: this.getAuthHeaders(),
        withCredentials: true,
      },
    );
    return response.data;
  }

  /**
   * Select a roadmap as active
   */
  async selectRoadmap(roadmapId: string): Promise<Roadmap> {
    console.log("[RoadmapService] Selecting roadmap:", roadmapId);

    const response = await axios.post(
      `${API_BASE_URL}/api/roadmap/${roadmapId}/select`,
      {},
      {
        headers: this.getAuthHeaders(),
        withCredentials: true,
      },
    );
    return response.data.data;
  }

  /**
   * Generate roadmap with streaming (returns EventSource for SSE)
   */
  createRoadmapStream(data: GenerateRoadmapRequest): EventSource {
    // EventSource doesn't support POST body
    // Use streamRoadmapGeneration method instead
    throw new Error("Use streamRoadmapGeneration method instead");
  }

  /**
   * Stream roadmap generation using fetch
   */
  async *streamRoadmapGeneration(
    data: GenerateRoadmapRequest,
    onRoadmapCreated?: (id: string) => void,
  ): AsyncGenerator<StreamChunk, void, unknown> {
    console.log("[RoadmapService] Starting stream with data:", {
      ...data,
      chatSessionId: data.chatSessionId,
    });

    const response = await fetch(`${API_BASE_URL}/api/roadmap/stream`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
      credentials: "include",
    });

    if (!response.ok || !response.body) {
      const errorText = await response.text().catch(() => "Unknown error");
      throw new Error(
        `Failed to start roadmap generation: ${response.status} ${response.statusText} - ${errorText}`,
      );
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let eventCount = 0;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim() || !line.startsWith("data: ")) continue;

          eventCount++;
          const jsonStr = line.substring(6);

          if (eventCount <= 5) {
            console.log(
              `[RoadmapService] Event ${eventCount}:`,
              jsonStr.substring(0, 100),
            );
          }

          try {
            // Use robust extractor instead of regex
            const jsonObjects = extractJsonObjects(jsonStr);

            for (const jsonObj of jsonObjects) {
              const parsed = JSON.parse(jsonObj);

              if (parsed.event === "roadmap_created") {
                console.log("[RoadmapService] Roadmap created:", parsed.data);
                onRoadmapCreated?.(parsed.data);
                yield { type: "status", data: "Roadmap created!" };
              } else if (parsed.event === "token") {
                yield { type: "content", data: parsed.data };
              } else if (parsed.event === "status") {
                yield { type: "status", data: parsed.data };
              } else if (parsed.event === "error") {
                yield { type: "error", data: parsed.data };
              }
            }
          } catch (e) {
            console.error(
              "[RoadmapService] Failed to parse SSE:",
              jsonStr.substring(0, 100),
              e,
            );
          }
        }
      }

      // Process any remaining buffer content
      if (buffer.trim() && buffer.startsWith("data: ")) {
        try {
          const jsonStr = buffer.substring(6);
          const parsed = JSON.parse(jsonStr);

          if (parsed.event === "roadmap_created") {
            console.log(
              "[RoadmapService] Roadmap created (from buffer):",
              parsed.data,
            );
            onRoadmapCreated?.(parsed.data);
            yield { type: "status", data: "Roadmap created!" };
          } else if (parsed.event === "token") {
            yield { type: "content", data: parsed.data };
          } else if (parsed.event === "status") {
            yield { type: "status", data: parsed.data };
          } else if (parsed.event === "error") {
            yield { type: "error", data: parsed.data };
          }
        } catch (e) {
          console.warn("[RoadmapService] Parsing final buffer failed:", e);
        }
      }

      console.log(
        `[RoadmapService] Stream complete. Total events: ${eventCount}`,
      );
    } finally {
      reader.releaseLock();
    }
  }
}

export const roadmapService = new RoadmapService();

// Helper to extract multiple JSON objects from a concatenated string
function extractJsonObjects(input: string): string[] {
  const objects: string[] = [];
  let depth = 0;
  let startIndex = 0;
  let inString = false;
  let escape = false;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (escape) {
      escape = false;
      continue;
    }

    if (char === "\\") {
      escape = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
    }

    if (!inString) {
      if (char === "{") {
        if (depth === 0) startIndex = i;
        depth++;
      } else if (char === "}") {
        depth--;
        if (depth === 0) {
          objects.push(input.substring(startIndex, i + 1));
        }
      }
    }
  }

  // Fallback: if no objects found but string exists, return it as is (might be single object or malformed)
  if (objects.length === 0 && input.trim()) {
    return [input];
  }

  return objects;
}
