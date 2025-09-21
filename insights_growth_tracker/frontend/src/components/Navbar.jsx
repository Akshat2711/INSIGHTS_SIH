import React, { useState, useEffect } from "react";
import { Menu, X, Home, User, BarChart3, Users, Settings, Search,Activity } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(true);//(localStorage.getItem("insight_theme") === "dark")for later currently reomved this as light mode is not there for all ui
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;

  // Listen for scroll events to add blur effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Listen for theme changes
  useEffect(() => {
    const handleThemeChange = () => {
      setDarkMode(localStorage.getItem("insight_theme") === "dark");
    };
    
    window.addEventListener('storage', handleThemeChange);
    return () => window.removeEventListener('storage', handleThemeChange);
  }, []);

  const navigationItems = [
    { name: 'Me', href: '/me', icon: User },
    { name: 'Compare', href: '/compare', icon: BarChart3 },
    { name: 'Leaderboard', href: '/leaderboard', icon: Users },
    { name: 'Suggestions', href: '/suggestions', icon: Activity },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  // Function to handle search button click
  const handleSearchClick = () => {
    navigate('/search');
  };

  // Function to handle logo click
  const handleLogoClick = () => {
    navigate('/me');
  };

  return (
    <>
      {/* Modern Glassmorphism Navbar */}
      <nav className={`fixed top-8 left-1/2 transform -translate-x-1/2 max-w-6xl rounded-3xl shadow-2xl z-40 transition-all duration-300 ${
        scrolled 
          ? 'py-3 backdrop-blur-md bg-black/30 border-b border-white/10' 
          : 'py-4 backdrop-blur-sm bg-black/20 border-b border-white/5'
      }`} style={{width: '95%'}}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between">
            
            {/* Enhanced Logo */}
            <div className="flex items-center gap-3">
              <div className="relative group" onClick={() => window.location.href = '/search'} style={{cursor: 'pointer'}}>
                <div className={`absolute inset-0 rounded-xl blur-md transition-all duration-300 ${
                  darkMode 
                    ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/30 group-hover:from-purple-500/40 group-hover:to-pink-500/40' 
                    : 'bg-gradient-to-r from-purple-400/30 to-pink-400/30 group-hover:from-purple-300/40 group-hover:to-pink-300/40'
                }`}></div>
                <h1 
                  onClick={handleLogoClick}
                  className={`relative text-2xl font-black tracking-tight cursor-pointer transition-all duration-300 ${
                  darkMode 
                    ? 'bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400' 
                    : 'bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600'
                } bg-clip-text text-transparent hover:scale-105`}>
                  Insights
                </h1>
              </div>
              <div className={`hidden sm:block w-px h-6 ${
                darkMode ? 'bg-white/20' : 'bg-black/20'
              }`}></div>
              <span className={`hidden sm:block text-sm font-medium ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Growth Tracker
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-2">
              <button
                onClick={handleSearchClick}
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-300 group backdrop-blur-sm ${
                  darkMode
                    ? 'text-gray-300 hover:text-white hover:bg-white/10 border border-white/10'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-black/10 border border-black/10'
                }`}
              >
                <Search size={18} className="relative z-10" />
                <span className="relative z-10">Search</span>
                
                {/* Hover effect */}
                <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${
                  darkMode 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                    : 'bg-gradient-to-r from-purple-400 to-pink-400'
                }`}></div>
              </button>
              
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.href;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-300 group ${
                      isActive
                        ? darkMode
                          ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/30 text-white border border-purple-400/30'
                          : 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border border-purple-300'
                        : darkMode
                          ? 'text-gray-300 hover:text-white hover:bg-white/10'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-black/10'
                    } backdrop-blur-sm`}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <div className={`absolute inset-0 rounded-xl opacity-20 ${
                        darkMode 
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                          : 'bg-gradient-to-r from-purple-400 to-pink-400'
                      }`}></div>
                    )}
                    <Icon size={18} className="relative z-10" />
                    <span className="relative z-10">{item.name}</span>
                    
                    {/* Hover effect */}
                    <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${
                      darkMode 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                        : 'bg-gradient-to-r from-purple-400 to-pink-400'
                    }`}></div>
                  </a>
                );
              })}
            </div>

            {/* Enhanced Action Items */}
            <div className="flex items-center gap-3">
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`lg:hidden flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 backdrop-blur-sm border ${
                  darkMode 
                    ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' 
                    : 'bg-black/10 border-black/20 text-black hover:bg-black/20'
                } hover:scale-105`}
              >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Enhanced Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsOpen(false)}
          ></div>
          
          {/* Mobile Menu Panel */}
          <div className={`fixed top-0 right-0 h-full w-80 max-w-sm transform transition-transform duration-300 backdrop-blur-xl border-l z-50${
            darkMode 
              ? 'bg-black/80 border-white/10' 
              : 'bg-white/80 border-black/10'
          } shadow-2xl`}>
            
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className={`text-lg font-bold ${
                darkMode 
                  ? 'bg-gradient-to-r from-purple-400 to-pink-400' 
                  : 'bg-gradient-to-r from-purple-600 to-pink-600'
              } bg-clip-text text-transparent`}>
                Navigation
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  darkMode 
                    ? 'hover:bg-white/10 text-gray-300 hover:text-white' 
                    : 'hover:bg-black/10 text-gray-600 hover:text-gray-900'
                }`}
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Mobile Navigation Items */}
            <div className="p-6 space-y-3">
              <button
                onClick={() => {
                  handleSearchClick();
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 group backdrop-blur-sm ${
                  darkMode
                    ? 'text-gray-300 hover:text-white hover:bg-white/10'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-black/10'
                }`}
              >
                <div className={`p-2 rounded-lg ${
                  darkMode
                    ? 'bg-white/10 group-hover:bg-white/20'
                    : 'bg-black/10 group-hover:bg-black/20'
                } transition-all duration-300`}>
                  <Search size={20} />
                </div>
                <span className="font-medium">Search</span>
              </button>
              
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.href;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 group ${
                      isActive
                        ? darkMode
                          ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/30 text-white border border-purple-400/30'
                          : 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border border-purple-300'
                        : darkMode
                          ? 'text-gray-300 hover:text-white hover:bg-white/10'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-black/10'
                    } backdrop-blur-sm`}
                  >
                    <div className={`p-2 rounded-lg ${
                      isActive
                        ? darkMode
                          ? 'bg-purple-500/20'
                          : 'bg-purple-200'
                        : darkMode
                          ? 'bg-white/10 group-hover:bg-white/20'
                          : 'bg-black/10 group-hover:bg-black/20'
                    } transition-all duration-300`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <span className="font-medium">{item.name}</span>
                      {isActive && (
                        <div className={`text-xs mt-1 ${
                          darkMode ? 'text-purple-300' : 'text-purple-600'
                        }`}>
                          Current page
                        </div>
                      )}
                    </div>
                  </a>
                );
              })}
            </div>
            
            {/* Mobile Menu Footer */}
            <div className={`absolute bottom-0 left-0 right-0 p-6 border-t ${
              darkMode ? 'border-white/10' : 'border-black/10'
            }`}>
              <div className={`text-center text-sm ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Insights Growth Tracker
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;