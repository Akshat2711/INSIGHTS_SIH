import React, { useState, useEffect } from 'react';
import { Crown, Loader, AlertCircle, Trophy} from 'lucide-react';
import Particles from '../components/Particles';
import { Current_leaderboard_user_performance } from '../components/Leaderboard_cuser_performance';
import { Leaderboard_table } from '../components/Leaderboard_table';
import { API_BASE_URL } from '../utils/apiConfig';

const LeaderBoard = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [isDataFromStorage, setIsDataFromStorage] = useState(false);
  const [allUsersData, setAllUsersData] = useState(null);

  // Default user ID
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


  //func to interact with all users data from other components
  const fnc_allUsersData = (data) => {
    setAllUsersData(data);
  }

  const fnc_lastrefresh = (data) => {
    setLastRefresh(data);
  }

  const fnc_isDataFromStorage = (data) => {
    setIsDataFromStorage(data);
  } 

  //////////////////////////////////////////////
  // REMOVED: calculatePointsFromData function as requested.
  //////////////////////////////////////////////


  // Manually triggered fetch function
  const fetchAllUsersData = async () => {
    setLoading(true);
    setError(null);
    setIsDataFromStorage(false);
    
    try {
      const response = await fetch(`${API_BASE_URL}/getallusers`);
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

  // Function to calculate detailed points breakdown for a user (KEPT for user performance component)
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
    
    // Helper function to safely extract points from an item
    const extractPoints = (item) => {
      if (!item) return 0;
      
      if (typeof item === 'number') return item;
      if (typeof item === 'string' && !isNaN(parseInt(item))) return parseInt(item);
      
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
    
    const parts = userId.split('-');
    const nameParts = parts.filter(part => isNaN(parseInt(part))); // Remove numeric parts
    
    const formattedName = nameParts
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
    
    return formattedName || userId; 
  };

  // MODIFIED: Generate leaderboard data using stored/fetched totalPoints
  const generateLeaderboardData = () => {
    if (!allUsersData || !allUsersData.all_users) return [];

    const realUsers = [];
    const userEntries = Object.entries(allUsersData.all_users);

    userEntries.forEach(([userId, userData], index) => {
      
      // *** LOGIC CHANGE: Use pre-calculated totalPoints from userData ***
      const totalPoints = userData.total_points || 0; // ASSUMES userData has a 'totalPoints' field

      const postData = userData.post_to_no || {};
      
      // Helper to get count or 'NA'
      const getCount = (key) => (Array.isArray(postData[key]) && postData[key].length > 0) ? postData[key].length : 'NA';
      const getCgpa = postData.cgpa !== undefined && postData.cgpa !== null && !isNaN(parseFloat(postData.cgpa)) ? parseFloat(postData.cgpa) : 'NA';

      const hackathons = getCount('hackathon');
      const certifications = getCount('certification');
      const leadership = getCount('leadership');
      const projects = getCount('project');
      const internships = getCount('internship');
      const inhouse_projects = getCount('inhouse_project');
      const fsd_projects = getCount('fsd_project');
      const coding_platforms = getCount('coding_platform');
      const memberships = getCount('membership');
      const assessments = getCount('assessment');
      const research_publications = getCount('research_publications');

      const profileName = formatUserIdToName(userId);

      realUsers.push({
        id: index + 1,
        userId: userId,
        name: profileName, 
        cgpa: getCgpa,
        hackathons: hackathons,
        internships: internships,
        certifications: certifications,
        projects: projects,
        inhouse_projects: inhouse_projects,
        fsd_projects: fsd_projects,
        coding_platforms: coding_platforms,
        memberships: memberships,
        assessments: assessments,
        leadership: leadership,
        research_publications: research_publications,
        posts: userData.original_scrapping ? userData.original_scrapping.length : 0,
        totalPoints: totalPoints, // DISPLAY STORED TOTAL POINTS
        evidence: (() => {
          const evidenceParts = [];
          const pushEvidence = (count, label) => {
              if (typeof count === 'number' && count > 0) evidenceParts.push(`${count} ${label}`);
          };

          pushEvidence(hackathons, 'hackathons');
          pushEvidence(certifications, 'certifications');
          pushEvidence(leadership, 'leadership roles');
          pushEvidence(internships, 'internships');
          pushEvidence(projects, 'projects');
          pushEvidence(inhouse_projects, 'in-house projects');
          pushEvidence(fsd_projects, 'FSD projects');
          pushEvidence(coding_platforms, 'coding platform activities');
          pushEvidence(memberships, 'memberships');
          pushEvidence(assessments, 'assessments');
          pushEvidence(research_publications, 'research publications');
          
          if (userData.original_scrapping && userData.original_scrapping.length > 0) evidenceParts.push(`${userData.original_scrapping.length} professional posts`);
          
          return evidenceParts.length > 0 ? evidenceParts.join(', ') : 'No specific achievements recorded yet';
        })(),
        isReal: true
      });
    });

    return [...realUsers]
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((user, index) => ({ ...user, rank: index + 1 }));
  };


  const leaderboardData = generateLeaderboardData();
  const current_user = leaderboardData.find(user => user.userId === userid);

return (
  <div className="min-h-screen font-['Inter'] relative overflow-hidden bg-black">
    {/* Fixed Particles Background - covering entire page */}
{/*     <div className="fixed inset-0 w-full h-full z-0">
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
    </div> */}
    
    {/* Main Content */}
    <div className="relative z-10 pt-28 pb-16">
    {/* Hero Header Section */}
      <section className="px-6 sm:px-8 mb-12 mt-8">
        <div className="max-w-7xl mx-auto">
          {/* Title + Icon */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center p-4 rounded-3xl mb-6
              bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-400/20 backdrop-blur-xl">
              <Crown className="text-yellow-500" size={36} />
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent mb-4">
              Champions
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Discover the top performers and track your journey to excellence
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full mx-auto mt-6"></div>
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
    {/* Load Data Placeholder */}
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
    {/* Live Leaderboard Section */}
    {!loading && !error && allUsersData && (
      <Leaderboard_table leaderboardData={leaderboardData} darkMode={darkMode} fetchAllUsersData={fetchAllUsersData} loading={loading} allUsersData={allUsersData} textColor={textColor} formatUserIdToName={formatUserIdToName} fnc_allUsersData={fnc_allUsersData} fnc_isDataFromStorage={fnc_isDataFromStorage} fnc_lastrefresh={fnc_lastrefresh}/>
    )}

    {/* Current User Performance */}
    {!loading && !error && current_user && (
      <Current_leaderboard_user_performance current_user={current_user} darkMode={darkMode} allUsersData={allUsersData} userid={userid} />
    )}
    
  
    </div>
  </div>
);

};

export default LeaderBoard;