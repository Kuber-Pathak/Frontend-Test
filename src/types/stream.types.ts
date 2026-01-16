/**
 * Type definitions for server-sent event streaming
 */

export type StreamEventType = "content" | "status" | "error";

export interface StreamEvent {
  type: StreamEventType;
  data: string;
}

export interface ContentEvent extends StreamEvent {
  type: "content";
  data: string;
}

export interface StatusEvent extends StreamEvent {
  type: "status";
  data: string;
}

export interface ErrorEvent extends StreamEvent {
  type: "error";
  data: string;
}

export type StreamChunk = ContentEvent | StatusEvent | ErrorEvent | string;

/**
 * Type guard to check if chunk is a structured event
 */
export function isStreamEvent(chunk: StreamChunk): chunk is StreamEvent {
  return typeof chunk === "object" && "type" in chunk && "data" in chunk;
}

/**
 * Type guard for content events
 */
export function isContentEvent(chunk: StreamChunk): chunk is ContentEvent {
  return isStreamEvent(chunk) && chunk.type === "content";
}

/**
 * Type guard for status events
 */
export function isStatusEvent(chunk: StreamChunk): chunk is StatusEvent {
  return isStreamEvent(chunk) && chunk.type === "status";
}

/**
 * Type guard for error events
 */
export function isErrorEvent(chunk: StreamChunk): chunk is ErrorEvent {
  return isStreamEvent(chunk) && chunk.type === "error";
}
