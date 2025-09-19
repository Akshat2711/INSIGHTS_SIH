import React, { useState, useEffect } from 'react';
import { User, Award, Code, Briefcase, Github, Mail, FileText, ExternalLink, Trophy, Calendar, MessageCircle, Heart, Star, MapPin, Linkedin, Sun, Moon, Zap, Target, Crown, Book, GitBranch, Users, Eye, Download } from 'lucide-react';
import Particles from '../components/Particles';
import ChatBot from '../components/Chatbot';

const SearchPageResults = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode] = useState(true);
  const params = new URLSearchParams(window.location.search);
  const userid = params.get("userid"); // e.g. ?userid=arnab-dt

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const userid = params.get("userid"); // e.g. ?userid=arnab-dt

        if (!userid) {
          throw new Error("No userid found in URL");
        }

        const response = await fetch(`http://127.0.0.1:8080/senduserinfo?userid=${userid}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        setUserData(data.user_data);
      } catch (err) {
        console.error('Error fetching data:', err);
        alert("some error fetching plz check later")
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Remove old floating particles background effect
  const FloatingParticles = () => null;

  const StatCard = ({ icon: Icon, title, value, color, subtitle }) => (
    <div className={`${
      isDarkMode 
        ? 'bg-gradient-to-br from-white/5 via-white/[0.02] to-white/5 border-white/10 hover:border-purple-400/50 hover:shadow-purple-500/30' 
        : 'bg-gradient-to-br from-white/80 via-white/40 to-white/80 border-white/20 hover:border-purple-500/50 hover:shadow-purple-500/30'
    } border rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 group transform hover:-translate-y-2 backdrop-blur-xl`}>
      <div className="flex items-center justify-between mb-6">
        <div className={`p-4 rounded-2xl bg-gradient-to-br ${color} group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
          <Icon className="w-8 h-8 text-white drop-shadow-sm" />
        </div>
        <div className={`text-right`}>
          <div className={`text-4xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'} tracking-tight`}>{value}</div>
          {subtitle && <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mt-1`}>{subtitle}</div>}
        </div>
      </div>
      <h3 className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-bold text-lg tracking-wide`}>{title}</h3>
    </div>
  );

  const AchievementCard = ({ category, items, icon: Icon, color }) => (
    <div className={`${
      isDarkMode 
        ? 'bg-gradient-to-br from-white/5 via-white/[0.02] to-white/5 border-white/10 hover:border-purple-400/50' 
        : 'bg-gradient-to-br from-white/80 via-white/40 to-white/80 border-white/20 hover:border-purple-500/50'
    } border rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 backdrop-blur-xl`}>
      <div className="flex items-center gap-4 mb-8">
        <div className={`p-3 rounded-2xl bg-gradient-to-br ${color} shadow-lg`}>
          <Icon className="w-6 h-6 text-white drop-shadow-sm" />
        </div>
        <h3 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'} capitalize tracking-tight`}>{category}</h3>
        <div className="ml-auto px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm font-bold rounded-full shadow-lg">
          {items.reduce((total, item) => total + parseInt(item.points), 0)} pts
        </div>
      </div>
      
      <div className="space-y-6">
        {items.map((item, index) => (
          <div key={index} className={`border-l-4 ${isDarkMode ? 'border-purple-400' : 'border-purple-500'} pl-6 py-3 hover:border-purple-500 transition-colors relative`}>
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2 w-4 h-4 bg-purple-400 rounded-full shadow-lg"></div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-3 py-1 bg-gradient-to-r from-indigo-400 to-purple-400 text-white text-sm font-bold rounded-full shadow-lg">+{item.points} points</span>
              <div className={`flex items-center gap-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm font-medium`}>
                <span className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  {item.reaction}
                </span>
                <span className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  {item.comments}
                </span>
              </div>
            </div>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} text-sm mb-2 font-medium leading-relaxed`}>{item.source_post_excerpt?.[0] || item.why}</p>
            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} font-semibold uppercase tracking-wider`}>{item.type || item.position}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const PostCard = ({ post }) => (
    <div className={`${
      isDarkMode 
        ? 'bg-gradient-to-br from-white/5 via-white/[0.02] to-white/5 border-white/10 hover:border-indigo-400/50' 
        : 'bg-gradient-to-br from-white/80 via-white/40 to-white/80 border-white/20 hover:border-indigo-500/50'
    } border rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 backdrop-blur-xl`}>
      <div className="flex items-center gap-6 mb-6">
        <div className="relative">
          <img 
            src={post.author_avatar} 
            alt="Profile" 
            className="w-16 h-16 rounded-full border-4 border-gradient-to-r from-cyan-400 to-purple-500 shadow-lg"
          />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-3 border-white rounded-full shadow-lg"></div>
        </div>
        <div className="flex-1">
          <h4 className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-black text-lg tracking-tight`}>{userid}</h4>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm font-semibold mt-1`}>{post.timestamp}</p>
        </div>
      </div>
      
      <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-6 line-clamp-3 font-medium leading-relaxed text-sm`}>{post.text}</p>
      
      {post.images && post.images.length > 0 && (
        <div className="mb-6">
          <img 
            src={post.images[0]} 
            alt="Post content" 
            className="w-full h-56 object-cover rounded-2xl shadow-lg border-2 border-gray-200"
          />
        </div>
      )}
      
      <div className={`flex items-center justify-between ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm font-semibold`}>
        <span className="flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-indigo-500/20">
          <Heart className="w-4 h-4" />
          {post.reactions}
        </span>
        <span className="flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-indigo-500/20 to-blue-500/20">
          <MessageCircle className="w-4 h-4" />
          {post.comments}
        </span>
      </div>
    </div>
  );

  const RepositoryCard = ({ repo }) => (
    <div className={`${
      isDarkMode 
        ? 'bg-gradient-to-br from-white/5 via-white/[0.02] to-white/5 border-white/10 hover:border-green-400/50' 
        : 'bg-gradient-to-br from-white/80 via-white/40 to-white/80 border-white/20 hover:border-green-500/50'
    } border rounded-3xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 backdrop-blur-xl`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg">
            <Github className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-black text-lg tracking-tight`}>{repo.name}</h4>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm font-medium`}>{repo.language || 'No language'}</p>
          </div>
        </div>
        <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
          <ExternalLink className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
        </a>
      </div>
      
      <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4 text-sm font-medium leading-relaxed`}>
        {repo.description || 'No description available'}
      </p>
      
      <div className={`flex items-center justify-between ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm font-semibold`}>
        <span className="flex items-center gap-2">
          <Star className="w-4 h-4" />
          {repo.stargazers_count}
        </span>
        <span className="flex items-center gap-2">
          <GitBranch className="w-4 h-4" />
          {repo.forks_count}
        </span>
        <span className="flex items-center gap-2">
          <Eye className="w-4 h-4" />
          {repo.watchers_count}
        </span>
      </div>
    </div>
  );

  const ResumeSection = ({ resumeData }) => {
    if (!resumeData || !resumeData.data) return null;
    
    const { data } = resumeData;
    
    return (
      <div className={`${
        isDarkMode 
          ? 'bg-gradient-to-br from-white/5 via-white/[0.02] to-white/5 border-white/10' 
          : 'bg-gradient-to-br from-white/80 via-white/40 to-white/80 border-white/20'
      } border rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 backdrop-blur-xl`}>
        
        {/* Skills Section */}
        {data.skills && data.skills.length > 0 && (
          <div className="mb-8">
            <h4 className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-black text-xl mb-4 flex items-center gap-3`}>
              <Code className="w-5 h-5" />
              Skills
            </h4>
            <div className="flex flex-wrap gap-2">
              {data.skills.slice(0, 15).map((skill, index) => (
                <span key={index} className="px-3 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-bold rounded-full shadow-lg">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Education Section */}
        {data.education && data.education.length > 0 && (
          <div className="mb-8">
            <h4 className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-black text-xl mb-4 flex items-center gap-3`}>
              <Book className="w-5 h-5" />
              Education
            </h4>
            <div className="space-y-4">
              {data.education.map((edu, index) => (
                <div key={index} className={`border-l-4 ${isDarkMode ? 'border-blue-400' : 'border-blue-500'} pl-4 py-2`}>
                  <h5 className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-bold text-lg`}>{edu.degree || edu.qualification}</h5>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-semibold`}>{edu.institution || edu.school}</p>
                  {edu.year && <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>{edu.year}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Experience Section */}
        {data.experience && data.experience.length > 0 && (
          <div className="mb-8">
            <h4 className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-black text-xl mb-4 flex items-center gap-3`}>
              <Briefcase className="w-5 h-5" />
              Experience
            </h4>
            <div className="space-y-4">
              {data.experience.map((exp, index) => (
                <div key={index} className={`border-l-4 ${isDarkMode ? 'border-purple-400' : 'border-purple-500'} pl-4 py-2`}>
                  <h5 className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-bold text-lg`}>{exp.position || exp.title}</h5>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-semibold`}>{exp.company || exp.organization}</p>
                  {exp.duration && <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>{exp.duration}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Projects Section */}
        {data.projects && data.projects.length > 0 && (
          <div>
            <h4 className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-black text-xl mb-4 flex items-center gap-3`}>
              <Trophy className="w-5 h-5" />
              Projects
            </h4>
            <div className="space-y-4">
              {data.projects.slice(0, 3).map((project, index) => (
                <div key={index} className={`border-l-4 ${isDarkMode ? 'border-green-400' : 'border-green-500'} pl-4 py-2`}>
                  <h5 className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-bold text-lg`}>{project.name || project.title}</h5>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-medium text-sm leading-relaxed`}>
                    {project.description || project.summary}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
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
        
        <div className="flex items-center justify-center min-h-screen relative z-10">
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-8">
              <div className="absolute inset-0 rounded-full border-4 border-purple-200/30"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 animate-spin"></div>
            </div>
            <p className="text-gray-300 font-bold text-xl">Loading user profile...</p>
          </div>
        </div>
      </div>
    );
  }

  const totalHackathons = userData?.post_to_no?.hackathon?.length || 0;
  const totalProjects = userData?.post_to_no?.project?.length || 0;
  const totalLeadership = userData?.post_to_no?.leadership?.length || 0;
  const totalPoints = userData?.total_points || 0;
  console.log(userData);
  return (
    <div className="min-h-screen font-['Inter'] relative overflow-hidden bg-black">

      <ChatBot user_data={userData} theme_card_color="blue" />

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
      <div className="relative z-10">

        <div className="max-w-7xl mx-auto px-6 py-12 pt-32">
        {/* Profile Section */}
        <div className="mb-16">
          <div className={`${
            isDarkMode 
              ? 'bg-gradient-to-br from-white/5 via-white/[0.02] to-white/5 border-white/10' 
              : 'bg-gradient-to-br from-white/80 via-white/40 to-white/80 border-white/20'
          } border rounded-3xl p-10 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 backdrop-blur-xl`}>
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
                <img 
                  src="https://cdnb.artstation.com/p/assets/images/images/023/541/587/original/janaeither-t-profile-gif.gif?1579549292?w=120&h=120&fit=crop&crop=face" 
                  alt="Profile" 
                  className="w-36 h-36 rounded-full border-4 border-white shadow-2xl relative z-10"
                />
                <div className="absolute -bottom-2 -right-2 p-2 bg-green-500 rounded-full border-4 border-white shadow-lg z-10">
                  <div className="w-5 h-5 bg-green-400 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                  <h2 className={`text-5xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'} tracking-tight`}>{userid}</h2>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-sm">
                    <Crown className="w-4 h-4" />
                    Top Performer
                  </div>
                </div>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-8 font-semibold text-xl tracking-wide`}>Student at SRM University • Full Stack Developer</p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                  <button className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white rounded-2xl transition-all duration-300 font-bold shadow-lg hover:shadow-2xl hover:scale-105">
                    <Linkedin className="w-5 h-5" />
                    Connect on LinkedIn
                  </button>
                  <button className={`flex items-center gap-3 px-6 py-3 ${
                    isDarkMode 
                      ? 'bg-gray-700/70 hover:bg-gray-600 text-white' 
                      : 'bg-gray-200/70 hover:bg-gray-300 text-gray-800'
                  } rounded-2xl transition-all duration-300 font-bold shadow-lg hover:shadow-2xl hover:scale-105 backdrop-blur-sm`}>
                    <Github className="w-5 h-5" />
                    GitHub (Mock)
                  </button>
                  <button className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-2xl transition-all duration-300 font-bold shadow-lg hover:shadow-2xl hover:scale-105">
                    <FileText className="w-5 h-5" />
                    Resume
                  </button>
                  <button className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white rounded-2xl transition-all duration-300 font-bold shadow-lg hover:shadow-2xl hover:scale-105">
                    <Mail className="w-5 h-5" />
                    Contact
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <StatCard 
            icon={Trophy} 
            title="Total Points" 
            value={totalPoints} 
            color="from-yellow-400 via-orange-500 to-red-500"
            subtitle="Achievement Score"
          />
          <StatCard 
            icon={Code} 
            title="Hackathons" 
            value={totalHackathons} 
            color="from-purple-500 to-indigo-500"
            subtitle="Participated"
          />
          <StatCard 
            icon={Award} 
            title="Projects" 
            value={totalProjects} 
            color="from-indigo-500 to-blue-500"
            subtitle="Completed"
          />
          <StatCard 
            icon={Briefcase} 
            title="Leadership Roles" 
            value={totalLeadership} 
            color="from-blue-500 to-purple-500"
            subtitle="Positions"
          />
        </div>

        {/* Points Breakdown */}
        <div className="mb-16">
          <h3 className={`text-4xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-10 flex items-center gap-4 tracking-tight`}>
            <div className="p-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl shadow-lg">
              <Star className="w-8 h-8 text-white" />
            </div>
            Points Breakdown
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
          <div className="mb-16">
            <h3 className={`text-4xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-10 flex items-center gap-4 tracking-tight`}>
              <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                <Github className="w-8 h-8 text-white" />
              </div>
              GitHub Repositories
              <div className="ml-auto px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold rounded-full shadow-lg">
                {userData.github_data.repositories.length} repos
              </div>
            </h3>
            
            {/* GitHub Profile Stats */}
            {userData.github_data.profile && (
              <div className={`${
                isDarkMode 
                  ? 'bg-gradient-to-br from-white/5 via-white/[0.02] to-white/5 border-white/10' 
                  : 'bg-gradient-to-br from-white/80 via-white/40 to-white/80 border-white/20'
              } border rounded-3xl p-8 mb-8 backdrop-blur-xl`}>
                <div className="flex items-center gap-6 mb-6">
                  <img 
                    src={userData.github_data.profile.avatar_url} 
                    alt="GitHub Avatar" 
                    className="w-20 h-20 rounded-full border-4 border-gradient-to-r from-green-400 to-emerald-500 shadow-lg"
                  />
                  <div className="flex-1">
                    <h4 className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-black text-2xl tracking-tight mb-2`}>
                      @{userData.github_data.github_username}
                    </h4>
                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-medium mb-4`}>
                      {userData.github_data.profile.bio || 'No bio available'}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 rounded-2xl bg-gradient-to-r from-green-500/20 to-emerald-500/20">
                    <div className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {userData.github_data.profile.public_repos}
                    </div>
                    <div className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Repositories</div>
                  </div>
                  <div className="text-center p-4 rounded-2xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20">
                    <div className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {userData.github_data.profile.followers}
                    </div>
                    <div className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Followers</div>
                  </div>
                  <div className="text-center p-4 rounded-2xl bg-gradient-to-r from-purple-500/20 to-indigo-500/20">
                    <div className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {userData.github_data.profile.following}
                    </div>
                    <div className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Following</div>
                  </div>
                  <div className="text-center p-4 rounded-2xl bg-gradient-to-r from-orange-500/20 to-red-500/20">
                    <div className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {userData.github_data.profile.public_gists}
                    </div>
                    <div className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Gists</div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userData.github_data.repositories.slice(0, 6).map((repo, index) => (
                <RepositoryCard key={index} repo={repo} />
              ))}
            </div>
          </div>
        )}

        {/* Resume Analysis Section */}
        {userData?.resume_data && (
          <div className="mb-16">
            <h3 className={`text-4xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-10 flex items-center gap-4 tracking-tight`}>
              <div className="p-4 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl shadow-lg">
                <FileText className="w-8 h-8 text-white" />
              </div>
              Resume Analysis
              <div className="ml-auto px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-bold rounded-full shadow-lg">
                {userData.resume_data.status}
              </div>
            </h3>
            <ResumeSection resumeData={userData.resume_data} />
          </div>
        )}

        {/* Recent Activity */}
        <div>
          <h3 className={`text-4xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-10 flex items-center gap-4 tracking-tight`}>
            <div className="p-4 bg-gradient-to-r from-indigo-400 to-blue-500 rounded-2xl shadow-lg">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            Recent LinkedIn Activity
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {userData?.original_scrapping?.slice(0, 4).map((post, index) => (
              <PostCard key={index} post={post} />
            ))}
          </div>
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

export default SearchPageResults;