import { React, useState } from "react";
import { ChevronDown, ExternalLink, Star, Utensils, BookOpen } from "lucide-react";

export const Githubstats_card = ({ darkmode, githubData }) => {
  const [showAllRepos, setShowAllRepos] = useState(false);

  const totalRepos = githubData?.repositories?.length || 0;
  const totalStars =
    githubData?.repositories?.reduce((sum, repo) => sum + repo.total_stars, 0) || 0;
  const totalForks =
    githubData?.repositories?.reduce((sum, repo) => sum + repo.total_forks, 0) || 0;
  const primaryLanguages =
    githubData?.repositories?.reduce((acc, repo) => {
      if (repo.primary_language) {
        acc[repo.primary_language] = (acc[repo.primary_language] || 0) + 1;
      }
      return acc;
    }, {}) || {};

  const statCards = [
    { label: "Repositories", value: totalRepos, color: "from-green-500/40 to-emerald-600/30", icon: <BookOpen size={20}/> },
    { label: "Stars", value: totalStars, color: "from-yellow-500/40 to-orange-600/30", icon: <Star size={20}/> },
    { label: "Forks", value: totalForks, color: "from-blue-500/40 to-indigo-600/30", icon: <Utensils size={20}/> },
    { label: "Followers", value: githubData?.profile?.followers || 0, color: "from-purple-500/40 to-pink-600/30", icon: <ChevronDown size={20}/> },
  ];

  return (
    <section className="relative py-20 px-6 sm:px-12 overflow-hidden">
      {/* background glow */}
      <div
        className={`absolute inset-4 rounded-3xl backdrop-blur-xl border shadow-xl ${
          darkmode
            ? "bg-white/[0.02] border-white/10 shadow-black/40"
            : "bg-black/[0.02] border-black/10 shadow-black/20"
        }`}
      ></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <h2
            className={`text-4xl sm:text-6xl font-extrabold tracking-tight ${
              darkmode ? "text-white" : "text-gray-900"
            }`}
          >
            GitHub
            <span
              className={`block text-5xl sm:text-7xl mt-2 font-black ${
                darkmode
                  ? "bg-gradient-to-r from-green-400 via-blue-400 to-purple-400"
                  : "bg-gradient-to-r from-green-600 via-blue-600 to-purple-600"
              } bg-clip-text text-transparent animate-gradient-x`}
            >
              Overview
            </span>
          </h2>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
          {statCards.map((stat, i) => (
            <div
              key={i}
              className={`relative rounded-3xl p-6 backdrop-blur-xl group overflow-hidden transition-all hover:scale-[1.03] hover:shadow-lg ${
                darkmode
                  ? "bg-white/5 border border-white/10"
                  : "bg-white/70 border border-black/10"
              }`}
            >
              {/* glowing accent */}
              <div
                className={`absolute inset-0 opacity-0 group-hover:opacity-100 blur-2xl transition duration-500 bg-gradient-to-br ${stat.color}`}
              ></div>

              <div className="relative z-10 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`p-2 rounded-lg bg-gradient-to-r ${stat.color} text-white`}
                  >
                    {stat.icon}
                  </div>
                  <span
                    className={`text-3xl font-extrabold ${
                      darkmode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {stat.value}
                  </span>
                </div>
                <span
                  className={`text-sm tracking-wide ${
                    darkmode ? "text-gray-400" : "text-gray-700"
                  }`}
                >
                  {stat.label}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Languages */}
        <div
          className={`rounded-3xl p-8 mb-14 backdrop-blur-xl ${
            darkmode
              ? "bg-white/5 border border-white/10"
              : "bg-white/70 border border-black/10"
          }`}
        >
          <h3
            className={`text-2xl font-semibold mb-6 ${
              darkmode ? "text-white" : "text-gray-900"
            }`}
          >
            Most Used Languages
          </h3>
          <div className="flex flex-wrap gap-4">
            {Object.entries(primaryLanguages)
              .slice(0, 8)
              .map(([lang, count]) => (
                <div
                  key={lang}
                  className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all hover:scale-105 ${
                    darkmode
                      ? "bg-gradient-to-r from-green-600/20 to-blue-600/20 text-white border-green-400/20"
                      : "bg-gradient-to-r from-green-100 to-blue-100 text-gray-900 border-green-300"
                  }`}
                >
                  {lang} <span className="opacity-70">({count})</span>
                </div>
              ))}
          </div>
        </div>

        {/* Repositories */}
        <div
          className={`rounded-3xl p-8 backdrop-blur-xl ${
            darkmode
              ? "bg-white/5 border border-white/10"
              : "bg-white/70 border border-black/10"
          }`}
        >
          <div className="flex items-center justify-between mb-8">
            <h3
              className={`text-3xl font-bold ${
                darkmode ? "text-white" : "text-gray-900"
              }`}
            >
              Repositories ({totalRepos})
            </h3>
            <button
              onClick={() => setShowAllRepos(!showAllRepos)}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl font-medium transition-all hover:scale-105 ${
                darkmode
                  ? "bg-gradient-to-r from-green-500 to-blue-500 text-white"
                  : "bg-gradient-to-r from-green-600 to-blue-600 text-white"
              }`}
            >
              {showAllRepos ? "Show Less" : "Show All"}
              <ChevronDown
                size={18}
                className={`transform transition-transform ${
                  showAllRepos ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {(showAllRepos
              ? githubData?.repositories
              : githubData?.repositories?.slice(0, 6)
            )?.map((repo, index) => (
              <div
                key={repo.name}
                className={`relative p-6 rounded-2xl border backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
                  darkmode
                    ? "bg-white/5 border-white/10 hover:border-green-400/30"
                    : "bg-white/80 border-black/10 hover:border-green-300/40"
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Title */}
                <div className="flex items-start justify-between mb-3">
                  <h4
                    className={`font-semibold text-lg ${
                      darkmode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {repo.name}
                  </h4>
                  {repo.is_fork && (
                    <span
                      className={`px-2 py-0.5 rounded-lg text-xs ${
                        darkmode
                          ? "bg-yellow-500/20 text-yellow-300"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      Fork
                    </span>
                  )}
                </div>

                {/* Description */}
                {repo.description && (
                  <p
                    className={`text-sm mb-4 ${
                      darkmode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {repo.description.length > 90
                      ? `${repo.description.substring(0, 90)}...`
                      : repo.description}
                  </p>
                )}

                {/* Stats */}
                <div className="flex items-center gap-5 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        repo.primary_language
                          ? "bg-gradient-to-r from-green-500 to-blue-500"
                          : "bg-gray-400"
                      }`}
                    ></div>
                    <span
                      className={`${darkmode ? "text-gray-300" : "text-gray-600"}`}
                    >
                      {repo.primary_language || "No language"}
                    </span>
                  </div>
                  <div
                    className={`flex items-center gap-3 text-sm ${
                      darkmode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      <Star size={14} /> {repo.total_stars}
                    </span>
                    <span className="flex items-center gap-1">
                      <Utensils size={14} /> {repo.total_forks}
                    </span>
                  </div>
                </div>

                {/* Language Chips */}
                {repo.repo_languages && repo.repo_languages.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {repo.repo_languages.slice(0, 3).map((lang) => (
                      <span
                        key={lang}
                        className={`px-3 py-1 rounded-lg text-xs font-medium border ${
                          darkmode
                            ? "bg-green-600/20 text-green-300 border-green-400/30"
                            : "bg-green-100 text-green-700 border-green-200"
                        }`}
                      >
                        {lang}
                      </span>
                    ))}
                    {repo.repo_languages.length > 3 && (
                      <span
                        className={`text-xs px-2 py-1 ${
                          darkmode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        +{repo.repo_languages.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs ${
                      darkmode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {repo.open_issues_count > 0 &&
                      `${repo.open_issues_count} issues`}
                  </span>
                  <a
                    href={repo.repo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:scale-105 ${
                      darkmode
                        ? "bg-gradient-to-r from-green-500 to-blue-500 text-white"
                        : "bg-gradient-to-r from-green-600 to-blue-600 text-white"
                    }`}
                  >
                    <ExternalLink size={14} />
                    View
                  </a>
                </div>
              </div>
            ))}
          </div>

          {!showAllRepos && githubData?.repositories?.length > 6 && (
            <div className="text-center mt-8">
              <span
                className={`px-4 py-2 rounded-xl text-sm ${
                  darkmode
                    ? "bg-white/5 text-gray-400"
                    : "bg-black/5 text-gray-600"
                }`}
              >
                and {githubData.repositories.length - 6} more repositories...
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
