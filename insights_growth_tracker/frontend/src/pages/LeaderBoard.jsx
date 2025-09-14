import React, { useState, useEffect } from 'react';
import { Crown, Medal, Award, Info, Loader, AlertCircle, Trophy, Star, Zap, Target, Users, BookOpen, RefreshCw, Database } from 'lucide-react';

const LeaderBoard = () => {
  const [hoveredUser, setHoveredUser] = useState(null);
  const [allUsersData, setAllUsersData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [isDataFromStorage, setIsDataFromStorage] = useState(false);
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
      const response = await fetch('http://127.0.0.1:5000/getallusers');
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
  <div className={`space-y-10 p-8 min-h-screen mt-14 font-['Inter'] ${darkMode ? 'bg-[#0a0a0f]' : 'bg-[#f5f7fa]'}`}>
    {/* Header with Refresh Button */}
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
      <div className="flex items-center gap-3">
        <h1 className={`text-3xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-black'}`}>
          Professional Leaderboard
        </h1>
        {isDataFromStorage && (
          <div className={`flex items-center gap-1 text-xs ${darkMode ? 'text-cyan-400 bg-cyan-950/40' : 'text-cyan-700 bg-cyan-100'} px-2 py-1 rounded-xl shadow-sm shadow-cyan-500/30`}>
            <Database size={14} />
            Cached
          </div>
        )}
      </div>
      <div className="flex items-center gap-4">
        {lastRefresh && <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Last updated: {lastRefresh}</span>}
        <div className="flex gap-2">
          <button
            onClick={fetchAllUsersData}
            disabled={loading}
            aria-label="Refresh leaderboard"
            className={`flex items-center gap-2 px-5 py-2 rounded-2xl font-medium transition-all duration-300 shadow-md
              ${loading ? (darkMode ? 'bg-gray-700 cursor-not-allowed text-white' : 'bg-gray-300 cursor-not-allowed text-black') : (darkMode ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-cyan-500/70 hover:scale-[1.02]' : 'bg-gradient-to-r from-cyan-400 to-blue-400 text-black hover:shadow-cyan-400/70 hover:scale-[1.02]')}`}
          >
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
          {allUsersData && (
            <button
              onClick={clearCachedData}
              aria-label="Clear cached data"
              className={`flex items-center gap-2 px-5 py-2 rounded-2xl font-medium transition-all duration-300 hover:scale-[1.02] ${
                darkMode
                  ? 'bg-gradient-to-r from-pink-600 to-red-600 text-white hover:shadow-pink-500/70'
                  : 'bg-gradient-to-r from-pink-300 to-red-400 text-black hover:shadow-pink-300/70'
              }`}
            >
              <Database size={16} />
              Clear Cache
            </button>
          )}
        </div>
      </div>
    </div>
    {/* Loading */}
    {loading && (
      <div className="flex items-center justify-center py-16">
        <div className={`rounded-2xl p-10 text-center animate-pulse ${darkMode ? 'bg-[#141418] border border-cyan-500/40 shadow-xl shadow-cyan-500/20 text-white' : 'bg-white border border-cyan-300 shadow-xl shadow-cyan-300/20 text-black'}`}>
          <Loader className={`animate-spin mx-auto mb-4 ${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`} size={40} />
          <span className="font-medium">Loading leaderboard...</span>
        </div>
      </div>
    )}
    {/* Error */}
    {error && (
      <div className="flex items-center justify-center py-16">
        <div className={`rounded-2xl p-10 text-center max-w-lg ${darkMode ? 'bg-red-950/40 border border-red-500 shadow-lg shadow-red-500/30' : 'bg-red-100 border border-red-400 shadow-lg shadow-red-300/30'}`}>
          <AlertCircle className={`${darkMode ? 'text-red-500' : 'text-red-600'} mx-auto mb-4`} size={40} />
          <span className={`${darkMode ? 'text-red-400' : 'text-red-700'} font-medium block`}>{error}</span>
          <button
            onClick={fetchAllUsersData}
            className={`mt-6 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 hover:scale-[1.05] ${
              darkMode
                ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white hover:shadow-red-500/70'
                : 'bg-gradient-to-r from-red-400 to-pink-300 text-black hover:shadow-red-300/70'
            }`}
          >
            Try Again
          </button>
        </div>
      </div>
    )}
    {/* No Data */}
    {!loading && !error && !allUsersData && (
      <div className="flex items-center justify-center py-16">
        <div className={`rounded-2xl p-10 text-center w-full max-w-lg transition-all duration-300 hover:shadow-cyan-400/40 ${
          darkMode ? 'bg-[#141418] shadow-xl shadow-cyan-500/20 border border-cyan-500/40 text-white' : 'bg-white shadow-xl shadow-cyan-300/20 border border-cyan-300/40 text-black'
        }`}>
          <Trophy className={`${darkMode ? 'text-cyan-400' : 'text-cyan-600'} mx-auto mb-4`} size={48} />
          <h3 className="text-2xl font-semibold mb-3">Welcome to the Leaderboard!</h3>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>No cached data found. Click "Refresh Data" to load the latest leaderboard information from the server.</p>
          <button
            onClick={fetchAllUsersData}
            className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 hover:scale-[1.05] ${
              darkMode
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-cyan-500/70'
                : 'bg-gradient-to-r from-cyan-400 to-blue-400 text-black hover:shadow-cyan-400/70'
            }`}
          >
            Load Leaderboard
          </button>
        </div>
      </div>
    )}
    {/* Leaderboard Data */}
    {!loading && !error && allUsersData && (
      <div className={`rounded-2xl shadow-2xl border bg-opacity-60 backdrop-blur-lg ${
        darkMode
          ? 'shadow-cyan-500/10 border-cyan-500/30 bg-[#141418]'
          : 'shadow-cyan-300/10 border-cyan-300/30 bg-white'
      }`}>
        <div className={`p-6 border-b rounded-t-2xl flex items-center ${
          darkMode ? 'border-cyan-500/20' : 'border-cyan-300/20'
        }`}>
          <Trophy className={`${darkMode ? 'text-yellow-400' : 'text-yellow-600'} mr-3`} size={28} />
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>Live Leaderboard</h2>
          <span className={`ml-4 text-sm border px-3 py-1 rounded-xl ${
            darkMode ? 'border-cyan-500/40 text-cyan-300' : 'border-cyan-300/40 text-cyan-700'
          }`}>
            ({leaderboardData.filter(u => u.isReal).length} Real Users)
          </span>
          {isDataFromStorage && <span className={`ml-2 text-xs px-2 py-1 rounded-xl ${
            darkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700'
          }`}>From Cache</span>}
        </div>
        {/* Mobile cards */}
        <div className="md:hidden space-y-4 p-6">
          {leaderboardData.map((user) => (
            <div
              key={user.id}
              className={`border rounded-2xl p-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
                darkMode
                  ? `bg-transparent border-cyan-500/10 ${user.isReal ? 'border-2' : ''}`
                  : `bg-white border-cyan-300/10 ${user.isReal ? 'border-2 border-cyan-300' : ''}`
              }`}
              onMouseEnter={() => setHoveredUser(user.id)}
              onMouseLeave={() => setHoveredUser(null)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="mr-4">{getRankIcon(user.rank)}</div>
                  <div>
                    <span className={`font-semibold ${darkMode ? 'text-white' : 'text-black'}`}>{user.name}</span>
                    <div className="mt-1">
                      <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>@{user.userId}</span>
                      {user.isReal && (
                        <span className={`ml-2 text-xs border px-2 py-1 rounded-xl font-medium ${
                          darkMode ? 'border-cyan-500/30 text-cyan-300' : 'border-cyan-300/30 text-cyan-700'
                        }`}>Real Data</span>
                      )}
                    </div>
                  </div>
                </div>
                <span className={`text-xl font-bold ${darkMode ? 'text-cyan-300' : 'text-cyan-700'}`}>{user.totalPoints}</span>
              </div>
              {hoveredUser === user.id && (
                <div className={`text-sm border-t pt-3 ${
                  darkMode ? 'text-gray-300 border-cyan-500/10' : 'text-gray-700 border-cyan-300/10'
                }`}>
                  <div className="flex items-start">
                    <Info size={14} className={`mr-2 mt-0.5 flex-shrink-0 ${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`} />
                    <p>{user.evidence || 'No specific achievements recorded yet'}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className={`${darkMode ? 'bg-[#1a1a20] text-cyan-400' : 'bg-cyan-100 text-cyan-700'}`}>
                <th className={`text-left py-4 px-4 font-semibold ${darkMode ? '' : 'text-black'}`}>Rank</th>
                <th className={`text-left py-4 px-4 font-semibold ${darkMode ? '' : 'text-black'}`}>Name</th>
                {columns.map((col) => (
                  <th key={col.key} className={`text-center py-4 px-3 text-sm font-semibold ${darkMode ? '' : 'text-black'}`}>
                    <div className="flex items-center justify-center gap-1">
                      {col.icon && getStatIcon(col.icon)}
                      <span>{col.label}</span>
                    </div>
                  </th>
                ))}
                <th className={`text-center py-4 px-4 font-bold ${darkMode ? 'text-cyan-300' : 'text-cyan-700'}`}>Total Points</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData.map((user) => (
                <tr
                  key={user.id}
                  className={`transition-all duration-300 cursor-pointer border-b hover:bg-opacity-60 ${
                    darkMode
                      ? `border-gray-800 hover:bg-[#1c1c24]/60 ${user.isReal ? 'border-l-4 border-l-cyan-400' : ''}`
                      : `border-gray-200 hover:bg-cyan-50 ${user.isReal ? 'border-l-4 border-l-cyan-300' : ''}`
                  }`}
                  onMouseEnter={() => setHoveredUser(user.id)}
                  onMouseLeave={() => setHoveredUser(null)}
                >
                  <td className="py-4 px-4">{getRankIcon(user.rank)}</td>
                  <td className={`py-4 px-4 ${darkMode ? 'text-white' : 'text-black'}`}>
                    <div className="flex flex-col">
                      <span>{user.name}</span>
                      <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>@{user.userId}</span>
                      {user.isReal && (
                        <span className={`text-xs border px-2 py-1 rounded-xl w-fit mt-1 font-medium ${
                          darkMode ? 'border-cyan-500/40 text-cyan-300' : 'border-cyan-300/40 text-cyan-700'
                        }`}>
                          Real Data
                        </span>
                      )}
                    </div>
                  </td>
                  {columns.map((col) => (
                    <td key={col.key} className={`py-4 px-3 text-center ${darkMode ? 'text-white' : 'text-black'}`}>
                      <span className={`${user[col.key] === 'NA' ? (darkMode ? 'text-gray-500 italic' : 'text-gray-400 italic') : ''}`}>{user[col.key]}</span>
                    </td>
                  ))}
                  <td className={`py-4 px-4 text-center font-bold ${darkMode ? 'text-cyan-300' : 'text-cyan-700'}`}>{user.totalPoints}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Hovered Evidence */}
          {hoveredUser && (
            <div className={`border rounded-2xl m-4 p-4 backdrop-blur-md shadow-lg transition-all duration-300 ${
              darkMode
                ? 'border-cyan-500/40 bg-[#141418]/90 shadow-cyan-500/30'
                : 'border-cyan-300/40 bg-white/90 shadow-cyan-300/30'
            }`}>
              <div className="flex items-start">
                <Info size={18} className={`${darkMode ? 'text-cyan-400' : 'text-cyan-600'} mr-3 mt-0.5`} />
                <div>
                  <p className={`text-sm font-semibold mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>Evidence:</p>
                  <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {leaderboardData.find((u) => u.id === hoveredUser)?.evidence || 'No specific achievements recorded yet'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )}

    {/* Current User Performance + Recent Activity (FULL restored) */}
    {!loading && !error && current_user && (
      <div className={`rounded-2xl shadow-xl border bg-opacity-60 backdrop-blur-lg ${
        darkMode
          ? 'shadow-violet-500/20 border-violet-500/30 bg-[#141418]'
          : 'shadow-violet-300/20 border-violet-300/30 bg-white'
      }`}>
        <div className={`p-6 border-b flex items-center ${
          darkMode ? 'border-violet-500/20' : 'border-violet-300/20'
        }`}>
          <Star className={`${darkMode ? 'text-yellow-400' : 'text-yellow-600'} mr-3`} size={24} />
          <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>Your Performance</h3>
          <span className={`ml-3 text-sm border px-3 py-1 rounded-xl ${
            darkMode ? 'border-violet-500/40 text-violet-300' : 'border-violet-300/40 text-violet-700'
          }`}>Real Data</span>
        </div>
        <div className="p-6 bg-transparent rounded-b-2xl">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
            {/* Rank */}
            <div className="text-center group">
              <div className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>#{current_user.rank}</div>
              <div className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Current Rank</div>
            </div>
            {/* Total Points */}
            <div className="text-center group">
              <div className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>{current_user.totalPoints}</div>
              <div className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Points</div>
            </div>
            {/* Hackathons */}
            <div className="text-center group">
              <div className="flex items-center justify-center mb-2">
                <Zap className={`${darkMode ? 'text-cyan-400' : 'text-cyan-600'} mr-2`} size={20} />
                <div className={`text-2xl font-bold ${current_user.hackathons === 'NA' ? (darkMode ? 'text-gray-500' : 'text-gray-400') : (darkMode ? 'text-white' : 'text-black')}`}>
                  {current_user.hackathons}
                </div>
              </div>
              <div className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Hackathons</div>
            </div>
            {/* Certifications */}
            <div className="text-center group">
              <div className="flex items-center justify-center mb-2">
                <Trophy className={`${darkMode ? 'text-cyan-400' : 'text-cyan-600'} mr-2`} size={20} />
                <div className={`text-2xl font-bold ${current_user.certifications === 'NA' ? (darkMode ? 'text-gray-500' : 'text-gray-400') : (darkMode ? 'text-white' : 'text-black')}`}>
                  {current_user.certifications}
                </div>
              </div>
              <div className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Certifications</div>
            </div>
            {/* Projects */}
            <div className="text-center group">
              <div className="flex items-center justify-center mb-2">
                <Star className={`${darkMode ? 'text-cyan-400' : 'text-cyan-600'} mr-2`} size={20} />
                <div className={`text-2xl font-bold ${current_user.projects === 'NA' ? (darkMode ? 'text-gray-500' : 'text-gray-400') : (darkMode ? 'text-white' : 'text-black')}`}>
                  {current_user.projects}
                </div>
              </div>
              <div className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Projects</div>
            </div>
            {/* Leadership */}
            <div className="text-center group">
              <div className="flex items-center justify-center mb-2">
                <Users className={`${darkMode ? 'text-cyan-400' : 'text-cyan-600'} mr-2`} size={20} />
                <div className={`text-2xl font-bold ${current_user.leadership === 'NA' ? (darkMode ? 'text-gray-500' : 'text-gray-400') : (darkMode ? 'text-white' : 'text-black')}`}>
                  {current_user.leadership}
                </div>
              </div>
              <div className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Leadership</div>
            </div>
          </div>
          {/* Recent Activity from LinkedIn (restored exactly like prev version) */}
          {allUsersData && allUsersData.all_users[userid]?.original_scrapping && (
            <div className="mt-8">
              <h4 className={`font-semibold mb-4 flex items-center ${darkMode ? 'text-white' : 'text-black'}`}>
                <BookOpen className={`${darkMode ? 'text-indigo-400' : 'text-indigo-600'} mr-2`} size={20} />
                Recent Activities from LinkedIn:
              </h4>
              <div className="space-y-3">
                {allUsersData.all_users[userid].original_scrapping.slice(0, 3).map((post, index) => (
                  <div key={index} className={`border rounded-2xl p-4 hover:shadow-lg transition-shadow duration-200 ${
                    darkMode ? 'border-cyan-500/20 bg-[#0f1012]' : 'border-cyan-300/20 bg-gray-50'
                  }`}>
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} line-clamp-2 leading-relaxed`}>{post.text}</p>
                    <div className={`flex items-center justify-between mt-3 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <span>{post.timestamp}</span>
                      <span className="flex items-center">
                        <span className="text-pink-500 mr-1">❤️</span>
                        {post.reactions} reactions
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )}
  </div>
);

};

export default LeaderBoard;