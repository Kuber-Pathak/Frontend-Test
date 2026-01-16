import { useState, useCallback, useRef } from "react";
import { roadmapService } from "@/src/services/roadmap.service";
import type { StreamChunk } from "@/src/types/stream.types";
import {
  isContentEvent,
  isStatusEvent,
  isErrorEvent,
} from "@/src/types/stream.types";

interface UseRoadmapStreamOptions {
  onRoadmapCreated?: (roadmapId: string) => void;
  onError?: (error: string) => void;
}

export function useRoadmapStream(options: UseRoadmapStreamOptions = {}) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamContent, setStreamContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const startStream = useCallback(
    async (
      message: string,
      conversationHistory: Array<{
        role: "user" | "assistant";
        content: string;
      }>,
      chatSessionId?: string
    ) => {
      setIsStreaming(true);
      setStreamContent("");
      setError(null);

      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController();

      try {
        const stream = roadmapService.streamRoadmapGeneration(
          {
            message,
            conversation_history: conversationHistory,
            chatSessionId,
          },
          (roadmapId) => {
            options.onRoadmapCreated?.(roadmapId);
          }
        );

        let fullResponse = "";

        for await (const chunk of stream) {
          // Check if aborted
          if (abortControllerRef.current?.signal.aborted) {
            break;
          }

          if (typeof chunk === "string") {
            fullResponse += chunk;
          } else if (isContentEvent(chunk)) {
            fullResponse += chunk.data;
          } else if (isStatusEvent(chunk)) {
            // Status updates can be logged or displayed separately
            console.log("Stream status:", chunk.data);
          } else if (isErrorEvent(chunk)) {
            const errorMsg = chunk.data;
            setError(errorMsg);
            options.onError?.(errorMsg);
            fullResponse += `\n\n> **Error:** ${errorMsg}`;
          }

          setStreamContent(fullResponse);
        }

        return fullResponse;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Stream failed";
        setError(errorMsg);
        options.onError?.(errorMsg);
        throw err;
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [options]
  );

  const cancelStream = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsStreaming(false);
  }, []);

  return {
    isStreaming,
    streamContent,
    error,
    startStream,
    cancelStream,
  };
}
