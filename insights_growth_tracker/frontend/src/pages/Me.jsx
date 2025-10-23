import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronRight, ChevronLeft, Calendar, TrendingUp, Award, Trophy, Code, BookOpen, Loader,ExternalLink,ChartColumn } from 'lucide-react';
import Particles from '../components/Particles';
import { Githubstats_card } from '../components/Githubstats_card';
import { Resumestats_card } from '../components/Resumestats_card';
import DetailedBreakdownSection from '../components/DetailedBreakdownSection';
import { Achievement_summary_section } from '../components/Achievement_summary_section';
import { Modern_post_highlight_section } from '../components/Modern_post_highlight_section';
import { Modern_points_analytics_section } from '../components/Modern_points_analytics_section';

const Me = () => {

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
      <Modern_post_highlight_section linkedInPosts={linkedInPosts} darkMode={darkMode} />

      {/* Points Analytics Section - Responsive Dashboard Style */}
      <Modern_points_analytics_section darkMode={darkMode} chartData={chartData} totalPoints={totalPoints} avgPointsPerAchievement={avgPointsPerAchievement} totalAchievements={totalAchievements}/>

      {/* Completely Redesigned Achievement Summary - Card Layout */}

      <Achievement_summary_section darkMode={darkMode} eventCategories={eventCategories} />




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