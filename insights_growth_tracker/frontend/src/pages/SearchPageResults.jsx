import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { User, Award, Code, Briefcase, Github, Mail, FileText, ExternalLink, Trophy, Calendar, MessageCircle, Heart, Star, MapPin, Linkedin, Sun, Moon, Zap, Target, Crown, Book, GitBranch, Users, Eye, Download } from 'lucide-react';

// Lazy load heavy components
const Particles = lazy(() => import('../components/Particles'));
const ChatBot = lazy(() => import('../components/Chatbot'));

// Skeleton loading components
const SkeletonCard = () => (
  <div className="animate-pulse">
    <div className="bg-gray-300/20 rounded-3xl p-8 space-y-4">
      <div className="flex items-center justify-between">
        <div className="w-12 h-12 bg-gray-300/30 rounded-2xl"></div>
        <div className="w-16 h-8 bg-gray-300/30 rounded"></div>
      </div>
      <div className="w-3/4 h-4 bg-gray-300/30 rounded"></div>
    </div>
  </div>
);

const SkeletonProfile = () => (
  <div className="animate-pulse">
    <div className="bg-gray-300/20 rounded-3xl p-6 md:p-10">
      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
        <div className="w-24 h-24 md:w-36 md:h-36 bg-gray-300/30 rounded-full"></div>
        <div className="flex-1 space-y-4 text-center md:text-left">
          <div className="w-48 h-8 bg-gray-300/30 rounded mx-auto md:mx-0"></div>
          <div className="w-64 h-4 bg-gray-300/30 rounded mx-auto md:mx-0"></div>
          <div className="flex flex-wrap justify-center md:justify-start gap-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="w-32 h-10 bg-gray-300/30 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const SearchPageResults = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imagesLoaded, setImagesLoaded] = useState({});
  const [isDarkMode] = useState(true);
  
  // Memoize URL params
  const userid = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("userid");
  }, []);

  // Image lazy loading hook
  const useImageLoader = (src) => {
    const [loaded, setLoaded] = useState(false);
    
    useEffect(() => {
      if (!src) return;
      
      const img = new Image();
      img.onload = () => setLoaded(true);
      img.src = src;
    }, [src]);
    
    return loaded;
  };

  // Optimized fetch function with error handling
  const fetchUserData = useCallback(async () => {
    if (!userid) {
      setError("No userid found in URL");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(
        `https://insights-sih-tf-lva.fly.dev/senduserinfo?userid=${userid}`,
        { 
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setUserData(data.user_data);
      setError(null);
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Request timed out. Please try again.');
      } else {
        setError(err.message || 'Failed to fetch user data');
      }
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [userid]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Memoized computed values
  const stats = useMemo(() => ({
    totalHackathons: userData?.post_to_no?.hackathon?.length || 0,
    totalProjects: userData?.post_to_no?.project?.length || 0,
    totalLeadership: userData?.post_to_no?.leadership?.length || 0,
    totalPoints: userData?.total_points || 0,
  }), [userData]);

  // Optimized StatCard component
  const StatCard = React.memo(({ icon: Icon, title, value, color, subtitle }) => (
    <div className={`${
      isDarkMode 
        ? 'bg-gradient-to-br from-white/5 via-white/[0.02] to-white/5 border-white/10 hover:border-purple-400/50 hover:shadow-purple-500/30' 
        : 'bg-gradient-to-br from-white/80 via-white/40 to-white/80 border-white/20 hover:border-purple-500/50 hover:shadow-purple-500/30'
    } border rounded-2xl md:rounded-3xl p-4 md:p-8 hover:shadow-2xl transition-all duration-300 group transform hover:-translate-y-1 md:hover:-translate-y-2 backdrop-blur-xl`}>
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className={`p-2 md:p-4 rounded-xl md:rounded-2xl bg-gradient-to-br ${color} group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
          <Icon className="w-5 h-5 md:w-8 md:h-8 text-white drop-shadow-sm" />
        </div>
        <div className="text-right">
          <div className={`text-2xl md:text-4xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'} tracking-tight`}>{value}</div>
          {subtitle && <div className={`text-xs md:text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mt-1`}>{subtitle}</div>}
        </div>
      </div>
      <h3 className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-bold text-sm md:text-lg tracking-wide`}>{title}</h3>
    </div>
  ));

  // Optimized AchievementCard component
  const AchievementCard = React.memo(({ category, items, icon: Icon, color }) => (
    <div className={`${
      isDarkMode 
        ? 'bg-gradient-to-br from-white/5 via-white/[0.02] to-white/5 border-white/10 hover:border-purple-400/50' 
        : 'bg-gradient-to-br from-white/80 via-white/40 to-white/80 border-white/20 hover:border-purple-500/50'
    } border rounded-2xl md:rounded-3xl p-4 md:p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 md:hover:-translate-y-2 backdrop-blur-xl`}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 md:mb-8">
        <div className="flex items-center gap-3 flex-1">
          <div className={`p-2 md:p-3 rounded-xl md:rounded-2xl bg-gradient-to-br ${color} shadow-lg`}>
            <Icon className="w-4 h-4 md:w-6 md:h-6 text-white drop-shadow-sm" />
          </div>
          <h3 className={`text-xl md:text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'} capitalize tracking-tight`}>{category}</h3>
        </div>
        <div className="px-3 py-1 md:px-4 md:py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs md:text-sm font-bold rounded-full shadow-lg self-start sm:self-auto">
          {items.reduce((total, item) => total + parseInt(item.points), 0)} pts
        </div>
      </div>
      
      <div className="space-y-4 md:space-y-6">
        {items.map((item, index) => (
          <div key={index} className={`border-l-2 md:border-l-4 ${isDarkMode ? 'border-purple-400' : 'border-purple-500'} pl-4 md:pl-6 py-2 md:py-3 hover:border-purple-500 transition-colors relative`}>
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 md:-translate-x-2 w-2 h-2 md:w-4 md:h-4 bg-purple-400 rounded-full shadow-lg"></div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 md:mb-3 gap-2">
              <span className="px-2 py-1 md:px-3 md:py-1 bg-gradient-to-r from-indigo-400 to-purple-400 text-white text-xs md:text-sm font-bold rounded-full shadow-lg self-start">+{item.points} points</span>
              <div className={`flex items-center gap-2 md:gap-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-xs md:text-sm font-medium`}>
                <span className="flex items-center gap-1 md:gap-2">
                  <Heart className="w-3 h-3 md:w-4 md:h-4" />
                  {item.reaction}
                </span>
                <span className="flex items-center gap-1 md:gap-2">
                  <MessageCircle className="w-3 h-3 md:w-4 md:h-4" />
                  {item.comments}
                </span>
              </div>
            </div>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} text-xs md:text-sm mb-2 font-medium leading-relaxed`}>
              {item.source_post_excerpt?.[0] || item.why}
            </p>
            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} font-semibold uppercase tracking-wider`}>
              {item.type || item.position}
            </div>
          </div>
        ))}
      </div>
    </div>
  ));

  // Optimized PostCard component with lazy image loading
  const PostCard = React.memo(({ post }) => {
    const imageLoaded = useImageLoader(post.author_avatar);
    
    return (
      <div className={`${
        isDarkMode 
          ? 'bg-gradient-to-br from-white/5 via-white/[0.02] to-white/5 border-white/10 hover:border-indigo-400/50' 
          : 'bg-gradient-to-br from-white/80 via-white/40 to-white/80 border-white/20 hover:border-indigo-500/50'
      } border rounded-2xl md:rounded-3xl p-4 md:p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 md:hover:-translate-y-2 backdrop-blur-xl`}>
        <div className="flex items-center gap-3 md:gap-6 mb-4 md:mb-6">
          <div className="relative">
            {imageLoaded ? (
              <img 
                src={post.author_avatar} 
                alt="Profile" 
                className="w-12 h-12 md:w-16 md:h-16 rounded-full border-2 md:border-4 border-gradient-to-r from-cyan-400 to-purple-500 shadow-lg"
                loading="lazy"
              />
            ) : (
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gray-300/30 animate-pulse border-2 md:border-4 border-gray-300/50"></div>
            )}
            <div className="absolute -bottom-0.5 -right-0.5 md:-bottom-1 md:-right-1 w-3 h-3 md:w-5 md:h-5 bg-green-500 border-2 md:border-3 border-white rounded-full shadow-lg"></div>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-black text-sm md:text-lg tracking-tight truncate`}>{userid}</h4>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-xs md:text-sm font-semibold mt-1 truncate`}>{post.timestamp}</p>
          </div>
        </div>
        
        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4 md:mb-6 line-clamp-3 font-medium leading-relaxed text-xs md:text-sm`}>{post.text}</p>
        
        {post.images && post.images.length > 0 && (
          <div className="mb-4 md:mb-6">
            <img 
              src={post.images[0]} 
              alt="Post content" 
              className="w-full h-40 md:h-56 object-cover rounded-xl md:rounded-2xl shadow-lg border border-gray-200"
              loading="lazy"
            />
          </div>
        )}
        
        <div className={`flex items-center justify-between ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-xs md:text-sm font-semibold`}>
          <span className="flex items-center gap-1 md:gap-2 px-2 py-1 md:px-3 md:py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-indigo-500/20">
            <Heart className="w-3 h-3 md:w-4 md:h-4" />
            {post.reactions}
          </span>
          <span className="flex items-center gap-1 md:gap-2 px-2 py-1 md:px-3 md:py-2 rounded-full bg-gradient-to-r from-indigo-500/20 to-blue-500/20">
            <MessageCircle className="w-3 h-3 md:w-4 md:h-4" />
            {post.comments}
          </span>
        </div>
      </div>
    );
  });

  // Optimized RepositoryCard component
  const RepositoryCard = React.memo(({ repo }) => (
    <div className={`${
      isDarkMode 
        ? 'bg-gradient-to-br from-white/5 via-white/[0.02] to-white/5 border-white/10 hover:border-green-400/50' 
        : 'bg-gradient-to-br from-white/80 via-white/40 to-white/80 border-white/20 hover:border-green-500/50'
    } border rounded-2xl md:rounded-3xl p-4 md:p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 md:hover:-translate-y-2 backdrop-blur-xl`}>
      <div className="flex items-start justify-between mb-3 md:mb-4">
        <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
          <div className="p-1.5 md:p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg md:rounded-xl shadow-lg flex-shrink-0">
            <Github className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-black text-sm md:text-lg tracking-tight truncate`}>{repo.name}</h4>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-xs md:text-sm font-medium truncate`}>{repo.language || 'No language'}</p>
          </div>
        </div>
        <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="p-1.5 md:p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0" aria-label="Open repository">
          <ExternalLink className={`w-3 h-3 md:w-4 md:h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
        </a>
      </div>
      
      <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-3 md:mb-4 text-xs md:text-sm font-medium leading-relaxed line-clamp-2`}>
        {repo.description || 'No description available'}
      </p>
      
      <div className={`flex items-center justify-between ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-xs md:text-sm font-semibold`}>
        <span className="flex items-center gap-1">
          <Star className="w-3 h-3 md:w-4 md:h-4" />
          {repo.stargazers_count}
        </span>
        <span className="flex items-center gap-1">
          <GitBranch className="w-3 h-3 md:w-4 md:h-4" />
          {repo.forks_count}
        </span>
        <span className="flex items-center gap-1">
          <Eye className="w-3 h-3 md:w-4 md:h-4" />
          {repo.watchers_count}
        </span>
      </div>
    </div>
  ));

  // Optimized ResumeSection component
  const ResumeSection = React.memo(({ resumeData }) => {
    if (!resumeData?.data) return null;
    
    const { data } = resumeData;
    
    return (
      <div className={`${
        isDarkMode 
          ? 'bg-gradient-to-br from-white/5 via-white/[0.02] to-white/5 border-white/10' 
          : 'bg-gradient-to-br from-white/80 via-white/40 to-white/80 border-white/20'
      } border rounded-2xl md:rounded-3xl p-4 md:p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 md:hover:-translate-y-2 backdrop-blur-xl`}>
        
        {/* Skills Section */}
        {data.skills && data.skills.length > 0 && (
          <div className="mb-6 md:mb-8">
            <h4 className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-black text-lg md:text-xl mb-3 md:mb-4 flex items-center gap-2 md:gap-3`}>
              <Code className="w-4 h-4 md:w-5 md:h-5" />
              Skills
            </h4>
            <div className="flex flex-wrap gap-1.5 md:gap-2">
              {data.skills.slice(0, 15).map((skill, index) => (
                <span key={index} className="px-2 py-1 md:px-3 md:py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs md:text-sm font-bold rounded-full shadow-lg">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Education Section */}
        {data.education && data.education.length > 0 && (
          <div className="mb-6 md:mb-8">
            <h4 className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-black text-lg md:text-xl mb-3 md:mb-4 flex items-center gap-2 md:gap-3`}>
              <Book className="w-4 h-4 md:w-5 md:h-5" />
              Education
            </h4>
            <div className="space-y-3 md:space-y-4">
              {data.education.map((edu, index) => (
                <div key={index} className={`border-l-2 md:border-l-4 ${isDarkMode ? 'border-blue-400' : 'border-blue-500'} pl-3 md:pl-4 py-2`}>
                  <h5 className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-bold text-sm md:text-lg`}>{edu.degree || edu.qualification}</h5>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-semibold text-xs md:text-base`}>{edu.institution || edu.school}</p>
                  {edu.year && <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-xs md:text-sm`}>{edu.year}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Experience Section */}
        {data.experience && data.experience.length > 0 && (
          <div className="mb-6 md:mb-8">
            <h4 className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-black text-lg md:text-xl mb-3 md:mb-4 flex items-center gap-2 md:gap-3`}>
              <Briefcase className="w-4 h-4 md:w-5 md:h-5" />
              Experience
            </h4>
            <div className="space-y-3 md:space-y-4">
              {data.experience.map((exp, index) => (
                <div key={index} className={`border-l-2 md:border-l-4 ${isDarkMode ? 'border-purple-400' : 'border-purple-500'} pl-3 md:pl-4 py-2`}>
                  <h5 className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-bold text-sm md:text-lg`}>{exp.position || exp.title}</h5>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-semibold text-xs md:text-base`}>{exp.company || exp.organization}</p>
                  {exp.duration && <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-xs md:text-sm`}>{exp.duration}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Projects Section */}
        {data.projects && data.projects.length > 0 && (
          <div>
            <h4 className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-black text-lg md:text-xl mb-3 md:mb-4 flex items-center gap-2 md:gap-3`}>
              <Trophy className="w-4 h-4 md:w-5 md:h-5" />
              Projects
            </h4>
            <div className="space-y-3 md:space-y-4">
              {data.projects.slice(0, 3).map((project, index) => (
                <div key={index} className={`border-l-2 md:border-l-4 ${isDarkMode ? 'border-green-400' : 'border-green-500'} pl-3 md:pl-4 py-2`}>
                  <h5 className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-bold text-sm md:text-lg`}>{project.name || project.title}</h5>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-medium text-xs md:text-sm leading-relaxed`}>
                    {project.description || project.summary}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  });

  // Error component
  const ErrorState = () => (
    <div className="min-h-screen font-['Inter'] relative overflow-hidden bg-black flex items-center justify-center">
      <div className="text-center p-8">
        <div className="w-16 h-16 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center">
          <ExternalLink className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">Something went wrong</h2>
        <p className="text-gray-300 mb-6">{error}</p>
        <button 
          onClick={fetchUserData}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-indigo-600 transition-all duration-300"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  // Loading component
  const LoadingState = () => (
    <div className="min-h-screen font-['Inter'] relative overflow-hidden bg-black">
      <div className="max-w-7xl mx-auto px-4 py-12 pt-32">
        {/* Loading Profile */}
        <div className="mb-16">
          <SkeletonProfile />
        </div>
        
        {/* Loading Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mb-16">
          {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
        </div>
        
        <div className="text-center">
          <div className="relative w-12 h-12 md:w-20 md:h-20 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full border-2 md:border-4 border-purple-200/30"></div>
            <div className="absolute inset-0 rounded-full border-2 md:border-4 border-transparent border-t-purple-500 animate-spin"></div>
          </div>
          <p className="text-gray-300 font-bold text-lg md:text-xl">Loading user profile...</p>
        </div>
      </div>
    </div>
  );

  if (error) return <ErrorState />;
  if (loading) return <LoadingState />;

  return (
    <div className="min-h-screen font-['Inter'] relative overflow-hidden bg-black">
      {/* Lazy loaded components with fallbacks */}
      <Suspense fallback={null}>
        <ChatBot user_data={userData} theme_card_color="blue" />
      </Suspense>

      {/* Fixed Particles Background */}
      <div className="fixed inset-0 w-full h-full z-0">
        <Suspense fallback={null}>
          <Particles
            particleColors={['#ffffff', '#ffffff', '#ffffff']}
            particleCount={window.innerWidth < 768 ? 100 : 300} // Reduce particles on mobile
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
        </Suspense>
      </div>
      
      {/* Main Content */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 pt-24 md:pt-32">
        {/* Profile Section */}
        <div className="mb-12 md:mb-16">
          <div className={`${
            isDarkMode 
              ? 'bg-gradient-to-br from-white/5 via-white/[0.02] to-white/5 border-white/10' 
              : 'bg-gradient-to-br from-white/80 via-white/40 to-white/80 border-white/20'
          } border rounded-2xl md:rounded-3xl p-6 md:p-10 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 md:hover:-translate-y-2 backdrop-blur-xl`}>
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
                <img 
                  src="https://cdnb.artstation.com/p/assets/images/images/023/541/587/original/janaeither-t-profile-gif.gif?1579549292?w=120&h=120&fit=crop&crop=face" 
                  alt="Profile" 
                  className="w-24 h-24 md:w-36 md:h-36 rounded-full border-2 md:border-4 border-white shadow-2xl relative z-10"
                  loading="lazy"
                />
                <div className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 p-1 md:p-2 bg-green-500 rounded-full border-2 md:border-4 border-white shadow-lg z-10">
                  <div className="w-3 h-3 md:w-5 md:h-5 bg-green-400 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 mb-3 md:mb-4">
                  <h2 className={`text-3xl md:text-5xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'} tracking-tight`}>{userid}</h2>
                  <div className="flex items-center justify-center gap-2 px-3 py-1 md:px-4 md:py-2 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-xs md:text-sm mx-auto md:mx-0">
                    <Crown className="w-3 h-3 md:w-4 md:h-4" />
                    Top Performer
                  </div>
                </div>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-6 md:mb-8 font-semibold text-lg md:text-xl tracking-wide`}>Student at SRM University • Full Stack Developer</p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-4">
                  <button className="flex items-center gap-2 md:gap-3 px-4 py-2 md:px-6 md:py-3 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white rounded-xl md:rounded-2xl transition-all duration-300 font-bold shadow-lg hover:shadow-2xl hover:scale-105 text-sm md:text-base">
                    <Linkedin className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="hidden sm:inline">Connect on </span>LinkedIn
                  </button>
                  <button className={`flex items-center gap-2 md:gap-3 px-4 py-2 md:px-6 md:py-3 ${
                    isDarkMode 
                      ? 'bg-gray-700/70 hover:bg-gray-600 text-white' 
                      : 'bg-gray-200/70 hover:bg-gray-300 text-gray-800'
                  } rounded-xl md:rounded-2xl transition-all duration-300 font-bold shadow-lg hover:shadow-2xl hover:scale-105 backdrop-blur-sm text-sm md:text-base`}>
                    <Github className="w-4 h-4 md:w-5 md:h-5" />
                    GitHub
                  </button>
                  <button className="flex items-center gap-2 md:gap-3 px-4 py-2 md:px-6 md:py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xl md:rounded-2xl transition-all duration-300 font-bold shadow-lg hover:shadow-2xl hover:scale-105 text-sm md:text-base">
                    <FileText className="w-4 h-4 md:w-5 md:h-5" />
                    Resume
                  </button>
                  <button className="flex items-center gap-2 md:gap-3 px-4 py-2 md:px-6 md:py-3 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white rounded-xl md:rounded-2xl transition-all duration-300 font-bold shadow-lg hover:shadow-2xl hover:scale-105 text-sm md:text-base">
                    <Mail className="w-4 h-4 md:w-5 md:h-5" />
                    Contact
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mb-12 md:mb-16">
          <StatCard 
            icon={Trophy} 
            title="Total Points" 
            value={stats.totalPoints} 
            color="from-yellow-400 via-orange-500 to-red-500"
            subtitle="Achievement Score"
          />
          <StatCard 
            icon={Code} 
            title="Hackathons" 
            value={stats.totalHackathons} 
            color="from-purple-500 to-indigo-500"
            subtitle="Participated"
          />
          <StatCard 
            icon={Award} 
            title="Projects" 
            value={stats.totalProjects} 
            color="from-indigo-500 to-blue-500"
            subtitle="Completed"
          />
          <StatCard 
            icon={Briefcase} 
            title="Leadership Roles" 
            value={stats.totalLeadership} 
            color="from-blue-500 to-purple-500"
            subtitle="Positions"
          />
        </div>

        {/* Points Breakdown */}
        <div className="mb-12 md:mb-16">
          <h3 className={`text-2xl md:text-4xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6 md:mb-10 flex items-center gap-3 md:gap-4 tracking-tight`}>
            <div className="p-3 md:p-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl md:rounded-2xl shadow-lg">
              <Star className="w-5 h-5 md:w-8 md:h-8 text-white" />
            </div>
            Points Breakdown
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {userData?.post_to_no?.project && (
              <AchievementCard 
                category="Projects" 
                items={userData.post_to_no.project} 
                icon={Code}
                color="from-indigo-500 to-blue-500"
              />
            )}
            {userData?.post_to_no?.hackathon && (
              <AchievementCard 
                category="Hackathons" 
                items={userData.post_to_no.hackathon} 
                icon={Trophy}
                color="from-purple-500 to-indigo-500"
              />
            )}
            {userData?.post_to_no?.leadership && (
              <AchievementCard 
                category="Leadership" 
                items={userData.post_to_no.leadership} 
                icon={Briefcase}
                color="from-blue-500 to-purple-500"
              />
            )}
          </div>
        </div>

        {/* GitHub Repositories Section */}
        {userData?.github_data?.repositories && userData.github_data.repositories.length > 0 && (
          <div className="mb-12 md:mb-16">
            <h3 className={`text-2xl md:text-4xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6 md:mb-10 flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4 tracking-tight`}>
              {/* Icon + Title */}
              <div className="flex items-center gap-2 md:gap-4 flex-wrap">
                <div className="p-2 md:p-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl md:rounded-2xl shadow-lg flex-shrink-0">
                  <Github className="w-4 h-4 md:w-8 md:h-8 text-white" />
                </div>
                <span className="text-base md:text-2xl font-black">GitHub Repositories</span>
              </div>

              {/* Repo Count Badge */}
              <div className="px-2 py-1 md:px-4 md:py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs md:text-sm font-bold rounded-full shadow-lg mt-2 sm:mt-0 sm:ml-auto flex-shrink-0 text-center">
                {userData.github_data.repositories.length} repos
              </div>
            </h3>

            
            {/* GitHub Profile Stats */}
            {userData.github_data.profile && (
              <div className={`${
                isDarkMode 
                  ? 'bg-gradient-to-br from-white/5 via-white/[0.02] to-white/5 border-white/10' 
                  : 'bg-gradient-to-br from-white/80 via-white/40 to-white/80 border-white/20'
              } border rounded-2xl md:rounded-3xl p-4 md:p-8 mb-6 md:mb-8 backdrop-blur-xl`}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 md:gap-6 mb-4 md:mb-6">
                  <img 
                    src={userData.github_data.profile.avatar_url} 
                    alt="GitHub Avatar" 
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 md:border-4 border-gradient-to-r from-green-400 to-emerald-500 shadow-lg mx-auto sm:mx-0"
                    loading="lazy"
                  />
                  <div className="flex-1 text-center sm:text-left">
                    <h4 className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-black text-xl md:text-2xl tracking-tight mb-2`}>
                      @{userData.github_data.github_username}
                    </h4>
                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-medium mb-4 text-sm md:text-base`}>
                      {userData.github_data.profile.bio || 'No bio available'}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  <div className="text-center p-3 md:p-4 rounded-xl md:rounded-2xl bg-gradient-to-r from-green-500/20 to-emerald-500/20">
                    <div className={`text-xl md:text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {userData.github_data.profile.public_repos}
                    </div>
                    <div className={`text-xs md:text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Repositories</div>
                  </div>
                  <div className="text-center p-3 md:p-4 rounded-xl md:rounded-2xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20">
                    <div className={`text-xl md:text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {userData.github_data.profile.followers}
                    </div>
                    <div className={`text-xs md:text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Followers</div>
                  </div>
                  <div className="text-center p-3 md:p-4 rounded-xl md:rounded-2xl bg-gradient-to-r from-purple-500/20 to-indigo-500/20">
                    <div className={`text-xl md:text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {userData.github_data.profile.following}
                    </div>
                    <div className={`text-xs md:text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Following</div>
                  </div>
                  <div className="text-center p-3 md:p-4 rounded-xl md:rounded-2xl bg-gradient-to-r from-orange-500/20 to-red-500/20">
                    <div className={`text-xl md:text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {userData.github_data.profile.public_gists}
                    </div>
                    <div className={`text-xs md:text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Gists</div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              {userData.github_data.repositories.slice(0, 6).map((repo, index) => (
                <RepositoryCard key={index} repo={repo} />
              ))}
            </div>
          </div>
        )}

        {/* Resume Analysis Section */}
        {userData?.resume_data && (
          <div className="mb-12 md:mb-16">
            <h3 className={`text-2xl md:text-4xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6 md:mb-10 flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4 tracking-tight`}>
              <div className="flex items-center gap-3 md:gap-4">
                <div className="p-3 md:p-4 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl md:rounded-2xl shadow-lg">
                  <FileText className="w-5 h-5 md:w-8 md:h-8 text-white" />
                </div>
                Resume Analysis
              </div>
              <div className="px-3 py-1 md:px-4 md:py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs md:text-sm font-bold rounded-full shadow-lg self-start sm:ml-auto">
                {userData.resume_data.status}
              </div>
            </h3>
            <ResumeSection resumeData={userData.resume_data} />
          </div>
        )}

        {/* Recent Activity */}
        <div>
          <h3 className={`text-2xl md:text-4xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6 md:mb-10 flex items-center gap-3 md:gap-4 tracking-tight`}>
            <div className="p-3 md:p-4 bg-gradient-to-r from-indigo-400 to-blue-500 rounded-xl md:rounded-2xl shadow-lg">
              <Calendar className="w-5 h-5 md:w-8 md:h-8 text-white" />
            </div>
            Recent LinkedIn Activity
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            {userData?.original_scrapping?.slice(0, 4).map((post, index) => (
              <PostCard key={index} post={post} />
            ))}
          </div>
        </div>
        </div>
      </div>
      
      {/* Accessibility helpers and responsive styles */}
      <style>{`
        :root { 
          color-scheme: dark; 
        }
        .sr-only { 
          position: absolute; 
          width: 1px; 
          height: 1px; 
          padding: 0; 
          margin: -1px; 
          overflow: hidden; 
          clip: rect(0,0,0,0); 
          white-space: nowrap; 
          border: 0; 
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        /* Custom scrollbar for better UX */
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
        
        /* Performance optimizations */
        * {
          box-sizing: border-box;
        }
        
        img {
          max-width: 100%;
          height: auto;
        }
        
        /* Reduce motion for users who prefer it */
        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
        
        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .border {
            border-width: 2px;
          }
        }
        
        /* Dark mode preference */
        @media (prefers-color-scheme: dark) {
          :root {
            color-scheme: dark;
          }
        }
      `}</style>
    </div>
  );
};


export default SearchPageResults;