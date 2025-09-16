import React, { useState, useEffect } from 'react';
import { User, Award, Code, Briefcase, Github, Mail, FileText, ExternalLink, Trophy, Calendar, MessageCircle, Heart, Star, MapPin, Linkedin, Sun, Moon } from 'lucide-react';

const SearchPageResults = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
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


  const StatCard = ({ icon: Icon, title, value, color, subtitle }) => (
    <div className={`${
      isDarkMode 
        ? 'bg-black border-gray-800 hover:border-cyan-400/50 hover:shadow-cyan-400/20' 
        : 'bg-white border-gray-200 hover:border-cyan-500/50 hover:shadow-cyan-500/20'
    } border-2 rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 group transform hover:-translate-y-1`}>
      <div className="flex items-center justify-between mb-6">
        <div className={`p-4 rounded-2xl bg-gradient-to-br ${color} group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
          <Icon className="w-8 h-8 text-white drop-shadow-sm" />
        </div>
        <div className="text-right">
          <div className={`text-4xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'} tracking-tight`}>{value}</div>
          {subtitle && <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>{subtitle}</div>}
        </div>
      </div>
      <h3 className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-bold text-lg tracking-wide`}>{title}</h3>
    </div>
  );

  const AchievementCard = ({ category, items, icon: Icon, color }) => (
    <div className={`${
      isDarkMode 
        ? 'bg-black border-gray-800 hover:border-purple-400/50' 
        : 'bg-white border-gray-200 hover:border-purple-500/50'
    } border-2 rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1`}>
      <div className="flex items-center gap-4 mb-8">
        <div className={`p-3 rounded-2xl bg-gradient-to-br ${color} shadow-lg`}>
          <Icon className="w-6 h-6 text-white drop-shadow-sm" />
        </div>
        <h3 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'} capitalize tracking-tight`}>{category}</h3>
        <div className="ml-auto px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-sm font-bold rounded-full shadow-lg">
          {items.reduce((total, item) => total + parseInt(item.points), 0)} pts
        </div>
      </div>
      
      <div className="space-y-6">
        {items.map((item, index) => (
          <div key={index} className={`border-l-4 ${isDarkMode ? 'border-cyan-400' : 'border-cyan-500'} pl-6 py-3 hover:border-cyan-500 transition-colors relative`}>
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2 w-4 h-4 bg-cyan-400 rounded-full shadow-lg"></div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-3 py-1 bg-gradient-to-r from-emerald-400 to-cyan-400 text-white text-sm font-bold rounded-full shadow-lg">+{item.points} points</span>
              <div className={`flex items-center gap-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm font-medium`}>
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
            <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} font-semibold uppercase tracking-wider`}>{item.type || item.position}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const PostCard = ({ post }) => (
    <div className={`${
      isDarkMode 
        ? 'bg-black border-gray-800 hover:border-green-400/50' 
        : 'bg-white border-gray-200 hover:border-green-500/50'
    } border-2 rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1`}>
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
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm font-semibold mt-1`}>{post.timestamp}</p>
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
      
      <div className={`flex items-center justify-between ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm font-semibold`}>
        <span className="flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-pink-500/20 to-red-500/20">
          <Heart className="w-4 h-4" />
          {post.reactions}
        </span>
        <span className="flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20">
          <MessageCircle className="w-4 h-4" />
          {post.comments}
        </span>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-black text-white' : 'bg-white text-gray-900'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-cyan-200 dark:border-gray-800"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-500 animate-spin"></div>
          </div>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} font-semibold text-lg`}>Loading user profile...</p>
        </div>
      </div>
    );
  }

  const totalHackathons = userData?.post_to_no?.hackathon?.length || 0;
  const totalProjects = userData?.post_to_no?.project?.length || 0;
  const totalLeadership = userData?.post_to_no?.leadership?.length || 0;
  const totalPoints = userData?.total_points || 0;

  return (
    <div className={`min-h-screen duration-500 ${
      isDarkMode 
        ? 'bg-black text-white' 
        : 'bg-white text-gray-900'
    }`}>


      <div className="max-w-7xl mx-auto px-8 py-10 ">
        {/* Profile Section */}
        <div className="mb-12">
          <div className={`${
            isDarkMode 
              ? 'bg-black border-gray-800' 
              : 'bg-white border-gray-200'
          } border-2 rounded-3xl p-10 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 mt-14`}>
            <div className="flex items-center gap-8 mb-8">
              <div className="relative">
                <img 
                  src="https://cdnb.artstation.com/p/assets/images/images/023/541/587/original/janaeither-t-profile-gif.gif?1579549292?w=120&h=120&fit=crop&crop=face" 
                  alt="Profile" 
                  className="w-28 h-28 rounded-full border-4 border-gradient-to-r from-cyan-400 to-purple-500 shadow-2xl"
                />
                <div className="absolute -bottom-2 -right-2 p-1 bg-green-500 rounded-full border-4 border-white shadow-lg">
                  <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="flex-1">
                <h2 className={`text-4xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3 tracking-tight`}>{userid}</h2>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-6 font-semibold text-lg tracking-wide`}>Student at SRM University • Full Stack Developer</p>
                <div className="flex flex-wrap items-center gap-4">
                  <button className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl transition-all duration-300 font-bold shadow-lg hover:shadow-2xl hover:scale-105">
                    <Linkedin className="w-5 h-5" />
                    Connect on LinkedIn
                  </button>
                  <button className={`flex items-center gap-3 px-6 py-3 ${
                    isDarkMode 
                      ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  } rounded-2xl transition-all duration-300 font-bold shadow-lg hover:shadow-2xl hover:scale-105`}>
                    <Github className="w-5 h-5" />
                    GitHub (Mock)
                  </button>
                  <button className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-2xl transition-all duration-300 font-bold shadow-lg hover:shadow-2xl hover:scale-105">
                    <FileText className="w-5 h-5" />
                    Resume
                  </button>
                  <button className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl transition-all duration-300 font-bold shadow-lg hover:shadow-2xl hover:scale-105">
                    <Mail className="w-5 h-5" />
                    Contact
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
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
            color="from-purple-500 via-pink-500 to-red-500"
            subtitle="Participated"
          />
          <StatCard 
            icon={Award} 
            title="Projects" 
            value={totalProjects} 
            color="from-blue-500 via-cyan-500 to-teal-500"
            subtitle="Completed"
          />
          <StatCard 
            icon={Briefcase} 
            title="Leadership Roles" 
            value={totalLeadership} 
            color="from-green-500 via-emerald-500 to-teal-500"
            subtitle="Positions"
          />
        </div>

        {/* Points Breakdown */}
        <div className="mb-12">
          <h3 className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-8 flex items-center gap-4 tracking-tight`}>
            <div className="p-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl shadow-lg">
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
                color="from-blue-500 via-cyan-500 to-teal-500"
              />
            )}
            {userData?.post_to_no?.hackathon && (
              <AchievementCard 
                category="Hackathons" 
                items={userData.post_to_no.hackathon} 
                icon={Trophy}
                color="from-purple-500 via-pink-500 to-red-500"
              />
            )}
            {userData?.post_to_no?.leadership && (
              <AchievementCard 
                category="Leadership" 
                items={userData.post_to_no.leadership} 
                icon={Briefcase}
                color="from-green-500 via-emerald-500 to-teal-500"
              />
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h3 className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-8 flex items-center gap-4 tracking-tight`}>
            <div className="p-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl shadow-lg">
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
  );
};

export default SearchPageResults;
