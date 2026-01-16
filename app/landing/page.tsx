"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Menu,
  Plus,
  Search,
  Sparkles,
  ChevronRight,
  Send,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useChat } from "@/hooks/useChat";
import { useRoadmaps } from "@/hooks/useRoadmaps";
import { MessageBubble } from "@/components/MessageBubble";

export default function LandingPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [input, setInput] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string | null>(
    null
  );
  const { user, logout, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const {
    messages,
    isLoading,
    loadingStatus,
    error,
    sendMessage,
    loadRoadmapConversation,
  } = useChat();
  const {
    roadmaps,
    isLoading: roadmapsLoading,
    refetch: refetchRoadmaps,
  } = useRoadmaps();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS

  // Protect route - redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0) {
      setShowChat(true);
    }
  }, [messages]);

  // NOW WE CAN HAVE CONDITIONAL RETURNS

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    setShowChat(true);
    sendMessage(input);
    setInput("");
  };

  const handleNewChat = () => {
    setShowChat(false);
    setSelectedRoadmapId(null);
    setInput("");
  };

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
    setShowChat(true);
    setSelectedRoadmapId(null);
    sendMessage(prompt);
  };

  const handleRoadmapClick = async (roadmapId: string) => {
    try {
      setSelectedRoadmapId(roadmapId);
      setShowChat(true);

      // Fetch the full roadmap details
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      if (!token) return;

      const res = await fetch(
        `http://localhost:4000/api/roadmap/${roadmapId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      if (!res.ok) {
        console.error("Failed to fetch roadmap details");
        return;
      }

      const roadmap = await res.json();
      console.log("Loaded roadmap:", roadmap);

      // Display the roadmap content in the chat
      loadRoadmapConversation(roadmap);
    } catch (error) {
      console.error("Error loading roadmap:", error);
    }
  };

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } transition-all duration-300 bg-[#171717] border-r border-gray-800 flex flex-col overflow-hidden`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-gradient-to-br from-red-500 to-orange-600 p-2 rounded-lg">
              <Sparkles size={20} className="text-white" />
            </div>
            <span className="font-bold text-lg">bato.ai</span>
          </div>

          {/* New Chat Button */}
          <button
            onClick={handleNewChat}
            className="w-full flex items-center gap-2 px-4 py-2.5 bg-[#0a0a0a] hover:bg-[#1a1a1a] rounded-lg transition-colors border border-gray-800"
          >
            <Plus size={18} />
            <span className="text-sm font-medium">New Chat</span>
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-800">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            />
            <input
              type="text"
              placeholder="Search Chat"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#0a0a0a] border border-gray-800 rounded-lg text-sm focus:outline-none focus:border-gray-700 placeholder-gray-600"
            />
          </div>
        </div>

        {/* Roadmaps Section */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">
              Roadmaps
            </h3>
            <div className="space-y-1">
              {roadmapsLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500 mx-auto"></div>
                </div>
              ) : roadmaps.length === 0 ? (
                <p className="text-xs text-gray-600 text-center py-4">
                  No roadmaps yet
                </p>
              ) : (
                roadmaps.map((roadmap) => (
                  <button
                    key={roadmap.id}
                    onClick={() => handleRoadmapClick(roadmap.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#1a1a1a] rounded-lg transition-colors group text-left ${
                      selectedRoadmapId === roadmap.id ? "bg-[#1a1a1a]" : ""
                    }`}
                  >
                    <ChevronRight
                      size={16}
                      className="text-gray-600 group-hover:text-gray-400"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {roadmap.title}
                      </p>
                      <p className="text-xs text-gray-600">
                        {formatDate(roadmap.createdAt)}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center text-sm font-bold">
                {user?.fullName?.[0] || user?.email?.[0] || "U"}
              </div>
              <div className="text-sm">
                <p className="font-medium">{user?.fullName || "User"}</p>
                <p className="text-xs text-gray-600">Free Plan</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut size={16} className="text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="h-14 border-b border-gray-800 flex items-center px-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors"
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Content Area */}
        {!showChat ? (
          /* Landing View */
          <div className="flex-1 flex items-center justify-center px-4">
            <div className="max-w-2xl w-full">
              {/* Welcome Message */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">
                  Ready to Learn{" "}
                  <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                    Something New?
                  </span>
                </h1>
              </div>

              {/* Search Input */}
              <form onSubmit={handleSubmit} className="relative mb-8">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <div className="bg-gradient-to-br from-red-500 to-orange-600 p-2 rounded-lg">
                    <Sparkles size={20} className="text-white" />
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Ask me a Roadmap"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="w-full pl-16 pr-14 py-4 bg-[#171717] border border-gray-800 rounded-xl text-base focus:outline-none focus:border-gray-700 placeholder-gray-600"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-gradient-to-br from-red-500 to-orange-600 p-2.5 rounded-lg hover:from-red-600 hover:to-orange-700 transition-all disabled:opacity-50"
                >
                  <ChevronRight size={20} className="text-white" />
                </button>
              </form>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleQuickAction("I want to learn React")}
                  className="p-4 bg-[#171717] border border-gray-800 rounded-xl hover:bg-[#1a1a1a] transition-colors text-left"
                >
                  <div className="text-sm font-medium mb-1">
                    Learn Web Development
                  </div>
                  <div className="text-xs text-gray-600">
                    Get a complete roadmap
                  </div>
                </button>
                <button
                  onClick={() =>
                    handleQuickAction("I want to learn Data Science")
                  }
                  className="p-4 bg-[#171717] border border-gray-800 rounded-xl hover:bg-[#1a1a1a] transition-colors text-left"
                >
                  <div className="text-sm font-medium mb-1">
                    Master Data Science
                  </div>
                  <div className="text-xs text-gray-600">
                    From basics to advanced
                  </div>
                </button>
                <button
                  onClick={() =>
                    handleQuickAction("I want to become a DevOps Engineer")
                  }
                  className="p-4 bg-[#171717] border border-gray-800 rounded-xl hover:bg-[#1a1a1a] transition-colors text-left"
                >
                  <div className="text-sm font-medium mb-1">
                    Become a DevOps Engineer
                  </div>
                  <div className="text-xs text-gray-600">
                    Step-by-step guide
                  </div>
                </button>
                <button
                  onClick={() =>
                    handleQuickAction("I want to learn Mobile Development")
                  }
                  className="p-4 bg-[#171717] border border-gray-800 rounded-xl hover:bg-[#1a1a1a] transition-colors text-left"
                >
                  <div className="text-sm font-medium mb-1">
                    Learn Mobile Development
                  </div>
                  <div className="text-xs text-gray-600">
                    iOS & Android paths
                  </div>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Chat View */
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
              <div className="max-w-4xl mx-auto space-y-6">
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}

                {/* Error Message */}
                {error && (
                  <div className="p-4 mb-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-center text-sm">
                    {error}
                  </div>
                )}

                {isLoading && (
                  <div className="flex items-center gap-3 text-gray-400">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500"></div>
                    <span className="text-sm">
                      {loadingStatus === "analyzing" &&
                        "🔍 Analyzing your query..."}
                      {loadingStatus === "generating" &&
                        "✨ Generating your roadmap..."}
                      {loadingStatus === "idle" && "Processing..."}
                    </span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-800 p-4">
              <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
                <div className="relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a follow-up question..."
                    disabled={isLoading}
                    className="w-full pl-4 pr-12 py-3 bg-[#171717] border border-gray-800 rounded-xl text-base focus:outline-none focus:border-gray-700 placeholder-gray-600 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-br from-red-500 to-orange-600 p-2 rounded-lg hover:from-red-600 hover:to-orange-700 transition-all disabled:opacity-50"
                  >
                    <Send size={18} className="text-white" />
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
