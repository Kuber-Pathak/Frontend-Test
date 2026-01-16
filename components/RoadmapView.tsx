import { Roadmap } from "@/types";
import { Workflow, Clock, BookOpen, CheckCircle2 } from "lucide-react";

interface RoadmapViewProps {
  roadmap: Roadmap;
}

export function RoadmapView({ roadmap }: RoadmapViewProps) {
  console.log("[RoadmapView] Rendering roadmap:", roadmap);

  return (
    <div className="w-full max-w-5xl mx-auto my-6">
      {/* Header Card */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-8 mb-6 border border-gray-700/50 shadow-2xl">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl">
                <Workflow className="text-white" size={24} />
              </div>
              <h2 className="text-3xl font-bold text-white">
                {roadmap.key_technologies && roadmap.key_technologies.length > 0
                  ? roadmap.key_technologies.join(" + ")
                  : roadmap.title || "Learning"}{" "}
                Roadmap
              </h2>
            </div>
            <p className="text-gray-400 text-lg">{roadmap.goal}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-4 mt-6">
          {roadmap.total_estimated_hours && (
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-lg border border-gray-700/50">
              <Clock className="text-red-400" size={18} />
              <span className="text-sm font-medium text-gray-300">
                {roadmap.total_estimated_hours} hours total
              </span>
            </div>
          )}
          {roadmap.proficiency && (
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-lg border border-gray-700/50">
              <span className="text-sm font-medium text-gray-300">
                Level:{" "}
                <span className="text-red-400 capitalize">
                  {roadmap.proficiency}
                </span>
              </span>
            </div>
          )}
          {roadmap.phases && (
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-lg border border-gray-700/50">
              <span className="text-sm font-medium text-gray-300">
                {roadmap.phases.length} phases
              </span>
            </div>
          )}
        </div>

        {/* Tech Stack & Prerequisites */}
        {((roadmap.key_technologies || []).length > 0 ||
          (roadmap.prerequisites || []).length > 0) && (
          <div className="flex flex-wrap gap-6 mt-6 pt-6 border-t border-gray-700/50">
            {(roadmap.key_technologies || []).length > 0 && (
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                  Technologies
                </span>
                <div className="flex flex-wrap gap-2">
                  {(roadmap.key_technologies || []).map(
                    (tech: string, i: number) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-full text-xs font-medium text-red-400"
                      >
                        {tech}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}
            {(roadmap.prerequisites || []).length > 0 && (
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                  Prerequisites
                </span>
                <div className="flex flex-wrap gap-2">
                  {(roadmap.prerequisites || []).map(
                    (req: string, i: number) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-gray-800/50 border border-gray-700/50 rounded-full text-xs font-medium text-gray-400"
                      >
                        {req}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Phases */}
      <div className="space-y-6">
        {!roadmap.phases || roadmap.phases.length === 0 ? (
          <div className="text-center py-12 bg-gray-900/50 rounded-2xl border border-gray-800">
            <p className="text-gray-500">
              No phases available for this roadmap.
            </p>
          </div>
        ) : (
          roadmap.phases.map((phase, phaseIndex) => (
            <div
              key={phaseIndex}
              className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 overflow-hidden shadow-xl"
            >
              {/* Phase Header */}
              <div className="p-6 border-b border-gray-700/50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {phaseIndex + 1}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {phase.title}
                      </h3>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        {phase.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4 px-4 py-2 bg-gray-800/50 rounded-lg border border-gray-700/50">
                    <Clock className="text-red-400" size={16} />
                    <span className="text-sm font-semibold text-gray-300">
                      {phase.estimated_hours}h
                    </span>
                  </div>
                </div>
              </div>

              {/* Topics */}
              <div className="p-6 space-y-4">
                {(phase.topics || []).map((topic, topicIndex) => (
                  <div
                    key={topicIndex}
                    className="group bg-gray-800/30 rounded-xl p-5 border border-gray-700/30 hover:border-red-500/30 transition-all duration-200"
                  >
                    {/* Topic Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-red-500 to-orange-500"></div>
                          <h4 className="text-lg font-semibold text-white">
                            {topic.title}
                          </h4>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed ml-5">
                          {topic.description}
                        </p>
                      </div>
                      <span className="ml-4 px-3 py-1 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-lg text-xs font-semibold text-red-400">
                        {topic.estimated_hours}h
                      </span>
                    </div>

                    {/* Doc Link */}
                    {topic.doc_link && (
                      <div className="mb-4 ml-5">
                        <a
                          href={topic.doc_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-xs text-red-400 hover:text-red-300 transition-colors"
                        >
                          <BookOpen size={14} />
                          <span className="underline">View Documentation</span>
                        </a>
                      </div>
                    )}

                    {/* Subtopics */}
                    {topic.subtopics && topic.subtopics.length > 0 && (
                      <div className="ml-5 mt-4 space-y-3">
                        <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Learning Steps
                        </h5>
                        <div className="space-y-2">
                          {topic.subtopics.map((subtopic, subtopicIndex) => (
                            <div
                              key={subtopicIndex}
                              className="flex items-start gap-3 p-3 bg-gray-900/50 rounded-lg border border-gray-700/30 hover:border-gray-600/50 transition-colors"
                            >
                              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 flex items-center justify-center mt-0.5">
                                <span className="text-xs font-bold text-red-400">
                                  {subtopicIndex + 1}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1">
                                    <h6 className="text-sm font-medium text-gray-200 mb-1">
                                      {subtopic.title}
                                    </h6>
                                    <p className="text-xs text-gray-500 leading-relaxed">
                                      {subtopic.description}
                                    </p>
                                  </div>
                                  <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                                    {subtopic.estimated_hours}h
                                  </span>
                                </div>
                                {subtopic.doc_link && (
                                  <a
                                    href={subtopic.doc_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors mt-2"
                                  >
                                    <BookOpen size={12} />
                                    <span className="underline">Docs</span>
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Best Practices */}
                    {topic.best_practices &&
                      topic.best_practices.length > 0 && (
                        <div className="ml-5 mt-4 p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
                          <div className="flex items-center gap-2 mb-3">
                            <CheckCircle2
                              className="text-green-400"
                              size={16}
                            />
                            <h5 className="text-xs font-semibold text-green-400 uppercase tracking-wider">
                              Best Practices
                            </h5>
                          </div>
                          <ul className="space-y-2">
                            {topic.best_practices.map(
                              (practice: string, i: number) => (
                                <li
                                  key={i}
                                  className="flex items-start gap-2 text-xs text-gray-400"
                                >
                                  <span className="text-green-400 mt-0.5">
                                    •
                                  </span>
                                  <span>{practice}</span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Next Steps */}
      {(roadmap.next_steps || []).length > 0 && (
        <div className="mt-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700/50 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg">
              <Workflow className="text-white" size={20} />
            </div>
            <h3 className="text-xl font-bold text-white">What's Next?</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(roadmap.next_steps || []).map((step: string, i: number) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700/30"
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-xs font-bold text-white mt-0.5">
                  {i + 1}
                </span>
                <span className="text-sm text-gray-300 leading-relaxed">
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
