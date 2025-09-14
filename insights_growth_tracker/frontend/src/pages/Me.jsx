import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, ChevronLeft, Calendar, TrendingUp, Award, Trophy, Code, BookOpen, Loader,ExternalLink,ChartColumn } from 'lucide-react';

const Me = () => {
  const [expandedPost, setExpandedPost] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Theme detection and update function
  const updateTheme = () => {
    const darkMode = localStorage.getItem("insight_theme") === "dark";
    document.body.style.backgroundColor = darkMode ? "rgb(0, 0, 0)" : "rgb(207, 207, 207)";
  };

  // Listen for theme changes (storage event)
  useEffect(() => {
    updateTheme(); // Initial theme set

    const handleStorage = (e) => {
      if (e.key === "insight_theme") {
        updateTheme();
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Also update theme when user changes theme in this tab
  useEffect(() => {
    updateTheme();
  }, [localStorage.getItem("insight_theme")]);

  // Theme-based helpers
  const darkMode = localStorage.getItem("insight_theme") === "dark";
  const borderColor = darkMode ? 'border-white' : 'border-gray-300';
  const textColor = darkMode ? 'text-white' : 'text-gray-900';
  const secondaryText = darkMode ? 'text-gray-400' : 'text-gray-600';
  const cardBg = darkMode ? 'bg-neutral-900' : 'bg-white';
  const inputBg = darkMode ? 'bg-gray-800' : 'bg-gray-50';
  const timelineLine = darkMode ? 'bg-gradient-to-b from-white via-gray-700 to-gray-500' : 'bg-gradient-to-b from-gray-900 via-gray-300 to-gray-100';
  const timelineBorder = darkMode ? 'border-white' : 'border-gray-300';
  const timelineBg = darkMode ? 'bg-gray-800' : 'bg-gray-100';
  const timelineHoverBg = darkMode ? 'bg-gray-700' : 'bg-gray-200';

  // Default user ID other(punit173,akshat-srivastava-5a52b1240,utkarshdubey608,devanshi-karaulia-469b37287)
  const user_info= localStorage.getItem("insight_user_info") || null;
  console.log(user_info);
 

    useEffect(() => {
      if (user_info) {
        setUserData(JSON.parse(user_info));
      }
    }, [user_info]);



  // Initialize scroll arrows visibility
    useEffect(() => {
      const container = document.getElementById('postsContainer');
      const rightBtn = document.getElementById('scrollRight');
      
      if (container && rightBtn) {
        const isScrollable = container.scrollWidth > container.clientWidth;
        if (isScrollable) {
          rightBtn.classList.remove('opacity-0', 'pointer-events-none');
        }
      }
    }, [userData]);


  // Transform API data to match component structure
  const transformApiData = (apiData) => {
    if (!apiData || !apiData.user_data) return null;

    const { original_scrapping, post_to_no } = apiData.user_data;
    
    // Transform LinkedIn posts
    const linkedInPosts = original_scrapping.map((post, index) => ({
      id: index + 1,
      author_name: post.author_name ? post.author_name.split('•')[0].replace('View: ', '').trim() : 'Unknown',
      timestamp: post.timestamp || 'No timestamp',
      text: post.text || 'No content available',
      reactions: post.reactions || '0 reactions',
       images: post.images || [], 
      comments: post.comments || '0 comments',
      type: determinePostType(post.text),
      achievement: extractAchievement(post.text),
      hashtags: extractHashtags(post.text)
    }));

    // Transform achievements data with better error handling
    const achievementsData = {
      hackathon: Array.isArray(post_to_no?.hackathon) ? post_to_no.hackathon : [],
      coding_platform: Array.isArray(post_to_no?.coding_platform) ? post_to_no.coding_platform : [],
      internship: Array.isArray(post_to_no?.internship) ? post_to_no.internship : [],
      leadership: Array.isArray(post_to_no?.leadership) ? post_to_no.leadership : [],
      project: Array.isArray(post_to_no?.project) ? post_to_no.project : [],
      inhouse_project: Array.isArray(post_to_no?.inhouse_project) ? post_to_no.inhouse_project : [],
      fsd_project: Array.isArray(post_to_no?.fsd_project) ? post_to_no.fsd_project : [],
      certification: Array.isArray(post_to_no?.certification) ? post_to_no.certification : [],
      membership: Array.isArray(post_to_no?.membership) ? post_to_no.membership : [],
      assessment: Array.isArray(post_to_no?.assessment) ? post_to_no.assessment : [],
      research_publications: Array.isArray(post_to_no?.research_publications) ? post_to_no.research_publications : []
    };

    return { linkedInPosts, achievementsData, post_to_no };
  };

  // Helper functions
  const determinePostType = (text) => {
    if (!text || typeof text !== 'string') return 'other';
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('hackathon')) return 'hackathon';
    if (lowerText.includes('coding') || lowerText.includes('competition')) return 'coding_platform';
    if (lowerText.includes('intern')) return 'internship';
    if (lowerText.includes('project') || lowerText.includes('app')) {
      if (lowerText.includes('inhouse')) return 'inhouse_project';
      if (lowerText.includes('fsd') || lowerText.includes('full stack')) return 'fsd_project';
      return 'project';
    }
    if (lowerText.includes('lead') || lowerText.includes('president')) return 'leadership';
    if (lowerText.includes('course') || lowerText.includes('certification')) return 'certification';
    if (lowerText.includes('member') || lowerText.includes('club')) return 'membership';
    if (lowerText.includes('assessment') || lowerText.includes('test')) return 'assessment';
    if (lowerText.includes('research') || lowerText.includes('publication') || lowerText.includes('paper')) return 'research_publications';
    
    return 'other';
  };

  const extractAchievement = (text) => {
    if (!text || typeof text !== 'string') return 'Achievement';
    const lowerText = text.toLowerCase();
    if (lowerText.includes('first') || lowerText.includes('1st') || lowerText.includes('winner')) return '1st Position';
    if (lowerText.includes('second') || lowerText.includes('2nd')) return '2nd Position';
    if (lowerText.includes('third') || lowerText.includes('3rd')) return '3rd Position';
    if (lowerText.includes('selected') || lowerText.includes('top 100')) return 'Selected';
    if (lowerText.includes('completed') || lowerText.includes('internship')) return 'Completed';
    if (lowerText.includes('promoted') || lowerText.includes('lead')) return 'Leadership Role';
    if (lowerText.includes('published') || lowerText.includes('research')) return 'Published';
    return 'Achievement';
  };

  const extractHashtags = (text) => {
    if (!text || typeof text !== 'string') return [];
    const hashtagMatches = text.match(/#\w+/g);
    return hashtagMatches || [];
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'hackathon': return Trophy;
      case 'coding_platform': return Code;
      case 'certification': return BookOpen;
      case 'internship': return Award;
      case 'leadership': return Award;
      case 'project': return Code;
      case 'inhouse_project': return Code;
      case 'fsd_project': return Code;
      case 'membership': return Award;
      case 'assessment': return BookOpen;
      case 'research_publications': return BookOpen;
      default: return Award;
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'hackathon': return 'bg-purple-900';
      case 'coding_platform': return 'bg-blue-900';
      case 'certification': return 'bg-green-900';
      case 'internship': return 'bg-orange-900';
      case 'leadership': return 'bg-red-900';
      case 'project': return 'bg-indigo-900';
      case 'inhouse_project': return 'bg-indigo-800';
      case 'fsd_project': return 'bg-indigo-700';
      case 'membership': return 'bg-yellow-800';
      case 'assessment': return 'bg-teal-900';
      case 'research_publications': return 'bg-emerald-900';
      default: return 'bg-gray-900';
    }
  };

  const getReactionCount = (reactionsStr) => {
    if (!reactionsStr) return 0;
    if (typeof reactionsStr === 'number') return reactionsStr;
    const match = reactionsStr.match(/(\d+) reactions?/);
    if (match) return parseInt(match[1]);
    const andMatch = reactionsStr.match(/and (\d+) others/);
    return andMatch ? parseInt(andMatch[1]) + 1 : 1;
  };

  const getCommentCount = (commentsStr) => {
    if (!commentsStr) return 0;
    if (typeof commentsStr === 'number') return commentsStr;
    const match = commentsStr.match(/(\d+) comments?/);
    return match ? parseInt(match[1]) : 0;
  };

  // Loading state
  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${cardBg}`}>
        <div className="text-center">
          <Loader className="animate-spin mx-auto mb-4" size={48} />
          <p className={secondaryText}>Loading user data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${cardBg}`}>
        <div className={`text-center bg-red-50 p-6 rounded-lg border ${borderColor}`}>
          <p className="text-red-600 mb-4">Error loading data: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const transformedData = transformApiData(userData);
  if (!transformedData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">No data available</p>
      </div>
    );
  }

  const { linkedInPosts, post_to_no } = transformedData;

  // Calculate analytics from API data with null safety
  const safePostToNo = post_to_no || {};
  console.log(safePostToNo);
  
  // Calculate total points from all categories except CGPA
  const allAchievements = Object.entries(safePostToNo)
    .filter(([key]) => key !== 'cgpa')
    .map(([, items]) => Array.isArray(items) ? items : [])
    .flat()
    .filter(Boolean);
    
  const totalPoints = allAchievements.reduce((sum, item) => sum + parseInt(item?.points || 0), 0);
  const totalAchievements = allAchievements.length;
  const avgPointsPerAchievement = totalAchievements > 0 ? (totalPoints / totalAchievements).toFixed(1) : '0.0';

  // Create chart data from API achievements with null safety
  const chartData = [
    { 
      category: 'Hackathons', 
      points: (safePostToNo.hackathon || []).reduce((sum, item) => sum + parseInt(item?.points || 0), 0), 
      count: (safePostToNo.hackathon || []).length 
    },
    { 
      category: 'Internships', 
      points: (safePostToNo.internship || []).reduce((sum, item) => sum + parseInt(item?.points || 0), 0), 
      count: (safePostToNo.internship || []).length 
    },
    { 
      category: 'Leadership', 
      points: (safePostToNo.leadership || []).reduce((sum, item) => sum + parseInt(item?.points || 0), 0), 
      count: (safePostToNo.leadership || []).length 
    },
    { 
      category: 'Projects', 
      points: (safePostToNo.project || []).reduce((sum, item) => sum + parseInt(item?.points || 0), 0), 
      count: (safePostToNo.project || []).length 
    },
    { 
      category: 'Certifications', 
      points: (safePostToNo.certification || []).reduce((sum, item) => sum + parseInt(item?.points || 0), 0), 
      count: (safePostToNo.certification || []).length 
    },
    { 
      category: 'Inhouse Projects', 
      points: (safePostToNo.inhouse_project || []).reduce((sum, item) => sum + parseInt(item?.points || 0), 0), 
      count: (safePostToNo.inhouse_project || []).length 
    },
    { 
      category: 'FSD Projects', 
      points: (safePostToNo.fsd_project || []).reduce((sum, item) => sum + parseInt(item?.points || 0), 0), 
      count: (safePostToNo.fsd_project || []).length 
    },
    { 
      category: 'Coding Platforms', 
      points: (safePostToNo.coding_platform || []).reduce((sum, item) => sum + parseInt(item?.points || 0), 0), 
      count: (safePostToNo.coding_platform || []).length 
    },
    { 
      category: 'Memberships', 
      points: (safePostToNo.membership || []).reduce((sum, item) => sum + parseInt(item?.points || 0), 0), 
      count: (safePostToNo.membership || []).length 
    },
    { 
      category: 'Assessments', 
      points: (safePostToNo.assessment || []).reduce((sum, item) => sum + parseInt(item?.points || 0), 0), 
      count: (safePostToNo.assessment || []).length 
    },
    { 
      category: 'Research Publications', 
      points: (safePostToNo.research_publications || []).reduce((sum, item) => sum + parseInt(item?.points || 0), 0), 
      count: (safePostToNo.research_publications || []).length 
    }
  ].filter(item => item.count > 0); // Only show categories with data

  const maxPoints = Math.max(...chartData.map(d => d.points), 1);

  // Complete Event categories with all 12 metrics
  const eventCategories = [
    { 
      name: 'CGPA', 
      count: userData?.user_data?.cgpa || 'N/A', 
      icon: Award, 
      points: 0, // CGPA is typically not point-based
      displayType: 'value' // Special flag to show as value instead of count
    },
    { 
      name: 'Hackathons', 
      count: (safePostToNo.hackathon || []).length, 
      icon: Trophy, 
      points: (safePostToNo.hackathon || []).reduce((sum, item) => sum + parseInt(item?.points || 0), 0) 
    },
    { 
      name: 'Internships', 
      count: (safePostToNo.internship || []).length, 
      icon: Award, 
      points: (safePostToNo.internship || []).reduce((sum, item) => sum + parseInt(item?.points || 0), 0) 
    },
    { 
      name: 'Certifications', 
      count: (safePostToNo.certification || []).length, 
      icon: BookOpen, 
      points: (safePostToNo.certification || []).reduce((sum, item) => sum + parseInt(item?.points || 0), 0) 
    },
    { 
      name: 'Projects', 
      count: (safePostToNo.project || []).length, 
      icon: Code, 
      points: (safePostToNo.project || []).reduce((sum, item) => sum + parseInt(item?.points || 0), 0) 
    },
    { 
      name: 'Inhouse Projects', 
      count: (safePostToNo.inhouse_project || []).length, 
      icon: Code, 
      points: (safePostToNo.inhouse_project || []).reduce((sum, item) => sum + parseInt(item?.points || 0), 0) 
    },
    { 
      name: 'FSD Projects', 
      count: (safePostToNo.fsd_project || []).length, 
      icon: Code, 
      points: (safePostToNo.fsd_project || []).reduce((sum, item) => sum + parseInt(item?.points || 0), 0) 
    },
    { 
      name: 'Coding Platforms', 
      count: (safePostToNo.coding_platform || []).length, 
      icon: Code, 
      points: (safePostToNo.coding_platform || []).reduce((sum, item) => sum + parseInt(item?.points || 0), 0) 
    },
    { 
      name: 'Memberships', 
      count: (safePostToNo.membership || []).length, 
      icon: Award, 
      points: (safePostToNo.membership || []).reduce((sum, item) => sum + parseInt(item?.points || 0), 0) 
    },
    { 
      name: 'Assessments', 
      count: (safePostToNo.assessment || []).length, 
      icon: BookOpen, 
      points: (safePostToNo.assessment || []).reduce((sum, item) => sum + parseInt(item?.points || 0), 0) 
    },
    { 
      name: 'Leadership', 
      count: (safePostToNo.leadership || []).length, 
      icon: Award, 
      points: (safePostToNo.leadership || []).reduce((sum, item) => sum + parseInt(item?.points || 0), 0) 
    },
    { 
      name: 'Research Publications', 
      count: (safePostToNo.research_publications || []).length, 
      icon: BookOpen, 
      points: (safePostToNo.research_publications || []).reduce((sum, item) => sum + parseInt(item?.points || 0), 0) 
    },
    { 
      name: 'Total Points', 
      count: totalPoints, 
      icon: TrendingUp, 
      points: totalPoints,
      displayType: 'summary' // Special flag for summary row
    }
  ];

  return (
    <div className={`space-y-4 mt-10 ${cardBg}`}>
      {/* Timeline Section */}
      <section className={`p-4 ${darkMode ? "bg-black" : "bg-gray-100"} min-h-screen`}>
        <div className="relative"></div>
        <h2 className={`text-3xl font-bold ${darkMode ? "text-cyan-400" : "text-cyan-700"} mb-6 flex items-center mt-8`}>
          <Calendar className={`mr-3 ${darkMode ? "text-cyan-400" : "text-cyan-700"}`} size={28} />
          Post Highlights
        </h2>

       {/* Navigation Arrows */}
          <button
            id="scrollLeft"
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full shadow-lg transition-all ${
              darkMode ? "bg-gray-800 hover:bg-gray-700 text-white" : "bg-white hover:bg-gray-100 text-gray-900"
            } opacity-0 pointer-events-none`}
            onClick={() => {
              const container = document.getElementById('postsContainer');
              container.scrollBy({ left: -400, behavior: 'smooth' });
            }}
          >
            <ChevronLeft size={20} />
          </button>

          <button
            id="scrollRight"
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full shadow-lg transition-all ${
              darkMode ? "bg-gray-800 hover:bg-gray-700 text-white" : "bg-white hover:bg-gray-100 text-gray-900"
            } opacity-0 pointer-events-none`}
            onClick={() => {
              const container = document.getElementById('postsContainer');
              container.scrollBy({ left: 400, behavior: 'smooth' });
            }}
          >
            <ChevronRight size={20} />
          </button>

          {/* Horizontal Scroll Container */}
          <div 
            id="postsContainer"
            className="flex overflow-x-auto space-x-6 pb-4 hide-scrollbar"
            onScroll={(e) => {
              const container = e.target;
              const leftBtn = document.getElementById('scrollLeft');
              const rightBtn = document.getElementById('scrollRight');
              
              // Show/hide left arrow
              if (container.scrollLeft > 10) {
                leftBtn.classList.remove('opacity-0', 'pointer-events-none');
              } else {
                leftBtn.classList.add('opacity-0', 'pointer-events-none');
              }
              
              // Show/hide right arrow
              const isScrollable = container.scrollWidth > container.clientWidth;
              const isAtEnd = container.scrollLeft >= container.scrollWidth - container.clientWidth - 10;
              
              if (isScrollable && !isAtEnd) {
                rightBtn.classList.remove('opacity-0', 'pointer-events-none');
              } else {
                rightBtn.classList.add('opacity-0', 'pointer-events-none');
              }
            }}
          >
          {linkedInPosts.map((post, index) => {
            const TypeIcon = getTypeIcon(post.type);
            const postText = post.text || "No content available";
            const preview =
              postText.length > 150
                ? postText.substring(0, 150) + "..."
                : postText;

            return (
              <div
                key={post.id}
                data-post-index={index} // <-- Add this line
                className={`flex-shrink-0 w-96 rounded-2xl shadow-xl border relative overflow-hidden group hover:shadow-cyan-500/30 transition-all duration-300 ${cardBg} ${darkMode ? "border-neutral-800" : "border-gray-300"}`}
              >
                {/* Top Bar with Icon + Meta */}
                <div className={`flex items-center justify-between p-4 border-b ${darkMode ? "border-neutral-800" : "border-gray-200"}`}>
                  {/* Left Side */}
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Icon */}
                    <div className={`w-10 h-10 flex items-center justify-center rounded-full ${darkMode ? "bg-purple-900" : "bg-purple-200"} shadow-md flex-shrink-0`}>
                      <TypeIcon size={18} className={darkMode ? "text-white" : "text-purple-900"} />
                    </div>

                    {/* Text */}
                    <div className="min-w-0">
                      <h3 className={`font-semibold text-sm line-clamp-2 max-w-[180px] ${textColor}`}>
                        {post.author_name}
                      </h3>
                      <p className={`text-xs ${secondaryText}`}>
                        {post.timestamp.split(" • ")[0]}
                      </p>
                    </div>
                  </div>

                  {/* Right Side Badge */}
                  <span
                    className={`text-xs font-bold text-white px-2 py-1 rounded-full ${getTypeColor(post.type)} flex-shrink-0 ml-2`}
                    style={{
                      backgroundColor: darkMode ? undefined : "#a5b4fc"
                    }}
                  >
                    {post.achievement}
                  </span>
                </div>

                {/* Images Section */}
                {post.images && post.images.length > 0 && (
                  <div
                    className={`grid ${post.images.length > 1 ? "grid-cols-2" : "grid-cols-1"} gap-1`}
                  >
                    {post.images.slice(0, 4).map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt="Post media"
                        className="w-full h-40 object-cover hover:scale-105 transition-transform duration-300"
                      />
                    ))}
                    {post.images.length > 4 && (
                      <div className={`flex items-center justify-center ${darkMode ? "bg-neutral-800 text-gray-300" : "bg-gray-200 text-gray-500"} text-sm`}>
                        +{post.images.length - 4} more
                      </div>
                    )}
                  </div>
                )}

            {/* Post Content */}
                <div className="p-4">
                  <div className={`overflow-hidden transition-all duration-300 ${expandedPost === post.id ? 'max-h-none' : 'max-h-20'}`}>
                    <p className={`${darkMode ? "text-gray-200" : "text-gray-700"} text-sm leading-relaxed mb-3`}>
                      {expandedPost === post.id ? postText : preview}
                    </p>
                  </div>

                  {post.hashtags && post.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.hashtags.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          className={`text-xs ${darkMode ? "text-cyan-300 bg-cyan-900/30" : "text-cyan-700 bg-cyan-100"} px-2 py-1 rounded`}
                        >
                          {tag}
                        </span>
                      ))}
                      {post.hashtags.length > 3 && (
                        <span className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          +{post.hashtags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Reactions + Comments */}
                  <div className={`flex gap-4 text-xs ${secondaryText}`}>
                    <span className="flex items-center gap-2">
                      <span className={`w-2 h-2 ${darkMode ? "bg-cyan-400" : "bg-cyan-700"} rounded-full`}></span>
                      {getReactionCount(post.reactions)} reactions
                    </span>
                    <span className="flex items-center gap-2">
                      <span className={`w-2 h-2 ${darkMode ? "bg-pink-500" : "bg-pink-300"} rounded-full`}></span>
                      {getCommentCount(post.comments)} comments
                    </span>
                  </div>

                  {/* Expand/Collapse */}
                  <button
                    onClick={() =>
                      setExpandedPost(expandedPost === post.id ? null : post.id)
                    }
                    className={`absolute top-1 right-3 ${darkMode ? "text-cyan-400 hover:text-cyan-200" : "text-cyan-700 hover:text-cyan-500"} transition-colors`}
                  >
                    {expandedPost === post.id ? (
                      <ChevronDown size={18} />
                    ) : (
                      <ChevronRight size={18} />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        
      </section>

      {/* Points Analytics Section */}
      <section className={`w-full py-20 px-6 ${darkMode ? "bg-black" : "bg-gray-50"}`}>
              <h2 className={`text-3xl font-bold ${darkMode ? "text-cyan-400" : "text-cyan-700"} mb-10 flex items-center w-full `}>
                <TrendingUp className={`mr-3 ${darkMode ? "text-cyan-400" : "text-cyan-700"}`} size={28} />
                Points Analytics
              </h2>

                <h2 className={`text-3xl font-bold mb-12 flex items-center justify-center 
                  ${darkMode ? "text-white" : "text-black"}`}>
                  <ChartColumn className={`mr-3 ${darkMode ? "text-white" : "text-black"}`} size={28} />
                  Participation in Various Events
                </h2>

       {chartData.length > 0 && (
          <div className={`w-full max-w-7xl mx-auto mb-12 rounded-2xl shadow-xl p-6 border ${cardBg} ${darkMode ? "border-neutral-800" : "border-gray-300"}`}>
            {/* Chart */}
            <div className="relative h-64 sm:h-80 lg:h-96 w-full overflow-x-auto hide-scrollbar">
              <svg
                className="w-full h-full min-w-[600px]"
                viewBox="0 0 100 50"
                preserveAspectRatio="none"
                style={{ vectorEffect: "non-scaling-stroke" }}
              >
                {/* Horizontal Gridlines */}
                {[0, 25, 50, 75, 100].map((y) => (
                  <line
                    key={y}
                    x1="10"
                    y1={40 - (y / 100) * 30}
                    x2="90"
                    y2={40 - (y / 100) * 30}
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="0.2"
                    vectorEffect="non-scaling-stroke"
                    opacity={y === 0 || y === 100 ? "0.7" : "0.3"}
                  />
                ))}

                {/* Vertical Gridlines */}
                {chartData.map((_, i) => (
                  <line
                    key={i}
                    x1={10 + (i / Math.max(chartData.length - 1, 1)) * 80}
                    y1="10"
                    x2={10 + (i / Math.max(chartData.length - 1, 1)) * 80}
                    y2="40"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="0.2"
                    vectorEffect="non-scaling-stroke"
                  />
                ))}

                {/* Bars */}
                {chartData.map((d, i) => (
                  <rect
                    key={i}
                    x={10 + (i / Math.max(chartData.length - 1, 1)) * 80 - 4}
                    y={40 - (d.points / maxPoints) * 30}
                    width="8"
                    height={(d.points / maxPoints) * 30}
                    fill="url(#fluorescentGradient)"
                    className="hover:fill-cyan-500 transition-all cursor-pointer"
                  >
                    <title>{`${d.category}: ${d.points} points from ${d.count} achievements`}</title>
                  </rect>
                ))}

                {/* Gradient Definition */}
                <defs>
                  <linearGradient id="fluorescentGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00FFFF" />
                    <stop offset="100%" stopColor="#8A2BE2" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Labels Under Chart */}
            <div className="flex justify-between items-center mt-6 px-2">
              <div className="flex-1 flex justify-between">
                {chartData.map((d, i) => (
                  <div key={i} className="text-center">
                    <div className={`text-xs font-medium ${darkMode ? "text-cyan-300" : "text-cyan-700"} mb-1`}>
                      <span className="hidden sm:inline">{d.category}</span>
                      <span className="sm:hidden">{d.category.slice(0, 4)}</span>
                    </div>
                    <div className={`text-xs ${secondaryText}`}>
                      {d.count} achievements
                    </div>
                    <div className={`text-xs font-bold ${darkMode ? "text-cyan-400" : "text-cyan-700"} mt-1`}>
                      {d.points} pts
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}


        {/* Stats Cards */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className={`rounded-2xl shadow-lg border p-8 transition-all text-center 
            ${cardBg} ${darkMode ? "border-neutral-800 hover:shadow-cyan-500/30" : "border-gray-300 hover:shadow-cyan-200/40"}`}>
            <div className={`text-5xl font-extrabold mb-3 
              ${darkMode ? "text-cyan-400" : "text-cyan-700"}`}>{totalPoints}</div>
            <div className={`text-sm uppercase tracking-wide ${secondaryText}`}>Total Points</div>
          </div>
          <div className={`rounded-2xl shadow-lg border p-8 transition-all text-center 
            ${cardBg} ${darkMode ? "border-neutral-800 hover:shadow-pink-500/30" : "border-gray-300 hover:shadow-pink-200/40"}`}>
            <div className={`text-5xl font-extrabold mb-3 
              ${darkMode ? "text-pink-400" : "text-pink-600"}`}>{avgPointsPerAchievement}</div>
            <div className={`text-sm uppercase tracking-wide ${secondaryText}`}>Avg Points</div>
          </div>
          <div className={`rounded-2xl shadow-lg border p-8 transition-all text-center 
            ${cardBg} ${darkMode ? "border-neutral-800 hover:shadow-green-500/30" : "border-gray-300 hover:shadow-green-200/40"}`}>
            <div className={`text-5xl font-extrabold mb-3 
              ${darkMode ? "text-green-400" : "text-green-600"}`}>{totalAchievements}</div>
            <div className={`text-sm uppercase tracking-wide ${secondaryText}`}>Total Achievements</div>
          </div>
        </div>
      </section>


      {/* Achievement Categories Section */}
      <section className={`p-8 ${darkMode ? "bg-[#0a0a0f]" : "bg-white"} min-h-screen`}>
        <h2 className={`text-3xl font-bold mb-10 flex items-center tracking-tight ${darkMode ? "text-white" : "text-gray-900"}`}>
          <Award className={`mr-3 ${darkMode ? "text-cyan-400" : "text-cyan-700"} drop-shadow-[0_0_8px_#22d3ee]`} size={28} />
          Achievement Summary
        </h2>

        {/* Category Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {eventCategories.map((category, index) => {
            const Icon = category.icon;
            return (
              <div
                key={category.name}
                className={`rounded-2xl p-5 flex items-center justify-between shadow-md border transition-all duration-300 ${darkMode ? "bg-[#111] border-transparent hover:border-cyan-400/40 hover:shadow-[0_0_20px_rgba(34,211,238,0.6)]" : "bg-gray-50 border-gray-200 hover:border-cyan-200 hover:shadow-[0_0_20px_rgba(34,211,238,0.2)]"}`}
                style={{
                  opacity: 0,
                  transform: 'translateY(20px)',
                  animation: `fadeUp 0.6s ease-out ${index * 0.1 + 0.3}s forwards`,
                }}
              >
                <div className="flex items-center">
                  <div
                    className={`p-4 rounded-2xl shadow-[0_0_12px_rgba(34,211,238,0.8)] mr-4 transition-transform group-hover:scale-105 ${darkMode ? "bg-gradient-to-tr from-cyan-400 to-blue-500" : "bg-gradient-to-tr from-cyan-200 to-blue-200"}`}
                  >
                    <Icon className={darkMode ? "text-black" : "text-blue-900"} size={22} />
                  </div>
                  <div>
                    <span className={`font-semibold text-lg block ${darkMode ? "text-white" : "text-gray-900"}`}>{category.name}</span>
                    {category.displayType !== 'value' && category.displayType !== 'summary' && (
                      <span className={`text-sm ${secondaryText}`}>{category.points} points earned</span>
                    )}
                    {category.displayType === 'value' && (
                      <span className={`text-sm ${secondaryText}`}>Current CGPA</span>
                    )}
                  </div>
                </div>
                <span className={`text-3xl font-bold drop-shadow-[0_0_10px_#22d3ee] ${darkMode ? "text-cyan-300" : "text-cyan-700"}`}>
                  {category.count}
                </span>
              </div>
            );
          })}
        </div>

        {/* Detailed Breakdown */}
        <div className="mt-14 space-y-10">
          <h3 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>Detailed Breakdown</h3>

          {Object.entries(safePostToNo).map(([category, items]) =>
            Array.isArray(items) && items.length > 0 ? (
              <div
                key={category}
                className={`rounded-2xl p-6 border shadow-lg transition-all ${darkMode ? "bg-[#141414] border-gray-800 hover:shadow-[0_0_25px_rgba(236,72,153,0.5)]" : "bg-gray-50 border-gray-200 hover:shadow-[0_0_25px_rgba(236,72,153,0.2)]"}`}
              >
                <h4 className={`text-lg font-semibold mb-5 capitalize flex items-center ${darkMode ? "text-magenta-400" : "text-pink-700"}`}>
                  {React.createElement(getTypeIcon(category), {
                    size: 20,
                    className: `mr-2 ${darkMode ? "text-pink-400" : "text-pink-700"} drop-shadow-[0_0_6px_#ec4899]`,
                  })}
                  {category.replace("_", " ")}
                </h4>

                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div
                      key={index}
                      className={`p-5 rounded-xl border transition-all ${darkMode ? "bg-[#1a1a1f] border-gray-700 hover:border-violet-400/40 hover:shadow-[0_0_15px_rgba(167,139,250,0.5)]" : "bg-white border-gray-200 hover:border-violet-200 hover:shadow-[0_0_15px_rgba(167,139,250,0.2)]"}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          {item?.position && (
                            <span className={`font-medium ${darkMode ? "text-cyan-300" : "text-cyan-700"}`}>
                              Position:{" "}
                              {item.position === "1" || item.position === "Winner"
                                ? "1st"
                                : item.position === "2"
                                ? "2nd"
                                : item.position === "3"
                                ? "3rd"
                                : item.position}
                            </span>
                          )}
                          {item?.type && (
                            <span className={`ml-2 font-medium ${darkMode ? "text-violet-300" : "text-violet-700"}`}>{item.type}</span>
                          )}
                          <div className={`text-sm mt-1 ${secondaryText}`}>
                            {Array.isArray(item?.timestamp)
                              ? item.timestamp.join(", ")
                              : item?.timestamp}{" "}
                            • Reactions: {item?.reaction || 0} • Comments: {item?.comments || 0}
                          </div>
                        </div>
                        <div className="text-right">
                            <span
                              className={`font-bold text-lg drop-shadow-[0_0_8px_#4ade80] 
                                ${item?.why?.toLowerCase().includes("deducted") 
                                  ? "text-red-400 drop-shadow-[0_0_8px_#f87171]"   // 🔴 red neon
                                  : darkMode 
                                    ? "text-green-300" 
                                    : "text-green-700"
                                }`}
                            >
                              {item?.points || 0} pts
                            </span>

                          <div className={`text-xs max-w-xs ${secondaryText}`}>
                            {item?.why || "Achievement points"}
                          </div>
                        </div>
                      </div>

                      {/* Source Posts */}
                      {item?.source_post_excerpt?.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <h5 className={`text-sm font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>Source Posts:</h5>
                          {item.source_post_excerpt.map((excerpt, excerptIndex) => (
                            <div
                              key={excerptIndex}
                              className={`p-3 rounded-lg text-sm border ${darkMode ? "bg-[#222] border-gray-700" : "bg-gray-100 border-gray-200"}`}
                            >
                              <p className={`mb-2 line-clamp-3 ${darkMode ? "text-gray-200" : "text-gray-700"}`}>
                                {excerpt.length > 150 ? excerpt.substring(0, 150) + "..." : excerpt}
                              </p>
                              {item?.source_post_index?.[excerptIndex] !== undefined && (
                                <button
                                  onClick={() => {
                                    const postIndex = item.source_post_index[excerptIndex];
                                    const postElement = document.querySelector(
                                      `[data-post-index="${postIndex}"]`
                                    );
                                    if (postElement) {
                                      postElement.scrollIntoView({
                                        behavior: "smooth",
                                        block: "center",
                                      });
                                      postElement.classList.add("highlight-post");
                                      setTimeout(
                                        () => postElement.classList.remove("highlight-post"),
                                        3000
                                      );
                                    }
                                  }}
                                  className={`text-xs px-2 py-1 rounded transition-colors shadow-sm ${darkMode ? "bg-cyan-500 text-black hover:bg-cyan-400" : "bg-cyan-200 text-cyan-900 hover:bg-cyan-100"}`}
                                >
                                  <ExternalLink size={12} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : null
          )}
        </div>
      </section>

      <style jsx>{`
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

        .highlight-post {
          background: rgba(59, 130, 246, 0.1);
          border-left-color: #3b82f6 !important;
          transform: scale(1.02);
          transition: all 0.3s ease;
        }

        .hide-scrollbar {
          -ms-overflow-style: none;  /* IE & Edge */
          scrollbar-width: none;     /* Firefox */
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;             /* Chrome, Safari */
        }

      `}</style>
    </div>
  );
};

export default Me;