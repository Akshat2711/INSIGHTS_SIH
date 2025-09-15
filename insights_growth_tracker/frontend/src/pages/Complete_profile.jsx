import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Trophy, Calendar, MessageSquare, Heart, Award, Save, ArrowLeft,Loader } from 'lucide-react';

const CompleteProfile = () => {
  const [currentPostIndex, setCurrentPostIndex] = useState(0);
  const [userResponses, setUserResponses] = useState({});
  const [currentResponse, setCurrentResponse] = useState('');
  const [posts, setPosts] = useState([]);
  const [achievements, setAchievements] = useState({});
  const [totalPoints, setTotalPoints] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  
    const darkMode = localStorage.getItem("insight_theme") === "dark";
    useEffect(() => {
      document.body.style.backgroundColor = darkMode ? "rgb(0, 0, 0)" : "rgb(207, 207, 207)";
    }, [darkMode]);
  


  useEffect(() => {
    // Load data from localStorage
    const info = localStorage.getItem("insight_user_info");
    if (info) {
      try {
        const parsedData = JSON.parse(info);
        console.log("Parsed data:", parsedData);
        
        // Set global data for achievement detection
        window.parsedData = parsedData;
        
        // Extract posts from the correct structure
        let postsArray = [];
        let achievementData = {};
        let totalPts = 0;
        
        if (parsedData.user_data) {
          // Data is nested under user_data
          if (parsedData.user_data.original_scrapping && Array.isArray(parsedData.user_data.original_scrapping)) {
            postsArray = parsedData.user_data.original_scrapping;
          } else if (Array.isArray(parsedData.user_data)) {
            postsArray = parsedData.user_data;
          } else if (parsedData.user_data.posts) {
            postsArray = parsedData.user_data.posts;
          }
          achievementData = parsedData.user_data.post_to_no || {};
          totalPts = parsedData.user_data.total_points || 0;
        } else if (Array.isArray(parsedData)) {
          postsArray = parsedData;
        } else if (parsedData.posts) {
          postsArray = parsedData.posts;
          achievementData = parsedData.post_to_no || {};
          totalPts = parsedData.total_points || 0;
        }
        
        console.log("Posts array:", postsArray);
        setPosts(postsArray);
        setAchievements(achievementData);
        setTotalPoints(totalPts);
        
        // Set global data for achievement detection
        window.parsedData = parsedData.user_data || parsedData;
        
        // Load existing responses from the new storage format
        const savedResponses = localStorage.getItem('insight_user_post_responses');
        if (savedResponses && postsArray.length > 0) {
          try {
            const parsedResponses = JSON.parse(savedResponses);
            const existingResponses = {};
            postsArray.forEach((post, index) => {
              if (post.post_id && parsedResponses[post.post_id]) {
                existingResponses[index] = parsedResponses[post.post_id];
              }
            });
                        
            setUserResponses(existingResponses);
          } catch (error) {
            console.error("Error parsing saved responses:", error);
          }
        }
      } catch (error) {
        console.error("Error parsing localStorage data:", error);
      }
    }
  }, []);

  useEffect(() => {
    setCurrentResponse(userResponses[currentPostIndex] || '');
  }, [currentPostIndex, userResponses]);

  const getPostAchievements = (postIndex) => {
    const achievements = [];
    
    // Check all achievement categories in post_to_no
    if (window.parsedData?.post_to_no) {
      Object.keys(window.parsedData.post_to_no).forEach(category => {
        const categoryData = window.parsedData.post_to_no[category];
        
        if (Array.isArray(categoryData)) {
          categoryData.forEach(item => {
            if (item.source_post_index && item.source_post_index.includes(postIndex)) {
              achievements.push({
                type: category.charAt(0).toUpperCase() + category.slice(1),
                position: item.position,
                points: item.points,
                description: item.why,
                timestamp: item.timestamp?.[0] || ''
              });
            }
          });
        }
      });
    }

    return achievements;
  };



  const handleNext = () => {
    // Save current response to state
    if (currentResponse.trim()) {
      const updatedResponses = {
        ...userResponses,
        [currentPostIndex]: currentResponse.trim()
      };
      setUserResponses(updatedResponses);
    }

    if (currentPostIndex < posts.length - 1) {
      setCurrentPostIndex(currentPostIndex + 1);
    } else {
      // Save all responses to localStorage when completing
      saveAllResponses();
      setIsComplete(true);
    }
  };

  const handlePrevious = () => {
    if (currentPostIndex > 0) {
      setCurrentPostIndex(currentPostIndex - 1);
    }
  };

  




const saveAllResponses = async () => {
  setLoading(true);
  
  try {
    // Include current response if not saved yet
    const finalResponses = {
      ...userResponses
    };
    
    if (currentResponse.trim()) {
      finalResponses[currentPostIndex] = currentResponse.trim();
    }

    // Create response object with post_id as keys
    const roleData = {};
    posts.forEach((post, index) => {
      if (finalResponses[index] && post.post_id) {
        roleData[post.post_id] = finalResponses[index];
      }
    });

    // Save locally first
    localStorage.setItem('insight_user_post_responses', JSON.stringify(roleData));
    
    // Update backend
    const username = localStorage.getItem("linkedin_id");
    const response = await fetch('http://127.0.0.1:5000/update_points', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username,
        roles: roleData
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('Points updated successfully:', result);
      
      // Update local state immediately
      if (result.total_points) {
        setTotalPoints(result.total_points);
      }
      
      alert(`Points updated successfully! New total: ${result.total_points || 'calculating...'} points`);
    } else {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to update points');
    }
    
  } catch (error) {
    console.error('Error updating points:', error);
    alert(`Failed to update points: ${error.message}. Please try again.`);
  } finally {
    setLoading(false);
  }
};






  const handleSaveAndReturn = () => {
    // Save current response to state first
    const updatedResponses = {
      ...userResponses
    };
    
    if (currentResponse.trim()) {
      updatedResponses[currentPostIndex] = currentResponse.trim();
    }
    
    // Create response object with image URLs as keys
    const responseObject = {};
    posts.forEach((post, index) => {
      if (updatedResponses[index] && post.post_id) {
        responseObject[post.post_id] = updatedResponses[index];
      }
    });

    // Save to localStorage
    localStorage.setItem('insight_user_post_responses', JSON.stringify(responseObject));
    window.location.href = '/settings';
    
    
   
  };

  if (posts.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-400 mb-2">Loading your achievements...</p>
          <p className="text-gray-500 text-sm">
            If this persists, please check if data is saved in localStorage
          </p>
          <button
            onClick={() => {
              const info = localStorage.getItem("insight_user_info");
              console.log("Raw localStorage data:", info);
              if (info) {
                console.log("Parsed data:", JSON.parse(info));
              }
            }}
            className="mt-4 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-xl text-sm"
          >
            Debug Data
          </button>
        </div>
      </div>
    );
  }



  

  if (isComplete) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 mb-8 mt-10">
              <h2 className="text-2xl font-bold text-white mb-4">Summary</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-400">{posts.length}</div>
                  <div className="text-gray-400">Posts Reviewed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">{Object.keys(userResponses).length}</div>
                  <div className="text-gray-400">Achievements Described</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">{totalPoints}</div>
                  <div className="text-gray-400">Total Points</div>
                </div>
              </div>
            </div>

          {/* Loading */}
                  {loading && (
                    <div className="flex items-center justify-center py-16">
                      <div className={`rounded-2xl p-10 text-center animate-pulse ${darkMode ? 'bg-[#141418] border border-cyan-500/40 shadow-xl shadow-cyan-500/20 text-white' : 'bg-white border border-cyan-300 shadow-xl shadow-cyan-300/20 text-black'}`}>
                        <Loader className={`animate-spin mx-auto mb-4 ${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`} size={40} />
                        <span className="font-medium">Updating Scores...</span>
                      </div>
                    </div>
                  )}

            <button
              onClick={handleSaveAndReturn}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25 transform hover:scale-105"
            >
              <ArrowLeft className="w-5 h-5 inline mr-2" />
              Return to Settings
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentPost = posts[currentPostIndex];
  const postAchievements = getPostAchievements(currentPostIndex);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700/50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center mt-20">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Complete Your Profile
            </h1>
            <p className="text-gray-400">
              Post {currentPostIndex + 1} of {posts.length} • {totalPoints} total points
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-gray-800 rounded-full px-4 py-2">
              <span className="text-cyan-400 font-semibold">
                {Math.round(((currentPostIndex + 1) / posts.length) * 100)}%
              </span>
            </div>
            <button
              onClick={handleSaveAndReturn}
              className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-xl transition-colors duration-200"
            >
              <Save className="w-4 h-4 inline mr-2" />
              Save & Exit
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Post Display */}
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="bg-gray-800 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-cyan-400 to-purple-400 h-full transition-all duration-500"
                style={{ width: `${((currentPostIndex + 1) / posts.length) * 100}%` }}
              />
            </div>

            {/* Post Card */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
              {/* Post Images */}
              {currentPost.images && currentPost.images.length > 0 && (
                <div className="grid grid-cols-2 gap-2 p-4">
                  {currentPost.images.slice(0, 4).map((image, idx) => (
                    <img
                      key={idx}
                      src={image}
                      alt={`Post image ${idx + 1}`}
                      className="w-full h-32 object-cover rounded-xl border border-gray-700/50"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Post Content */}
              <div className="p-6">
                <div className="flex items-start space-x-4 mb-4">
                  <img
                    src={currentPost.author_avatar}
                    alt="Author"
                    className="w-12 h-12 rounded-full border-2 border-cyan-400/30"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-white line-clamp-2">
                      {currentPost.author_name?.replace('View: ', '').split('•')[0]}
                    </h3>
                    <p className="text-gray-400 text-sm flex items-center mt-1">
                      <Calendar className="w-4 h-4 mr-1" />
                      {currentPost.timestamp}
                    </p>
                  </div>
                </div>

                <p className="text-gray-300 line-clamp-6 mb-4">
                  {currentPost.text}
                </p>

                <div className="flex items-center space-x-6 text-gray-400">
                  <span className="flex items-center">
                    <Heart className="w-4 h-4 mr-1" />
                    {currentPost.reactions}
                  </span>
                  <span className="flex items-center">
                    <MessageSquare className="w-4 h-4 mr-1" />
                    {currentPost.comments}
                  </span>
                </div>
              </div>
            </div>

            {/* Achievement Points - Show for ALL posts */}
            <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-cyan-400 mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2" />
                Post Analysis
              </h3>
              
              {postAchievements.length > 0 ? (
                <div className="space-y-3 mb-4">
                  {postAchievements.map((achievement, idx) => (
                    <div key={idx} className="bg-black/30 rounded-xl p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-white">
                          {achievement.type}
                          {achievement.position && ` - ${achievement.position} Position`}
                        </span>
                        <span className="bg-gradient-to-r from-cyan-400 to-purple-400 text-black px-3 py-1 rounded-full text-sm font-bold">
                          {achievement.points} pts
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm">{achievement.description}</p>
                      {achievement.timestamp && (
                        <p className="text-gray-400 text-xs mt-1">{achievement.timestamp}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-black/30 rounded-xl p-4 mb-4">
                  <p className="text-gray-300 text-sm">
                    📝 This post contains valuable professional content. Please describe your role, experience, or learnings from this post.
                  </p>
                </div>
              )}

              <div className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-xl p-3">
                <p className="text-blue-300 text-sm font-medium">
                  💡 Every post contributes to your professional story - describe your involvement or key takeaways!
                </p>
              </div>
            </div>
          </div>

          {/* Response Form */}
          <div className="space-y-6">
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                Tell Us About This Post
              </h2>
              <p className="text-gray-400 mb-6">
                Describe your role, involvement, experience, or key learnings from this professional activity or achievement.
              </p>

              <textarea
                value={currentResponse}
                onChange={(e) => setCurrentResponse(e.target.value)}
                placeholder={postAchievements.length > 0 
                  ? "Describe your role, contribution, challenges faced, skills used, and impact created..." 
                  : "Share your experience, learnings, involvement, or professional insights from this post..."}
                className="w-full h-64 bg-gray-800 border border-gray-600 rounded-xl p-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent resize-none"
                maxLength={1500}
              />
              
              <div className="flex justify-between items-center mt-4">
                <span className="text-gray-400 text-sm">
                  {currentResponse.length}/1500 characters
                </span>
                {userResponses[currentPostIndex] && (
                  <span className="text-green-400 text-sm flex items-center">
                    <Save className="w-4 h-4 mr-1" />
                    Saved
                  </span>
                )}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentPostIndex === 0}
                className="bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl transition-all duration-200 flex items-center"
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                Previous
              </button>

              <button
                onClick={handleNext}
                className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25 transform hover:scale-105 flex items-center"
              >
                {currentPostIndex === posts.length - 1 ? 'Complete' : 'Next'}
                <ChevronRight className="w-5 h-5 ml-2" />
              </button>
            </div>

            {/* Enhanced Writing Tips */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4">
              <h4 className="font-semibold text-blue-400 mb-2">💡 Writing Guidelines</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• <strong>For Achievements:</strong> Describe your role, contribution, and impact</li>
                <li>• <strong>For Learning:</strong> Share insights, skills gained, or knowledge acquired</li>
                <li>• <strong>For Events:</strong> Explain your participation and key takeaways</li>
                <li>• <strong>For Projects:</strong> Detail technologies used and problems solved</li>
                <li>• <strong>For General Posts:</strong> Highlight professional relevance and value</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Initialize the parsed data globally - removed since we do it in useEffect
// We'll handle this in the component itself

export default CompleteProfile;