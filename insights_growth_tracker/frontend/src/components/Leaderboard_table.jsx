import React, { useState } from 'react';
import { Crown, Medal, Award, Info, AlertCircle, Trophy, Star, Zap, Target, Users, BookOpen, RefreshCw, Database, X, Code} from 'lucide-react';

export const Leaderboard_table = ({leaderboardData,darkMode,fetchAllUsersData,loading,allUsersData,textColor,formatUserIdToName,fnc_allUsersData,fnc_lastrefresh,fnc_isDataFromStorage}) => {


    const [hoveredUser, setHoveredUser] = useState(null);
    const [selectedUserBreakdown, setSelectedUserBreakdown] = useState(null);

    




    

// Clear cached data
const clearCachedData = () => {
    localStorage.removeItem('leaderboard_data');
    localStorage.removeItem('leaderboard_last_refresh');
    fnc_allUsersData(null);

    fnc_lastrefresh(null);
    fnc_isDataFromStorage(false);
  };


const getRankIcon = (rank) => {
      switch (rank) {
        case 1:
          return <Crown className="text-yellow-500" size={24} />;
        case 2:
          return <Medal className={darkMode ? "text-gray-300" : "text-gray-400"} size={24} />;
        case 3:
          return <Award className="text-amber-600" size={24} />;
        default:
          return <span className={`text-xl font-bold ${textColor}`}>#{rank}</span>;
      }
    };



  // Function to calculate detailed points breakdown for a user
  const calculateDetailedPointsBreakdown = (userData) => {
    if (!userData || !userData.post_to_no) return { categories: [], totalPoints: 0 };
    
    const postData = userData.post_to_no;
    const breakdown = {
      categories: [],
      totalPoints: 0
    };
    
    const categoryMappings = {
      hackathon: { name: 'Hackathons', icon: 'Zap', color: 'orange' },
      certification: { name: 'Certifications', icon: 'Trophy', color: 'blue' },
      leadership: { name: 'Leadership', icon: 'Users', color: 'red' },
      project: { name: 'Projects', icon: 'Star', color: 'purple' },
      internship: { name: 'Internships', icon: 'Target', color: 'green' },
      inhouse_project: { name: 'In-house Projects', icon: 'Star', color: 'indigo' },
      fsd_project: { name: 'FSD Projects', icon: 'Star', color: 'pink' },
      coding_platform: { name: 'Coding Platforms', icon: 'Code', color: 'cyan' },
      membership: { name: 'Memberships', icon: 'Users', color: 'violet' },
      assessment: { name: 'Assessments', icon: 'Target', color: 'teal' },
      research_publications: { name: 'Research Publications', icon: 'BookOpen', color: 'emerald' }
    };
    
    // Helper function to safely extract points from an item (same as original)
    const extractPoints = (item) => {
      if (!item) return 0;
      
      // If item is a simple number or string, return it
      if (typeof item === 'number') return item;
      if (typeof item === 'string' && !isNaN(parseInt(item))) return parseInt(item);
      
      // If item is an object, try to extract points
      if (typeof item === 'object') {
        const points = item.points || item.point || item.score || 0;
        return typeof points === 'number' ? points : (typeof points === 'string' && !isNaN(parseInt(points))) ? parseInt(points) : 0;
      }
      
      return 0;
    };
    
    Object.entries(categoryMappings).forEach(([key, config]) => {
      if (postData[key] && Array.isArray(postData[key]) && postData[key].length > 0) {
        const count = postData[key].length;
        
        // Calculate actual total points for this category using the real point extraction logic
        const actualTotalPoints = postData[key].reduce((sum, item) => {
          return sum + extractPoints(item);
        }, 0);
        
        // Calculate average points per item for display
        const avgPointsPerItem = count > 0 ? Math.round(actualTotalPoints / count * 10) / 10 : 0;
        
        breakdown.categories.push({
          name: config.name,
          count: count,
          pointsPerItem: avgPointsPerItem,
          totalPoints: actualTotalPoints,
          icon: config.icon,
          color: config.color,
          items: postData[key]
        });
        
        breakdown.totalPoints += actualTotalPoints;
      }
    });
    
    return breakdown;
  };




    


  return (
    <div>

    {/* Points Breakdown Modal */}
    {selectedUserBreakdown && allUsersData && allUsersData.all_users[selectedUserBreakdown] && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className={`max-w-4xl mt-32 w-full max-h-[90vh] overflow-y-auto hide-scrollbar rounded-3xl backdrop-blur-2xl border ${darkMode ? 'bg-gradient-to-br from-gray-900/95 to-slate-900/95 border-white/10' : 'bg-gradient-to-br from-white/95 to-gray-50/95 border-black/10'}`}>
          {/* Modal Header */}
          <div className={`p-6 border-b ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${darkMode ? 'bg-gradient-to-br from-indigo-600/30 to-purple-600/30' : 'bg-gradient-to-br from-indigo-100 to-purple-100'}`}>
                  <Trophy className={`${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} size={24} />
                </div>
                <div>
                  <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {formatUserIdToName(selectedUserBreakdown)}'s Points Breakdown
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Detailed analysis of achievement points
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserBreakdown(null)}
                className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 ${darkMode ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-black/10 text-gray-600 hover:text-gray-900'}`}
              >
                <X size={24} />
              </button>
            </div>
          </div>
          
          {/* Modal Content */}
          <div className="p-6">
            {(() => {
              const breakdown = calculateDetailedPointsBreakdown(allUsersData.all_users[selectedUserBreakdown]);
              const getIconComponent = (iconName, color, size = 20) => {
                const iconProps = { size, className: `text-${color}-500` };
                switch (iconName) {
                  case 'Zap': return <Zap {...iconProps} />;
                  case 'Trophy': return <Trophy {...iconProps} />;
                  case 'Users': return <Users {...iconProps} />;
                  case 'Star': return <Star {...iconProps} />;
                  case 'Target': return <Target {...iconProps} />;
                  case 'BookOpen': return <BookOpen {...iconProps} />;
                  case 'Code': return <Code {...iconProps} />;
                  default: return <Star {...iconProps} />;
                }
              };
              
              return (
                <div>
                  {/* Total Points Summary */}
                  <div className={`rounded-2xl p-6 mb-6 ${darkMode ? 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20' : 'bg-gradient-to-r from-indigo-100 to-purple-100 border border-indigo-200'}`}>
                    <div className="text-center">
                      <h4 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Total Achievement Points</h4>
                      <div className={`text-4xl font-black ${darkMode ? 'bg-gradient-to-r from-indigo-400 to-purple-400' : 'bg-gradient-to-r from-indigo-600 to-purple-600'} bg-clip-text text-transparent`}>
                        {breakdown.totalPoints}
                      </div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
                        Earned across {breakdown.categories.length} categories
                      </p>
                    </div>
                  </div>
                  
                  {/* Categories Breakdown */}
                  {breakdown.categories.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      {breakdown.categories.map((category, index) => (
                        <div key={index} className={`rounded-2xl p-5 border transition-all duration-300 hover:scale-[1.02] ${darkMode ? 'bg-white/[0.02] border-white/5 hover:border-white/10' : 'bg-white/60 border-white/10 hover:border-gray-200'} backdrop-blur-sm`}>
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-xl bg-${category.color}-500/10`}>
                                {getIconComponent(category.icon, category.color, 20)}
                              </div>
                              <div>
                                <h5 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{category.name}</h5>
                                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{category.count} items</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-xl font-bold ${darkMode ? `text-${category.color}-400` : `text-${category.color}-600`}`}>{category.totalPoints}</div>
                              <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>points</div>
                            </div>
                          </div>
                          
                          <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-3`}>
                            <span className="font-medium">{category.count}</span> items × <span className="font-medium">{category.pointsPerItem}</span> avg points = <span className="font-bold">{category.totalPoints}</span> points
                          </div>
                          
                          {/* Items Preview */}
                          <div className={`max-h-24 overflow-y-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            <div className="text-xs leading-relaxed">
                              {category.items.slice(0, 3).map((item, itemIndex) => {
                                const itemPoints = (() => {
                                  if (!item) return 0;
                                  if (typeof item === 'number') return item;
                                  if (typeof item === 'string' && !isNaN(parseInt(item))) return parseInt(item);
                                  if (typeof item === 'object') {
                                    const points = item.points || item.point || item.score || 0;
                                    return typeof points === 'number' ? points : (typeof points === 'string' && !isNaN(parseInt(points))) ? parseInt(points) : 0;
                                  }
                                  return 0;
                                })();
                                
                                return (
                                  <div key={itemIndex} className="mb-1 p-2 rounded-lg bg-black/5 flex justify-between items-start">
                                    <span className="flex-1">
                                      {typeof item === 'object' ? (
                                        item.title || item.name || item.description || item.type || 'Achievement'
                                      ) : (
                                        String(item).substring(0, 40) + (String(item).length > 40 ? '...' : '')
                                      )}
                                    </span>
                                    <span className={`ml-2 px-1 py-0.5 rounded text-xs font-bold ${darkMode ? 'bg-white/10 text-white' : 'bg-black/10 text-gray-800'}`}>
                                      {itemPoints}pts
                                    </span>
                                  </div>
                                );
                              })}
                              {category.items.length > 3 && (
                                <div className={`text-xs italic ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                  +{category.items.length - 3} more items...
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={`text-center py-12 rounded-2xl ${darkMode ? 'bg-white/[0.02] border border-white/5' : 'bg-white/60 border border-white/10'}`}>
                      <AlertCircle className={`mx-auto mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} size={48} />
                      <p className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>No Achievement Data</p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>This user hasn't recorded any achievements yet</p>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    )}  



              <section className="px-8 mb-16">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
 

          {/* Top 3 Podium */}
          {leaderboardData.length >= 3 && (
            <div className="mb-16">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {/* Second Place */}
                <div className="md:order-1 order-2">
                  <div className={`relative rounded-3xl backdrop-blur-2xl border p-8 text-center transform hover:scale-105 transition-all duration-300 ${darkMode ? 'bg-gradient-to-br from-gray-500/10 to-slate-500/10 border-gray-400/20 hover:border-gray-300/40' : 'bg-gradient-to-br from-gray-100 to-slate-100 border-gray-200 hover:border-gray-300'}`}>
                    <div className={`absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-2xl font-bold ${darkMode ? 'bg-gradient-to-r from-gray-600 to-slate-600 text-white' : 'bg-gradient-to-r from-gray-500 to-slate-500 text-white'}`}>
                      2nd Place
                    </div>
                    <div className="mb-6 mt-4">
                      <Medal className={`mx-auto mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-400'}`} size={48} />
                      <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{leaderboardData[1].name}</h3>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>@{leaderboardData[1].userId}</p>
                      <div className={`text-3xl font-black ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{leaderboardData[1].totalPoints}</div>
                      <div className={`text-sm font-medium ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Points</div>
                    </div>
                    {leaderboardData[1].isReal && (
                      <div className={`inline-block px-3 py-1 rounded-xl text-xs font-bold ${darkMode ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-purple-100 text-purple-700 border border-purple-200'}`}>
                        Real User
                      </div>
                    )}
                  </div>
                </div>

                {/* First Place */}
                <div className="md:order-2 order-1">
                  <div className={`relative rounded-3xl backdrop-blur-2xl border p-8 text-center transform hover:scale-105 transition-all duration-300 ${darkMode ? 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-400/20 hover:border-yellow-300/40' : 'bg-gradient-to-br from-yellow-100 to-orange-100 border-yellow-200 hover:border-yellow-300'}`}>
                    <div className={`absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-2xl font-bold ${darkMode ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white' : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'}`}>
                      🏆 Champion
                    </div>
                    <div className="mb-6 mt-4">
                      <Crown className={`mx-auto mb-4 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} size={56} />
                      <h3 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{leaderboardData[0].name}</h3>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>@{leaderboardData[0].userId}</p>
                      <div className={`text-4xl font-black ${darkMode ? 'bg-gradient-to-r from-yellow-400 to-orange-400' : 'bg-gradient-to-r from-yellow-600 to-orange-600'} bg-clip-text text-transparent`}>{leaderboardData[0].totalPoints}</div>
                      <div className={`text-sm font-medium ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Points</div>
                    </div>
                    {leaderboardData[0].isReal && (
                      <div className={`inline-block px-3 py-1 rounded-xl text-xs font-bold ${darkMode ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-purple-100 text-purple-700 border border-purple-200'}`}>
                        Real User
                      </div>
                    )}
                  </div>
                </div>

                {/* Third Place */}
                <div className="md:order-3 order-3">
                  <div className={`relative rounded-3xl backdrop-blur-2xl border p-8 text-center transform hover:scale-105 transition-all duration-300 ${darkMode ? 'bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-400/20 hover:border-amber-300/40' : 'bg-gradient-to-br from-amber-100 to-orange-100 border-amber-200 hover:border-amber-300'}`}>
                    <div className={`absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-2xl font-bold ${darkMode ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white' : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'}`}>
                      3rd Place
                    </div>
                    <div className="mb-6 mt-4">
                      <Award className={`mx-auto mb-4 text-amber-600`} size={48} />
                      <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{leaderboardData[2].name}</h3>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>@{leaderboardData[2].userId}</p>
                      <div className={`text-3xl font-black ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>{leaderboardData[2].totalPoints}</div>
                      <div className={`text-sm font-medium ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Points</div>
                    </div>
                    {leaderboardData[2].isReal && (
                      <div className={`inline-block px-3 py-1 rounded-xl text-xs font-bold ${darkMode ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-purple-100 text-purple-700 border border-purple-200'}`}>
                        Real User
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          

          {/* Full Rankings - Modern Card Layout */}
          <div className={`rounded-3xl backdrop-blur-2xl border overflow-hidden ${darkMode ? 'bg-gradient-to-br from-white/5 via-white/[0.02] to-white/5 border-white/10' : 'bg-gradient-to-br from-white/80 via-white/40 to-white/80 border-white/20'}`}>
            {/* Header */}
            <div className={`p-6 border-b flex sm:flex-row flex-col ${darkMode ? 'border-white/10' : 'border-black/10'}`}>

              <div >
                <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Top Rankings</h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>participants ranked by performance</p>
              </div>

              {/* Compact Icon Buttons */}
                  <div className="flex items-center gap-2 mt-4 sm:mt-0 sm:absolute sm:top-6 sm:right-6">
                    {/* Refresh Button */}
                    <button
                      onClick={fetchAllUsersData}
                      disabled={loading}
                      className={`flex items-center justify-center w-9 h-9 rounded-full border text-gray-600 dark:text-gray-300 
                        ${loading 
                          ? "border-gray-300 dark:border-gray-600 cursor-not-allowed opacity-60" 
                          : "border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-white/10"
                        } transition`}
                      title="Refresh"
                    >
                      <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    </button>

                    {/* Clear Button */}
                    {allUsersData && (
                      <button
                        onClick={clearCachedData}
                        className="flex items-center justify-center w-9 h-9 rounded-full border border-gray-300 dark:border-gray-600
                          text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition"
                        title="Clear"
                      >
                        <Database className="w-4 h-4" />
                      </button>
                    )}
                  </div>
            </div>
            
            {/* Rankings Grid */}
              <div className="p-4 sm:p-6">
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 max-w-7xl mx-auto">
                  {leaderboardData.map((user) => (
                    <div
                      key={user.id}
                      className={`rounded-2xl border p-4 sm:p-6 transition-all duration-300 hover:scale-[1.01] cursor-pointer ${
                        darkMode
                          ? 'bg-white/[0.02] border-white/5 hover:border-purple-400/20'
                          : 'bg-white/60 border-white/10 hover:border-purple-300/30'
                      } backdrop-blur-sm ${user.isReal ? (darkMode ? 'border-l-4 border-l-purple-400' : 'border-l-4 border-l-purple-500') : ''}`}
                      onMouseEnter={() => setHoveredUser(user.id)}
                      onMouseLeave={() => setHoveredUser(null)}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        {/* Left: Rank & User Info */}
                        <div className="flex flex-1 items-start sm:items-center gap-4 sm:gap-6 flex-wrap">
                          <div className="flex-shrink-0">{getRankIcon(user.rank)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <h4 className={`text-lg font-bold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {user.name}
                              </h4>
                              {user.isReal && (
                                <span
                                  className={`px-2 py-1 rounded-lg text-xs font-bold ${
                                    darkMode
                                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                      : 'bg-purple-100 text-purple-700 border border-purple-200'
                                  }`}
                                >
                                  Real
                                </span>
                              )}
                            </div>
                            <p className={`text-sm truncate ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                              @{user.userId}
                            </p>

                            {/* Key Stats Row */}
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                              {user.hackathons !== 'NA' && user.hackathons > 0 && (
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <Zap className="text-orange-500" size={14} />
                                  <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{user.hackathons}</span>
                                </div>
                              )}
                              {user.certifications !== 'NA' && user.certifications > 0 && (
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <Trophy className="text-blue-500" size={14} />
                                  <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{user.certifications}</span>
                                </div>
                              )}
                              {user.projects !== 'NA' && user.projects > 0 && (
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <Star className="text-purple-500" size={14} />
                                  <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{user.projects}</span>
                                </div>
                              )}
                              {user.leadership !== 'NA' && user.leadership > 0 && (
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <Users className="text-red-500" size={14} />
                                  <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{user.leadership}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right: Points */}
                        <div className="text-right flex-shrink-0">
                          <div
                            className={`text-3xl font-black mb-1 ${
                              darkMode
                                ? 'bg-gradient-to-r from-purple-400 to-indigo-400'
                                : 'bg-gradient-to-r from-purple-600 to-indigo-600'
                            } bg-clip-text text-transparent`}
                          >
                            {user.totalPoints}
                          </div>
                          <div className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Points</div>
                        </div>
                      </div>

                      {/* Evidence - Expanded on Hover */}
                      {hoveredUser === user.id && (
                        <div className={`mt-4 pt-4 border-t transition-all duration-300 ${darkMode ? 'border-white/5' : 'border-black/5'}`}>
                          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <Info size={16} className={`mt-0.5 flex-shrink-0 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-semibold mb-1 truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                  Achievement Summary:
                                </p>
                                <p className={`text-sm text-wrap leading-relaxed truncate ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                  {user.evidence || 'No specific achievements recorded yet'}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedUserBreakdown(user.userId);
                              }}
                              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 ${
                                darkMode
                                  ? 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/30'
                                  : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border border-indigo-200'
                              }`}
                            >
                              <Info size={14} />
                              <span>View Breakdown</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

          </div>
        </div>
      </section>
    </div>
  )
}
