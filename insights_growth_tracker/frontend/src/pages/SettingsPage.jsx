import React, { useState, useEffect } from 'react';
import { User, Linkedin, RefreshCw, Settings, Shield, Database, BarChart3, LogOut, Edit3 } from 'lucide-react';
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";
import Particles from '../components/Particles';

export default function SettingsPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [message, setMessage] = useState(null);
  const [activeSection, setActiveSection] = useState('profile');
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
        `http://127.0.0.1:8080/scrapdata?userid=${encodeURIComponent(userData.linkedinId)}`,
        { method: "POST" }
      );
      const data = await res.json();

      let userInfo;
      if (data.success) {
        try {
          const response = await fetch(`http://127.0.0.1:8080/senduserinfo?userid=${linkedinId}`);
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          userInfo = await response.json();
        } catch (err) {
          console.error("Error fetching user info:", err);
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




// github ndpoint handler
const handleRefreshGithubData = async () => {
  if (!githubId.trim()) {
    setMessage({ type: 'error', text: 'Please enter a GitHub username' });
    return;
  }

  setIsRefreshingGithub(true);
  setMessage(null);

  try {
    const res = await fetch(
      `http://127.0.0.1:8080/refresh-github-data?github_id=${encodeURIComponent(githubId)}&userid=${encodeURIComponent(linkedinId)}`,  // Add linkedinId
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
      'http://127.0.0.1:8080/upload-resume',
      { 
        method: "POST",
        body: formData
      }
    );
    const data = await res.json();

    if (data.success) {
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
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'data', label: 'Data Management', icon: Database },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Enhanced Particles Background */}
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
      <div className="relative z-10 min-h-screen pt-20 pb-12">
        
        {/* Modern Settings Section */}
        <section className="relative py-16 px-8 overflow-hidden">
          {/* Glassmorphism background container */}
          <div className={`absolute inset-4 rounded-3xl backdrop-blur-md border shadow-2xl ${
            darkMode 
              ? 'bg-white/[0.02] border-white/5 shadow-black/20' 
              : 'bg-black/[0.02] border-black/5 shadow-black/10'
          }`}></div>

          <div className="relative z-10 max-w-7xl mx-auto">
            
            {/* Header Section */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-4 mb-6">
                <div className={`p-4 rounded-2xl ${
                  darkMode 
                    ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30' 
                    : 'bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200'
                } backdrop-blur-xl`}>
                  <Settings className={`${darkMode ? "text-purple-400" : "text-purple-600"}`} size={40} />
                </div>
              </div>
              <h1 className={`text-6xl font-black mb-4 ${
                darkMode 
                  ? 'bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400' 
                  : 'bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600'
              } bg-clip-text text-transparent`}>
                Settings
              </h1>
              <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
                Customize your experience and manage your account preferences
              </p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all duration-300 backdrop-blur-xl border ${
                      isActive
                        ? darkMode
                          ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/30 border-purple-400/50 text-white'
                          : 'bg-gradient-to-r from-purple-100 to-pink-100 border-purple-300 text-purple-700'
                        : darkMode
                          ? 'bg-white/[0.05] border-white/10 text-gray-300 hover:bg-white/[0.1] hover:border-white/20'
                          : 'bg-black/[0.05] border-black/10 text-gray-600 hover:bg-black/[0.1] hover:border-black/20'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Main Content Area */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Profile Section */}
                {activeSection === 'profile' && (
                  <div className={`rounded-3xl p-8 backdrop-blur-xl border transition-all duration-500 ${
                    darkMode 
                      ? 'bg-gradient-to-br from-white/[0.08] to-white/[0.02] border-white/10' 
                      : 'bg-gradient-to-br from-black/[0.02] to-black/[0.08] border-black/10'
                  }`}>
                    <div className="flex items-center gap-4 mb-8">
                      <div className={`p-3 rounded-xl ${
                        darkMode 
                          ? 'bg-gradient-to-br from-blue-600/30 to-cyan-600/30' 
                          : 'bg-gradient-to-br from-blue-100 to-cyan-100'
                      }`}>
                        <User className={`${darkMode ? 'text-blue-400' : 'text-blue-600'}`} size={24} />
                      </div>
                      <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Profile Information
                      </h2>
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Full Name
                        </label>
                        <div className={`p-4 rounded-xl border backdrop-blur-sm ${
                          darkMode 
                            ? 'bg-white/[0.03] border-white/10 text-white' 
                            : 'bg-black/[0.02] border-black/10 text-gray-900'
                        }`}>
                          {userData.name}
                        </div>
                      </div>
                      
                      <div>
                        <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Email Address
                        </label>
                        <div className={`p-4 rounded-xl border backdrop-blur-sm ${
                          darkMode 
                            ? 'bg-white/[0.03] border-white/10 text-white' 
                            : 'bg-black/[0.02] border-black/10 text-gray-900'
                        }`}>
                          {userData.email}
                        </div>
                      </div>
                      
                      <div>
                        <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          LinkedIn ID
                        </label>
                        <div className={`p-4 rounded-xl border backdrop-blur-sm ${
                          darkMode 
                            ? 'bg-white/[0.03] border-white/10 text-white' 
                            : 'bg-black/[0.02] border-black/10 text-gray-900'
                        }`}>
                          {userData.linkedinId}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Data Management Section */}
                {activeSection === 'data' && (
                  <div
                    className={`rounded-3xl p-6 sm:p-8 backdrop-blur-xl border transition-all duration-500 ${
                      darkMode
                        ? "bg-gradient-to-br from-white/[0.08] to-white/[0.02] border-white/10"
                        : "bg-gradient-to-br from-black/[0.02] to-black/[0.08] border-black/10"
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8 flex-wrap">
                      <div
                        className={`p-2 sm:p-3 rounded-xl ${
                          darkMode
                            ? "bg-gradient-to-br from-emerald-600/30 to-teal-600/30"
                            : "bg-gradient-to-br from-emerald-100 to-teal-100"
                        }`}
                      >
                        <Database
                          className={`${darkMode ? "text-emerald-400" : "text-emerald-600"}`}
                          size={24}
                        />
                      </div>
                      <h2
                        className={`text-xl sm:text-2xl font-bold ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Data Management
                      </h2>
                    </div>

                    <div className="space-y-6">
                      {/* LinkedIn Data Section */}
                      <div className="flex flex-col sm:flex-row flex-wrap gap-4">
                        <button
                          onClick={handleRefreshData}
                          disabled={isRefreshing}
                          className={`flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-medium transition-all duration-300 w-full sm:w-auto ${
                            isRefreshing
                              ? "opacity-60 cursor-not-allowed"
                              : "hover:scale-105"
                          } ${
                            darkMode
                              ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg hover:shadow-blue-500/25"
                              : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg hover:shadow-blue-500/25"
                          }`}
                        >
                          <RefreshCw size={20} className={isRefreshing ? "animate-spin" : ""} />
                          {isRefreshing ? "Refreshing Data..." : "Refresh LinkedIn Data"}
                        </button>

                        <button
                          onClick={() => (window.location.href = "/complete-profile")}
                          className={`flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-medium transition-all duration-300 w-full sm:w-auto hover:scale-105 ${
                            darkMode
                              ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:shadow-purple-500/25"
                              : "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-purple-500/25"
                          }`}
                        >
                          <Edit3 size={20} />
                          Complete Profile
                        </button>
                      </div>

                      {/* GitHub Data Section */}
                      <div
                        className={`p-4 sm:p-6 rounded-xl border backdrop-blur-sm ${
                          darkMode
                            ? "bg-white/[0.03] border-white/10"
                            : "bg-black/[0.02] border-black/10"
                        }`}
                      >
                        <h3
                          className={`font-medium ${
                            darkMode ? "text-white" : "text-gray-900"
                          } mb-4`}
                        >
                          GitHub Integration
                        </h3>
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                          <input
                            type="text"
                            placeholder="Enter GitHub username"
                            value={githubId}
                            onChange={(e) => setGithubId(e.target.value)}
                            className={`flex-1 p-3 rounded-xl border backdrop-blur-sm ${
                              darkMode
                                ? "bg-white/[0.05] border-white/10 text-white placeholder-gray-400"
                                : "bg-black/[0.02] border-black/10 text-gray-900 placeholder-gray-500"
                            }`}
                          />
                          <button
                            onClick={handleRefreshGithubData}
                            disabled={isRefreshingGithub}
                            className={`flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 rounded-xl font-medium transition-all duration-300 w-full sm:w-auto ${
                              isRefreshingGithub
                                ? "opacity-60 cursor-not-allowed"
                                : "hover:scale-105"
                            } ${
                              darkMode
                                ? "bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg hover:shadow-orange-500/25"
                                : "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg hover:shadow-orange-500/25"
                            }`}
                          >
                            <RefreshCw
                              size={20}
                              className={isRefreshingGithub ? "animate-spin" : ""}
                            />
                            {isRefreshingGithub ? "Fetching..." : "Fetch GitHub Data"}
                          </button>
                        </div>
                      </div>

                      {/* Resume Upload Section */}
                      <div
                        className={`p-4 sm:p-6 rounded-xl border backdrop-blur-sm ${
                          darkMode
                            ? "bg-white/[0.03] border-white/10"
                            : "bg-black/[0.02] border-black/10"
                        }`}
                      >
                        <h3
                          className={`font-medium ${
                            darkMode ? "text-white" : "text-gray-900"
                          } mb-4`}
                        >
                          Resume Analysis
                        </h3>
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-end">
                          <div className="flex-1">
                            <input
                              id="resume-upload"
                              type="file"
                              accept=".pdf"
                              onChange={(e) => setResumeFile(e.target.files[0])}
                              className={`w-full p-3 rounded-xl border backdrop-blur-sm ${
                                darkMode
                                  ? "bg-white/[0.05] border-white/10 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white file:font-medium"
                                  : "bg-black/[0.02] border-black/10 text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-500 file:text-white file:font-medium"
                              }`}
                            />
                            {resumeFile && (
                              <p
                                className={`text-xs sm:text-sm mt-2 ${
                                  darkMode ? "text-gray-400" : "text-gray-600"
                                }`}
                              >
                                Selected: {resumeFile.name}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={handleResumeUpload}
                            disabled={isUploadingResume || !resumeFile}
                            className={`flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 rounded-xl font-medium transition-all duration-300 w-full sm:w-auto ${
                              isUploadingResume || !resumeFile
                                ? "opacity-60 cursor-not-allowed"
                                : "hover:scale-105"
                            } ${
                              darkMode
                                ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg hover:shadow-green-500/25"
                                : "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg hover:shadow-green-500/25"
                            }`}
                          >
                            <RefreshCw
                              size={20}
                              className={isUploadingResume ? "animate-spin" : ""}
                            />
                            {isUploadingResume ? "Analyzing..." : "Upload & Analyze"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                )}

                {/* Privacy & Security Section */}
                {activeSection === 'privacy' && (
                  <div className={`rounded-3xl p-8 backdrop-blur-xl border transition-all duration-500 ${
                    darkMode 
                      ? 'bg-gradient-to-br from-white/[0.08] to-white/[0.02] border-white/10' 
                      : 'bg-gradient-to-br from-black/[0.02] to-black/[0.08] border-black/10'
                  }`}>
                    <div className="flex items-center gap-4 mb-8">
                      <div className={`p-3 rounded-xl ${
                        darkMode 
                          ? 'bg-gradient-to-br from-red-600/30 to-orange-600/30' 
                          : 'bg-gradient-to-br from-red-100 to-orange-100'
                      }`}>
                        <Shield className={`${darkMode ? 'text-red-400' : 'text-red-600'}`} size={24} />
                      </div>
                      <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Privacy & Security
                      </h2>
                    </div>
                    
                    <div className="space-y-6">
                      <div className={`p-6 rounded-xl border backdrop-blur-sm ${
                        darkMode 
                          ? 'bg-white/[0.03] border-white/10' 
                          : 'bg-black/[0.02] border-black/10'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
                              Dark Mode
                            </h3>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
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
                      
                      <div className={`p-6 rounded-xl border backdrop-blur-sm ${
                        darkMode 
                          ? 'bg-white/[0.03] border-white/10' 
                          : 'bg-black/[0.02] border-black/10'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
                              Two-Factor Authentication
                            </h3>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              Add an extra layer of security to your account
                            </p>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                            darkMode 
                              ? 'bg-red-500/20 text-red-400' 
                              : 'bg-red-100 text-red-600'
                          }`}>
                            Disabled
                          </div>
                        </div>
                      </div>
                      
                      <div className={`p-6 rounded-xl border backdrop-blur-sm ${
                        darkMode 
                          ? 'bg-white/[0.03] border-white/10' 
                          : 'bg-black/[0.02] border-black/10'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
                              Login Notifications
                            </h3>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              Get notified when your account is accessed
                            </p>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                            darkMode 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-green-100 text-green-600'
                          }`}>
                            Enabled
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Analytics Section */}
                {activeSection === 'analytics' && (
                  <div className={`rounded-3xl p-8 backdrop-blur-xl border transition-all duration-500 ${
                    darkMode 
                      ? 'bg-gradient-to-br from-white/[0.08] to-white/[0.02] border-white/10' 
                      : 'bg-gradient-to-br from-black/[0.02] to-black/[0.08] border-black/10'
                  }`}>
                    <div className="flex items-center gap-4 mb-8">
                      <div className={`p-3 rounded-xl ${
                        darkMode 
                          ? 'bg-gradient-to-br from-cyan-600/30 to-blue-600/30' 
                          : 'bg-gradient-to-br from-cyan-100 to-blue-100'
                      }`}>
                        <BarChart3 className={`${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`} size={24} />
                      </div>
                      <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Account Analytics
                      </h2>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {[
                        { label: 'Profile Views', value: '0', color: 'purple' },
                        { label: 'Data Refreshes', value: '0', color: 'blue' },
                        { label: 'Comparisons Made', value: '0', color: 'green' },
                        { label: 'Days Active', value: '0', color: 'orange' }
                      ].map((stat, index) => (
                        <div key={index} className={`p-6 rounded-xl border text-center backdrop-blur-sm ${
                          darkMode 
                            ? 'bg-white/[0.03] border-white/10' 
                            : 'bg-black/[0.02] border-black/10'
                        }`}>
                          <div className={`text-3xl font-black mb-2 ${
                            stat.color === 'purple' ? 'text-purple-400' :
                            stat.color === 'blue' ? 'text-blue-400' :
                            stat.color === 'green' ? 'text-green-400' : 'text-orange-400'
                          }`}>
                            {stat.value}
                          </div>
                          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {stat.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                
                {/* Logout Card */}
                <div className={`rounded-3xl p-6 backdrop-blur-xl border ${
                  darkMode 
                    ? 'bg-gradient-to-br from-white/[0.08] to-white/[0.02] border-white/10' 
                    : 'bg-gradient-to-br from-black/[0.02] to-black/[0.08] border-black/10'
                }`}>
                  <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Account Actions
                  </h3>
                  <button
                    onClick={handleLogout}
                    className={`w-full flex items-center justify-center gap-3 p-4 rounded-xl font-medium transition-all duration-300 hover:scale-105 ${
                      darkMode 
                        ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg hover:shadow-red-500/25' 
                        : 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:shadow-red-500/25'
                    }`}
                  >
                    <LogOut size={20} />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}