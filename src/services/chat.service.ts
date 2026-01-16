import axios, { AxiosError } from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://bato-backend-a9x8.onrender.com";

// Response cache for GET requests
const responseCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
}

export interface Message {
  id: string;
  chatSessionId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  roadmapId?: string;
  roadmap?: {
    id: string;
    title: string;
    goal: string;
  };
}

interface CreateChatRequest {
  userId: string;
  initialMessage?: string;
}

interface AddMessageRequest {
  role: "user" | "assistant";
  content: string;
  roadmapId?: string;
}

class ChatService {
  private getAuthHeaders() {
    return {
      "Content-Type": "application/json",
    };
  }

  private getCacheKey(endpoint: string): string {
    return `${API_BASE_URL}${endpoint}`;
  }

  private getFromCache<T>(endpoint: string): T | null {
    const cacheKey = this.getCacheKey(endpoint);
    const cached = responseCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data as T;
    }

    // Clean up expired cache
    if (cached) {
      responseCache.delete(cacheKey);
    }

    return null;
  }

  private setCache(endpoint: string, data: any): void {
    const cacheKey = this.getCacheKey(endpoint);
    responseCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });
  }

  private invalidateCache(pattern?: string): void {
    if (!pattern) {
      responseCache.clear();
      return;
    }

    for (const key of responseCache.keys()) {
      if (key.includes(pattern)) {
        responseCache.delete(key);
      }
    }
  }

  private async handleRequest<T>(
    request: () => Promise<T>,
    options?: { retries?: number; cacheKey?: string },
  ): Promise<T> {
    const { retries = 2, cacheKey } = options || {};

    // Check cache for GET requests
    if (cacheKey) {
      const cached = this.getFromCache<T>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const result = await request();

        // Cache successful GET responses
        if (cacheKey) {
          this.setCache(cacheKey, result);
        }

        return result;
      } catch (error) {
        lastError = error as Error;

        // Don't retry on client errors (4xx)
        if (
          axios.isAxiosError(error) &&
          error.response?.status &&
          error.response.status < 500
        ) {
          throw error;
        }

        // Wait before retry (exponential backoff)
        if (attempt < retries) {
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, attempt) * 1000),
          );
        }
      }
    }

    throw lastError;
  }

  async getChats(userId: string): Promise<ChatSession[]> {
    return this.handleRequest(
      async () => {
        const response = await axios.get(`${API_BASE_URL}/api/chats`, {
          headers: this.getAuthHeaders(),
          params: { userId },
        });
        // Backend returns {success: true, data: chats[]}
        return response.data.data || response.data;
      },
      { cacheKey: `/api/chats?userId=${userId}` },
    );
  }

  async getChat(chatId: string): Promise<ChatSession> {
    return this.handleRequest(
      async () => {
        const response = await axios.get(
          `${API_BASE_URL}/api/chats/${chatId}`,
          {
            headers: this.getAuthHeaders(),
          },
        );
        return response.data.data || response.data;
      },
      { cacheKey: `/api/chats/${chatId}` },
    );
  }

  async getChatMessages(chatId: string): Promise<Message[]> {
    return this.handleRequest(
      async () => {
        const response = await axios.get(
          `${API_BASE_URL}/api/chats/${chatId}/messages`,
          { headers: this.getAuthHeaders() },
        );
        return response.data.data || response.data;
      },
      { cacheKey: `/api/chats/${chatId}/messages` },
    );
  }

  async createChat(data: CreateChatRequest): Promise<ChatSession> {
    console.log("[ChatService] Creating chat with data:", data);

    const result = await this.handleRequest(async () => {
      const response = await axios.post(`${API_BASE_URL}/api/chats`, data, {
        headers: this.getAuthHeaders(),
      });
      console.log("[ChatService] Backend response:", response.data);
      // Backend returns {success: true, data: chatSession}
      return response.data.data || response.data;
    });

    console.log("[ChatService] Result after handleRequest:", result);

    // Invalidate chats list cache
    this.invalidateCache(`/api/chats?userId=${data.userId}`);

    return result;
  }

  async addMessage(chatId: string, data: AddMessageRequest): Promise<Message> {
    const result = await this.handleRequest(async () => {
      const response = await axios.post(
        `${API_BASE_URL}/api/chats/${chatId}/messages`,
        data,
        { headers: this.getAuthHeaders() },
      );
      return response.data.data || response.data;
    });

    // Invalidate messages cache for this chat
    this.invalidateCache(`/api/chats/${chatId}/messages`);

    return result;
  }

  async deleteChat(chatId: string): Promise<void> {
    await this.handleRequest(async () => {
      await axios.delete(`${API_BASE_URL}/api/chats/${chatId}`, {
        headers: this.getAuthHeaders(),
      });
    });

    // Invalidate all caches related to this chat
    this.invalidateCache(chatId);
  }

  async updateChatTitle(chatId: string, title: string): Promise<ChatSession> {
    const result = await this.handleRequest(async () => {
      const response = await axios.patch(
        `${API_BASE_URL}/api/chats/${chatId}`,
        { title },
        { headers: this.getAuthHeaders() },
      );
      return response.data;
    });

    // Invalidate chat cache
    this.invalidateCache(chatId);

    return result;
  }
}

export const chatService = new ChatService();
