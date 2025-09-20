import React, { useState, useEffect, useRef } from "react";
import { Search, Zap, Users, TrendingUp, Filter, ArrowRight, Star, Award, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import Particles from '../components/Particles';

export default function SearchInsights() {
  const [query, setQuery] = useState("");
  const [searchBy, setSearchBy] = useState("keyword");
  const [limit, setLimit] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [isDark, setIsDark] = useState(true);
  const inputRef = useRef(null);

  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const darkMode = localStorage.getItem("insight_theme") === "dark";
    if (darkMode) {
      setIsDark(true);
    }
  }, []);

  // Add this function to handle navigation to login
  const handleLoginClick = () => {
    navigate("/login");
  };

  // Add this function to handle navigation to signup
  const handleSignupClick = () => {
    navigate("/signup");
  };

  const fetchResults = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    setError(null);
    setLoading(true);
    setResults(null);

    try {
      const encoded = encodeURIComponent(query);
      const endpoint = `https://insights-sih-tf-lva.fly.dev/search-users-by-keyword?keyword=${encoded}&limit=${limit}`;

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
      bg: 'bg-gradient-to-br from-gray-900 via-black to-gray-900',
      cardBg: 'bg-gradient-to-br from-white/5 via-white/[0.02] to-white/5',
      secondaryBg: 'bg-gray-800/60',
      text: 'text-white',
      subText: 'text-gray-300',
      border: 'border-white/10',
      input: 'bg-gray-800 text-white placeholder-gray-400 border-gray-700 focus:border-purple-400',
      shadow: 'shadow-2xl shadow-black/60',
      glow: 'shadow-purple-500/30'
    },
    light: {
      bg: 'bg-gradient-to-br from-gray-100 via-white to-gray-100',
      cardBg: 'bg-gradient-to-br from-white/80 via-white/40 to-white/80',
      secondaryBg: 'bg-gray-100/80',
      text: 'text-gray-900',
      subText: 'text-gray-600',
      border: 'border-white/20',
      input: 'bg-gray-50 text-gray-900 placeholder-gray-500 border-gray-300 focus:border-purple-500',
      shadow: 'shadow-xl shadow-gray-300/60',
      glow: 'shadow-purple-500/30'
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

  // Floating particles background effect - REMOVED
  const FloatingParticles = () => null;

  // Simple input handler to prevent focus loss
  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  // Feature cards for the hero section
  const FeatureCard = ({ icon: Icon, title, description, color }) => (
    <div className={`${t.cardBg} rounded-2xl p-6 backdrop-blur-xl border ${t.border} transition-all duration-300 hover:scale-105 ${t.shadow}`}>
      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <h3 className={`text-xl font-bold ${t.text} mb-2 text-center`}>{title}</h3>
      <p className={`${t.subText} text-center`}>{description}</p>
    </div>
  );

  return (
    <div className="min-h-screen font-['Inter'] relative overflow-hidden bg-black">
      {/* Fixed Particles Background - covering entire page */}
      <div className="fixed inset-0 w-full h-full z-0">
        <Particles
          particleColors={['#ffffff', '#ffffff', '#ffffff']}
          particleCount={300}
          particleSpread={15}
          speed={0.1}
          particleBaseSize={150}
          moveParticlesOnHover={true}
          alphaParticles={false}
          disableRotation={false}
          particleHoverFactor={0.5}
          sizeRandomness={0.8}
          cameraDistance={25}
        />
      </div>
      
      {/* Main Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="pt-20 pb-16">
          <div className="space-y-6 mt-20 font-[Inter,Roboto,system-ui,sans-serif]">
            <div className="max-w-6xl mx-auto space-y-6 px-4">
              {/* Hero Header Section */}
              <section className="px-8 mb-16">
                <div className="max-w-7xl mx-auto">
                  <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center mb-6">
                <div className="relative">
                  <h1 className={`text-6xl font-black mb-6 ${
                    isDark 
                      ? 'bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400' 
                      : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600'
                  } bg-clip-text text-transparent`}>
                    insights
                  </h1>
                </div>
              </div>
              <p className={`text-xl ${t.subText} font-medium max-w-3xl mx-auto mb-10 text-center`}>
                Discover profiles and keywords with intelligent search powered by advanced analytics
              </p>
              
              {/* Login and Signup buttons - only shown when not authenticated */}
              {!user && (
                <div className="flex gap-4 justify-center mb-12">
                  <button
                    onClick={handleLoginClick}
                    className="px-8 py-4 rounded-2xl font-bold bg-white/10 backdrop-blur-lg border border-white/20 text-white hover:bg-white/20 transition-all duration-300 shadow-lg"
                  >
                    Login
                  </button>
                  <button
                    onClick={handleSignupClick}
                    className="px-8 py-4 rounded-2xl font-bold bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-purple-500/30"
                  >
                    Sign Up
                  </button>
                </div>
              )}
                  </div>
                </div>
              </section>

              {/* Search Interface */}
              <div className="mb-16">
                <form onSubmit={fetchResults} className="space-y-8">
                <div className="relative w-full max-w-2xl mx-auto">
                  <div className={`relative ${t.cardBg} rounded-2xl p-1 ${t.border} backdrop-blur-xl`}>
                    <div className="flex">
                      <div className="flex items-center pl-4">
                        <Search className="w-6 h-6 text-purple-400" />
                      </div>
                      <input
                        ref={inputRef}
                        value={query}
                        onChange={handleInputChange}
                        placeholder={searchBy === "keyword" ? "Search by keywords (e.g., data science, react, AI)" : "Search by username or handle"}
                        className={`flex-1 py-5 px-4 text-lg ${t.input} focus:outline-none bg-transparent`}
                        autoComplete="off"
                      />
                      <button
                        type="submit"
                        disabled={loading || !query.trim()}
                        className="px-8 py-5 rounded-xl text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                            <span>Searching...</span>
                          </div>
                        ) : (
                          "Search"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Search Controls */}
                <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
                  {/* Search Type Toggle */}
                  <div className={`inline-flex rounded-2xl p-1 ${t.secondaryBg} border ${t.border} backdrop-blur-sm`}>
                    <button
                      type="button"
                      onClick={() => setSearchBy("keyword")}
                      className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                        searchBy === "keyword"
                          ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg"
                          : `${t.text} hover:bg-white/10`
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
                          ? "bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-lg"
                          : `${t.text} hover:bg-white/10`
                      }`}
                    >
                      <Users className="w-4 h-4 inline mr-2" />
                      By User
                    </button>
                  </div>

                  {/* Limit Input */}
                  <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl ${t.secondaryBg} border ${t.border} backdrop-blur-sm`}>
                    <TrendingUp className="w-5 h-5 text-purple-500" />
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
                </div>
                </form>
              </div>

              {/* Features Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <FeatureCard 
                icon={Target}
                title="Precision Search"
                description="Find exactly what you're looking for with our advanced keyword matching algorithms"
                color="from-purple-500 to-indigo-500"
              />
              <FeatureCard 
                icon={Award}
                title="Ranking System"
                description="See how profiles rank based on relevance and engagement metrics"
                color="from-indigo-500 to-blue-500"
              />
              <FeatureCard 
                icon={Star}
                title="Smart Insights"
                description="Get actionable insights from profile data and keyword trends"
                color="from-blue-500 to-purple-500"
              />
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <main className="w-full px-4 sm:px-6 pb-16">
          <div className="max-w-7xl mx-auto">
            {error && (
              <div className={`${t.cardBg} border border-red-500/30 rounded-2xl p-8 text-red-400 backdrop-blur-xl ${t.shadow} max-w-3xl mx-auto`}>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                    ❌
                  </div>
                  <div>
                    <h3 className="font-bold text-2xl mb-2">Search Failed</h3>
                    <p className="text-red-300 text-lg">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {results && (
              <div className="space-y-10 animate-fade-in">
                {/* Results Header */}
                <div className="text-center mb-12">
                  <h2 className={`text-4xl font-bold ${t.text} mb-4`}>
                    Results for "{results.keyword || query}"
                  </h2>
                  <p className={`${t.subText} text-xl text-center`}>
                    Found <span className="text-purple-400 font-bold">{results.total_results || 0}</span> matching profiles
                  </p>
                </div>

                {/* Results Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {(results.top_users || []).map((user) => (
                    <div
                      key={user.user_id}
                      className={`group ${t.cardBg} rounded-3xl p-8 backdrop-blur-xl border ${t.border} hover:shadow-purple-500/30 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 ${t.shadow}`}
                      onClick={() => navigate(`/searchresults?userid=${user.user_id}`)}
                    >
                      <div className="flex items-start gap-6">
                        {/* Rank Badge */}
                        <div className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${getRankColor(user.rank)} flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                          <span className="text-white font-black text-2xl">
                            {user.rank}
                          </span>
                          {user.rank <= 3 && (
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                              <span className="text-sm">👑</span>
                            </div>
                          )}
                        </div>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                            <h3 className={`text-2xl font-bold ${t.text} truncate`}>
                              {user.name || user.user_id}
                            </h3>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/20 border border-purple-500/30">
                                <Zap className="w-5 h-5 text-purple-400" />
                                <span className="text-purple-400 font-bold text-lg">
                                  {user.total_points} pts
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-6 mb-6 justify-start">
                            <div className="flex items-center gap-3">
                              <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                              <span className={`${t.subText} text-base`}>
                                <strong className="text-purple-400 font-bold">{user.keyword_occurrences}</strong> keyword matches
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                              <span className={`${t.subText} text-base`}>
                                ID: <code className="font-mono text-sm">{user.user_id}</code>
                              </span>
                            </div>
                          </div>

                          {/* Sample matches preview */}
                          {user.sample_matches && user.sample_matches.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-600/30">
                              <p className={`${t.subText} text-sm mb-3 font-semibold text-left`}>Sample matches:</p>
                              <div className="flex flex-wrap gap-2 justify-start">
                                {user.sample_matches.slice(0, 3).map((match, i) => (
                                  <span key={i} className="px-3 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium">
                                    {match.field}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* View Profile Button */}
                          <div className="mt-6 flex justify-end">
                            <button 
                              className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/30 text-purple-400 hover:from-purple-500/30 hover:to-indigo-500/30 transition-all duration-300 group font-bold"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/searchresults?userid=${user.user_id}`);
                              }}
                            >
                              View Full Profile
                              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {Array.isArray(results.top_users) && results.top_users.length === 0 && (
                    <div className={`${t.cardBg} rounded-3xl p-16 text-center backdrop-blur-xl border ${t.border} ${t.shadow} col-span-full`}>
                      <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-gray-500/20 to-gray-600/20 flex items-center justify-center">
                        <Search className="w-16 h-16 text-gray-400" />
                      </div>
                      <h3 className={`text-3xl font-bold ${t.text} mb-4`}>No results found</h3>
                      <p className={`${t.subText} text-xl mb-8 text-center`}>
                        Try adjusting your search terms or search criteria
                      </p>
                      <button
                        onClick={() => setResults(null)}
                        className="px-8 py-4 rounded-2xl font-bold bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-purple-500/30"
                      >
                        Try Another Search
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      
      {/* Accessibility helpers (visually-hidden) */}
      <style>{`
        :root { color-scheme: dark; }
        .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
      `}</style>
    </div>
  );
}