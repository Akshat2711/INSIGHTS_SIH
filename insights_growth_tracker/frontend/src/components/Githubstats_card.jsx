import {React,useState } from "react";
import { ChevronDown, ExternalLink} from 'lucide-react';



export const Githubstats_card = ({darkmode,githubData}) => {

/* for github section */
const [showAllRepos, setShowAllRepos] = useState(false);
console.log(githubData )

// GitHub Analytics
const totalRepos = githubData?.repositories?.length || 0;
const totalStars = githubData?.repositories?.reduce((sum, repo) => sum + repo.total_stars, 0) || 0;
const totalForks = githubData?.repositories?.reduce((sum, repo) => sum + repo.total_forks, 0) || 0;
const primaryLanguages = githubData?.repositories?.reduce((acc, repo) => {
  if (repo.primary_language) {
    acc[repo.primary_language] = (acc[repo.primary_language] || 0) + 1;
  }
  return acc;
}, {}) || {};




  return (
    <section className="relative py-24 px-8 overflow-hidden pt-8">
  {/* Same glassmorphism background */}
  <div className={`absolute inset-4 rounded-3xl backdrop-blur-md border shadow-2xl ${
    darkmode
      ? 'bg-white/[0.02] border-white/5 shadow-black/20' 
      : 'bg-black/[0.02] border-black/5 shadow-black/10'
  }`}></div>

  <div className="relative z-10 max-w-7xl mx-auto">
    {/* GitHub Header */}
    <div className="text-center mb-16">
      <h2 className={`text-5xl font-black mb-6 ${darkmode? 'text-white' : 'text-gray-900'}`}>
        GitHub
        <span className={`block text-6xl ${darkmode? 'bg-gradient-to-r from-green-400 to-blue-400' : 'bg-gradient-to-r from-green-600 to-blue-600'} bg-clip-text text-transparent`}>
          Overview
        </span>
      </h2>
    </div>

    {/* GitHub Stats Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      <div className={`rounded-3xl p-6 ${darkmode? 'bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20' : 'bg-gradient-to-br from-green-50 to-green-100 border border-green-200'} backdrop-blur-xl`}>
        <div className={`text-3xl font-black mb-1 ${darkmode? 'text-white' : 'text-gray-900'}`}>{totalRepos}</div>
        <div className={`text-sm ${darkmode? 'text-gray-400' : 'text-gray-600'}`}>Total Repositories</div>
      </div>
      
      <div className={`rounded-3xl p-6 ${darkmode? 'bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/20' : 'bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200'} backdrop-blur-xl`}>
        <div className={`text-3xl font-black mb-1 ${darkmode? 'text-white' : 'text-gray-900'}`}>{totalStars}</div>
        <div className={`text-sm ${darkmode? 'text-gray-400' : 'text-gray-600'}`}>Total Stars</div>
      </div>
      
      <div className={`rounded-3xl p-6 ${darkmode? 'bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20' : 'bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200'} backdrop-blur-xl`}>
        <div className={`text-3xl font-black mb-1 ${darkmode? 'text-white' : 'text-gray-900'}`}>{totalForks}</div>
        <div className={`text-sm ${darkmode? 'text-gray-400' : 'text-gray-600'}`}>Total Forks</div>
      </div>
      
      <div className={`rounded-3xl p-6 ${darkmode? 'bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20' : 'bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200'} backdrop-blur-xl`}>
        <div className={`text-3xl font-black mb-1 ${darkmode? 'text-white' : 'text-gray-900'}`}>{githubData?.profile?.followers || 0}</div>
        <div className={`text-sm ${darkmode? 'text-gray-400' : 'text-gray-600'}`}>Followers</div>
      </div>
    </div>

    {/* Top Languages */}
    <div className={`rounded-3xl p-8 mb-12 ${darkmode? 'bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10' : 'bg-gradient-to-br from-black/[0.02] to-black/[0.08] border border-black/10'} backdrop-blur-xl`}>
      <h3 className={`text-xl font-bold mb-6 ${darkmode? 'text-white' : 'text-gray-900'}`}>Most Used Languages</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(primaryLanguages).slice(0, 8).map(([lang, count], index) => (
          <div key={lang} className={`p-4 rounded-xl ${darkmode? 'bg-white/5' : 'bg-black/5'}`}>
            <div className={`font-bold ${darkmode? 'text-white' : 'text-gray-900'}`}>{lang}</div>
            <div className={`text-sm ${darkmode? 'text-gray-400' : 'text-gray-600'}`}>{count} repos</div>
          </div>
        ))}
      </div>
    </div>

    {/* Repositories Section */}
    <div className={`rounded-3xl p-8 ${darkmode? 'bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10' : 'bg-gradient-to-br from-black/[0.02] to-black/[0.08] border border-black/10'} backdrop-blur-xl`}>
      <div className="flex items-center justify-between mb-8">
        <h3 className={`text-2xl font-bold ${darkmode? 'text-white' : 'text-gray-900'}`}>
          Repositories ({totalRepos})
        </h3>
        <button
          onClick={() => setShowAllRepos(!showAllRepos)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:scale-105 ${
            darkmode
              ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white hover:shadow-lg hover:shadow-green-500/30' 
              : 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:shadow-lg hover:shadow-green-200/50'
          }`}
        >
          {showAllRepos ? 'Show Less' : 'Show All'}
          <ChevronDown 
            size={18} 
            className={`transform transition-transform ${showAllRepos ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Repository Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {(showAllRepos ? githubData?.repositories : githubData?.repositories?.slice(0, 6))?.map((repo, index) => (
          <div
            key={repo.name}
            className={`p-6 rounded-2xl border transition-all duration-300 hover:scale-[1.02] group ${
              darkmode
                ? 'bg-gradient-to-br from-white/[0.03] to-white/[0.01] border-white/10 hover:border-green-400/30' 
                : 'bg-gradient-to-br from-white/80 to-white/60 border-white/20 hover:border-green-300/50'
            } backdrop-blur-sm`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Repository Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <h4 className={`font-bold text-lg mb-2 ${darkmode? 'text-white' : 'text-gray-900'} group-hover:text-transparent group-hover:bg-gradient-to-r ${darkmode? 'group-hover:from-green-400 group-hover:to-blue-400' : 'group-hover:from-green-600 group-hover:to-blue-600'} group-hover:bg-clip-text transition-all`}>
                  {repo.name}
                </h4>
                {repo.description && (
                  <p className={`text-sm mb-3 ${darkmode? 'text-gray-300' : 'text-gray-600'}`}>
                    {repo.description.length > 100 ? `${repo.description.substring(0, 100)}...` : repo.description}
                  </p>
                )}
              </div>
              {repo.is_fork && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${darkmode? 'bg-yellow-500/20 text-yellow-300' : 'bg-yellow-100 text-yellow-700'} ml-3 flex-shrink-0`}>
                  Fork
                </span>
              )}
            </div>

            {/* Repository Stats */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                <div className={`w-3 h-3 rounded-full ${repo.primary_language ? 'bg-gradient-to-r from-green-500 to-blue-500' : 'bg-gray-400'}`}></div>
                <span className={`text-sm ${darkmode? 'text-gray-300' : 'text-gray-600'}`}>
                  {repo.primary_language || 'No language'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm flex items-center gap-1 ${darkmode? 'text-gray-300' : 'text-gray-600'}`}>
                  ⭐ {repo.total_stars}
                </span>
                <span className={`text-sm flex items-center gap-1 ${darkmode? 'text-gray-300' : 'text-gray-600'}`}>
                  🔄 {repo.total_forks}
                </span>
              </div>
            </div>

            {/* Languages Tags */}
            {repo.repo_languages && repo.repo_languages.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {repo.repo_languages.slice(0, 3).map((lang, langIndex) => (
                  <span
                    key={lang}
                    className={`px-3 py-1 rounded-lg text-xs font-medium ${
                      darkmode
                        ? 'bg-green-600/20 text-green-300 border border-green-500/30' 
                        : 'bg-green-100 text-green-700 border border-green-200'
                    }`}
                  >
                    {lang}
                  </span>
                ))}
                {repo.repo_languages.length > 3 && (
                  <span className={`text-xs px-2 py-1 ${darkmode? 'text-gray-400' : 'text-gray-500'}`}>
                    +{repo.repo_languages.length - 3} more
                  </span>
                )}
              </div>
            )}

            {/* Repository Link */}
            <div className="flex items-center justify-between">
              <div className={`text-xs ${darkmode? 'text-gray-400' : 'text-gray-500'}`}>
                {repo.open_issues_count > 0 && `${repo.open_issues_count} issues`}
              </div>
              <a
                href={repo.repo_url}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:scale-105 ${
                  darkmode
                    ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white hover:shadow-lg' 
                    : 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:shadow-lg'
                }`}
              >
                <ExternalLink size={12} />
                View
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Show more indicator when collapsed */}
      {!showAllRepos && githubData?.repositories?.length > 6 && (
        <div className="text-center mt-8">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${darkmode? 'bg-white/5 text-gray-400' : 'bg-black/5 text-gray-600'}`}>
            <span className="text-sm">and {githubData.repositories.length - 6} more repositories...</span>
          </div>
        </div>
      )}
    </div>
  </div>
</section>
  )
}
