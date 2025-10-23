import React, { useState } from 'react';
import {  Trophy, Star, Zap,Users, BookOpen, ChevronDown, ChevronUp, ExternalLink, ArrowRight, Heart, MessageCircle } from 'lucide-react';


export const Current_leaderboard_user_performance = ({current_user,darkMode,allUsersData,userid=userid}) => {

    const [showAllActivities, setShowAllActivities] = useState(false);
    const [expandedActivity, setExpandedActivity] = useState(null);



  return (
    <div>
            <section className="px-8">
        <div className="max-w-7xl mx-auto">
          <div className={`rounded-3xl backdrop-blur-2xl border overflow-hidden ${darkMode ? 'bg-gradient-to-br from-white/5 via-white/[0.02] to-white/5 border-white/10' : 'bg-gradient-to-br from-white/80 via-white/40 to-white/80 border-white/20'}`}>
            {/* Header */}
            <div className={`p-6 border-b ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${darkMode ? 'bg-gradient-to-br from-indigo-600/30 to-purple-600/30' : 'bg-gradient-to-br from-indigo-100 to-purple-100'}`}>
                  <Star className={`${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} size={24} />
                </div>
                <div>
                  <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Your Performance</h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Track your progress among champions</p>
                </div>
              </div>
            </div>
            
            {/* Stats Grid */}
            <div className="p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-8">
                <div className={`text-center p-4 rounded-2xl ${darkMode ? 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20' : 'bg-gradient-to-br from-yellow-100 to-orange-100 border border-yellow-200'}`}>
                  <div className={`text-3xl font-black mb-2 ${darkMode ? 'bg-gradient-to-r from-yellow-400 to-orange-400' : 'bg-gradient-to-r from-yellow-600 to-orange-600'} bg-clip-text text-transparent`}>#{current_user.rank}</div>
                  <div className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Rank</div>
                </div>
                <div className={`text-center p-4 rounded-2xl ${darkMode ? 'bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20' : 'bg-gradient-to-br from-purple-100 to-pink-100 border border-purple-200'}`}>
                  <div className={`text-3xl font-black mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{current_user.totalPoints}</div>
                  <div className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Points</div>
                </div>
                <div className={`text-center p-4 rounded-2xl ${darkMode ? 'bg-white/5' : 'bg-black/5'}`}>
                  <div className="flex items-center justify-center mb-2">
                    <Zap className={`${darkMode ? 'text-orange-400' : 'text-orange-600'} mr-2`} size={20} />
                    <div className={`text-2xl font-bold ${current_user.hackathons === 'NA' ? (darkMode ? 'text-gray-500' : 'text-gray-400') : (darkMode ? 'text-white' : 'text-gray-900')}`}>
                      {current_user.hackathons}
                    </div>
                  </div>
                  <div className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Hackathons</div>
                </div>
                <div className={`text-center p-4 rounded-2xl ${darkMode ? 'bg-white/5' : 'bg-black/5'}`}>
                  <div className="flex items-center justify-center mb-2">
                    <Trophy className={`${darkMode ? 'text-blue-400' : 'text-blue-600'} mr-2`} size={20} />
                    <div className={`text-2xl font-bold ${current_user.certifications === 'NA' ? (darkMode ? 'text-gray-500' : 'text-gray-400') : (darkMode ? 'text-white' : 'text-gray-900')}`}>
                      {current_user.certifications}
                    </div>
                  </div>
                  <div className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Certifications</div>
                </div>
                <div className={`text-center p-4 rounded-2xl ${darkMode ? 'bg-white/5' : 'bg-black/5'}`}>
                  <div className="flex items-center justify-center mb-2">
                    <Star className={`${darkMode ? 'text-purple-400' : 'text-purple-600'} mr-2`} size={20} />
                    <div className={`text-2xl font-bold ${current_user.projects === 'NA' ? (darkMode ? 'text-gray-500' : 'text-gray-400') : (darkMode ? 'text-white' : 'text-gray-900')}`}>
                      {current_user.projects}
                    </div>
                  </div>
                  <div className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Projects</div>
                </div>
                <div className={`text-center p-4 rounded-2xl ${darkMode ? 'bg-white/5' : 'bg-black/5'}`}>
                  <div className="flex items-center justify-center mb-2">
                    <Users className={`${darkMode ? 'text-red-400' : 'text-red-600'} mr-2`} size={20} />
                    <div className={`text-2xl font-bold ${current_user.leadership === 'NA' ? (darkMode ? 'text-gray-500' : 'text-gray-400') : (darkMode ? 'text-white' : 'text-gray-900')}`}>
                      {current_user.leadership}
                    </div>
                  </div>
                  <div className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Leadership</div>
                </div>
              </div>
              
              {/* Recent Activities - Enhanced with Expandable Content */}
              {allUsersData && allUsersData.all_users[userid]?.original_scrapping && (
                <div>
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-2">
                    <h4 className={`font-bold flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      <BookOpen className={`${darkMode ? 'text-indigo-400' : 'text-indigo-600'} mr-2`} size={20} />
                      Recent LinkedIn Activities:
                    </h4>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${darkMode ? 'bg-indigo-500/10 text-indigo-300' : 'bg-indigo-100 text-indigo-700'}`}>
                      {allUsersData.all_users[userid].original_scrapping.length} Total Posts
                    </div>
                  </div>

                  {/* Activities Grid */}
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {allUsersData.all_users[userid].original_scrapping
                      .slice(0, showAllActivities ? allUsersData.all_users[userid].original_scrapping.length : 3)
                      .map((post, index) => (
                        <div 
                          key={index} 
                          className={`p-4 sm:p-6 rounded-2xl border transition-all duration-300 hover:scale-[1.02] cursor-pointer ${
                            darkMode 
                              ? 'bg-white/[0.02] border-white/5 hover:border-indigo-400/20' 
                              : 'bg-white/60 border-white/10 hover:border-indigo-300/30'
                          } backdrop-blur-sm`}
                          onClick={() => setExpandedActivity(expandedActivity === index ? null : index)}
                        >
                          {/* Post Preview */}
                          <div className={`${expandedActivity === index ? 'mb-4' : 'mb-3'} flex flex-col min-w-0`}>
                            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} leading-relaxed text-sm ${expandedActivity === index ? '' : 'line-clamp-3 break-words'}`}>
                              {post.text}
                            </p>
                            
                            {/* Expand/Collapse Indicator */}
                            {post.text && post.text.length > 120 && (
                              <div className="flex items-center justify-center mt-2">
                                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                                  darkMode 
                                    ? 'bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20' 
                                    : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                                }`}>
                                  {expandedActivity === index ? (
                                    <>
                                      <ChevronUp size={12} />
                                      <span>Show Less</span>
                                    </>
                                  ) : (
                                    <>
                                      <ChevronDown size={12} />
                                      <span>Show More</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Post Metadata */}
                          <div className={`flex flex-wrap items-center justify-between text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} pt-3 border-t ${darkMode ? 'border-white/5' : 'border-black/5'}`}>
                            <div className="flex flex-wrap items-center gap-3 min-w-0">
                              <span className="flex items-center gap-1 flex-shrink-0">
                                <span className="text-pink-500"><Heart/></span>
                                {post.reactions || 0}
                              </span>
                              <span className="flex items-center gap-1 flex-shrink-0">
                                <span className="text-blue-500"><MessageCircle/></span>
                                {post.comments || 0}
                              </span>
                            </div>
                            
                            {/* External Link */}
                              <div
                                className={`p-1 sm:p-2 rounded-full mt-1 sm:mt-2 transition-all duration-300 hover:scale-110 flex-shrink-0 ${
                                  darkMode
                                    ? 'hover:bg-indigo-500/10 text-indigo-400'
                                    : 'hover:bg-indigo-100 text-indigo-600'
                                }`}
                              >
                                <ExternalLink size={16} className="sm:text-lg" />
                              </div>

                          </div>
                        </div>
                    ))}
                  </div>

                  {/* Show More/Less Button */}
                  {allUsersData.all_users[userid].original_scrapping.length > 3 && (
                    <div className="text-center mt-6">
                      <button
                        onClick={() => setShowAllActivities(!showAllActivities)}
                        className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all duration-300 hover:scale-105 ${
                          darkMode 
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/30' 
                            : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:shadow-lg hover:shadow-indigo-400/30'
                        }`}
                      >
                        {showAllActivities ? (
                          <>
                            <ChevronUp size={16} />
                            <span>Show Less Activities</span>
                          </>
                        ) : (
                          <>
                            <ArrowRight size={16} />
                            <span>View All {allUsersData.all_users[userid].original_scrapping.length} Activities</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
