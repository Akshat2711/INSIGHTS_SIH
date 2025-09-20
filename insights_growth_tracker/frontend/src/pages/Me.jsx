import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronRight, ChevronLeft, Calendar, TrendingUp, Award, Trophy, Code, BookOpen, Loader,ExternalLink,ChartColumn } from 'lucide-react';
import Particles from '../components/Particles';
import { Githubstats_card } from '../components/Githubstats_card';
import { Resumestats_card } from '../components/Resumestats_card';
import DetailedBreakdownSection from '../components/DetailedBreakdownSection';

const Me = () => {
  const [expandedPost, setExpandedPost] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef(null);




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

    const { original_scrapping, post_to_no, github_data, resume_data } = apiData.user_data;
    
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

    return { 
    linkedInPosts, 
    achievementsData, 
    post_to_no,
    githubData: github_data,
    resumeData: resume_data 
  };
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
      case 'coding_platform': return 'bg-indigo-900';
      case 'certification': return 'bg-blue-900';
      case 'internship': return 'bg-purple-800';
      case 'leadership': return 'bg-indigo-800';
      case 'project': return 'bg-blue-800';
      case 'inhouse_project': return 'bg-purple-700';
      case 'fsd_project': return 'bg-indigo-700';
      case 'membership': return 'bg-blue-700';
      case 'assessment': return 'bg-purple-600';
      case 'research_publications': return 'bg-indigo-600';
      default: return 'bg-purple-800';
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

  // Carousel navigation functions
  const scrollToSlide = (slideIndex) => {
    if (carouselRef.current) {
      const cardWidth = 380; // Approximate card width including gap
      carouselRef.current.scrollTo({
        left: slideIndex * cardWidth,
        behavior: 'smooth'
      });
      setCurrentSlide(slideIndex);
    }
  };

  const nextSlide = () => {
    const maxSlides = Math.max(0, (linkedInPosts?.length || 0) - 3);
    const newSlide = Math.min(currentSlide + 1, maxSlides);
    scrollToSlide(newSlide);
  };

  const prevSlide = () => {
    const newSlide = Math.max(currentSlide - 1, 0);
    scrollToSlide(newSlide);
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

  const { linkedInPosts, post_to_no, githubData, resumeData } = transformedData;

  // Calculate analytics from API data with null safety
  const safePostToNo = post_to_no || {};

  
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





const currentCGPA = resumeData?.data?.education?.[0]?.gpa || 'N/A';

  // Complete Event categories with all 12 metrics
  const eventCategories = [
    { 
      name: 'CGPA', 
      count: currentCGPA, 
      icon: Award, 
      points: 0,
      displayType: 'value'
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
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Fixed Particles Background - covering entire page */}
      <div className="fixed inset-0 w-full h-full z-0">
        <Particles
          particleColors={['#ffffff', '#ffffff', '#ffffff']}
          particleCount={400}
          particleSpread={15}
          speed={0.1}
          particleBaseSize={180}
          moveParticlesOnHover={true}
          alphaParticles={false}
          disableRotation={false}
          particleHoverFactor={0.5}
          sizeRandomness={0.6}
          cameraDistance={20}
        />
      </div>
      
      {/* Content Container */}
      <div className="relative z-10 space-y-4 pt-16">

      {/* Modern Post Highlights Section */}
      <section className="relative p-8 min-h-screen overflow-hidden pt-8">
        {/* Glassmorphism background container */}
        <div className={`absolute inset-4 rounded-3xl backdrop-blur-md border shadow-2xl ${
          darkMode 
            ? 'bg-white/[0.02] border-white/5 shadow-black/20' 
            : 'bg-black/[0.02] border-black/5 shadow-black/10'
        }`}></div>


        <div className="relative z-10 max-w-7xl mx-auto pt-4">
          {/* Modern Header */}
          <div className="text-center mb-16 mt-4">
            <div className="inline-flex items-center gap-4 mb-6">
              <div className={`p-3 rounded-2xl ${darkMode ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30' : 'bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200'} backdrop-blur-xl`}>
                <Calendar className={`${darkMode ? "text-purple-400" : "text-purple-600"}`} size={32} />
              </div>
            </div>
            <h2 className={`text-5xl font-bold mb-4 ${darkMode ? 'bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400' : 'bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600'} bg-clip-text text-transparent`}>
              Post Highlights
            </h2>
            <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
              Discover your most impactful moments and achievements across your professional journey
            </p>
          </div>

          {/* Cards Carousel Layout */}
          <div className="relative">
            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className={`absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full backdrop-blur-xl border transition-all duration-300 ${
                currentSlide === 0
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:scale-110 hover:shadow-lg'
              } ${
                darkMode 
                  ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' 
                  : 'bg-black/10 border-black/20 text-black hover:bg-black/20'
              }`}
            >
              <ChevronLeft size={24} />
            </button>
            
            <button
              onClick={nextSlide}
              disabled={linkedInPosts && currentSlide >= Math.max(0, linkedInPosts.length - 3)}
              className={`absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full backdrop-blur-xl border transition-all duration-300 ${
                linkedInPosts && currentSlide >= Math.max(0, linkedInPosts.length - 3)
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:scale-110 hover:shadow-lg'
              } ${
                darkMode 
                  ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' 
                  : 'bg-black/10 border-black/20 text-black hover:bg-black/20'
              }`}
            >
              <ChevronRight size={24} />
            </button>

            {/* Carousel Container */}
            <div 
              ref={carouselRef}
              className="overflow-x-auto scrollbar-hide px-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <div className="flex gap-6 pb-4" style={{ width: `${(linkedInPosts?.length || 0) * 380}px` }}>
                {linkedInPosts?.map((post, index) => {
                  const TypeIcon = getTypeIcon(post.type);
                  const postText = post.text || "No content available";
                  const preview = postText.length > 120 ? postText.substring(0, 120) + "..." : postText;

                  return (
                    <div
                      key={post.id}
                      data-post-index={index}
                      className="flex-shrink-0 w-[360px] transform transition-all duration-500 hover:scale-[1.03] hover:-translate-y-2"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {/* Enhanced Carousel Card */}
                      <div className={`rounded-3xl p-6 backdrop-blur-2xl border transition-all duration-500 group hover:shadow-2xl h-full ${
                        darkMode 
                          ? 'bg-gradient-to-br from-white/8 via-white/[0.03] to-white/8 border-white/15 hover:border-purple-400/40 hover:shadow-purple-500/30' 
                          : 'bg-gradient-to-br from-white/90 via-white/50 to-white/90 border-white/30 hover:border-purple-300/60 hover:shadow-purple-200/40'
                      }`}>
                        
                        {/* Enhanced floating gradient orb */}
                        <div className={`absolute -top-3 -right-3 w-20 h-20 ${
                          darkMode ? 'bg-gradient-to-br from-purple-500/30 to-pink-500/30' : 'bg-gradient-to-br from-purple-200/70 to-pink-200/70'
                        } rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700`}></div>
                        
                        {/* Card Header */}
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className={`p-3 rounded-xl ${
                              darkMode ? 'bg-gradient-to-br from-purple-600/40 to-pink-600/40 shadow-lg' : 'bg-gradient-to-br from-purple-100 to-pink-100 shadow-md'
                            } backdrop-blur-sm flex-shrink-0`}>
                              <TypeIcon size={20} className={`${darkMode ? 'text-purple-300' : 'text-purple-700'}`} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className={`font-bold text-base ${darkMode ? 'text-white' : 'text-gray-900'} line-clamp-1`}>
                                {post.author_name}
                              </h3>
                              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {post.timestamp.split(" • ")[0]}
                              </p>
                            </div>
                          </div>
                          
                          {/* Enhanced Achievement Badge */}
                          <div className={`px-3 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 shadow-lg transform group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                            {post.achievement}
                          </div>
                        </div>

                        {/* Images Section - Enhanced */}
                        {post.images && post.images.length > 0 && (
                          <div className="mb-6">
                            <div className={`grid gap-3 rounded-xl overflow-hidden ${
                              post.images.length === 1 ? "grid-cols-1" : 
                              post.images.length === 2 ? "grid-cols-2" :
                              post.images.length === 3 ? "grid-cols-2" : "grid-cols-2"
                            }`}>
                              {post.images.slice(0, 4).map((img, i) => (
                                <div 
                                  key={i} 
                                  className={`relative overflow-hidden rounded-lg ${
                                    post.images.length === 3 && i === 0 ? "col-span-2" : ""
                                  }`}
                                >
                                  <img
                                    src={img}
                                    alt="Post media"
                                    className="w-full h-28 object-cover transform group-hover:scale-110 transition-transform duration-700"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </div>
                              ))}
                              {post.images.length > 4 && (
                                <div className={`flex items-center justify-center text-sm font-medium rounded-lg h-28 ${
                                  darkMode ? "bg-gray-800/60 text-gray-300" : "bg-gray-100/90 text-gray-600"
                                }`}>
                                  +{post.images.length - 4}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Enhanced Content Section */}
                        <div className="space-y-4">
                          <div className={`overflow-hidden transition-all duration-500 ${
                            expandedPost === post.id ? 'max-h-none' : 'max-h-20'
                          }`}>
                            <p className={`text-sm leading-relaxed ${
                              darkMode ? 'text-gray-200' : 'text-gray-700'
                            }`}>
                              {expandedPost === post.id ? postText : preview}
                            </p>
                          </div>

                          {/* Enhanced Hashtags */}
                          {post.hashtags && post.hashtags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {post.hashtags.slice(0, expandedPost === post.id ? post.hashtags.length : 3).map((tag, i) => (
                                <span
                                  key={i}
                                  className={`text-xs px-3 py-1.5 rounded-lg font-medium backdrop-blur-sm ${
                                    darkMode 
                                      ? 'bg-purple-600/25 text-purple-300 border border-purple-500/40' 
                                      : 'bg-purple-100 text-purple-700 border border-purple-200'
                                  }`}
                                >
                                  {tag}
                                </span>
                              ))}
                              {post.hashtags.length > 3 && expandedPost !== post.id && (
                                <span className={`text-xs px-3 py-1.5 rounded-lg ${
                                  darkMode ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                  +{post.hashtags.length - 3}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Enhanced Stats Bar */}
                          <div className={`flex items-center justify-between pt-4 border-t ${
                            darkMode ? 'border-white/15' : 'border-gray-200/60'
                          }`}>
                            <div className="flex gap-6">
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${
                                  darkMode ? 'from-purple-400 to-pink-400' : 'from-purple-500 to-pink-500'
                                } shadow-sm`}></div>
                                <span className={`text-sm font-medium ${
                                  darkMode ? 'text-gray-300' : 'text-gray-600'
                                }`}>
                                  {getReactionCount(post.reactions)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${
                                  darkMode ? 'from-indigo-400 to-cyan-400' : 'from-indigo-500 to-cyan-500'
                                } shadow-sm`}></div>
                                <span className={`text-sm font-medium ${
                                  darkMode ? 'text-gray-300' : 'text-gray-600'
                                }`}>
                                  {getCommentCount(post.comments)}
                                </span>
                              </div>
                            </div>
                            
                            {/* Enhanced Expand Button */}
                            <button
                              onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                              className={`p-2.5 rounded-xl transition-all duration-300 backdrop-blur-sm ${
                                darkMode 
                                  ? 'hover:bg-white/15 text-purple-400 hover:text-purple-300 border border-white/10' 
                                  : 'hover:bg-purple-50 text-purple-600 hover:text-purple-700 border border-purple-200'
                              } transform hover:scale-110 shadow-sm`}
                            >
                              {expandedPost === post.id ? (
                                <ChevronDown size={18} />
                              ) : (
                                <ChevronRight size={18} />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Carousel Indicators */}
            <div className="flex justify-center mt-8 gap-2">
              {linkedInPosts && Array.from({ length: Math.max(1, linkedInPosts.length - 2) }, (_, i) => (
                <button
                  key={i}
                  onClick={() => scrollToSlide(i)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentSlide === i
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 scale-125'
                      : darkMode
                        ? 'bg-white/30 hover:bg-white/50'
                        : 'bg-black/30 hover:bg-black/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Completely Redesigned Points Analytics Section - Dashboard Style */}
      <section className="relative py-24 px-8 overflow-hidden pt-8">
        {/* Glassmorphism background container */}
        <div className={`absolute inset-4 rounded-3xl backdrop-blur-md border shadow-2xl ${
          darkMode 
            ? 'bg-white/[0.02] border-white/5 shadow-black/20' 
            : 'bg-black/[0.02] border-black/5 shadow-black/10'
        }`}></div>


        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Dashboard Header */}
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className={`text-6xl font-black mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Analytics
                </h2>
                <div className={`w-24 h-1 ${darkMode ? 'bg-gradient-to-r from-emerald-400 to-blue-400' : 'bg-gradient-to-r from-emerald-600 to-blue-600'} rounded-full`}></div>
              </div>
              <div className={`px-6 py-3 rounded-2xl ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} backdrop-blur-sm`}>
                <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Performance Overview</span>
              </div>
            </div>
          </div>

          {/* Dashboard Grid Layout */}
          <div className="grid grid-cols-12 gap-8 mb-16">
            {/* Main Chart - Large Card */}
            <div className="col-span-12 lg:col-span-8">
              <div className={`h-96 rounded-3xl p-8 ${darkMode ? 'bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10' : 'bg-gradient-to-br from-black/[0.02] to-black/[0.08] border border-black/10'} backdrop-blur-xl`}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Achievement Distribution</h3>
                  <div className={`flex items-center gap-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span>Active</span>
                  </div>
                </div>
                
                {/* Horizontal Bar Chart */}
                {chartData.length > 0 && (
                  <div className="space-y-4">
                    {chartData.slice(0, 6).map((item, index) => (
                      <div key={index} className="group">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {item.category.length > 15 ? item.category.substring(0, 15) + '...' : item.category}
                          </span>
                          <span className={`text-sm font-bold ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                            {item.points}pts
                          </span>
                        </div>
                        <div className={`w-full h-3 rounded-full ${darkMode ? 'bg-white/5' : 'bg-black/5'} overflow-hidden`}>
                          <div 
                            className={`h-full rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 transition-all duration-1000 ease-out group-hover:shadow-lg group-hover:shadow-emerald-500/30`}
                            style={{ 
                              width: `${Math.min((item.points / Math.max(...chartData.map(d => d.points), 1)) * 100, 100)}%`,
                              animationDelay: `${index * 200}ms`
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Stats Cards - Sidebar */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              <div className={`rounded-3xl p-6 ${darkMode ? 'bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20' : 'bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200'} backdrop-blur-xl`}>
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className={`${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} size={24} />
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${darkMode ? 'bg-emerald-400/20 text-emerald-300' : 'bg-emerald-200 text-emerald-800'}`}>+12%</span>
                </div>
                <div className={`text-3xl font-black mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{totalPoints}</div>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Points Earned</div>
              </div>
              
              <div className={`rounded-3xl p-6 ${darkMode ? 'bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20' : 'bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200'} backdrop-blur-xl`}>
                <div className="flex items-center justify-between mb-4">
                  <Award className={`${darkMode ? 'text-blue-400' : 'text-blue-600'}`} size={24} />
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${darkMode ? 'bg-blue-400/20 text-blue-300' : 'bg-blue-200 text-blue-800'}`}>AVG</span>
                </div>
                <div className={`text-3xl font-black mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{avgPointsPerAchievement}</div>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Average per Achievement</div>
              </div>
              
              <div className={`rounded-3xl p-6 ${darkMode ? 'bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20' : 'bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200'} backdrop-blur-xl`}>
                <div className="flex items-center justify-between mb-4">
                  <Trophy className={`${darkMode ? 'text-purple-400' : 'text-purple-600'}`} size={24} />
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${darkMode ? 'bg-purple-400/20 text-purple-300' : 'bg-purple-200 text-purple-800'}`}>TOTAL</span>
                </div>
                <div className={`text-3xl font-black mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{totalAchievements}</div>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Achievements Unlocked</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Completely Redesigned Achievement Summary - Card Layout */}
      <section className="relative py-24 px-8 overflow-hidden pt-8">
        {/* Glassmorphism background container */}
        <div className={`absolute inset-4 rounded-3xl backdrop-blur-md border shadow-2xl ${
          darkMode 
            ? 'bg-white/[0.02] border-white/5 shadow-black/20' 
            : 'bg-black/[0.02] border-black/5 shadow-black/10'
        }`}></div>


        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className={`text-5xl font-black mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Achievement
              <span className={`block text-6xl ${darkMode ? 'bg-gradient-to-r from-purple-400 to-pink-400' : 'bg-gradient-to-r from-purple-600 to-pink-600'} bg-clip-text text-transparent`}>
                Summary
              </span>
            </h2>
            <div className={`w-32 h-1 mx-auto ${darkMode ? 'bg-gradient-to-r from-purple-400 to-pink-400' : 'bg-gradient-to-r from-purple-600 to-pink-600'} rounded-full`}></div>
          </div>

          {/* Masonry-style Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {eventCategories.map((category, index) => {
              const Icon = category.icon;
              const isSpecial = category.displayType === 'summary';
              return (
                <div
                  key={category.name}
                  className={`${isSpecial ? 'md:col-span-2 lg:col-span-1' : ''} rounded-3xl p-6 transition-all duration-700 hover:scale-105 hover:-translate-y-2 ${
                    darkMode 
                      ? 'bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 hover:border-purple-400/30' 
                      : 'bg-gradient-to-br from-white/90 to-white/60 border border-white/20 hover:border-purple-300/50'
                  } backdrop-blur-xl group cursor-pointer`}
                  style={{
                    animationDelay: `${index * 150}ms`,
                    animation: 'fadeInUp 0.8s ease-out forwards'
                  }}
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className={`p-3 rounded-2xl ${
                      darkMode 
                        ? 'bg-gradient-to-br from-purple-600/20 to-pink-600/20' 
                        : 'bg-gradient-to-br from-purple-100 to-pink-100'
                    } group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`${darkMode ? 'text-purple-400' : 'text-purple-600'}`} size={24} />
                    </div>
                    {!isSpecial && (
                      <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                        darkMode 
                          ? 'bg-purple-500/20 text-purple-300' 
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {category.points}pts
                      </div>
                    )}
                  </div>

                  {/* Category Name */}
                  <h3 className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'} group-hover:text-transparent group-hover:bg-gradient-to-r ${darkMode ? 'group-hover:from-purple-400 group-hover:to-pink-400' : 'group-hover:from-purple-600 group-hover:to-pink-600'} group-hover:bg-clip-text transition-all duration-300`}>
                    {category.name}
                  </h3>

                  {/* Count Display */}
                  <div className="flex items-end justify-between">
                    <div className={`text-4xl font-black ${darkMode ? 'text-white' : 'text-gray-900'} group-hover:scale-110 transition-transform duration-300`}>
                      {category.count}
                    </div>
                    <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} text-right`}>
                      {category.displayType === 'value' ? 'Current CGPA' :
                       category.displayType === 'summary' ? 'Total Score' : 'Achievements'}
                    </div>
                  </div>

                  {/* Progress Indicator */}
                  {!isSpecial && category.displayType !== 'value' && (
                    <div className="mt-4">
                      <div className={`w-full h-2 rounded-full ${darkMode ? 'bg-white/10' : 'bg-black/10'}`}>
                        <div 
                          className={`h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000 ease-out`}
                          style={{ 
                            width: `${Math.min((category.points / Math.max(...eventCategories.filter(c => c.displayType !== 'value' && c.displayType !== 'summary').map(c => c.points), 1)) * 100, 100)}%`,
                            animationDelay: `${index * 100 + 500}ms`
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>






  {/* GitHub Analytics Section */}

  <Githubstats_card darkmode={darkMode} githubData={githubData} />

  {/* Resume Overview Section */}
  <Resumestats_card darkMode={darkMode} resumeData={resumeData} getTypeIcon={getTypeIcon}/>

{/* Completely Redesigned Detailed Breakdown - Timeline Style */}
<DetailedBreakdownSection darkMode={darkMode} safePostToNo={safePostToNo} getTypeIcon={getTypeIcon} />





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

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

      `}</style>
      </div>
    </div>
  );
};

export default Me;