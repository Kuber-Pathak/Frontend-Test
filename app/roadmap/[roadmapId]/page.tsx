"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProgressBar } from "@/src/components/ProgressBar";
import {
  progressService,
  RoadmapProgress,
} from "@/src/services/progress.service";
import { roadmapService } from "@/src/services/roadmap.service";

interface Roadmap {
  id: string;
  title: string;
  goal: string;
  proficiency: string;
  roadmapData: any;
  isSelected: boolean;
  createdAt: string;
}

export default function RoadmapTrackerPage() {
  const params = useParams();
  const roadmapId = params?.roadmapId as string;
  const router = useRouter();

  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [progress, setProgress] = useState<RoadmapProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedPhases, setExpandedPhases] = useState<Set<number>>(
    new Set([0]),
  );

  useEffect(() => {
    if (roadmapId) {
      loadRoadmapAndProgress();
    }
  }, [roadmapId]);

  const loadRoadmapAndProgress = async () => {
    try {
      setIsLoading(true);

      // Fetch roadmap from API
      const roadmapData = await roadmapService.getRoadmapById(roadmapId);
      setRoadmap(roadmapData);

      // Load progress
      const progressData = await progressService.getProgress(roadmapId);
      setProgress(progressData);
    } catch (error) {
      console.error("Failed to load roadmap:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePhase = (phaseIndex: number) => {
    const newExpanded = new Set(expandedPhases);
    if (newExpanded.has(phaseIndex)) {
      newExpanded.delete(phaseIndex);
    } else {
      newExpanded.add(phaseIndex);
    }
    setExpandedPhases(newExpanded);
  };

  const handleToggleTopic = async (phaseIndex: number, topicIndex: number) => {
    if (!roadmapId) return;

    const topicPath = `${phaseIndex}.${topicIndex}`;
    const isCompleted = progress?.completedTopics.includes(topicPath);

    try {
      if (isCompleted) {
        // Remove from completed
        const updatedTopics = progress!.completedTopics.filter(
          (t) => t !== topicPath,
        );
        const updatedProgress = await progressService.updateProgress(
          roadmapId,
          {
            completedTopics: updatedTopics,
          },
        );
        setProgress(updatedProgress);
      } else {
        // Mark as completed
        const updatedProgress = await progressService.completeTopic(
          roadmapId,
          topicPath,
        );
        setProgress(updatedProgress);
      }
    } catch (error) {
      console.error("Failed to update progress:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading roadmap...</p>
        <style jsx>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            text-align: center;
          }
          .spinner {
            width: 50px;
            height: 50px;
            border: 4px solid var(--border-color);
            border-top-color: var(--primary-color);
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="error-container">
        <h2>Roadmap not found</h2>
        <button onClick={() => router.push("/chat")} className="btn-back">
          Back to Chat
        </button>
        <style jsx>{`
          .error-container {
            text-align: center;
            padding: 2rem;
          }
          .btn-back {
            padding: 0.5rem 1rem;
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 6px;
            cursor: pointer;
          }
        `}</style>
      </div>
    );
  }

  const completionPercentage = progress?.completionPercentage || 0;

  return (
    <div className="roadmap-tracker-page">
      <div className="tracker-header">
        <button onClick={() => router.push("/chat")} className="btn-back">
          ← Back to Chat
        </button>

        <div className="roadmap-info">
          <h1>{roadmap.title}</h1>
          <p className="roadmap-goal">{roadmap.goal}</p>
          <div className="roadmap-meta">
            <span className="badge">{roadmap.proficiency}</span>
            <span className="meta-text">
              {roadmap.roadmapData.phases.length} phases
            </span>
          </div>
        </div>

        <div className="progress-section">
          <ProgressBar percentage={completionPercentage} height="12px" />
          <div className="progress-stats">
            <div className="stat">
              <span className="stat-value">
                {progress?.completedTopics.length || 0}
              </span>
              <span className="stat-label">Topics Completed</span>
            </div>
            <div className="stat">
              <span className="stat-value">
                {Math.round(progress?.totalTimeSpent || 0)}h
              </span>
              <span className="stat-label">Time Spent</span>
            </div>
          </div>
        </div>
      </div>

      <div className="phases-container">
        {roadmap.roadmapData.phases.map((phase: any, phaseIndex: number) => {
          const isExpanded = expandedPhases.has(phaseIndex);
          const phaseCompleted = progress?.completedPhases.includes(phaseIndex);

          return (
            <div
              key={phaseIndex}
              className={`phase-card ${phaseCompleted ? "completed" : ""}`}
            >
              <div
                className="phase-header"
                onClick={() => togglePhase(phaseIndex)}
              >
                <div className="phase-title-section">
                  <span className="phase-number">Phase {phaseIndex + 1}</span>
                  <h3>{phase.title}</h3>
                </div>
                <div className="phase-actions">
                  <span className="phase-duration">
                    {phase.estimated_hours}h
                  </span>
                  <span
                    className={`expand-icon ${isExpanded ? "expanded" : ""}`}
                  >
                    ▼
                  </span>
                </div>
              </div>

              {isExpanded && (
                <div className="phase-content">
                  <p className="phase-description">{phase.description}</p>

                  <div className="topics-list">
                    {phase.topics.map((topic: any, topicIndex: number) => {
                      const topicPath = `${phaseIndex}.${topicIndex}`;
                      const isTopicCompleted =
                        progress?.completedTopics.includes(topicPath);

                      return (
                        <div key={topicIndex} className="topic-item">
                          <div className="topic-header">
                            <label className="checkbox-container">
                              <input
                                type="checkbox"
                                checked={isTopicCompleted}
                                onChange={() =>
                                  handleToggleTopic(phaseIndex, topicIndex)
                                }
                              />
                              <span className="checkmark"></span>
                              <span
                                className={`topic-title ${
                                  isTopicCompleted ? "completed" : ""
                                }`}
                              >
                                {topic.title}
                              </span>
                            </label>
                            <span className="topic-duration">
                              {topic.estimated_hours}h
                            </span>
                          </div>
                          <p className="topic-description">
                            {topic.description}
                          </p>

                          {/* Learn More Button */}
                          <button
                            onClick={() =>
                              router.push(
                                `/roadmap/${roadmapId}/topic/${phaseIndex + 1}/${encodeURIComponent(topic.title)}?phaseTitle=${encodeURIComponent(phase.title)}&goal=${encodeURIComponent(roadmap.goal)}`,
                              )
                            }
                            className="btn-learn-more"
                          >
                            📚 Learn More
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .roadmap-tracker-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          min-height: 100vh;
          background: var(--bg-primary);
        }

        .tracker-header {
          margin-bottom: 2rem;
        }

        .btn-back {
          padding: 0.5rem 1rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.875rem;
          margin-bottom: 1.5rem;
          transition: all 0.2s;
        }

        .btn-back:hover {
          background: var(--bg-hover);
          transform: translateX(-2px);
        }

        .roadmap-info h1 {
          font-size: 2rem;
          margin-bottom: 0.5rem;
          color: var(--text-primary);
        }

        .roadmap-goal {
          font-size: 1.125rem;
          color: var(--text-secondary);
          margin-bottom: 1rem;
        }

        .roadmap-meta {
          display: flex;
          gap: 1rem;
          align-items: center;
          margin-bottom: 2rem;
        }

        .badge {
          padding: 0.25rem 0.75rem;
          background: var(--primary-light);
          color: var(--primary-color);
          border-radius: 12px;
          font-size: 0.8125rem;
          font-weight: 500;
          text-transform: capitalize;
        }

        .meta-text {
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        .progress-section {
          background: var(--bg-secondary);
          padding: 1.5rem;
          border-radius: 12px;
          border: 1px solid var(--border-color);
        }

        .progress-stats {
          display: flex;
          gap: 2rem;
          margin-top: 1rem;
        }

        .stat {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--primary-color);
        }

        .stat-label {
          font-size: 0.8125rem;
          color: var(--text-muted);
          margin-top: 0.25rem;
        }

        .phases-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .phase-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.2s;
        }

        .phase-card.completed {
          border-color: var(--success-color);
          background: var(--success-light);
        }

        .phase-header {
          padding: 1.5rem;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: background 0.2s;
        }

        .phase-header:hover {
          background: var(--bg-hover);
        }

        .phase-title-section {
          flex: 1;
        }

        .phase-number {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
        }

        .phase-header h3 {
          margin: 0.25rem 0 0 0;
          font-size: 1.25rem;
          color: var(--text-primary);
        }

        .phase-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .phase-duration {
          font-size: 0.875rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .expand-icon {
          font-size: 0.75rem;
          color: var(--text-muted);
          transition: transform 0.2s;
        }

        .expand-icon.expanded {
          transform: rotate(180deg);
        }

        .phase-content {
          padding: 0 1.5rem 1.5rem;
        }

        .phase-description {
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
          font-size: 0.9375rem;
        }

        .topics-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .topic-item {
          padding: 1rem;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
        }

        .topic-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .checkbox-container {
          display: flex;
          align-items: center;
          cursor: pointer;
          user-select: none;
        }

        .checkbox-container input {
          margin-right: 0.75rem;
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .topic-title {
          font-weight: 500;
          font-size: 0.9375rem;
          color: var(--text-primary);
        }

        .topic-title.completed {
          text-decoration: line-through;
          color: var(--text-muted);
        }

        .topic-duration {
          font-size: 0.8125rem;
          color: var(--text-muted);
        }

        .topic-description {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin: 0.5rem 0 0 2rem;
        }

        .btn-learn-more {
          margin: 0.75rem 0 0 2rem;
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.8125rem;
          font-weight: 600;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
        }

        .btn-learn-more:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .subtopics-list {
          margin-top: 0.75rem;
          margin-left: 2rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .subtopic-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8125rem;
          color: var(--text-secondary);
        }

        .subtopic-bullet {
          color: var(--primary-color);
        }

        .subtopic-title {
          flex: 1;
        }

        .subtopic-duration {
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}
