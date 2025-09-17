import React, { useState, useEffect } from 'react';
import { Crown, Medal, Award, Info, Loader, AlertCircle, Trophy, Star, Zap, Target, Users, BookOpen, RefreshCw, Database, ChevronDown, ChevronUp, ExternalLink, ArrowRight, X, Code } from 'lucide-react';
import Particles from '../components/Particles';

const LeaderBoard = () => {
  const [hoveredUser, setHoveredUser] = useState(null);
  const [allUsersData, setAllUsersData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [isDataFromStorage, setIsDataFromStorage] = useState(false);
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [expandedActivity, setExpandedActivity] = useState(null);
  const [selectedUserBreakdown, setSelectedUserBreakdown] = useState(null);
  // Default user ID other(punit173,akshat-srivastava-5a52b1240,utkarshdubey608,devanshi-karaulia-469b37287)
  const linkedinId = localStorage.getItem('linkedin_id') || 'mayank-rai-907079217';
  const [userid, setuserid] = useState(linkedinId);

  // Theme detection
  const darkMode = localStorage.getItem("insight_theme") === "dark";
  useEffect(() => {
    document.body.style.backgroundColor = darkMode ? "rgb(0, 0, 0)" : "rgb(207, 207, 207)";
  }, [darkMode]);

  // Theme-based helpers
  const borderColor = darkMode ? 'border-white' : 'border-black';
  const textColor = darkMode ? 'text-white' : 'text-black';
  const secondaryText = darkMode ? 'text-gray-400' : 'text-gray-700';
  const cardBg = darkMode ? '' : '';
  const inputBg = darkMode ? 'bg-gray-800' : 'bg-gray-50';
  const statBg = darkMode ? 'bg-gray-800' : 'bg-gray-100';
  const tableHeaderBg = darkMode ? 'bg-gray-900 bg-opacity-10' : 'bg-black bg-opacity-10';
  const tableRowHoverBg = darkMode ? 'hover:bg-gray-800 hover:bg-opacity-30' : 'hover:bg-black hover:bg-opacity-5';

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('leaderboard_data');
    const savedRefreshTime = localStorage.getItem('leaderboard_last_refresh');
    
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setAllUsersData(parsedData);
        setIsDataFromStorage(true);
        
        if (savedRefreshTime) {
          setLastRefresh(savedRefreshTime);
        }
      } catch (error) {
        console.error('Error parsing saved leaderboard data:', error);
        // Clear corrupted data
        localStorage.removeItem('leaderboard_data');
        localStorage.removeItem('leaderboard_last_refresh');
      }
    }
  }, []);

  // Function to calculate points from real data - FIXED to include ALL categories
  const calculatePointsFromData = (postData) => {
    if (!postData) return { 
      totalPoints: 0, 
      hackathons: 'NA', 
      certifications: 'NA', 
      leadership: 'NA', 
      projects: 'NA', 
      internships: 'NA', 
      inhouse_projects: 'NA', 
      fsd_projects: 'NA', 
      coding_platforms: 'NA', 
      memberships: 'NA', 
      assessments: 'NA', 
      research_publications: 'NA',
      cgpa: 'NA'
    };
    
    let totalPoints = 0;
    let stats = {
      hackathons: 'NA',
      certifications: 'NA',
      leadership: 'NA',
      projects: 'NA',
      internships: 'NA',
      inhouse_projects: 'NA',
      fsd_projects: 'NA',
      coding_platforms: 'NA',
      memberships: 'NA',
      assessments: 'NA',
      research_publications: 'NA',
      cgpa: 'NA'
    };

    // Define all categories to process
    const categories = [
      'hackathon',
      'certification', 
      'leadership',
      'project',
      'internship',
      'inhouse_project',
      'fsd_project',
      'coding_platform',
      'membership',
      'assessment',
      'research_publications'
    ];

    // Helper function to safely extract points from an item
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

    // Process each category
    categories.forEach(category => {
      try {
        if (postData[category] && Array.isArray(postData[category]) && postData[category].length > 0) {
          // Map category names to stats object keys
          const statKey = category === 'hackathon' ? 'hackathons' :
                         category === 'certification' ? 'certifications' :
                         category === 'project' ? 'projects' :
                         category === 'internship' ? 'internships' :
                         category === 'inhouse_project' ? 'inhouse_projects' :
                         category === 'fsd_project' ? 'fsd_projects' :
                         category === 'coding_platform' ? 'coding_platforms' :
                         category === 'membership' ? 'memberships' :
                         category === 'assessment' ? 'assessments' :
                         category;

          stats[statKey] = postData[category].length;
          
          // Safely calculate total points for this category
          const categoryPoints = postData[category].reduce((sum, item) => {
            return sum + extractPoints(item);
          }, 0);
          
          totalPoints += categoryPoints;
        }
      } catch (error) {
        console.warn(`Error processing category ${category}:`, error);
        // Continue processing other categories
      }
    });

    // Handle CGPA separately if it exists in the data
    if (postData.cgpa !== undefined && postData.cgpa !== null && !isNaN(parseFloat(postData.cgpa))) {
      stats.cgpa = parseFloat(postData.cgpa);
    }

    // Set other categories to 0 if we have some data, otherwise keep as 'NA'
    if (totalPoints > 0) {
      Object.keys(stats).forEach(key => {
        if (stats[key] === 'NA' && key !== 'cgpa') stats[key] = 0;
      });
    }

    return { totalPoints, ...stats };
  };

  // Manually triggered fetch function
  const fetchAllUsersData = async () => {
    setLoading(true);
    setError(null);
    setIsDataFromStorage(false);
    
    try {
      const response = await fetch('http://127.0.0.1:8080/getallusers');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Save to state
      setAllUsersData(data);
      
      // Save to localStorage
      localStorage.setItem('leaderboard_data', JSON.stringify(data));
      
      // Update refresh timestamp
      const refreshTime = new Date().toLocaleString();
      setLastRefresh(refreshTime);
      localStorage.setItem('leaderboard_last_refresh', refreshTime);
      
    } catch (err) {
      setError(`Failed to fetch users data: ${err.message}`);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Clear cached data
  const clearCachedData = () => {
    localStorage.removeItem('leaderboard_data');
    localStorage.removeItem('leaderboard_last_refresh');
    setAllUsersData(null);
    setLastRefresh(null);
    setIsDataFromStorage(false);
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

  // Helper function to format user ID into a readable name
  const formatUserIdToName = (userId) => {
    if (!userId) return 'Unknown User';
    
    // Convert user ID to a more readable format
    // e.g., "mayank-rai-907079217" becomes "Mayank Rai"
    const parts = userId.split('-');
    const nameParts = parts.filter(part => isNaN(parseInt(part))); // Remove numeric parts
    
    // Capitalize each part
    const formattedName = nameParts
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
    
    return formattedName || userId; // Fallback to original userId if no valid parts
  };

  // Mock leaderboard data with real users
  const generateLeaderboardData = () => {
    if (!allUsersData || !allUsersData.all_users) return [];

    const realUsers = [];
    const userEntries = Object.entries(allUsersData.all_users);

    // Process real users
    userEntries.forEach(([userId, userData], index) => {
      const userStats = calculatePointsFromData(userData.post_to_no);
      
      // Use formatted name instead of trying to extract from posts
      const profileName = formatUserIdToName(userId);

      realUsers.push({
        id: index + 1,
        userId: userId,
        name: profileName, // Use formatted name
        cgpa: userStats.cgpa,
        hackathons: userStats.hackathons,
        internships: userStats.internships,
        certifications: userStats.certifications,
        projects: userStats.projects,
        inhouse_projects: userStats.inhouse_projects,
        fsd_projects: userStats.fsd_projects,
        coding_platforms: userStats.coding_platforms,
        memberships: userStats.memberships,
        assessments: userStats.assessments,
        leadership: userStats.leadership,
        research_publications: userStats.research_publications,
        posts: userData.original_scrapping ? userData.original_scrapping.length : 0,
        totalPoints: userStats.totalPoints,
        evidence: (() => {
          const evidenceParts = [];
          if (userStats.hackathons !== 'NA' && userStats.hackathons > 0) evidenceParts.push(`${userStats.hackathons} hackathons`);
          if (userStats.certifications !== 'NA' && userStats.certifications > 0) evidenceParts.push(`${userStats.certifications} certifications`);
          if (userStats.leadership !== 'NA' && userStats.leadership > 0) evidenceParts.push(`${userStats.leadership} leadership roles`);
          if (userStats.internships !== 'NA' && userStats.internships > 0) evidenceParts.push(`${userStats.internships} internships`);
          if (userStats.projects !== 'NA' && userStats.projects > 0) evidenceParts.push(`${userStats.projects} projects`);
          if (userStats.inhouse_projects !== 'NA' && userStats.inhouse_projects > 0) evidenceParts.push(`${userStats.inhouse_projects} in-house projects`);
          if (userStats.fsd_projects !== 'NA' && userStats.fsd_projects > 0) evidenceParts.push(`${userStats.fsd_projects} FSD projects`);
          if (userStats.coding_platforms !== 'NA' && userStats.coding_platforms > 0) evidenceParts.push(`${userStats.coding_platforms} coding platform activities`);
          if (userStats.memberships !== 'NA' && userStats.memberships > 0) evidenceParts.push(`${userStats.memberships} memberships`);
          if (userStats.assessments !== 'NA' && userStats.assessments > 0) evidenceParts.push(`${userStats.assessments} assessments`);
          if (userStats.research_publications !== 'NA' && userStats.research_publications > 0) evidenceParts.push(`${userStats.research_publications} research publications`);
          if (userData.original_scrapping && userData.original_scrapping.length > 0) evidenceParts.push(`${userData.original_scrapping.length} professional posts`);
          
          return evidenceParts.length > 0 ? evidenceParts.join(', ') : 'No specific achievements recorded yet';
        })(),
        isReal: true
      });
    });

    // Add some mock users if needed for comparison
    const mockUsers = [
      {
        id: realUsers.length + 1,
        name: 'Alex Rodriguez (Sample)',
        cgpa: 9.2,
        hackathons: 15,
        internships: 3,
        certifications: 20,
        projects: 12,
        inhouse_projects: 5,
        fsd_projects: 3,
        coding_platforms: 8,
        memberships: 4,
        assessments: 15,
        leadership: 6,
        research_publications: 2,
        posts: 45,
        totalPoints: 4250,
        evidence: 'Sample user for comparison - Winner of 3 major hackathons, completed ML specialization',
        isReal: false
      }
    ];

    return [...realUsers, ...mockUsers]
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((user, index) => ({ ...user, rank: index + 1 }));
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

  const getStatIcon = (key) => {
    const iconMap = {
      hackathons: <Zap className="text-orange-500" size={16} />,
      internships: <Target className="text-green-500" size={16} />,
      certifications: <Trophy className="text-blue-500" size={16} />,
      projects: <Star className="text-purple-500" size={16} />,
      leadership: <Users className="text-red-500" size={16} />,
      research_publications: <BookOpen className="text-indigo-500" size={16} />
    };
    return iconMap[key] || null;
  };

  const columns = [
    { key: 'cgpa', label: 'CGPA', icon: null },
    { key: 'hackathons', label: 'Hackathons', icon: 'hackathons' },
    { key: 'internships', label: 'Internships', icon: 'internships' },
    { key: 'certifications', label: 'Certifications', icon: 'certifications' },
    { key: 'projects', label: 'Projects', icon: 'projects' },
    { key: 'inhouse_projects', label: 'In-house Projects', icon: null },
    { key: 'fsd_projects', label: 'FSD Projects', icon: null },
    { key: 'coding_platforms', label: 'Coding Platforms', icon: null },
    { key: 'memberships', label: 'Memberships', icon: null },
    { key: 'assessments', label: 'Assessments', icon: null },
    { key: 'leadership', label: 'Leadership', icon: 'leadership' },
    { key: 'research_publications', label: 'Research Publications', icon: 'research_publications' }
  ];

  const leaderboardData = generateLeaderboardData();
  const current_user = leaderboardData.find(user => user.userId === userid);

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


    {/* Main Content */}
    <div className="relative z-10 pt-28 pb-16">
      {/* Hero Header Section */}
      <section className="px-8 mb-16 mt-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-4 mb-6">
              <div className={`p-4 rounded-3xl ${darkMode ? 'bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30' : 'bg-gradient-to-r from-yellow-100 to-orange-100 border border-yellow-200'} backdrop-blur-xl`}>
                <Crown className={`${darkMode ? "text-yellow-400" : "text-yellow-600"}`} size={40} />
              </div>
            </div>
            <h1 className={`text-7xl font-black mb-6 ${darkMode ? 'bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400' : 'bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600'} bg-clip-text text-transparent`}>
              Champions
            </h1>
            <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
              Discover the top performers and track your journey to excellence
            </p>
            <div className={`w-32 h-1 mx-auto mt-6 ${darkMode ? 'bg-gradient-to-r from-yellow-400 to-orange-400' : 'bg-gradient-to-r from-yellow-600 to-orange-600'} rounded-full`}></div>
          </div>

          {/* Controls Bar */}
          <div className={`rounded-3xl p-6 backdrop-blur-2xl border ${darkMode ? 'bg-gradient-to-br from-white/5 via-white/[0.02] to-white/5 border-white/10' : 'bg-gradient-to-br from-white/80 via-white/40 to-white/80 border-white/20'}`}>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl ${darkMode ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-yellow-100 border border-yellow-200'}`}>
                  <Trophy className={`${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} size={20} />
                  <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Live Rankings
                  </span>
                </div>
                {isDataFromStorage && (
                  <div className={`flex items-center gap-2 text-sm ${darkMode ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/20' : 'text-cyan-700 bg-cyan-100 border border-cyan-200'} px-3 py-2 rounded-2xl`}>
                    <Database size={16} />
                    <span>Cached Data</span>
                  </div>
                )}
                {lastRefresh && (
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} px-3 py-2`}>
                    Updated: {new Date(lastRefresh).toLocaleTimeString()}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchAllUsersData}
                  disabled={loading}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all duration-300 ${loading ? (darkMode ? 'bg-gray-700 cursor-not-allowed text-gray-400' : 'bg-gray-300 cursor-not-allowed text-gray-500') : (darkMode ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:shadow-lg hover:shadow-emerald-500/30 hover:scale-105' : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-400/30 hover:scale-105')}`}
                >
                  <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Updating...' : 'Refresh'}
                </button>
                {allUsersData && (
                  <button
                    onClick={clearCachedData}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all duration-300 hover:scale-105 ${darkMode ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white hover:shadow-lg hover:shadow-red-500/30' : 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:shadow-lg hover:shadow-red-400/30'}`}
                  >
                    <Database size={16} />
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    {/* Status Messages */}
    {loading && (
      <section className="px-8">
        <div className="max-w-4xl mx-auto">
          <div className={`rounded-3xl p-12 text-center backdrop-blur-2xl border ${darkMode ? 'bg-gradient-to-br from-white/5 via-white/[0.02] to-white/5 border-white/10' : 'bg-gradient-to-br from-white/80 via-white/40 to-white/80 border-white/20'}`}>
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-6 ${darkMode ? 'bg-gradient-to-br from-emerald-600/30 to-teal-600/30' : 'bg-gradient-to-br from-emerald-100 to-teal-100'}`}>
              <Loader className={`animate-spin ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} size={32} />
            </div>
            <h3 className={`text-2xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Loading Champions</h3>
            <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Fetching the latest rankings from our servers...</p>
          </div>
        </div>
      </section>
    )}

    {error && (
      <section className="px-8">
        <div className="max-w-4xl mx-auto">
          <div className={`rounded-3xl p-12 text-center backdrop-blur-2xl border ${darkMode ? 'bg-gradient-to-br from-red-500/10 via-red-600/5 to-red-500/10 border-red-500/20' : 'bg-gradient-to-br from-red-50 via-red-100 to-red-50 border-red-200'}`}>
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-6 ${darkMode ? 'bg-gradient-to-br from-red-600/30 to-pink-600/30' : 'bg-gradient-to-br from-red-100 to-pink-100'}`}>
              <AlertCircle className={`${darkMode ? 'text-red-400' : 'text-red-600'}`} size={32} />
            </div>
            <h3 className={`text-2xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Connection Failed</h3>
            <p className={`text-lg mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{error}</p>
            <button
              onClick={fetchAllUsersData}
              className={`px-8 py-4 rounded-2xl font-bold transition-all duration-300 hover:scale-105 ${darkMode ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white hover:shadow-lg hover:shadow-red-500/30' : 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:shadow-lg hover:shadow-red-400/30'}`}
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    )}

    {!loading && !error && !allUsersData && (
      <section className="px-8">
        <div className="max-w-4xl mx-auto">
          <div className={`rounded-3xl p-12 text-center backdrop-blur-2xl border ${darkMode ? 'bg-gradient-to-br from-white/5 via-white/[0.02] to-white/5 border-white/10' : 'bg-gradient-to-br from-white/80 via-white/40 to-white/80 border-white/20'}`}>
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-6 ${darkMode ? 'bg-gradient-to-br from-yellow-600/30 to-orange-600/30' : 'bg-gradient-to-br from-yellow-100 to-orange-100'}`}>
              <Trophy className={`${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} size={32} />
            </div>
            <h3 className={`text-2xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Ready to Compete?</h3>
            <p className={`text-lg mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Load the leaderboard to see where you stand among the champions</p>
            <button
              onClick={fetchAllUsersData}
              className={`px-8 py-4 rounded-2xl font-bold transition-all duration-300 hover:scale-105 ${darkMode ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white hover:shadow-lg hover:shadow-yellow-500/30' : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:shadow-lg hover:shadow-yellow-400/30'}`}
            >
              Load Champions
            </button>
          </div>
        </div>
      </section>
    )}
    {/* Live Leaderboard Section - Redesigned */}
    {!loading && !error && allUsersData && (
      <section className="px-8 mb-16">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-4 mb-6">
              <div className={`p-4 rounded-3xl ${darkMode ? 'bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-500/30' : 'bg-gradient-to-r from-purple-100 to-indigo-100 border border-purple-200'} backdrop-blur-xl`}>
                <Trophy className={`${darkMode ? "text-purple-400" : "text-purple-600"}`} size={36} />
              </div>
            </div>
            <h2 className={`text-5xl font-black mb-4 ${darkMode ? 'bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400' : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600'} bg-clip-text text-transparent`}>
              Live Rankings
            </h2>
            <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
              Real-time leaderboard showcasing top performers
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl ${darkMode ? 'bg-purple-500/10 border border-purple-500/20 text-purple-300' : 'bg-purple-100 border border-purple-200 text-purple-700'}`}>
                <Users size={16} />
                <span className="font-semibold">{leaderboardData.filter(u => u.isReal).length} Real Users</span>
              </div>
              {isDataFromStorage && (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl ${darkMode ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-300' : 'bg-cyan-100 border border-cyan-200 text-cyan-700'}`}>
                  <Database size={16} />
                  <span className="font-semibold">Cached Data</span>
                </div>
              )}
            </div>
          </div>

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
            <div className={`p-6 border-b ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
              <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Complete Rankings</h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>All participants ranked by performance</p>
            </div>
            
            {/* Rankings Grid */}
            <div className="p-6">
              <div className="grid gap-4">
                {leaderboardData.map((user, index) => (
                  <div
                    key={user.id}
                    className={`rounded-2xl border p-6 transition-all duration-300 hover:scale-[1.01] cursor-pointer ${darkMode ? 'bg-white/[0.02] border-white/5 hover:border-purple-400/20' : 'bg-white/60 border-white/10 hover:border-purple-300/30'} backdrop-blur-sm ${user.isReal ? (darkMode ? 'border-l-4 border-l-purple-400' : 'border-l-4 border-l-purple-500') : ''}`}
                    onMouseEnter={() => setHoveredUser(user.id)}
                    onMouseLeave={() => setHoveredUser(null)}
                  >
                    <div className="flex items-center justify-between">
                      {/* Left: Rank & User Info */}
                      <div className="flex items-center gap-6">
                        <div className="flex-shrink-0">
                          {getRankIcon(user.rank)}
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{user.name}</h4>
                            {user.isReal && (
                              <span className={`px-2 py-1 rounded-lg text-xs font-bold ${darkMode ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-purple-100 text-purple-700 border border-purple-200'}`}>
                                Real
                              </span>
                            )}
                          </div>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>@{user.userId}</p>
                          
                          {/* Key Stats Row */}
                          <div className="flex items-center gap-4 text-sm">
                            {user.hackathons !== 'NA' && user.hackathons > 0 && (
                              <div className="flex items-center gap-1">
                                <Zap className="text-orange-500" size={14} />
                                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{user.hackathons}</span>
                              </div>
                            )}
                            {user.certifications !== 'NA' && user.certifications > 0 && (
                              <div className="flex items-center gap-1">
                                <Trophy className="text-blue-500" size={14} />
                                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{user.certifications}</span>
                              </div>
                            )}
                            {user.projects !== 'NA' && user.projects > 0 && (
                              <div className="flex items-center gap-1">
                                <Star className="text-purple-500" size={14} />
                                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{user.projects}</span>
                              </div>
                            )}
                            {user.leadership !== 'NA' && user.leadership > 0 && (
                              <div className="flex items-center gap-1">
                                <Users className="text-red-500" size={14} />
                                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{user.leadership}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Right: Points */}
                      <div className="text-right">
                        <div className={`text-3xl font-black mb-1 ${darkMode ? 'bg-gradient-to-r from-purple-400 to-indigo-400' : 'bg-gradient-to-r from-purple-600 to-indigo-600'} bg-clip-text text-transparent`}>
                          {user.totalPoints}
                        </div>
                        <div className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Points</div>
                      </div>
                    </div>
                    
                    {/* Evidence - Expanded on Hover */}
                    {hoveredUser === user.id && (
                      <div className={`mt-4 pt-4 border-t transition-all duration-300 ${darkMode ? 'border-white/5' : 'border-black/5'}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <Info size={16} className={`mt-0.5 flex-shrink-0 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                            <div className="flex-1">
                              <p className={`text-sm font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Achievement Summary:</p>
                              <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {user.evidence || 'No specific achievements recorded yet'}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedUserBreakdown(user.userId);
                            }}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 ${darkMode ? 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/30' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border border-indigo-200'}`}
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
    )}

    {/* Current User Performance - Redesigned */}
    {!loading && !error && current_user && (
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
                  <div className="flex items-center justify-between mb-6">
                    <h4 className={`font-bold flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      <BookOpen className={`${darkMode ? 'text-indigo-400' : 'text-indigo-600'} mr-2`} size={20} />
                      Recent LinkedIn Activities:
                    </h4>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${darkMode ? 'bg-indigo-500/10 text-indigo-300' : 'bg-indigo-100 text-indigo-700'}`}>
                      {allUsersData.all_users[userid].original_scrapping.length} Total Posts
                    </div>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {allUsersData.all_users[userid].original_scrapping
                      .slice(0, showAllActivities ? allUsersData.all_users[userid].original_scrapping.length : 3)
                      .map((post, index) => (
                      <div 
                        key={index} 
                        className={`p-4 rounded-2xl border transition-all duration-300 hover:scale-[1.02] cursor-pointer ${
                          darkMode 
                            ? 'bg-white/[0.02] border-white/5 hover:border-indigo-400/20' 
                            : 'bg-white/60 border-white/10 hover:border-indigo-300/30'
                        } backdrop-blur-sm`}
                        onClick={() => setExpandedActivity(expandedActivity === index ? null : index)}
                      >
                        {/* Post Preview */}
                        <div className={`${
                          expandedActivity === index ? 'mb-4' : 'mb-3'
                        }`}>
                          <p className={`${
                            darkMode ? 'text-gray-300' : 'text-gray-700'
                          } leading-relaxed text-sm ${
                            expandedActivity === index ? '' : 'line-clamp-3'
                          }`}>
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
                        <div className={`flex items-center justify-between text-xs ${
                          darkMode ? 'text-gray-400' : 'text-gray-600'
                        } pt-3 border-t ${
                          darkMode ? 'border-white/5' : 'border-black/5'
                        }`}>
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              {new Date(post.timestamp).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="text-pink-500">❤️</span>
                              {post.reactions || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="text-blue-500">💬</span>
                              {post.comments || 0}
                            </span>
                          </div>
                          
                          {/* External Link */}
                          <div className={`p-1 rounded-full transition-all duration-300 hover:scale-110 ${
                            darkMode 
                              ? 'hover:bg-indigo-500/10 text-indigo-400' 
                              : 'hover:bg-indigo-100 text-indigo-600'
                          }`}>
                            <ExternalLink size={12} />
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
    )}
    
    {/* Points Breakdown Modal */}
    {selectedUserBreakdown && allUsersData && allUsersData.all_users[selectedUserBreakdown] && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className={`max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-3xl backdrop-blur-2xl border ${darkMode ? 'bg-gradient-to-br from-gray-900/95 to-slate-900/95 border-white/10' : 'bg-gradient-to-br from-white/95 to-gray-50/95 border-black/10'}`}>
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
    </div>
  </div>
);

};

export default LeaderBoard;