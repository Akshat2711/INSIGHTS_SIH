import React, { useState, useEffect } from "react";
import { Search,Zap, Users, TrendingUp, Filter} from "lucide-react";
import { useNavigate } from "react-router-dom";



export default function SearchInsights() {
  const [query, setQuery] = useState("");
  const [searchBy, setSearchBy] = useState("keyword");
  const [limit, setLimit] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [isDark, setIsDark] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const darkMode = localStorage.getItem("insight_theme") === "dark";
    if (darkMode) {
      setIsDark(true);
    }
  }, []);



  const fetchResults = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    setError(null);
    setLoading(true);
    setResults(null);

    try {
      const encoded = encodeURIComponent(query);
      const endpoint = `http://127.0.0.1:5000/search-users-by-keyword?keyword=${encoded}&limit=${limit}`;

      const resp = await fetch(endpoint);
      if (!resp.ok) throw new Error(`${resp.status} ${resp.statusText}`);
      const data = await resp.json();
      setResults(data);
    } catch (err) {
      setError(err.message || "Failed to fetch");
    } finally {
      setLoading(false);
    }
  };

  const theme = {
    dark: {
      bg: 'bg-black',
      cardBg: 'bg-transparent',
      secondaryBg: 'bg-gray-800/50',
      text: 'text-gray-100',
      subText: 'text-gray-400',
      border: 'border-gray-700',
      input: 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500',
      shadow: 'shadow-2xl shadow-black/60',
      glow: 'shadow-cyan-500/20'
    },
    light: {
      bg: 'bg-white',
      cardBg: 'bg-transparent',
      secondaryBg: 'bg-gray-100/80',
      text: 'text-gray-900',
      subText: 'text-gray-600',
      border: 'border-gray-300',
      input: 'bg-white border-gray-300 text-gray-900 placeholder-gray-400',
      shadow: 'shadow-xl shadow-gray-300/60',
      glow: 'shadow-blue-500/30'
    }
  };


  const t = theme[isDark ? 'dark' : 'light'];

  const getRankColor = (rank) => {
    const colors = [
      'from-yellow-400 to-orange-500', // 1st - Gold
      'from-gray-300 to-gray-500',     // 2nd - Silver  
      'from-orange-400 to-yellow-600', // 3rd - Bronze
      'from-blue-400 to-cyan-500',     // 4th+
      'from-purple-400 to-pink-500'    // 5th+
    ];
    return colors[Math.min(rank - 1, colors.length - 1)];
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${t.bg} ${t.text}`}>
      {/* Animated background gradient */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute inset-0  animate-pulse"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-bounce-slow"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-bounce-slow animation-delay-1000"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center px-6 py-8">
        {/* Header with theme toggle */}
        <header className="w-full max-w-6xl flex justify-between items-center mb-12 mt-16">
          <div className="text-center flex-1">
            <div className="inline-flex items-center gap-3 mb-4">
              <h1 className="text-6xl md:text-9xl font-black tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-500 animate-gradient">
                  insights
                </span>
              </h1>
              
           
            </div>
            <p className={`text-lg ${t.subText} font-medium`}>
              Discover profiles and keywords with intelligent search
            </p>
          </div>
          
   
        </header>

        {/* Search Interface */}
        <main className="w-full max-w-4xl space-y-8">
          <div className={`${t.cardBg} ${t.shadow} rounded-3xl p-8 backdrop-blur-xl border ${t.border}`}>
            <form onSubmit={fetchResults} className="space-y-6">
              {/* Search Input */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <Search className="w-6 h-6 text-cyan-500" />
                </div>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={searchBy === "keyword" ? "Search by keywords (e.g., data science, react, AI)" : "Search by username or handle"}
                  className={`w-full pl-14 pr-6 py-4 text-xl rounded-2xl ${t.input} border focus:outline-none focus:ring-4 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all duration-300`}
                />
              </div>

              {/* Controls */}
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Search Type Toggle */}
                <div className={`inline-flex rounded-2xl p-1 ${t.secondaryBg} border ${t.border}`}>
                  <button
                    type="button"
                    onClick={() => setSearchBy("keyword")}
                    className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      searchBy === "keyword"
                        ? "bg-gradient-to-r from-cyan-500 to-violet-500 text-white shadow-lg transform scale-105"
                        : `${t.text} hover:scale-105 hover:bg-white/10`
                    }`}
                  >
                    <Filter className="w-4 h-4 inline mr-2" />
                    By Keyword
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchBy("user")}
                    className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      searchBy === "user"
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg transform scale-105"
                        : `${t.text} hover:scale-105 hover:bg-white/10`
                    }`}
                  >
                    <Users className="w-4 h-4 inline mr-2" />
                    By User
                  </button>
                </div>

                {/* Limit Input */}
                <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl ${t.secondaryBg} border ${t.border}`}>
                  <TrendingUp className="w-5 h-5 text-violet-500" />
                  <label className={`text-sm font-medium ${t.subText}`}>Show top</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={limit}
                    onChange={(e) => setLimit(Number(e.target.value) || 1)}
                    className={`w-16 text-center bg-transparent outline-none text-lg font-bold ${t.text}`}
                  />
                  <span className={`text-sm ${t.subText}`}>results</span>
                </div>

                {/* Search Button */}
                <button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="px-8 py-4 rounded-2xl text-lg font-bold bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 text-white shadow-xl hover:shadow-violet-500/50 hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Searching...
                    </div>
                  ) : (
                    <>
                      <Search className="w-5 h-5 inline mr-2" />
                      Search
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Results */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-red-400 animate-shake backdrop-blur-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                  ❌
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Search Failed</h3>
                  <p className="text-red-300">{error}</p>
                </div>
              </div>
            </div>
          )}

          {results && (
            <div className="space-y-6 animate-fade-in">
              {/* Results Header */}
              <div className={`${t.cardBg} rounded-2xl p-6 ${t.shadow} backdrop-blur-xl border ${t.border}`}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className={`text-2xl font-bold ${t.text} mb-2`}>
                      Results for "{results.keyword || query}"
                    </h2>
                    <p className={`${t.subText} text-lg`}>
                      Found {results.total_results || 0} matching profiles
                    </p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500/20 to-violet-500/20 border border-cyan-500/30">
                    <TrendingUp className="w-5 h-5 text-cyan-400" />
                    <span className="text-cyan-400 font-semibold">Top Results</span>
                  </div>
                </div>
              </div>

              {/* Results Grid */}
              <div className="grid gap-4">
                {(results.top_users || []).map((user, index) => (
                    <div
                      key={user.user_id}
                      className={`group ${t.cardBg} rounded-2xl p-6 ${t.shadow} backdrop-blur-xl border ${t.border} hover:${t.glow} hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer`}
                      onClick={() => navigate(`/searchresults?userid=${user.user_id}`)}
                    >
                    <div className="flex items-start gap-6">
                      {/* Rank Badge */}
                      <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${getRankColor(user.rank)} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <span className="text-white font-black text-xl">
                          {user.rank}
                        </span>
                        {user.rank <= 3 && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                            <span className="text-xs">👑</span>
                          </div>
                        )}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
                          <h3 className={`text-xl font-bold ${t.text} truncate`}>
                            {user.name || user.user_id}
                          </h3>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-violet-500/20 border border-violet-500/30">
                              <Zap className="w-4 h-4 text-violet-400" />
                              <span className="text-violet-400 font-semibold text-sm">
                                {user.total_points} pts
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                            <span className={`${t.subText} text-sm`}>
                              <strong className="text-cyan-400">{user.keyword_occurrences}</strong> keyword matches
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className={`${t.subText} text-sm`}>
                              ID: <code className="font-mono text-xs">{user.user_id}</code>
                            </span>
                          </div>
                        </div>

                        {/* Sample matches preview */}
                        {user.sample_matches && user.sample_matches.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-600/30">
                            <p className={`${t.subText} text-xs mb-2`}>Sample matches:</p>
                            <div className="flex flex-wrap gap-2">
                              {user.sample_matches.slice(0, 3).map((match, i) => (
                                <span key={i} className="px-2 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono">
                                  {match.field}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {Array.isArray(results.top_users) && results.top_users.length === 0 && (
                  <div className={`${t.cardBg} rounded-2xl p-12 text-center ${t.shadow} backdrop-blur-xl border ${t.border}`}>
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-500/20 to-gray-600/20 flex items-center justify-center">
                      <Search className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className={`text-xl font-semibold ${t.text} mb-2`}>No results found</h3>
                    <p className={`${t.subText}`}>
                      Try adjusting your search terms or search criteria
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 30s ease infinite;
        }
        .animate-bounce-slow {
          animation: bounce 3s infinite;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
}