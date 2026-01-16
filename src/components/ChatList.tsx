"use client";

import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ChatSession } from "../services/chat.service";
import {
  Plus,
  Search,
  MessageSquare,
  Trash2,
  PenSquare,
  Map as MapIcon,
  PanelLeftOpen,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../app/context/AuthContext";

interface ChatListProps {
  chats: ChatSession[];
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onNewChat: () => void;
}

export const ChatList = React.memo<ChatListProps>(
  ({ chats, selectedChatId, onSelectChat, onDeleteChat, onNewChat }) => {
    const { user, logout } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");

    // Ensure chats is always an array and filter safely
    const safeChats = Array.isArray(chats) ? chats : [];
    const filteredChats = safeChats.filter((chat) => {
      if (!chat || !chat.title) return false;
      return chat.title.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
      <div className="sidebar">
        {/* Header / Logo */}
        <div className="sidebar-header">
          <div className="logo-container">
            <MapIcon className="logo-icon" size={24} />
            <span className="logo-text">bato.ai</span>
          </div>
          <button className="collapse-btn">
            <PanelLeftOpen size={20} />
          </button>
        </div>

        {/* Main Actions */}
        <div className="sidebar-actions">
          <button onClick={onNewChat} className="action-item">
            <PenSquare size={18} />
            <span>New Chat</span>
          </button>
          <div className="search-container">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search Chat"
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="chat-section">
          <h3 className="section-title">Chats</h3>
          <div className="chat-list-items">
            {filteredChats.length === 0 ? (
              <div className="empty-state">
                <p className="empty-text">No chats found</p>
              </div>
            ) : (
              filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  className={`chat-item ${
                    selectedChatId === chat.id ? "active" : ""
                  }`}
                  onClick={() => onSelectChat(chat.id)}
                >
                  <div className="chat-item-content">
                    <div className="chat-icon-wrapper">
                      <span className="dot"></span>
                    </div>
                    <span className="chat-title">{chat.title}</span>
                  </div>
                  <button
                    className="btn-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChat(chat.id);
                    }}
                    title="Delete chat"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar Footer - User Profile */}
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">
              <span>{user?.name?.[0] || user?.email?.[0] || "U"}</span>
            </div>
            <div className="user-info">
              <span className="user-name">{user?.name || "User"}</span>
              <span className="user-email">{user?.email}</span>
            </div>
          </div>
          <button onClick={logout} className="logout-btn" title="Logout">
            <LogOut size={18} />
          </button>
        </div>

        <style jsx>{`
          .sidebar {
            width: 260px;
            height: 100vh;
            border-right: 1px solid var(--border-color);
            display: flex;
            flex-direction: column;
            background: var(--bg-secondary);
            color: var(--text-primary);
          }

          .sidebar-header {
            padding: 1.25rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 0.5rem;
            border-bottom: 1px solid var(--border-color);
          }

          /* ... existing styles ... */

          .chat-section {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            padding: 1rem;
          }

          /* Footer Styles */
          .sidebar-footer {
            padding: 1rem;
            border-top: 1px solid var(--border-color);
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: var(--bg-secondary);
          }

          .user-profile {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            flex: 1;
            min-width: 0;
          }

          .user-avatar {
            width: 32px;
            height: 32px;
            background: var(--primary-color);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 0.875rem;
          }

          .user-info {
            display: flex;
            flex-direction: column;
            min-width: 0;
          }

          .user-name {
            font-size: 0.875rem;
            font-weight: 500;
            color: var(--text-primary);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .user-email {
            font-size: 0.75rem;
            color: var(--text-muted);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .logout-btn {
            background: transparent;
            border: none;
            color: var(--text-muted);
            cursor: pointer;
            padding: 0.5rem;
            border-radius: 6px;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .logout-btn:hover {
            background: var(--bg-hover);
            color: var(--text-primary);
          }

          /* ... rest of styles ... */

          .logo-container {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            color: var(--primary-color);
          }

          .logo-text {
            font-weight: 700;
            font-size: 1.25rem;
            color: white;
          }

          .logo-icon {
            color: var(--primary-color);
          }

          .collapse-btn {
            background: none;
            border: 1px solid transparent;
            color: var(--text-muted);
            cursor: pointer;
            padding: 0.25rem;
            border-radius: 4px;
          }

          .collapse-btn:hover {
            color: var(--text-primary);
            border-color: var(--border-color);
            background: var(--bg-hover);
          }

          .sidebar-actions {
            padding: 1rem;
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            border-bottom: 1px solid var(--border-color);
          }

          .action-item {
            width: 100%;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem;
            background: transparent;
            color: var(--text-primary);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.9375rem;
            font-weight: 500;
            transition: all 0.2s;
            text-align: left;
          }

          .action-item:hover {
            background: var(--bg-hover);
            border-color: var(--text-muted);
          }

          .search-container {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.5rem 0.75rem;
            background: transparent;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            color: var(--text-secondary);
          }

          .search-container:hover,
          .search-container:focus-within {
            background: var(--bg-hover);
            border-color: var(--text-muted);
          }

          .search-input {
            background: transparent;
            border: none;
            color: var(--text-primary);
            width: 100%;
            font-size: 0.9375rem;
          }

          .search-input:focus {
            outline: none;
          }

          .search-input::placeholder {
            color: var(--text-muted);
          }

          .section-title {
            color: var(--text-muted);
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 0.75rem;
            padding-left: 0.5rem;
            font-weight: 600;
          }

          .chat-list-items {
            flex: 1;
            overflow-y: auto;
            padding-bottom: 1rem;
          }

          .empty-state {
            padding: 1rem;
            text-align: center;
            color: var(--text-muted);
            font-size: 0.875rem;
            border: 1px dashed var(--border-color);
            border-radius: 8px;
          }

          .chat-item {
            padding: 0.625rem 0.75rem;
            margin-bottom: 0.25rem;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: space-between;
            color: var(--text-secondary);
            font-size: 0.9375rem;
            border: 1px solid transparent;
          }

          .chat-item:hover {
            background: var(--bg-hover);
            color: var(--text-primary);
            border-color: var(--border-color);
          }

          .chat-item.active {
            background: var(--bg-hover);
            color: var(--text-primary);
            border-color: var(--primary-color);
          }

          .chat-item-content {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            flex: 1;
            min-width: 0;
          }

          .chat-icon-wrapper {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 16px;
          }

          .dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background-color: var(--border-color);
            transition: background-color 0.2s;
          }

          .chat-item:hover .dot {
            background-color: var(--text-muted);
          }

          .chat-item.active .dot {
            background-color: var(--primary-color);
            box-shadow: 0 0 4px var(--primary-color);
          }

          .chat-title {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .btn-delete {
            background: none;
            border: none;
            color: var(--text-muted);
            cursor: pointer;
            padding: 0.25rem;
            opacity: 0;
            transition: all 0.2s;
          }

          .chat-item:hover .btn-delete {
            opacity: 1;
          }

          .btn-delete:hover {
            color: var(--danger-color);
          }
        `}</style>
      </div>
    );
  }
);

ChatList.displayName = "ChatList";
