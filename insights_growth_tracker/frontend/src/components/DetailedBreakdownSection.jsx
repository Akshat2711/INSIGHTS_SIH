import React from "react";
import { Calendar, Trophy, BookOpen, ExternalLink } from 'lucide-react';


const DetailedBreakdownSection = ({ darkMode, safePostToNo, getTypeIcon }) => {




    
  return (
    <section className="relative py-24 px-8 overflow-hidden pt-8">
      {/* Glassmorphism background container */}
      <div
        className={`absolute inset-4 rounded-3xl backdrop-blur-md border shadow-2xl ${
          darkMode
            ? "bg-white/[0.02] border-white/5 shadow-black/20"
            : "bg-black/[0.02] border-black/5 shadow-black/10"
        }`}
      ></div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2
            className={`text-5xl font-black mb-4 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Detailed Breakdown
          </h2>
          <p
            className={`text-xl ${
              darkMode ? "text-gray-400" : "text-gray-600"
            } max-w-2xl mx-auto`}
          >
            Explore each achievement with comprehensive details and source
            references
          </p>
        </div>

        {/* Timeline Layout */}
        <div className="space-y-16">
          {Object.entries(safePostToNo).map(
            ([category, items], categoryIndex) =>
              Array.isArray(items) && items.length > 0 ? (
                <div key={category} className="relative">
                  {/* Category Header */}
                  <div
                    className={`sticky top-16 z-20 rounded-2xl p-6 mb-8 ${
                      darkMode
                        ? "bg-gradient-to-r from-slate-900/95 to-gray-900/95 border border-white/10"
                        : "bg-gradient-to-r from-white/95 to-gray-50/95 border border-black/10"
                    } backdrop-blur-xl`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-3 rounded-xl ${
                            darkMode
                              ? "bg-gradient-to-br from-indigo-600/30 to-purple-600/30"
                              : "bg-gradient-to-br from-indigo-100 to-purple-100"
                          }`}
                        >
                          {React.createElement(getTypeIcon(category), {
                            size: 24,
                            className: `${
                              darkMode ? "text-indigo-400" : "text-indigo-600"
                            }`,
                          })}
                        </div>
                        <div>
                          <h3
                            className={`text-2xl font-bold capitalize ${
                              darkMode ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {category.replace("_", " ")}
                          </h3>
                          <p
                            className={`text-sm ${
                              darkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            {items.length} achievements •{" "}
                            {items.reduce(
                              (sum, item) => sum + parseInt(item?.points || 0),
                              0
                            )}{" "}
                            total points
                          </p>
                        </div>
                      </div>
                      <div
                        className={`px-4 py-2 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600`}
                      >
                        #{categoryIndex + 1}
                      </div>
                    </div>
                  </div>

                  {/* Achievement Cards in Grid */}
                  <div className="grid gap-8 md:grid-cols-2">
                    {items.map((item, index) => (
                      <div
                        key={index}
                        className={`rounded-2xl p-6 transition-all duration-500 hover:scale-105 ${
                          darkMode
                            ? "bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/10 hover:border-indigo-400/30"
                            : "bg-gradient-to-br from-white/80 to-white/60 border border-white/20 hover:border-indigo-300/50"
                        } backdrop-blur-xl group`}
                        style={{
                          animationDelay: `${index * 100}ms`,
                          animation: "slideInUp 0.6s ease-out forwards",
                        }}
                      >
                        {/* Achievement Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            {item?.position && (
                              <div
                                className={`px-3 py-1 rounded-full text-sm font-bold text-white bg-gradient-to-r ${
                                  item.position === "1" ||
                                  item.position === "Winner"
                                    ? "from-yellow-500 to-orange-500"
                                    : item.position === "2"
                                    ? "from-gray-400 to-gray-600"
                                    : item.position === "3"
                                    ? "from-orange-600 to-orange-800"
                                    : "from-indigo-500 to-purple-500"
                                }`}
                              >
                                {item.position === "1" ||
                                item.position === "Winner"
                                  ? "🥇 1st"
                                  : item.position === "2"
                                  ? "🥈 2nd"
                                  : item.position === "3"
                                  ? "🥉 3rd"
                                  : item.position}
                              </div>
                            )}
                            {item?.type && (
                              <div
                                className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  darkMode
                                    ? "bg-indigo-600/20 text-indigo-300"
                                    : "bg-indigo-100 text-indigo-700"
                                }`}
                              >
                                {item.type}
                              </div>
                            )}
                          </div>

                          {/* Points Badge */}
                          <div
                            className={`flex items-center gap-2 px-3 py-1 rounded-xl ${
                              item?.why?.toLowerCase().includes("deducted")
                                ? "bg-red-500/20 border border-red-500/30"
                                : "bg-green-500/20 border border-green-500/30"
                            }`}
                          >
                            <Trophy
                              size={14}
                              className={`${
                                item?.why?.toLowerCase().includes("deducted")
                                  ? "text-red-400"
                                  : "text-green-400"
                              }`}
                            />
                            <span
                              className={`font-bold ${
                                item?.why?.toLowerCase().includes("deducted")
                                  ? "text-red-400"
                                  : "text-green-400"
                              }`}
                            >
                              {item?.points || 0}pts
                            </span>
                          </div>
                        </div>

                        {/* Metadata */}
                        <div
                          className={`flex items-center gap-4 text-sm mb-4 ${
                            darkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>
                              {Array.isArray(item?.timestamp)
                                ? item.timestamp.join(", ")
                                : item?.timestamp || "No date"}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span>❤️ {item?.reaction || 0}</span>
                            <span>💬 {item?.comments || 0}</span>
                          </div>
                        </div>

                        {/* Reason */}
                        <div
                          className={`p-3 rounded-lg ${
                            darkMode ? "bg-white/5" : "bg-black/5"
                          } mb-4`}
                        >
                          <p
                            className={`text-sm ${
                              darkMode ? "text-gray-300" : "text-gray-700"
                            }`}
                          >
                            {item?.why || "Achievement points awarded"}
                          </p>
                        </div>

                        {/* Source Posts Preview */}
                        {item?.source_post_excerpt?.length > 0 && (
                          <div className="space-y-3">
                            <h5
                              className={`text-sm font-semibold flex items-center gap-2 ${
                                darkMode ? "text-white" : "text-gray-900"
                              }`}
                            >
                              <BookOpen size={14} />
                              Source Posts ({item.source_post_excerpt.length})
                            </h5>
                            {item.source_post_excerpt
                              .slice(0, 2)
                              .map((excerpt, excerptIndex) => (
                                <div
                                  key={excerptIndex}
                                  className={`p-3 rounded-lg border transition-all hover:scale-[1.02] ${
                                    darkMode
                                      ? "bg-white/[0.02] border-white/5 hover:border-purple-400/20"
                                      : "bg-white/60 border-white/10 hover:border-purple-300/30"
                                  } backdrop-blur-sm`}
                                >
                                  <p
                                    className={`text-xs mb-2 line-clamp-2 ${
                                      darkMode ? "text-gray-300" : "text-gray-700"
                                    }`}
                                  >
                                    {excerpt.length > 100
                                      ? excerpt.substring(0, 100) + "..."
                                      : excerpt}
                                  </p>
                                  {item?.source_post_index?.[excerptIndex] !==
                                    undefined && (
                                    <button
                                      onClick={() => {
                                        const postIndex =
                                          item.source_post_index[excerptIndex];
                                        const postElement =
                                          document.querySelector(
                                            `[data-post-index="${postIndex}"]`
                                          );
                                        if (postElement) {
                                          postElement.scrollIntoView({
                                            behavior: "smooth",
                                            block: "center",
                                          });
                                          postElement.classList.add(
                                            "highlight-post"
                                          );
                                          setTimeout(
                                            () =>
                                              postElement.classList.remove(
                                                "highlight-post"
                                              ),
                                            3000
                                          );
                                        }
                                      }}
                                      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all hover:scale-105 ${
                                        darkMode
                                          ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                                          : "bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
                                      }`}
                                    >
                                      <ExternalLink size={10} />
                                      View
                                    </button>
                                  )}
                                </div>
                              ))}
                            {item.source_post_excerpt.length > 2 && (
                              <div
                                className={`text-center p-2 rounded-lg ${
                                  darkMode ? "bg-white/5" : "bg-black/5"
                                }`}
                              >
                                <span
                                  className={`text-xs ${
                                    darkMode ? "text-gray-400" : "text-gray-600"
                                  }`}
                                >
                                  +{item.source_post_excerpt.length - 2} more posts
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null
          )}
        </div>
      </div>
    </section>
  );
};

export default DetailedBreakdownSection;
