import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://bato-backend-a9x8.onrender.com";

export interface RoadmapProgress {
  id: string;
  roadmapId: string;
  completedPhases: number[];
  completedTopics: string[];
  currentPhase: number;
  currentTopic: string | null;
  totalTimeSpent: number;
  lastAccessedAt: string;
  completionPercentage?: number;
}

export interface ProgressUpdate {
  completedPhases?: number[];
  completedTopics?: string[];
  currentPhase?: number;
  currentTopic?: string;
  timeSpent?: number;
}

class ProgressService {
  private getAuthHeaders() {
    return {
      "Content-Type": "application/json",
    };
  }

  /**
   * Get progress for a roadmap
   */
  async getProgress(roadmapId: string): Promise<RoadmapProgress> {
    const response = await axios.get(
      `${API_BASE_URL}/api/roadmap/${roadmapId}/progress`,
      {
        headers: this.getAuthHeaders(),
        withCredentials: true,
      },
    );
    return response.data.data;
  }

  /**
   * Update progress for a roadmap
   */
  async updateProgress(
    roadmapId: string,
    updates: ProgressUpdate,
  ): Promise<RoadmapProgress> {
    const response = await axios.patch(
      `${API_BASE_URL}/api/roadmap/${roadmapId}/progress`,
      updates,
      {
        headers: this.getAuthHeaders(),
        withCredentials: true,
      },
    );
    return response.data.data;
  }

  /**
   * Mark a phase as completed
   */
  async completePhase(
    roadmapId: string,
    phaseIndex: number,
  ): Promise<RoadmapProgress> {
    const response = await axios.post(
      `${API_BASE_URL}/api/roadmap/${roadmapId}/progress/complete-phase`,
      { phaseIndex },
      {
        headers: this.getAuthHeaders(),
        withCredentials: true,
      },
    );
    return response.data.data;
  }

  /**
   * Mark a topic as completed
   */
  async completeTopic(
    roadmapId: string,
    topicPath: string,
  ): Promise<RoadmapProgress> {
    const response = await axios.post(
      `${API_BASE_URL}/api/roadmap/${roadmapId}/progress/complete-topic`,
      { topicPath },
      {
        headers: this.getAuthHeaders(),
        withCredentials: true,
      },
    );
    return response.data.data;
  }

  /**
   * Reset progress for a roadmap
   */
  async resetProgress(roadmapId: string): Promise<RoadmapProgress> {
    const response = await axios.post(
      `${API_BASE_URL}/api/roadmap/${roadmapId}/progress/reset`,
      {},
      {
        headers: this.getAuthHeaders(),
        withCredentials: true,
      },
    );
    return response.data.data;
  }
}

export const progressService = new ProgressService();
