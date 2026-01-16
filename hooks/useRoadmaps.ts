import { useState, useEffect } from "react";
import Cookies from "js-cookie";

interface Roadmap {
  id: string;
  title: string;
  goal: string;
  proficiency: string;
  createdAt: string;
}

export function useRoadmaps() {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoadmaps = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = Cookies.get("token");

      if (!token) {
        console.log("[useRoadmaps] No token found");
        setRoadmaps([]);
        setIsLoading(false);
        return;
      }

      console.log("[useRoadmaps] Fetching roadmaps...");

      const res = await fetch("http://localhost:4000/api/roadmap", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      console.log("[useRoadmaps] Response status:", res.status);

      if (!res.ok) {
        if (res.status === 401) {
          console.error("[useRoadmaps] Unauthorized - token may be expired");
          setRoadmaps([]);
          setError("Session expired");
          return;
        }
        const errorText = await res.text();
        console.error("[useRoadmaps] Error response:", errorText);
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      console.log("[useRoadmaps] Received data:", data);

      // Ensure data is an array
      const roadmapArray = Array.isArray(data) ? data : [];

      setRoadmaps(roadmapArray);
      setError(null);
      console.log(
        "[useRoadmaps] Successfully loaded",
        roadmapArray.length,
        "roadmaps"
      );
    } catch (err: any) {
      console.error("[useRoadmaps] Error:", err);
      setError(err.message || "Failed to fetch roadmaps");
      setRoadmaps([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  return { roadmaps, isLoading, error, refetch: fetchRoadmaps };
}
