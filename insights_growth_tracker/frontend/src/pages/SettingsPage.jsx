import React, { useState, useEffect, useRef } from 'react';
import { User, Linkedin, RefreshCw, Settings, Shield, Database, BarChart3, LogOut, Edit3, Upload, FileText } from 'lucide-react';
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";
import Particles from '../components/Particles';

export default function SettingsPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [message, setMessage] = useState(null);
  const [activeSection, setActiveSection] = useState('profile');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const linkedinId = localStorage.getItem("linkedin_id") || "punit173";
  const user_name = localStorage.getItem("insight_username") || "error_user";
  const user_email = localStorage.getItem("insight_email") || "error@gmail.com";
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("insight_theme") === "dark"
  );

  const [userData] = useState({
    name: user_name,
    email: user_email,
    linkedinId: linkedinId,
  });

  // Theme detection and update function
  const updateTheme = () => {
    document.body.style.backgroundColor = "rgb(0, 0, 0)";
  };

  // Listen for theme changes
  useEffect(() => {
    updateTheme();
  }, []);

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

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      setMessage({ type: 'error', text: 'Please upload a PDF file only.' });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File size should be less than 10MB.' });
      return;
    }

    setIsUploading(true);
    setMessage(null);

    try {
      // Here you would typically upload to your backend
      // For now, we'll just simulate the upload
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate upload delay
      
      setUploadedFile({
        name: file.name,
        size: file.size,
        uploadDate: new Date().toLocaleDateString()
      });
      
      setMessage({ type: 'success', text: 'Resume uploaded successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to upload resume. Please try again.' });
    } finally {
      setIsUploading(false);
      // Clear the input
      event.target.value = '';
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
                  <div className={`rounded-3xl p-8 backdrop-blur-xl border transition-all duration-500 ${
                    darkMode 
                      ? 'bg-gradient-to-br from-white/[0.08] to-white/[0.02] border-white/10' 
                      : 'bg-gradient-to-br from-black/[0.02] to-black/[0.08] border-black/10'
                  }`}>
                    <div className="flex items-center gap-4 mb-8">
                      <div className={`p-3 rounded-xl ${
                        darkMode 
                          ? 'bg-gradient-to-br from-emerald-600/30 to-teal-600/30' 
                          : 'bg-gradient-to-br from-emerald-100 to-teal-100'
                      }`}>
                        <Database className={`${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} size={24} />
                      </div>
                      <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Data Management
                      </h2>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="flex flex-wrap gap-4">
                        <button
                          onClick={handleRefreshData}
                          disabled={isRefreshing}
                          className={`flex items-center gap-3 px-6 py-4 rounded-xl font-medium transition-all duration-300 ${
                            isRefreshing ? 'opacity-60 cursor-not-allowed' : 'hover:scale-105'
                          } ${
                            darkMode 
                              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg hover:shadow-blue-500/25' 
                              : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg hover:shadow-blue-500/25'
                          }`}
                        >
                          <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
                          {isRefreshing ? 'Refreshing Data...' : 'Refresh LinkedIn Data'}
                        </button>
                        
                        <button
                          onClick={() => window.location.href = '/complete-profile'}
                          className={`flex items-center gap-3 px-6 py-4 rounded-xl font-medium transition-all duration-300 hover:scale-105 ${
                            darkMode 
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:shadow-purple-500/25' 
                              : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-purple-500/25'
                          }`}
                        >
                          <Edit3 size={20} />
                          Complete Profile
                        </button>

                        <button
                          onClick={handleFileUpload}
                          disabled={isUploading}
                          className={`flex items-center gap-3 px-6 py-4 rounded-xl font-medium transition-all duration-300 ${
                            isUploading ? 'opacity-60 cursor-not-allowed' : 'hover:scale-105'
                          } ${
                            darkMode 
                              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg hover:shadow-emerald-500/25' 
                              : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg hover:shadow-emerald-500/25'
                          }`}
                        >
                          <Upload size={20} className={isUploading ? 'animate-pulse' : ''} />
                          {isUploading ? 'Uploading...' : 'Upload Resume/CV'}
                        </button>
                      </div>

                      {/* Hidden file input */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />

                      {/* Uploaded file display */}
                      {uploadedFile && (
                        <div className={`p-6 rounded-xl border backdrop-blur-sm ${
                          darkMode 
                            ? 'bg-white/[0.03] border-white/10' 
                            : 'bg-black/[0.02] border-black/10'
                        }`}>
                          <div className="flex items-center gap-3 mb-3">
                            <FileText className={`${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} size={20} />
                            <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Uploaded Resume</h4>
                          </div>
                          <div className={`space-y-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            <p><span className="font-medium">File:</span> {uploadedFile.name}</p>
                            <p><span className="font-medium">Size:</span> {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                            <p><span className="font-medium">Uploaded:</span> {uploadedFile.uploadDate}</p>
                          </div>
                        </div>
                      )}
                      
                      {message && (
                        <div className={`p-4 rounded-xl border ${
                          message.type === 'success'
                            ? 'bg-green-500/10 border-green-500/30 text-green-400'
                            : 'bg-red-500/10 border-red-500/30 text-red-400'
                        }`}>
                          {message.text}
                        </div>
                      )}
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