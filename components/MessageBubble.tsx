import React from "react";
import ReactMarkdown from "react-markdown";
import { Message, Roadmap, ClarificationRequest } from "@/types";
import { cn } from "@/lib/utils";
import {
  Bot,
  User,
  CheckCircle2,
  BookOpen,
  Clock,
  Workflow,
} from "lucide-react";
import { RoadmapView } from "./RoadmapView";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  if (message.type === "roadmap" && message.roadmap) {
    return <RoadmapView roadmap={message.roadmap} />;
  }

  let content = message.content as string;
  let suggestions: Record<string, string[]> | undefined;

  if (message.type === "clarification") {
    const clarification = message.content as ClarificationRequest;
    content = clarification.message;
    suggestions = clarification.suggested_values;
  }

  return (
    <div
      className={cn(
        "flex w-full mb-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "flex flex-col max-w-[80%] rounded-2xl p-4 gap-3",
          isUser
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-900 border border-gray-200"
        )}
      >
        <div className="flex gap-3">
          <div className="mt-1 shrink-0">
            {isUser ? (
              <User size={20} />
            ) : (
              <Bot size={20} className="text-blue-600" />
            )}
          </div>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>

        {/* Render Suggestions if present */}
        {suggestions && !isUser && (
          <div className="ml-8 flex flex-wrap gap-2 mt-2">
            {Object.entries(suggestions).map(([key, values]) => (
              <div key={key} className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-gray-500 uppercase">
                  {key}
                </span>
                <div className="flex flex-wrap gap-1">
                  {values.map((val) => (
                    <span
                      key={val}
                      className="text-xs bg-white border border-gray-200 px-2 py-1 rounded-full text-blue-600"
                    >
                      {val}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
