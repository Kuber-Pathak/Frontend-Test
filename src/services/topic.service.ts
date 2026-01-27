import { TopicDetail } from "@/src/types/topic.types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

/**
 * Get detailed topic content (deep-dive)
 */
export async function getTopicDetail(
  phaseNumber: number,
  topicTitle: string,
  phaseTitle: string,
  goal: string,
  roadmapId?: string,
): Promise<TopicDetail> {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    throw new Error("Authentication required");
  }

  let url = `${API_BASE_URL}/api/topic/${phaseNumber}/${encodeURIComponent(topicTitle)}?phaseTitle=${encodeURIComponent(phaseTitle)}&goal=${encodeURIComponent(goal)}`;

  // Add roadmapId if provided for caching
  if (roadmapId) {
    url += `&roadmapId=${encodeURIComponent(roadmapId)}`;
  }

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      error: response.statusText,
    }));
    throw new Error(errorData.error || "Failed to fetch topic detail");
  }

  return response.json();
}
