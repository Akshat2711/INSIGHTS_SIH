import React, { useState, useEffect } from 'react';
import { User, Mail, Linkedin, RefreshCw, Settings, Sun, Moon } from 'lucide-react';
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";

export default function SettingsPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [message, setMessage] = useState(null);
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

  useEffect(() => {
    if (darkMode) {
      document.body.style.backgroundColor = "#050507";
      localStorage.setItem("insight_theme", "dark");
    } else {
      document.body.style.backgroundColor = "#f6f6f6";
      localStorage.setItem("insight_theme", "light");
    }
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
        `http://localhost:5000/scrapdata?userid=${encodeURIComponent(userData.linkedinId)}`,
        { method: "POST" }
      );
      const data = await res.json();

      let userInfo;
      if (data.success) {
        try {
          const response = await fetch(`http://127.0.0.1:5000/senduserinfo?userid=${linkedinId}`);
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

  const isDark = darkMode;

  return (
    <div className={`min-h-screen py-10 px-6 sm:px-10 font-roboto text-sm ${isDark ? 'text-slate-100' : 'text-gray-900'} mt-12`}>
      <style>{`
        :root {
          --dark-bg: #050507;
          --light-bg: #f6f6f6;
          --card-dark: rgba(255,255,255,0.03);
          --card-light: rgba(0,0,0,0.02);
          --neon-blue: #00b0ff;
          --neon-green: #00ffa6;
          --neon-magenta: #ff2dcb;
          --neon-cyan: #00ffd8;
          --neon-violet: #a55bff;
        }
        .font-roboto{font-family: 'Roboto', Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial}
        .soft-elev{box-shadow: 0 8px 30px rgba(2,6,23,0.15);} 
        .subtle-anim{transition: all 220ms cubic-bezier(.2,.9,.3,1);} 
        .card-dark{background: linear-gradient(180deg, var(--card-dark), transparent); border: 1px solid rgba(255,255,255,0.04);} 
        .card-light{background: linear-gradient(180deg, var(--card-light), transparent); border: 1px solid rgba(0,0,0,0.06);} 
      `}</style>

      <div className="max-w-5xl mx-auto grid grid-cols-1 gap-6">

        {/* Header */}
        <header className={`flex items-center justify-between p-5 rounded-2xl soft-elev subtle-anim ${isDark ? 'card-dark' : 'card-light'}`}>
          <div>
            <div className="flex items-center gap-3">
              <Settings size={22} className={isDark ? "text-[var(--neon-cyan)]" : "text-blue-500"} />
              <h1 className="text-2xl font-semibold">Account Settings</h1>
            </div>
            <p className={`mt-1 text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Manage your account and preferences.</p>
          </div>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl subtle-anim ${isDark ? 'bg-black border border-white/10' : 'bg-white border border-black/10'} hover:brightness-110`}
          >
            {darkMode ? <Sun size={16} className="text-[var(--neon-green)]" /> : <Moon size={16} className="text-blue-500" />}
            <span className="text-xs">{darkMode ? 'Light' : 'Dark'}</span>
          </button>
        </header>

        {/* Profile */}
        <section className={`p-6 rounded-2xl soft-elev subtle-anim ${isDark ? 'card-dark' : 'card-light'}`}>
          <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs mb-1">Full Name</label>
              <div className={`p-3 rounded-xl border ${isDark ? 'border-white/10 bg-transparent' : 'border-black/10 bg-white'}`}>{userData.name}</div>
            </div>
            <div>
              <label className="block text-xs mb-1">Email</label>
              <div className={`p-3 rounded-xl border ${isDark ? 'border-white/10 bg-transparent' : 'border-black/10 bg-white'}`}>{userData.email}</div>
            </div>
            <div>
              <label className="block text-xs mb-1">LinkedIn ID</label>
              <div className={`p-3 rounded-xl border ${isDark ? 'border-white/10 bg-transparent' : 'border-black/10 bg-white'}`}>{userData.linkedinId}</div>
            </div>
          </div>
        </section>

        {/* Data Management */}
        <section className={`p-6 rounded-2xl soft-elev subtle-anim ${isDark ? 'card-dark' : 'card-light'}`}>
          <h2 className="text-lg font-semibold mb-4">Data Management</h2>

          <div className="flex items-center gap-1 mb-4">

            <button
              onClick={handleRefreshData}
              disabled={isRefreshing}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold subtle-anim ${isRefreshing ? 'opacity-60 cursor-not-allowed' : ''} ${isDark ? 'bg-[var(--neon-blue)] text-black' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
              {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
            </button>

            {/* button for specifying your role in the post or what u learned from it */}
            <button
              onClick={() => window.location.href = '/complete-profile'}
              className={`ml-4 px-4 py-2 rounded-xl text-xs font-semibold subtle-anim ${isDark ? 'bg-[var(--neon-magenta)] text-black' : 'bg-pink-600 text-white hover:bg-pink-700'}`}
            > complete your profile! </button>

        </div>


          {message && (
            <div className={`mt-3 text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{message.text}</div>
          )}
        </section>

        {/* Statistics */}
        <section className={`p-6 rounded-2xl soft-elev subtle-anim ${isDark ? 'card-dark' : 'card-light'}`}>
          <h2 className="text-lg font-semibold mb-4">Account Statistics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-gray-300 text-center">
              <div className="text-2xl font-bold">0</div>
              <div className="text-xs">Profile Views</div>
            </div>
            <div className="p-4 rounded-xl border border-gray-300 text-center">
              <div className="text-2xl font-bold">0</div>
              <div className="text-xs">Comparisons</div>
            </div>
            <div className="p-4 rounded-xl border border-gray-300 text-center">
              <div className="text-2xl font-bold">0</div>
              <div className="text-xs">Refreshes</div>
            </div>
          </div>
        </section>

        {/* Logout */}
        <section className={`p-6 rounded-2xl soft-elev subtle-anim ${isDark ? 'card-dark' : 'card-light'}`}>
          <button onClick={handleLogout} className="w-full py-3 rounded-xl bg-red-600 text-white hover:bg-red-700">Logout</button>
        </section>
      </div>
    </div>
  );
}
