import React from "react";
import { formatDistanceToNow } from "date-fns";
import { Message } from "../services/chat.service";
import ReactMarkdown from "react-markdown";
import { User, Bot, Map } from "lucide-react";

interface ChatMessageProps {
  message: Message;
  onViewRoadmap?: (roadmapId: string) => void;
}

// Helper to determine if content is a roadmap JSON
const isRoadmapJson = (content: string): boolean => {
  if (!content || !content.trim().startsWith("{")) return false;
  try {
    const parsed = JSON.parse(content);
    return (
      parsed &&
      typeof parsed === "object" &&
      "phases" in parsed &&
      "goal" in parsed
    );
  } catch {
    return false;
  }
};

const tryParseRoadmap = (content: string): any => {
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
};

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onViewRoadmap,
}) => {
  // Memoize expensive JSON parsing
  const parsedRoadmap = React.useMemo(
    () => tryParseRoadmap(message.content),
    [message.content]
  );

  const isUser = message.role === "user";

  // Debug logging
  if (message.role === "assistant" && message.content) {
    console.log("[ChatMessage] Rendering assistant message:", {
      contentLength: message.content.length,
      startsWithBrace: message.content.trim().startsWith("{"),
      hasRoadmap: !!message.roadmap,
      contentPreview: message.content.substring(0, 50),
    });
  }

  return (
    <div className={`message ${isUser ? "user-message" : "assistant-message"}`}>
      <div className="message-container">
        <div className="message-avatar">
          {isUser ? <User size={20} /> : <Bot size={20} />}
        </div>

        <div className="message-content">
          <div className="message-header">
            <span className="message-role">{isUser ? "You" : "Bato AI"}</span>
            <span className="message-time">
              {formatDistanceToNow(new Date(message.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>

          <div className="message-text">
            {/* Show loader during generation, full content after */}
            {message.content === "⏳ Generating..." ? (
              <div className="generation-progress">
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span className="ml-2">Generating your roadmap...</span>
              </div>
            ) : message.content.trim().startsWith("{") ? (
              // Show complete JSON in a code block
              <div className="roadmap-json">
                <pre
                  style={{
                    background: "#1e1e1e",
                    padding: "1rem",
                    borderRadius: "8px",
                    overflow: "auto",
                    maxHeight: "600px",
                    margin: 0,
                  }}
                >
                  <code
                    style={{
                      color: "#d4d4d4",
                      fontSize: "0.875rem",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {message.content}
                  </code>
                </pre>

                {/* Select Roadmap Button */}
                {message.roadmapId && onViewRoadmap && (
                  <div
                    style={{
                      marginTop: "1rem",
                      display: "flex",
                      gap: "0.5rem",
                    }}
                  >
                    <button
                      onClick={() => onViewRoadmap(message.roadmapId!)}
                      style={{
                        padding: "0.75rem 1.5rem",
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "0.875rem",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        transition: "transform 0.2s, box-shadow 0.2s",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow =
                          "0 6px 15px rgba(102, 126, 234, 0.4)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow =
                          "0 4px 6px rgba(0, 0, 0, 0.1)";
                      }}
                    >
                      📍 Select & Track This Roadmap
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Show normal markdown content
              <ReactMarkdown>{message.content}</ReactMarkdown>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .chat-message {
          display: flex;
          gap: 1rem;
          padding: 1.5rem;
          margin-bottom: 0.5rem;
          animation: fadeIn 0.3s ease-in;
          border-radius: 8px;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .chat-message.user {
          background: transparent;
        }

        .chat-message.assistant {
          background: var(--bg-secondary);
        }

        .message-avatar {
          width: 32px;
          height: 32px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          background: var(--bg-hover);
          color: var(--text-primary);
        }

        .assistant .message-avatar {
          background: var(--primary-color);
          color: white;
        }

        .message-content {
          flex: 1;
          min-width: 0;
        }

        .message-header {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
          margin-bottom: 0.25rem;
        }

        .message-role {
          font-weight: 600;
          font-size: 0.875rem;
          color: var(--text-primary);
        }

        .message-time {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .message-text {
          color: var(--text-secondary);
          line-height: 1.6;
          word-wrap: break-word;
          font-size: 0.9375rem;
        }

        .message-text :global(p) {
          margin: 0 0 0.5rem 0;
        }

        .message-text :global(p:last-child) {
          margin-bottom: 0;
        }

        .message-text :global(ul),
        .message-text :global(ol) {
          margin: 0.5rem 0 0.5rem 1.5rem;
        }

        .message-text :global(code) {
          background: var(--code-bg);
          padding: 0.125rem 0.25rem;
          border-radius: 4px;
          font-family: "Courier New", monospace;
          font-size: 0.875rem;
        }

        .message-text :global(pre) {
          background: var(--code-bg);
          padding: 1rem;
          border-radius: 8px;
          overflow-x: auto;
          margin: 1rem 0;
        }

        .roadmap-card {
          margin-top: 1rem;
          padding: 1rem;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: border-color 0.2s;
        }

        .roadmap-card:hover {
          border-color: var(--primary-color);
        }

        .roadmap-icon-wrapper {
          width: 40px;
          height: 40px;
          background: var(--bg-secondary);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary-color);
        }

        .roadmap-details {
          flex: 1;
        }

        .roadmap-title {
          font-weight: 600;
          font-size: 0.9375rem;
          color: var(--text-primary);
          margin-bottom: 0.125rem;
        }

        .roadmap-goal {
          font-size: 0.8125rem;
          color: var(--text-muted);
        }

        .btn-view-roadmap {
          padding: 0.5rem 1rem;
          background: var(--primary-color);
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          white-space: nowrap;
          transition: all 0.2s;
        }

        .btn-view-roadmap:hover {
          background: var(--primary-hover);
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
};
