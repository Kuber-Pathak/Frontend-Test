export type QueryIntent = "learn" | "build";

export interface BestPractice {
  text: string;
  url?: string;
}

export interface Subtopic {
  title: string;
  description: string;
  estimated_hours: number;
  doc_link?: string;
  best_practices?: string[];
}

export interface Topic {
  title: string;
  description: string;
  estimated_hours: number;
  doc_link?: string;
  subtopics: Subtopic[];
  best_practices?: string[];
}

export interface Phase {
  title: string;
  description: string;
  estimated_hours: number;
  topics: Topic[];
}

export interface Roadmap {
  title?: string;
  goal: string;
  intent?: string;
  proficiency: string;
  phases: Phase[];
  total_estimated_hours?: number;
  key_technologies?: string[];
  prerequisites?: string[];
  next_steps?: string[];
  metadata?: Record<string, any>;
}

export interface ClarificationRequest {
  status: "clarification_needed";
  message: string;
  missing_fields: string[];
  suggested_values?: Record<string, string[]>;
}

export interface ChatRequest {
  message: string;
  conversation_history?: Array<{ role: string; content: string }>;
}

export interface ChatResponse {
  type: "text" | "roadmap" | "clarification";
  message?: string;
  roadmap?: Roadmap;
  clarification?: ClarificationRequest;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string | Roadmap | ClarificationRequest;
  type: "text" | "roadmap" | "clarification";
  roadmap?: Roadmap;
  isTyping?: boolean;
}
