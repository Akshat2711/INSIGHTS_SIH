
import React, { useState, useEffect } from 'react';
import { User, Linkedin, RefreshCw, Settings, Shield, Database, BarChart3, LogOut, Edit3, Github, FileText, Check, X } from 'lucide-react';
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";
import Particles from '../components/Particles';
import { API_BASE_URL } from '../utils/apiConfig';

export default function SettingsPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [message, setMessage] = useState(null);
  const [activeSection, setActiveSection] = useState('data');
  const linkedinId = localStorage.getItem("linkedin_id") || "punit173";
  const user_name = localStorage.getItem("insight_username") || "error_user";
  const user_email = localStorage.getItem("insight_email") || "error@gmail.com";

  const [githubId, setGithubId] = useState(localStorage.getItem("github_id") || "");
  const [isRefreshingGithub, setIsRefreshingGithub] = useState(false);

  const [resumeFile, setResumeFile] = useState(null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("insight_theme") === "dark"
  );

  const [userData] = useState({
    name: user_name,
    email: user_email,
    linkedinId: linkedinId,
  });

  // Check if services have data
  const hasLinkedInData = linkedinId ? true : false;
  const hasGithubData = !!JSON.parse(localStorage.getItem("insight_user_info") || '{}')?.user_data?.github_data;
  const hasResumeData = !!JSON.parse(localStorage.getItem("insight_user_info") || '{}')?.user_data?.resume_data;


  // Toggle dark mode function
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("insight_theme", newDarkMode ? "dark" : "light");
    // Update the body background color
    document.body.style.backgroundColor = newDarkMode ? "rgb(0, 0, 0)" : "rgb(255, 255, 255)";
  };

  // Theme detection and update function
  const updateTheme = () => {
    document.body.style.backgroundColor = darkMode ? "rgb(0, 0, 0)" : "rgb(255, 255, 255)";
  };

  // Listen for theme changes
  useEffect(() => {
    updateTheme();
  }, [darkMode]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("insight_email");
      localStorage.removeItem("insight_username");
      localStorage.removeItem("insight_user_info");
      localStorage.removeItem("linkedin_id");
      localStorage.removeItem("github_id");
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    setMessage(null);

    try {
      const res = await fetch(
        `https://ba7b80716e18.ngrok-free.app/scrapdata?userid=${encodeURIComponent(userData.linkedinId)}`,
        { method: "POST" }
      );
      const data = await res.json();

      let userInfo;
      if (data.success) {
        try {
          const response = await fetch(`https://ba7b80716e18.ngrok-free.app/senduserinfo?userid=${linkedinId}`);
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          userInfo = await response.json();
        } catch (err) {
          console.error("Error fetching user info(try to login again :( ):", err);
        }

        if (userInfo && typeof userInfo === "object") {
          localStorage.setItem("insight_user_info", JSON.stringify(userInfo));
        }
        setMessage({ type: 'success', text: data.message || 'Data refreshed successfully!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Something went wrong' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setIsRefreshing(false);
    }
  };

  // github endpoint handler
  const handleRefreshGithubData = async () => {
    if (!githubId.trim()) {
      setMessage({ type: 'error', text: 'Please enter a GitHub username' });
      return;
    }

    setIsRefreshingGithub(true);
    setMessage(null);

    try {
      const res = await fetch(
        `${API_BASE_URL}/refresh-github-data?github_id=${encodeURIComponent(githubId)}&userid=${encodeURIComponent(linkedinId)}`,
        { method: "POST" }
      );
      const data = await res.json();

      if (data.success) {
        localStorage.setItem("github_id", githubId);
        setMessage({ type: 'success', text: 'GitHub data refreshed successfully!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to refresh GitHub data' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setIsRefreshingGithub(false);
    }
  };

  // to handle resume submission
  const handleResumeUpload = async () => {
    if (!resumeFile) {
      setMessage({ type: 'error', text: 'Please select a PDF file' });
      return;
    }

    setIsUploadingResume(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      formData.append('userid', linkedinId);

      const res = await fetch(
        `${API_BASE_URL}/upload-resume`,
        { 
          method: "POST",
          body: formData
        }
      );
      const data = await res.json();

      if (data.success) {
        localStorage.setItem("resume_data", JSON.stringify({ uploaded: true, filename: resumeFile.name }));
        setMessage({ type: 'success', text: 'Resume analyzed and saved successfully!' });
        setResumeFile(null);
        // Reset file input
        document.getElementById('resume-upload').value = '';
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to analyze resume' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setIsUploadingResume(false);
    }
  };

  const menuItems = [
    { id: 'data', label: 'Data Management', icon: Database },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const ServiceCard = ({ icon: Icon, title, description, hasData, action, isLoading, color }) => (
    <div className={`relative p-4 sm:p-6 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] ${
      darkMode 
        ? 'bg-gradient-to-br from-white/[0.08] to-white/[0.03] border-white/10 hover:border-white/20' 
        : 'bg-gradient-to-br from-white/80 to-white/60 border-gray-200 hover:border-gray-300'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${color} backdrop-blur-xl`}>
            <Icon size={20} className="text-white" />
          </div>
          <div>
            <h3 className={`font-semibold text-sm sm:text-base ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {title}
            </h3>
            <p className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
              {description}
            </p>
          </div>
        </div>
        <div className={`flex items-center justify-center w-6 h-6 rounded-full ${
          hasData 
            ? 'bg-gradient-to-r from-emerald-500 to-green-500' 
            : 'bg-gradient-to-r from-gray-400 to-gray-500'
        }`}>
          {hasData ? <Check size={14} className="text-white" /> : <X size={14} className="text-white" />}
        </div>
      </div>
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced Particles Background */}
{/*       <div className="fixed inset-0 w-full h-full z-0">
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
      </div> */}
      
      {/* Content Container */}
      <div className="relative z-10 min-h-screen pt-16 pb-12">
        
        {/* Message Display */}
        {message && (
          <div className={`fixed left-1/2 top-[18vh] -translate-x-1/2 p-4 rounded-xl backdrop-blur-xl border transition-all duration-500 w-60 sm:w-72 md:w-80 ${
            message.type === 'success' 
              ? darkMode 
                ? 'bg-gradient-to-r from-emerald-600/20 to-green-600/20 border-emerald-500/30 text-emerald-300'
                : 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200 text-emerald-700'
              : darkMode
                ? 'bg-gradient-to-r from-red-600/20 to-pink-600/20 border-red-500/30 text-red-300'
                : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200 text-red-700'
          }`} style={{zIndex: 1000}}>
            <div className="flex items-center gap-2">
              {message.type === 'success' ? 
                <Check size={16} /> : 
                <X size={16} />
              }
              <span className="text-sm font-medium">{message.text}</span>
              <button 
                onClick={() => setMessage(null)}
                className="ml-2 opacity-70 hover:opacity-100"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Modern Settings Section */}
        <section className="relative py-8 px-4 sm:px-6 lg:px-8 overflow-hidden mt-10">
          {/* Glassmorphism background container */}
          <div className={`absolute inset-2 sm:inset-4 rounded-3xl backdrop-blur-md border shadow-2xl ${
            darkMode 
              ? 'bg-white/[0.03] border-white/10 shadow-purple-900/20' 
              : 'bg-white/[0.05] border-white/20 shadow-purple-900/10'
          }`}></div>

          <div className="relative z-10 max-w-7xl mx-auto">
            
            {/* Header Section */}
            <div className="text-center mb-12 sm:mb-16">
              <div className="inline-flex items-center gap-4 mb-6">
                <div className={`p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-purple-600/30 to-pink-600/30 border border-purple-500/40 backdrop-blur-xl`}>
                  <Settings className="text-purple-300" size={32} />
                </div>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4 bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 bg-clip-text text-transparent">
                Settings
              </h1>
              <p className="text-lg sm:text-xl text-purple-200 max-w-2xl mx-auto">
                Customize your experience and manage your account preferences
              </p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-8 sm:mb-12">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all duration-300 backdrop-blur-xl border text-sm sm:text-base ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-600/40 to-pink-600/40 border-purple-400/60 text-white shadow-lg'
                        : 'bg-white/[0.08] border-white/15 text-purple-200 hover:bg-white/[0.15] hover:border-white/25'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="font-medium hidden sm:inline">{item.label}</span>
                    <span className="font-medium sm:hidden">{item.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              
              {/* Main Content Area */}
              <div className="lg:col-span-2 space-y-6 sm:space-y-8">

              {/* Data Management Section */}
                {activeSection === 'data' && (
                  <div className={`rounded-2xl sm:rounded-3xl p-6 sm:p-8 backdrop-blur-xl border transition-all duration-500 ${
                    darkMode 
                      ? 'bg-gradient-to-br from-white/[0.12] to-white/[0.04] border-white/15' 
                      : 'bg-gradient-to-br from-white/20 to-white/10 border-white/25'
                  }`}>
                    {/* Header */}
                    <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                      <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600">
                        <Database className="text-white" size={20} />
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-white">
                        Data Management
                      </h2>
                    </div>

                    <div className="space-y-4 sm:space-y-6">
                      {/* Services Overview */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        <ServiceCard 
                          icon={Linkedin}
                          title="LinkedIn"
                          description="Professional profile data"
                          hasData={!!hasLinkedInData}
                          color="from-blue-600 to-blue-700"
                        />
                        <ServiceCard 
                          icon={Github}
                          title="GitHub"
                          description="Code repositories & stats"
                          hasData={!!hasGithubData}
                          color="from-gray-700 to-gray-800"
                        />
                        <ServiceCard 
                          icon={FileText}
                          title="Resume"
                          description="CV analysis & insights"
                          hasData={!!hasResumeData}
                          color="from-green-600 to-green-700"
                        />
                      </div>

                      {/* LinkedIn Data Section */}
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                          <button
                            onClick={handleRefreshData}
                            disabled={isRefreshing}
                            className={`flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-medium transition-all duration-300 ${
                              isRefreshing
                                ? "opacity-60 cursor-not-allowed"
                                : "hover:scale-105 active:scale-95"
                            } bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg hover:shadow-blue-500/25`}
                          >
                            <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
                            <span className="text-sm sm:text-base">
                              {isRefreshing ? "Refreshing..." : "Refresh LinkedIn Data"}
                            </span>
                          </button>

             
                        </div>
                      </div>

                      {/* GitHub Data Section */}
                      <div className="p-4 sm:p-6 rounded-xl border backdrop-blur-sm bg-white/[0.08] border-white/15">
                        <div className="flex items-center gap-2 mb-4">
                          <Github size={20} className="text-white" />
                          <h3 className="font-medium text-white">
                            GitHub Integration
                          </h3>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                          <input
                            type="text"
                            placeholder="Enter GitHub username"
                            value={githubId}
                            onChange={(e) => setGithubId(e.target.value)}
                            className="flex-1 p-3 rounded-xl border backdrop-blur-sm bg-white/[0.1] border-white/20 text-white placeholder-purple-200 text-sm sm:text-base"
                          />
                          <button
                            onClick={handleRefreshGithubData}
                            disabled={isRefreshingGithub}
                            className={`flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                              isRefreshingGithub
                                ? "opacity-60 cursor-not-allowed"
                                : "hover:scale-105 active:scale-95"
                            } bg-gradient-to-r from-gray-700 to-gray-800 text-white shadow-lg hover:shadow-gray-500/25`}
                          >
                            <RefreshCw
                              size={18}
                              className={isRefreshingGithub ? "animate-spin" : ""}
                            />
                            <span className="text-sm sm:text-base">
                              {isRefreshingGithub ? "Fetching..." : "Fetch Data"}
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Resume Upload Section */}
                      <div className="p-4 sm:p-6 rounded-xl border backdrop-blur-sm bg-white/[0.08] border-white/15">
                        <div className="flex items-center gap-2 mb-4">
                          <FileText size={20} className="text-white" />
                          <h3 className="font-medium text-white">
                            Resume Analysis
                          </h3>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-end">
                          <div className="flex-1">
                            <input
                              id="resume-upload"
                              type="file"
                              accept=".pdf"
                              onChange={(e) => setResumeFile(e.target.files[0])}
                              className="w-full p-3 rounded-xl border backdrop-blur-sm bg-white/[0.1] border-white/20 text-white text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white file:text-sm file:font-medium"
                            />
                            {resumeFile && (
                              <p className="text-xs mt-2 text-purple-200">
                                Selected: {resumeFile.name}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={handleResumeUpload}
                            disabled={isUploadingResume || !resumeFile}
                            className={`flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                              isUploadingResume || !resumeFile
                                ? "opacity-60 cursor-not-allowed"
                                : "hover:scale-105 active:scale-95"
                            } bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg hover:shadow-green-500/25`}
                          >
                            <RefreshCw
                              size={18}
                              className={isUploadingResume ? "animate-spin" : ""}
                            />
                            <span className="text-sm sm:text-base">
                              {isUploadingResume ? "Analyzing..." : "Upload & Analyze"}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Privacy & Security Section */}
                {activeSection === 'privacy' && (
                  <div className={`rounded-2xl sm:rounded-3xl p-6 sm:p-8 backdrop-blur-xl border transition-all duration-500 ${
                    darkMode 
                      ? 'bg-gradient-to-br from-white/[0.12] to-white/[0.04] border-white/15' 
                      : 'bg-gradient-to-br from-white/20 to-white/10 border-white/25'
                  }`}>
                    <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                      <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-red-600 to-orange-600">
                        <Shield className="text-white" size={20} />
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-white">
                        Privacy & Security
                      </h2>
                    </div>
                    
                    <div className="space-y-4 sm:space-y-6">
                      <div className="p-4 sm:p-6 rounded-xl border backdrop-blur-sm bg-white/[0.08] border-white/15">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-white mb-1">
                              Dark Mode
                            </h3>
                            <p className="text-sm text-purple-200">
                              Enable dark theme for better viewing in low light
                            </p>
                          </div>
                          <button
                            onClick={toggleDarkMode}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                              darkMode ? 'bg-purple-600' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                darkMode ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                      
                      <div className="p-4 sm:p-6 rounded-xl border backdrop-blur-sm bg-white/[0.08] border-white/15">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div>
                            <h3 className="font-medium text-white mb-1">
                              Two-Factor Authentication
                            </h3>
                            <p className="text-sm text-purple-200">
                              Add an extra layer of security to your account
                            </p>
                          </div>
                          <div className="px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                            Disabled
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 sm:p-6 rounded-xl border backdrop-blur-sm bg-white/[0.08] border-white/15">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div>
                            <h3 className="font-medium text-white mb-1">
                              Login Notifications
                            </h3>
                            <p className="text-sm text-purple-200">
                              Get notified when your account is accessed
                            </p>
                          </div>
                          <div className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                            Enabled
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* analytics Section */}
                {activeSection === 'analytics' && (
                  <div className={`rounded-2xl sm:rounded-3xl p-6 sm:p-8 backdrop-blur-xl border transition-all duration-500 ${
                    darkMode 
                      ? 'bg-gradient-to-br from-white/[0.12] to-white/[0.04] border-white/15' 
                      : 'bg-gradient-to-br from-white/20 to-white/10 border-white/25'
                  }`}>
                    <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                      <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-600">
                        <BarChart3 className="text-white" size={20} />
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-white">
                        Account Analytics
                      </h2>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                      {[
                        { label: 'Profile Views', value: '0', color: 'from-purple-500 to-purple-600', icon: User },
                        { label: 'Data Refreshes', value: '0', color: 'from-blue-500 to-blue-600', icon: RefreshCw },
                        { label: 'Comparisons Made', value: '0', color: 'from-green-500 to-green-600', icon: BarChart3 },
                        { label: 'Days Active', value: '0', color: 'from-orange-500 to-orange-600', icon: Settings }
                      ].map((stat, index) => {
                        const StatIcon = stat.icon;
                        return (
                          <div key={index} className="p-4 sm:p-6 rounded-xl border text-center backdrop-blur-sm bg-white/[0.08] border-white/15">
                            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r ${stat.color} mb-3`}>
                              <StatIcon size={18} className="text-white" />
                            </div>
                            <div className="text-2xl sm:text-3xl font-black mb-2 text-white">
                              {stat.value}
                            </div>
                            <div className="text-xs sm:text-sm text-purple-200">
                              {stat.label}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                
                {/* Quick Stats Card */}
                <div className={`rounded-2xl sm:rounded-3xl p-6 backdrop-blur-xl border ${
                  darkMode 
                    ? 'bg-gradient-to-br from-white/[0.12] to-white/[0.04] border-white/15' 
                    : 'bg-gradient-to-br from-white/20 to-white/10 border-white/25'
                }`}>
                  <h3 className="text-lg font-bold mb-4 text-white">
                    Data Status
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Linkedin size={16} className="text-blue-400" />
                        <span className="text-sm text-purple-200">LinkedIn</span>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${hasLinkedInData ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Github size={16} className="text-gray-400" />
                        <span className="text-sm text-purple-200">GitHub</span>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${hasGithubData ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-green-400" />
                        <span className="text-sm text-purple-200">Resume</span>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${hasResumeData ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                    </div>
                  </div>
                </div>

                {/* Profile Card */}
                <div className={`rounded-2xl sm:rounded-3xl p-6 backdrop-blur-xl border ${
                  darkMode 
                    ? 'bg-gradient-to-br from-white/[0.12] to-white/[0.04] border-white/15' 
                    : 'bg-gradient-to-br from-white/20 to-white/10 border-white/25'
                }`}>
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <User size={24} className="text-white" />
                    </div>
                    <h3 className="font-bold text-white mb-1">
                      {userData.name}
                    </h3>
                    <p className="text-sm text-purple-200">
                      {userData.email}
                    </p>
                  </div>
                  <div className="border-t border-white/10 pt-4">
                    <div className="flex items-center justify-center gap-2 text-xs text-purple-200">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span>Online</span>
                    </div>
                  </div>
                </div>
                
                {/* Logout Card */}
                <div className={`rounded-2xl sm:rounded-3xl p-6 backdrop-blur-xl border ${
                  darkMode 
                    ? 'bg-gradient-to-br from-white/[0.12] to-white/[0.04] border-white/15' 
                    : 'bg-gradient-to-br from-white/20 to-white/10 border-white/25'
                }`}>
                  <h3 className="text-lg font-bold mb-4 text-white">
                    Account Actions
                  </h3>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-3 p-4 rounded-xl font-medium transition-all duration-300 hover:scale-105 active:scale-95 bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg hover:shadow-red-500/25"
                  >
                    <LogOut size={20} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )}