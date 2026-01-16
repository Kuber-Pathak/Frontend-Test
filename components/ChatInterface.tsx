"use client";

import React, { useRef, useEffect } from "react";
import { useChat } from "@/hooks/useChat";
import { useHealth } from "@/hooks/useHealth";
import { useIngestion } from "@/hooks/useIngestion";
import { MessageBubble } from "@/components/MessageBubble";
import { cn } from "@/lib/utils";
import { Send, Sparkles, Database, Activity, RefreshCw } from "lucide-react";

export default function ChatInterface() {
  const { messages, isLoading, loadingStatus, error, sendMessage } = useChat();
  const { status: healthStatus, checkHealth } = useHealth();
  const { triggerIngestion, isIngesting, ingestSuccess, ingestError } =
    useIngestion();
  const [input, setInput] = React.useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Greeting is shown in the empty state below

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput("");
  };

  return (
    <div className="flex flex-col h-screen max-w-5xl mx-auto bg-white border-x border-gray-100 shadow-xl">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className="font-bold text-xl text-gray-900">Bato-Ai</h1>
            <p className="text-xs text-gray-500">
              Intelligent Roadmap Generator
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Backend Health Status */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100">
            <div
              className={`w-2 h-2 rounded-full ${
                healthStatus === "connected"
                  ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"
                  : healthStatus === "degraded"
                  ? "bg-amber-500"
                  : healthStatus === "error"
                  ? "bg-red-500"
                  : "bg-gray-300 animate-pulse"
              }`}
            />
            <span className="text-xs font-medium text-gray-600 capitalize">
              {healthStatus === "loading" ? "Checking..." : healthStatus}
            </span>
            <button
              onClick={() => checkHealth()}
              className="hover:rotate-180 transition-transform duration-500 text-gray-400"
              title="Check health now"
            >
              <RefreshCw size={12} />
            </button>
          </div>

          {/* Ingestion Trigger */}
          <button
            onClick={() => triggerIngestion()}
            disabled={isIngesting || healthStatus !== "connected"}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
              ingestSuccess
                ? "bg-green-100 text-green-700 border border-green-200"
                : ingestError
                ? "bg-red-100 text-red-700 border border-red-200"
                : "bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isIngesting ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <Database size={14} />
            )}
            {ingestSuccess
              ? "Success!"
              : isIngesting
              ? "Ingesting..."
              : "Ingest Docs"}
          </button>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 px-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-full shadow-lg">
              <Sparkles size={56} className="text-blue-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-gray-800">
                Welcome to Bato-AI! 👋
              </h3>
              <p className="text-gray-600 max-w-md">
                Your AI-powered learning roadmap generator. Tell me what you
                want to learn, and I'll create a personalized step-by-step plan
                just for you.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl w-full">
              <button
                onClick={() => setInput("I want to learn React")}
                className="p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all text-left group"
              >
                <div className="font-semibold text-gray-800 group-hover:text-blue-600">
                  🚀 Learn React
                </div>
                <div className="text-sm text-gray-500">
                  Build modern web applications
                </div>
              </button>
              <button
                onClick={() => setInput("I want to become a backend engineer")}
                className="p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all text-left group"
              >
                <div className="font-semibold text-gray-800 group-hover:text-blue-600">
                  💻 Backend Engineering
                </div>
                <div className="text-sm text-gray-500">
                  Master server-side development
                </div>
              </button>
              <button
                onClick={() => setInput("Teach me Python for data science")}
                className="p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all text-left group"
              >
                <div className="font-semibold text-gray-800 group-hover:text-blue-600">
                  📊 Data Science
                </div>
                <div className="text-sm text-gray-500">
                  Analyze data with Python
                </div>
              </button>
              <button
                onClick={() => setInput("I want to learn Next.js")}
                className="p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all text-left group"
              >
                <div className="font-semibold text-gray-800 group-hover:text-blue-600">
                  ⚡ Next.js
                </div>
                <div className="text-sm text-gray-500">
                  Full-stack React framework
                </div>
              </button>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-100 rounded-2xl p-4 flex gap-2 items-center text-gray-500 text-sm">
              <span className="animate-bounce">●</span>
              <span className="animate-bounce delay-100">●</span>
              <span className="animate-bounce delay-200">●</span>
              <span className="ml-2 font-medium">
                {loadingStatus === "analyzing"
                  ? "Analyzing..."
                  : loadingStatus === "generating"
                  ? "Writing..."
                  : "Thinking..."}
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 mb-4 bg-red-50 text-red-600 text-sm rounded-lg text-center">
            Error: {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100">
        <form
          onSubmit={handleSubmit}
          className="relative flex items-end gap-2 max-w-4xl mx-auto"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Describe your learning goal..."
            className="w-full p-4 pr-12 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none max-h-32 min-h-[60px]"
            rows={1}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 bottom-2 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send size={20} />
          </button>
        </form>
        <div className="text-center text-xs text-gray-400 mt-2">
          AI can make mistakes. Reference official documentation.
        </div>
      </div>
    </div>
  );
}
