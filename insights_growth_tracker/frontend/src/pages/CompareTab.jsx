import React, { useState, useEffect, useMemo } from 'react';
import { Search, User, Trophy, BookOpen, Calendar, Award, Code, Users, GraduationCap, Briefcase, Star, Database, Shield, FileText } from 'lucide-react';
import Particles from '../components/Particles';

// Hoisted UI subcomponents (move out of CompareTab to avoid remounts on every render)
export const Surface = ({ className = '', children }) => {
  const darkMode = (typeof window !== 'undefined') && localStorage.getItem('insight_theme') === 'dark';
  
  return (
    <div
      className={`rounded-3xl backdrop-blur-2xl border transition-all duration-300 ${
        darkMode 
          ? 'bg-gradient-to-br from-white/5 via-white/[0.02] to-white/5 border-white/10' 
          : 'bg-gradient-to-br from-white/80 via-white/40 to-white/80 border-white/20'
      } ${className}`}
    >
      {children}
    </div>
  );
};

export const FluoroButton = ({ children, className = '', ...props }) => {
  const darkMode = (typeof window !== 'undefined') && localStorage.getItem('insight_theme') === 'dark';
  
  return (
    <button
      {...props}
      className={`relative inline-flex items-center justify-center px-6 py-3 rounded-2xl font-bold transition-all duration-300 hover:scale-105 ${
        darkMode
          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-purple-500/30'
          : 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:shadow-lg hover:shadow-purple-400/30'
      } disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
};

export const Input = (props) => {
  const darkMode = (typeof window !== 'undefined') && localStorage.getItem('insight_theme') === 'dark';
  
  return (
    <input
      {...props}
      className={`w-full px-4 py-3 rounded-2xl transition-all duration-300 ${
        darkMode
          ? 'bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20'
          : 'bg-gray-50 text-gray-900 placeholder-gray-500 border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
      } outline-none ${props.className || ''}`}
    />
  );
};

// Hoisted ComparisonCard (memoized). It now receives metrics, accents, accentKeys, other/current user data and num helper as props.
export const ComparisonCard = React.memo(function ComparisonCard({
  user,
  isCurrentUser,
  metrics,
  accents,
  accentKeys,
  otherUserData,
  currentUserData,
  num,
}) {
  const darkMode = (typeof window !== 'undefined') && localStorage.getItem('insight_theme') === 'dark';
  
  return (
    <Surface className="p-5 sm:p-6 flex-1">
      <div className="text-center mb-4 sm:mb-6">
        <div
          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full mx-auto mb-3 flex items-center justify-center border ${
            darkMode ? 'border-white/10' : 'border-black/10'
          } ${
            isCurrentUser 
              ? (darkMode ? 'shadow-[0_0_20px_rgb(147,51,234,0.5)] bg-gradient-to-br from-purple-500/20 to-indigo-500/20' : 'shadow-[0_0_20px_rgb(147,51,234,0.3)] bg-gradient-to-br from-purple-100 to-indigo-100')
              : (darkMode ? 'shadow-[0_0_20px_rgb(99,102,241,0.5)] bg-gradient-to-br from-indigo-500/20 to-blue-500/20' : 'shadow-[0_0_20px_rgb(99,102,241,0.3)] bg-gradient-to-br from-indigo-100 to-blue-100')
          }`}
        >
          <User size={22} className={darkMode ? 'text-white' : 'text-gray-700'} />
        </div>
        <h3 className={`text-base sm:text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{user.name}</h3>
        <p className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>@{user.id}</p>
        <p className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Total Points: <span className={`font-semibold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>{user.totalPoints}</span>
        </p>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {metrics.map((metric, idx) => {
          const Icon = metric.icon;
          const value = user[metric.key];
          const otherValue = otherUserData && currentUserData
            ? (isCurrentUser ? otherUserData[metric.key] : currentUserData[metric.key])
            : 0;
          const a = num(value);
          const b = num(otherValue);
          const isHigher = a > b;
          const isEqual = a === b;
          
          return (
            <div key={metric.key} className="flex items-center justify-between">
              <div className="flex items-center min-w-0">
                <Icon size={16} className={`mr-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                <span className={`text-xs sm:text-sm ${darkMode ? 'text-white' : 'text-gray-900'} truncate`}>{metric.label}</span>
              </div>
              <div className="flex items-center ml-2">
                <span
                  className={`font-semibold mr-2 text-sm sm:text-base ${
                    otherUserData && currentUserData && !isEqual
                      ? (isHigher ? 'text-green-400' : 'text-red-400')
                      : (darkMode ? 'text-white' : 'text-gray-900')
                  }`}
                >
                  {typeof value === 'string' ? value : a}
                </span>
                {otherUserData && currentUserData && !isEqual && (
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ 
                      backgroundColor: isHigher ? '#10b981' : '#ef4444', 
                      boxShadow: `0 0 10px ${isHigher ? '#10b981' : '#ef4444'}` 
                    }}
                  />
                )}
                {/* subtle indicator line */}
                <div className={`ml-2 h-px w-6 opacity-30 ${
                  darkMode ? 'bg-purple-500' : 'bg-purple-600'
                }`} />
              </div>
            </div>
          );
        })}
      </div>
    </Surface>
  );
});

/**
 * CompareTab (Material-Neon Redesign)
 * - Modern dark fluorescent look inspired by Material Design
 * - Deep black surfaces, neon accents, soft elevation, rounded-2xl
 * - Accessible focus states, WCAG-friendly contrasts
 */
const CompareTab = () => {
  // Theme detection (controlled by state)
  const [darkMode, setDarkMode] = useState(
    (typeof window !== 'undefined') && localStorage.getItem('insight_theme') === 'dark'
  );

  // Fix: Declare compareUserId, loading, error, currentUserData, otherUserData state at the top before any usage
  const [compareUserId, setCompareUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentUserData, setCurrentUserData] = useState(null);
  const [otherUserData, setOtherUserData] = useState(null);

  // Listen for theme changes (storage event and local change)
  useEffect(() => {
    const updateTheme = () => {
      setDarkMode(localStorage.getItem('insight_theme') === 'dark');
    };
    window.addEventListener('storage', (e) => {
      if (e.key === 'insight_theme') updateTheme();
    });
    updateTheme();
    return () => window.removeEventListener('storage', updateTheme);
  }, []);

  // Accent palette (fluorescent)
  const accents = useMemo(() => ({
    blue: '#00D1FF',      // electric blue
    green: '#00FF9C',     // neon green
    magenta: '#FF00E5',   // hot magenta
    cyan: '#00FFC6',      // cyan
    violet: '#9B5CFF',    // violet
  }), []);

  // Pick a primary accent and subtle gradient background
  const accentKeys = Object.keys(accents);
  const primaryAccent = accents.blue;
  const secondaryAccent = accents.violet;

  // Update CSS variables and body background on theme change
  useEffect(() => {
    document.body.style.backgroundColor = darkMode ? "rgb(0, 0, 0)" : "rgb(207, 207, 207)";
  }, [darkMode]);

  // Current user ID & base info
  const currentUserId = (typeof window !== 'undefined' && localStorage.getItem('linkedin_id')) || 'punit173';
  const user_info = (typeof window !== 'undefined') ? JSON.parse(localStorage.getItem('insight_user_info')) || null : null;

  // Fetch current user data on component mount
  useEffect(() => {
    const processedData = processUserData(user_info, currentUserId);
    setCurrentUserData(processedData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // only for other user not for logged in user
  const fetchUserData = async (userId, setUserState) => {
    try {
      const response = await fetch(`https://insights-sih-tf-lva.fly.dev/senduserinfo?userid=${userId}`);
      if (!response.ok) throw new Error('User not found');
      const data = await response.json();
      const processedData = processUserData(data, userId);
      setUserState(processedData);
    } catch (err) {
      console.error('Error fetching user data:', err);
      throw new Error(`Failed to fetch data for user: ${userId}`);
    }
  };

  // Helper: format user id to presentable name
  const formatUserIdToName = (userId) => {
    if (!userId) return 'Unknown User';
    const parts = userId.split('-');
    const nameParts = parts.filter((part) => isNaN(parseInt(part)));
    const formatted = nameParts.map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');
    return formatted || userId;
  };

  // Safe numeric conversion for comparisons (handles "N.M.")
  const num = (v) => {
    if (v === null || v === undefined) return 0;
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };





const processUserData = (data, userId) => {
  if (!data) return {
    id: userId, name: formatUserIdToName(userId), cgpa: 'N.M.', hackathons: 0, internships: 0, certifications: 0, projects: 0,
    inhouseProjects: 0, fsdProjects: 0, codingPlatform: 0, memberships: 0, assessments: 0, leadership: 0, researchPublications: 0,
    posts: 0, totalPoints: 0, githubRepos: 0, githubStars: 0, githubForks: 0, githubFollowers: 0, workExperience: 0, 
    volunteerExperience: 0, awardsRecognitions: 0,
  };

  const userData = data.user_data || {};
  const postData = userData.post_to_no || {};
  const githubData = userData.github_data || {};
  const resumeData = userData.resume_data?.data || {};
  const name = formatUserIdToName(userId);

  // LinkedIn post data
  const hackathons = postData.hackathon ? postData.hackathon.length : 0;
  const certifications = postData.certification ? postData.certification.length : 0;
  const projects = postData.project ? postData.project.length : 0;
  const leadership = postData.leadership ? postData.leadership.length : 0;
  const internships = postData.internship ? postData.internship.length : 0;
  const inhouseProjects = postData.inhouse_project ? postData.inhouse_project.length : 0;
  const fsdProjects = postData.fsd_project ? postData.fsd_project.length : 0;
  const codingPlatform = postData.coding_platform ? postData.coding_platform.length : 0;
  const memberships = postData.membership ? postData.membership.length : 0;
  const assessments = postData.assessment ? postData.assessment.length : 0;
  const researchPublications = postData.research_publications ? postData.research_publications.length : 0;

  // GitHub metrics
  const githubRepos = githubData.repositories ? githubData.repositories.length : 0;
  const githubStars = githubData.repositories ? githubData.repositories.reduce((sum, repo) => sum + (repo.total_stars || 0), 0) : 0;
  const githubForks = githubData.repositories ? githubData.repositories.reduce((sum, repo) => sum + (repo.total_forks || 0), 0) : 0;
  const githubFollowers = githubData.profile?.followers || 0;

  // Resume metrics
  const workExperience = resumeData.work_experience ? resumeData.work_experience.length : 0;
  const volunteerExperience = resumeData.volunteer_experience ? resumeData.volunteer_experience.length : 0;
  const awardsRecognitions = resumeData.awards_and_recognitions ? resumeData.awards_and_recognitions.length : 0;

  const cgpa = data.cgpa || resumeData.education?.[0]?.gpa || 'N.M.';
  const totalPosts = userData.original_scrapping ? userData.original_scrapping.length : 0;

  const totalPoints = [
    ...(postData.hackathon || []),
    ...(postData.certification || []),
    ...(postData.project || []),
    ...(postData.leadership || []),
    ...(postData.internship || []),
    ...(postData.inhouse_project || []),
    ...(postData.fsd_project || []),
    ...(postData.coding_platform || []),
    ...(postData.membership || []),
    ...(postData.assessment || []),
    ...(postData.research_publications || []),
  ].reduce((sum, item) => sum + parseInt(item.points || 0, 10), 0);

  return {
    id: userId,
    name,
    cgpa,
    hackathons,
    internships,
    certifications,
    projects,
    inhouseProjects,
    fsdProjects,
    codingPlatform,
    memberships,
    assessments,
    leadership,
    researchPublications,
    posts: totalPosts,
    totalPoints,
    // GitHub data
    githubRepos,
    githubStars,
    githubForks,
    githubFollowers,
    // Resume data
    workExperience,
    volunteerExperience,
    awardsRecognitions,
  };
};



  const handleSearch = async () => {
    if (!compareUserId.trim()) {
      setError('Please enter a user ID');
      return;
    }
    setLoading(true);
    setError('');
    setOtherUserData(null);
    try {
      await fetchUserData(compareUserId.trim(), setOtherUserData);
    } catch (err) {
      console.error('Search error:', err);
      setError('User not found or error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const metrics = [
    { key: 'cgpa', label: 'CGPA', icon: GraduationCap },
    { key: 'hackathons', label: 'Hackathons', icon: Trophy },
    { key: 'internships', label: 'Internships', icon: Briefcase },
    { key: 'certifications', label: 'Certifications', icon: Award },
    { key: 'projects', label: 'Projects', icon: Code },
    { key: 'inhouseProjects', label: 'In-house Projects', icon: Database },
    { key: 'fsdProjects', label: 'FSD Projects', icon: FileText },
    { key: 'codingPlatform', label: 'Coding Platforms', icon: Code },
    { key: 'memberships', label: 'Memberships', icon: Users },
    { key: 'assessments', label: 'Assessments', icon: Star },
    { key: 'leadership', label: 'Leadership', icon: Shield },
    { key: 'researchPublications', label: 'Research Publications', icon: BookOpen },
    { key: 'posts', label: 'LinkedIn Posts', icon: Calendar },
    // New GitHub metrics
    { key: 'githubRepos', label: 'GitHub Repositories', icon: Code },
    { key: 'githubStars', label: 'GitHub Stars', icon: Star },
    { key: 'githubForks', label: 'GitHub Forks', icon: Users },
    { key: 'githubFollowers', label: 'GitHub Followers', icon: Users },
    // New resume metrics
    { key: 'workExperience', label: 'Work Experience', icon: Briefcase },
    { key: 'volunteerExperience', label: 'Volunteer Experience', icon: Users },
    { key: 'awardsRecognitions', label: 'Awards & Recognitions', icon: Award }
  ];

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
      <div className="relative z-10 pt-16 pb-16">
        <div className="space-y-6 mt-16 font-[Inter,Roboto,system-ui,sans-serif]">
          <div className="max-w-6xl mx-auto space-y-6 px-4">
        {/* Hero Header Section */}
        <section className="px-8 mb-16">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-4 mb-6">
                <div className={`p-4 rounded-3xl ${
                  darkMode 
                    ? 'bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-500/30' 
                    : 'bg-gradient-to-r from-purple-100 to-indigo-100 border border-purple-200'
                } backdrop-blur-xl`}>
                  <Search className={`${darkMode ? "text-purple-400" : "text-purple-600"}`} size={36} />
                </div>
              </div>
              <h1 className={`text-6xl font-black mb-6 ${
                darkMode 
                  ? 'bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400' 
                  : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600'
              } bg-clip-text text-transparent`}>
                Compare
              </h1>
              <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
                Compare your professional progress with peers and discover growth opportunities
              </p>
              <div className={`w-32 h-1 mx-auto mt-6 ${
                darkMode 
                  ? 'bg-gradient-to-r from-purple-400 to-indigo-400' 
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600'
              } rounded-full`}></div>
            </div>
          </div>
        </section>
        
        {/* Search Section */}
        <Surface className="p-4 sm:p-6">
          <h2 className={`text-lg sm:text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4 tracking-tight`}>Compare with Peer</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 ">
              <Input
                type="text"
                placeholder="Enter LinkedIn user ID (e.g., john-doe-123456789)"
                value={compareUserId}
                onChange={(e) => setCompareUserId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                disabled={loading}
                aria-label="LinkedIn user ID"
              />
            </div>
            <FluoroButton onClick={handleSearch} disabled={loading || !currentUserData} aria-label="Compare">
              <Search size={16} className="mr-2" />
              {loading ? 'Searching…' : 'Compare'}
            </FluoroButton>
          </div>
          {error && <div className="mt-3 text-red-400 text-sm">{error}</div>}
        </Surface>

        {/* Loading State */}
        {!currentUserData && (
          <Surface className="p-12 text-center">
            <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${darkMode ? 'border-purple-400' : 'border-purple-600'} mx-auto mb-4`}></div>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Loading your profile…</h3>
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Please wait while we fetch your data</p>
          </Surface>
        )}

        {/* Comparison Section */}
        {otherUserData && currentUserData ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* updated: pass metrics, accents, accentKeys, other/current data and num helper */}
              <ComparisonCard
                user={currentUserData}
                isCurrentUser={true}
                metrics={metrics}
                accents={accents}
                accentKeys={accentKeys}
                otherUserData={otherUserData}
                currentUserData={currentUserData}
                num={num}
              />
              <ComparisonCard
                user={otherUserData}
                isCurrentUser={false}
                metrics={metrics}
                accents={accents}
                accentKeys={accentKeys}
                otherUserData={otherUserData}
                currentUserData={currentUserData}
                num={num}
              />
            </div>

            {/* Summary */}
            <Surface className="p-6">
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Comparison Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`text-center rounded-xl p-4 border ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
                  <div className="text-2xl font-bold mb-1 text-green-400">
                    {metrics.filter((m) => num(currentUserData[m.key]) > num(otherUserData[m.key])).length}
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Areas you lead</div>
                </div>
                <div className={`text-center rounded-xl p-4 border ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
                  <div className="text-2xl font-bold mb-1 text-cyan-400">
                    {metrics.filter((m) => num(currentUserData[m.key]) === num(otherUserData[m.key])).length}
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Equal performance</div>
                </div>
                <div className={`text-center rounded-xl p-4 border ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
                  <div className="text-2xl font-bold mb-1 text-red-400">
                    {metrics.filter((m) => num(currentUserData[m.key]) < num(otherUserData[m.key])).length}
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Areas to improve</div>
                </div>
              </div>

              {/* Detailed Insights */}
              <div className={`mt-6 pt-6 border-t ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
                <h4 className={`text-md font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-3`}>Key Insights</h4>
                <div className={`space-y-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {num(currentUserData.totalPoints) > num(otherUserData.totalPoints) ? (
                    <p>🎉 You have {num(currentUserData.totalPoints) - num(otherUserData.totalPoints)} more points overall!</p>
                  ) : num(currentUserData.totalPoints) < num(otherUserData.totalPoints) ? (
                    <p>📈 You could gain {num(otherUserData.totalPoints) - num(currentUserData.totalPoints)} more points to match their level</p>
                  ) : (
                    <p>⚖️ You both have the same total points!</p>
                  )}
                  {num(currentUserData.hackathons) < num(otherUserData.hackathons) && (
                    <p>🏆 Consider participating in more hackathons to boost your competitive programming skills.</p>
                  )}
                  {num(currentUserData.projects) < num(otherUserData.projects) && (
                    <p>💡 Building more projects could help showcase your technical abilities.</p>
                  )}
                </div>
              </div>
            </Surface>
          </div>
        ) : currentUserData && !loading ? (
          <Surface className="p-12 text-center">
            <User size={48} className={`mx-auto mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Ready to Compare</h3>
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Enter a LinkedIn user ID above to start comparing your professional progress</p>
            <div className={`mt-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <p>Your current stats:</p>
              <p>
                Total Points: <span className={`font-semibold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>{currentUserData.totalPoints}</span>
              </p>
            </div>
          </Surface>
        ) : null}
          </div>
        </div>
      </div>
      
      {/* Accessibility helpers (visually-hidden) */}
      <style>{`
        :root { color-scheme: dark; }
        .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
      `}</style>
    </div>
  );
};

export default CompareTab;