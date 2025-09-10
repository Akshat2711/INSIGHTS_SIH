import React, { useState, useEffect, useMemo } from 'react';
import { Search, User, Trophy, BookOpen, Calendar, Award, Code, Users, GraduationCap, Briefcase, Star, Database, Shield, FileText } from 'lucide-react';

// Hoisted UI subcomponents (move out of CompareTab to avoid remounts on every render)
export const Surface = ({ className = '', children }) => (
  <div
    className={`rounded-2xl border border-[var(--border)] shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_20px_50px_rgba(0,0,0,0.5)] ${className}`}
    style={{ background: 'var(--surface)', backdropFilter: 'blur(10px)' }}
  >
    {children}
  </div>
);

export const FluoroButton = ({ children, className = '', ...props }) => (
  <button
    {...props}
    className={`relative inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold tracking-wide transition-all select-none 
      focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black
      disabled:opacity-60 disabled:cursor-not-allowed
      bg-[linear-gradient(135deg,var(--accent),var(--accent-2))]
      text-black
      shadow-[0_0_0_1px_rgba(255,255,255,.12),0_12px_24px_rgba(0,0,0,0.55),0_0_25px_var(--accent)]
      hover:shadow-[0_0_0_1px_rgba(255,255,255,.12),0_16px_36px_rgba(0,0,0,0.6),0_0_40px_var(--accent)]
      ${className}`}
  >
    {children}
  </button>
);

export const Input = (props) => (
  <input
    {...props}
    className={`w-full px-4 py-3 rounded-xl bg-[#0C0D12] text-[var(--text-primary)] placeholder-[#7A7C8E]
      border border-[var(--border)] outline-none transition-all
      focus:ring-2 focus:ring-[var(--accent)]/70 focus:border-transparent
      hover:border-[var(--accent)]/30 ${props.className || ''}`}
  />
);

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
  return (
    <Surface className="p-5 sm:p-6 flex-1">
      <div className="text-center mb-4 sm:mb-6">
        <div
          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full mx-auto mb-3 flex items-center justify-center border border-[var(--border)]
            ${isCurrentUser ? 'shadow-[0_0_20px_var(--accent)]' : 'shadow-[0_0_20px_var(--accent-2)]'}`}
          style={{
            background: isCurrentUser
              ? 'linear-gradient(135deg, rgba(0,209,255,.18), rgba(155,92,255,.06))'
              : 'linear-gradient(135deg, rgba(155,92,255,.18), rgba(0,209,255,.06))',
          }}
        >
          <User size={22} className="opacity-90" />
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-[var(--text-primary)]">{user.name}</h3>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-1">@{user.id}</p>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)]">Total Points: <span className="text-[var(--accent)] font-semibold">{user.totalPoints}</span></p>
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
          const rowAccent = accents[accentKeys[idx % accentKeys.length]];
          return (
            <div key={metric.key} className="flex items-center justify-between">
              <div className="flex items-center min-w-0">
                <Icon size={16} className="mr-2 opacity-80" />
                <span className="text-xs sm:text-sm text-[var(--text-primary)] truncate">{metric.label}</span>
              </div>
              <div className="flex items-center ml-2">
                <span
                  className={`font-semibold mr-2 text-sm sm:text-base ${
                    otherUserData && currentUserData && !isEqual
                      ? (isHigher ? 'text-[#2AF59A]' : 'text-[#FF6B6B]')
                      : 'text-[var(--text-primary)]'
                  }`}
                >
                  {typeof value === 'string' ? value : a}
                </span>
                {otherUserData && currentUserData && !isEqual && (
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: isHigher ? '#2AF59A' : '#FF6B6B', boxShadow: `0 0 10px ${isHigher ? '#2AF59A' : '#FF6B6B'}` }}
                  />
                )}
                {/* tiny neon underline on hover */}
                <div className="ml-2 h-px w-6 opacity-30" style={{ background: rowAccent }} />
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
    const root = document.documentElement;
    root.style.setProperty('--bg', darkMode ? '#020203' : '#f7f7fa');
    root.style.setProperty('--surface', darkMode ? 'rgba(9, 9, 12, 0.85)' : 'rgba(255,255,255,0.95)');
    root.style.setProperty('--text-primary', darkMode ? '#EAEAF2' : '#22223B');
    root.style.setProperty('--text-secondary', darkMode ? '#B5B6C6' : '#6B7280');
    root.style.setProperty('--border', darkMode ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)');
    root.style.setProperty('--accent', primaryAccent);
    root.style.setProperty('--accent-2', secondaryAccent);
    document.body.style.background = darkMode
      ? `radial-gradient(1200px 600px at 10% -10%, ${primaryAccent}10, transparent 40%), radial-gradient(900px 500px at 110% 10%, ${secondaryAccent}10, transparent 30%), var(--bg)`
      : `radial-gradient(1200px 600px at 10% -10%, ${primaryAccent}10, transparent 40%), radial-gradient(900px 500px at 110% 10%, ${secondaryAccent}10, transparent 30%), var(--bg)`;
    document.body.style.color = 'var(--text-primary)';
  }, [darkMode, primaryAccent, secondaryAccent]);

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
      const response = await fetch(`http://127.0.0.1:5000/senduserinfo?userid=${userId}`);
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
      posts: 0, totalPoints: 0,
    };

    const userData = data.user_data || {};
    const postData = userData.post_to_no || {};
    const name = formatUserIdToName(userId);

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

    const cgpa = data.cgpa || 'N.M.';
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
  ];

  return (
    <div className="space-y-6 mt-20 font-[Inter,Roboto,system-ui,sans-serif]">
      <div className="max-w-6xl mx-auto space-y-6 px-4">
        {/* Search Section */}
        <Surface className="p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-[var(--text-primary)] mb-4 tracking-tight">Compare with Peer</h2>
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
                className="bg-white/5"
            
              />
            </div>
            <FluoroButton onClick={handleSearch} disabled={loading || !currentUserData} aria-label="Compare">
              <Search size={16} className="mr-2" />
              {loading ? 'Searching…' : 'Compare'}
            </FluoroButton>
          </div>
          {error && <div className="mt-3 text-[#FF6B6B] text-sm">{error}</div>}
        </Surface>

        {/* Loading State */}
        {!currentUserData && (
          <Surface className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/80 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Loading your profile…</h3>
            <p className="text-[var(--text-secondary)]">Please wait while we fetch your data</p>
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
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Comparison Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center rounded-xl p-4 border border-[var(--border)] ">
                  <div className="text-2xl font-bold mb-1" style={{ color: accents.green }}>
                    {metrics.filter((m) => num(currentUserData[m.key]) > num(otherUserData[m.key])).length}
                  </div>
                  <div className="text-sm text-[var(--text-secondary)]">Areas you lead</div>
                </div>
                <div className="text-center rounded-xl p-4 border border-[var(--border)] ">
                  <div className="text-2xl font-bold mb-1" style={{ color: accents.cyan }}>
                    {metrics.filter((m) => num(currentUserData[m.key]) === num(otherUserData[m.key])).length}
                  </div>
                  <div className="text-sm text-[var(--text-secondary)]">Equal performance</div>
                </div>
                <div className="text-center rounded-xl p-4 border border-[var(--border)]">
                  <div className="text-2xl font-bold mb-1" style={{ color: '#FF6B6B' }}>
                    {metrics.filter((m) => num(currentUserData[m.key]) < num(otherUserData[m.key])).length}
                  </div>
                  <div className="text-sm text-[var(--text-secondary)]">Areas to improve</div>
                </div>
              </div>

              {/* Detailed Insights */}
              <div className="mt-6 pt-6 border-t border-[var(--border)]">
                <h4 className="text-md font-semibold text-[var(--text-primary)] mb-3">Key Insights</h4>
                <div className="space-y-2 text-sm text-[var(--text-secondary)]">
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
            <User size={48} className="opacity-80 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Ready to Compare</h3>
            <p className="text-[var(--text-secondary)]">Enter a LinkedIn user ID above to start comparing your professional progress</p>
            <div className="mt-4 text-sm text-[var(--text-secondary)]">
              <p>Your current stats:</p>
              <p>
                Total Points: <span className="font-semibold" style={{ color: 'var(--accent)' }}>{currentUserData.totalPoints}</span>
              </p>
            </div>
          </Surface>
        ) : null}
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
