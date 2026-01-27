"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getTopicDetail } from "@/src/services/topic.service";
import { TopicDetail } from "@/src/types/topic.types";
import {
  BookOpen,
  Clock,
  Target,
  Lightbulb,
  ExternalLink,
  CheckCircle,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface TopicDetailPageProps {
  phaseNumber: number;
  topicTitle: string;
  phaseTitle: string;
  goal: string;
  roadmapId?: string;
}

export const TopicDetailPage: React.FC<TopicDetailPageProps> = ({
  phaseNumber,
  topicTitle,
  phaseTitle,
  goal,
  roadmapId,
}) => {
  const router = useRouter();
  const [topic, setTopic] = useState<TopicDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopicDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getTopicDetail(
          phaseNumber,
          topicTitle,
          phaseTitle,
          goal,
          roadmapId,
        );
        setTopic(data);
      } catch (err: any) {
        console.error("Failed to fetch topic detail:", err);
        setError(err.message || "Failed to load topic details");
      } finally {
        setLoading(false);
      }
    };

    fetchTopicDetail();
  }, [phaseNumber, topicTitle, phaseTitle, goal, roadmapId]);

  if (loading) {
    return (
      <div className="topic-detail-container">
        <div className="loading-state">
          <Loader2 className="spinner" size={48} />
          <p>Loading topic details...</p>
        </div>
        <style jsx>{styles}</style>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="topic-detail-container">
        <div className="error-state">
          <AlertCircle size={48} color="#ef4444" />
          <h2>Failed to Load Topic</h2>
          <p>{error || "Topic not found"}</p>
          <button
            onClick={() => roadmapId && router.push(`/roadmap/${roadmapId}`)}
            className="btn-back"
          >
            Back to Roadmap
          </button>
        </div>
        <style jsx>{styles}</style>
      </div>
    );
  }

  return (
    <div className="topic-detail-container">
      {/* Header */}
      <div className="topic-header">
        <div className="breadcrumb">
          <span
            onClick={() => roadmapId && router.push(`/roadmap/${roadmapId}`)}
            className="breadcrumb-link"
          >
            {goal}
          </span>
          <ArrowRight size={16} />
          <span className="breadcrumb-current">
            Phase {phaseNumber}: {phaseTitle}
          </span>
          <ArrowRight size={16} />
          <span className="breadcrumb-current">{topic.title}</span>
        </div>

        <h1 className="topic-title">{topic.title}</h1>

        <div className="topic-meta">
          <div className="meta-item">
            <Clock size={16} />
            <span>{topic.estimated_hours} hours</span>
          </div>
          <div className="meta-item">
            <Target size={16} />
            <span className="difficulty-badge">{topic.difficulty_level}</span>
          </div>
        </div>
      </div>

      {/* Overview Section */}
      <section className="content-section">
        <h2 className="section-title">
          <BookOpen size={20} />
          Overview
        </h2>
        <p className="overview-text">{topic.overview}</p>
      </section>

      {/* Why Important */}
      <section className="content-section highlight-section">
        <h2 className="section-title">
          <Lightbulb size={20} />
          Why This Matters
        </h2>
        <p>{topic.why_important}</p>
      </section>

      {/* Key Concepts */}
      <section className="content-section">
        <h2 className="section-title">Key Concepts</h2>
        <div className="concepts-grid">
          {topic.key_concepts.map((concept: string, index: number) => (
            <div key={index} className="concept-card">
              <CheckCircle size={16} className="concept-icon" />
              <span>{concept}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Learning Objectives */}
      <section className="content-section">
        <h2 className="section-title">What You'll Learn</h2>
        <ul className="objectives-list">
          {topic.learning_objectives.map((objective: string, index: number) => (
            <li key={index}>{objective}</li>
          ))}
        </ul>
      </section>

      {/* Prerequisites */}
      {topic.prerequisites.length > 0 && (
        <section className="content-section">
          <h2 className="section-title">Prerequisites</h2>
          <ul className="prerequisites-list">
            {topic.prerequisites.map((prereq: string, index: number) => (
              <li key={index}>{prereq}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Learning Resources */}
      <section className="content-section">
        <h2 className="section-title">Learning Resources</h2>
        <div className="resources-grid">
          {topic.learning_resources.map((resource: any, index: number) => (
            <div key={index} className="resource-card">
              <div className="resource-header">
                <span className="resource-type">{resource.type}</span>
                {resource.estimated_time && (
                  <span className="resource-time">
                    <Clock size={14} />
                    {resource.estimated_time}
                  </span>
                )}
              </div>
              <h3 className="resource-title">{resource.title}</h3>
              {resource.url && (
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="resource-link"
                >
                  View Resource
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Practice Exercises */}
      <section className="content-section">
        <h2 className="section-title">Practice Exercises</h2>
        <div className="exercises-list">
          {topic.practice_exercises.map((exercise: any, index: number) => (
            <div key={index} className="exercise-card">
              <div className="exercise-header">
                <h3>{exercise.title}</h3>
                <div className="exercise-meta">
                  <span className={`difficulty-badge ${exercise.difficulty}`}>
                    {exercise.difficulty}
                  </span>
                  <span className="exercise-time">
                    <Clock size={14} />
                    {exercise.estimated_time}
                  </span>
                </div>
              </div>
              <p className="exercise-description">{exercise.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Documentation Links */}
      {topic.doc_links.length > 0 && (
        <section className="content-section">
          <h2 className="section-title">Official Documentation</h2>
          <div className="doc-links">
            {topic.doc_links.map((link: string, index: number) => (
              <a
                key={index}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="doc-link"
              >
                <ExternalLink size={16} />
                {link}
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Related Topics */}
      {topic.related_topics.length > 0 && (
        <section className="content-section">
          <h2 className="section-title">Related Topics</h2>
          <div className="related-topics">
            {topic.related_topics.map((relatedTopic: string, index: number) => (
              <div key={index} className="related-topic-chip">
                {relatedTopic}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Next Topic */}
      {topic.next_topic && (
        <div className="next-topic-banner">
          <span>Up Next:</span>
          <strong>{topic.next_topic}</strong>
          <ArrowRight size={20} />
        </div>
      )}

      <style jsx>{styles}</style>
    </div>
  );
};

const styles = `
  .topic-detail-container {
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem;
    color: var(--text-primary);
  }

  .loading-state,
  .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    gap: 1rem;
    text-align: center;
  }

  .spinner {
    animation: spin 1s linear infinite;
    color: var(--primary-color);
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .error-state h2 {
    color: var(--text-primary);
    margin: 0;
  }

  .error-state p {
    color: var(--text-muted);
  }

  .btn-back {
    margin-top: 1rem;
    padding: 0.75rem 1.5rem;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: opacity 0.2s;
  }

  .btn-back:hover {
    opacity: 0.9;
  }

  .topic-header {
    margin-bottom: 2rem;
  }

  .breadcrumb {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: var(--text-muted);
    margin-bottom: 1rem;
    flex-wrap: wrap;
  }

  .breadcrumb-link {
    cursor: pointer;
    color: var(--primary-color);
    transition: opacity 0.2s;
  }

  .breadcrumb-link:hover {
    opacity: 0.8;
  }

  .breadcrumb-current {
    color: var(--text-secondary);
  }

  .topic-title {
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0 0 1rem 0;
    color: var(--text-primary);
    line-height: 1.2;
  }

  .topic-meta {
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--text-secondary);
    font-size: 0.9375rem;
  }

  .difficulty-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.8125rem;
    font-weight: 600;
    text-transform: capitalize;
    background: var(--bg-secondary);
    color: var(--primary-color);
  }

  .difficulty-badge.beginner {
    background: #dcfce7;
    color: #16a34a;
  }

  .difficulty-badge.intermediate {
    background: #fef3c7;
    color: #d97706;
  }

  .difficulty-badge.advanced {
    background: #fee2e2;
    color: #dc2626;
  }

  .content-section {
    margin-bottom: 2.5rem;
    padding: 1.5rem;
    background: var(--bg-secondary);
    border-radius: 12px;
  }

  .highlight-section {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
    border-left: 4px solid var(--primary-color);
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0 0 1rem 0;
    color: var(--text-primary);
  }

  .overview-text {
    font-size: 1.0625rem;
    line-height: 1.8;
    color: var(--text-secondary);
    margin: 0;
  }

  .concepts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 0.75rem;
  }

  .concept-card {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: var(--bg-primary);
    border-radius: 8px;
    border: 1px solid var(--border-color);
    transition: border-color 0.2s;
  }

  .concept-card:hover {
    border-color: var(--primary-color);
  }

  .concept-icon {
    color: var(--primary-color);
    flex-shrink: 0;
  }

  .objectives-list,
  .prerequisites-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .objectives-list li,
  .prerequisites-list li {
    padding: 0.75rem 0;
    padding-left: 1.5rem;
    position: relative;
    line-height: 1.6;
    color: var(--text-secondary);
  }

  .objectives-list li::before {
    content: "✓";
    position: absolute;
    left: 0;
    color: var(--primary-color);
    font-weight: bold;
  }

  .prerequisites-list li::before {
    content: "→";
    position: absolute;
    left: 0;
    color: var(--text-muted);
  }

  .resources-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
  }

  .resource-card {
    padding: 1.25rem;
    background: var(--bg-primary);
    border-radius: 8px;
    border: 1px solid var(--border-color);
    transition: all 0.2s;
  }

  .resource-card:hover {
    border-color: var(--primary-color);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .resource-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  .resource-type {
    padding: 0.25rem 0.625rem;
    background: var(--bg-secondary);
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    color: var(--primary-color);
  }

  .resource-time {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.8125rem;
    color: var(--text-muted);
  }

  .resource-title {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 0.75rem 0;
    color: var(--text-primary);
  }

  .resource-link {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    color: var(--primary-color);
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 500;
    transition: opacity 0.2s;
  }

  .resource-link:hover {
    opacity: 0.8;
  }

  .exercises-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .exercise-card {
    padding: 1.25rem;
    background: var(--bg-primary);
    border-radius: 8px;
    border: 1px solid var(--border-color);
  }

  .exercise-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.75rem;
    gap: 1rem;
  }

  .exercise-header h3 {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0;
    color: var(--text-primary);
  }

  .exercise-meta {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-shrink: 0;
  }

  .exercise-time {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.8125rem;
    color: var(--text-muted);
  }

  .exercise-description {
    margin: 0;
    line-height: 1.6;
    color: var(--text-secondary);
  }

  .doc-links {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .doc-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: var(--bg-primary);
    border-radius: 8px;
    border: 1px solid var(--border-color);
    color: var(--primary-color);
    text-decoration: none;
    font-size: 0.9375rem;
    transition: all 0.2s;
  }

  .doc-link:hover {
    border-color: var(--primary-color);
    background: var(--bg-hover);
  }

  .related-topics {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .related-topic-chip {
    padding: 0.5rem 1rem;
    background: var(--bg-primary);
    border-radius: 20px;
    border: 1px solid var(--border-color);
    font-size: 0.875rem;
    color: var(--text-secondary);
    transition: all 0.2s;
    cursor: pointer;
  }

  .related-topic-chip:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
  }

  .next-topic-banner {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1.25rem 1.5rem;
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%);
    color: white;
    border-radius: 12px;
    margin-top: 2rem;
    font-size: 1rem;
  }

  .next-topic-banner strong {
    flex: 1;
  }

  @media (max-width: 768px) {
    .topic-detail-container {
      padding: 1rem;
    }

    .topic-title {
      font-size: 2rem;
    }

    .resources-grid,
    .concepts-grid {
      grid-template-columns: 1fr;
    }

    .exercise-header {
      flex-direction: column;
      align-items: flex-start;
    }
  }
`;
