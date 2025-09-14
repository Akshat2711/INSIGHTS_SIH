import React, { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { auth, db } from "../firebase/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function SignupCard() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [linkedinId, setLinkedinId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  //apply theme on the current page load
  const mode= localStorage.getItem("insight_theme") === "dark"?document.body.style.backgroundColor = "rgb(0, 0, 0)": document.body.style.backgroundColor = "rgb(207, 207, 207)";

  // Theme detection
  const darkMode = localStorage.getItem("insight_theme") === "dark";

  // Theme-based helpers
  const borderColor = darkMode ? 'border-white' : 'border-black';
  const textColor = darkMode ? 'text-white' : 'text-gray-900';
  const secondaryText = darkMode ? 'text-gray-400' : 'text-gray-600';
  const cardBg = darkMode ? '' : '';
  const inputBg = darkMode ? 'bg-gray-800' : '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1️⃣ Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2️⃣ Store extra fields in Firestore
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        linkedinId,
        createdAt: new Date(),
      });

      // 3️⃣ Save LinkedIn ID locally (for SuggestionTab, etc.)
      localStorage.setItem("linkedin_id", linkedinId);
      localStorage.setItem("insight_username", name);
      localStorage.setItem("insight_email", email);

      
      try{
      // 4️⃣ Fetch LinkedIn data immediately after signup
        await retrieve_linked_info();
      // 5 Redirect to /me
      navigate("/me");

      }
      catch(err){
        console.error("Error fetching LinkedIn data:", err);
        alert("Signup successful, but failed to fetch LinkedIn data. Please try again.");
      }
      



    } catch (err) {
      console.error("Signup Error:", err.message);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };


  const retrieve_linked_info = async () => {
    setLoading(true);

    try {
      const res = await fetch(
        `http://localhost:5000/scrapdata?userid=${encodeURIComponent(linkedinId)}`,
        { method: "POST" }
      );
      const data = await res.json();

      let userInfo; // <-- Fix: declare userInfo before assignment

      if (data.success) {
        
        //getting new info stored in backend
        try {
          const response = await fetch(`http://127.0.0.1:5000/senduserinfo?userid=${linkedinId}`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          userInfo = await response.json();
        } catch (error) {
          console.error("Error fetching user info:", error);
        }

        // Only save if userInfo is valid
        if (userInfo && typeof userInfo === "object") {
          localStorage.setItem("insight_user_info", JSON.stringify(userInfo));
        } else {
          console.warn("User info not updated in localStorage due to fetch error.");
        }
        setMessage({ type: 'success', text: data.message || 'Data refreshed successfully!' });


      } else {
        console.log(data.error || 'Something went wrong');
      }
    } catch (err) {
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  };





  return (
    <div className="min-h-screen flex items-center justify-center bg-black bg-cover bg-center px-6 py-12">
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.98 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ type: "spring", stiffness: 200, damping: 20 }}
    className="w-full max-w-md"
  >
    <div className="bg-zinc-900/70 backdrop-blur-md border border-zinc-800 rounded-2xl p-8 shadow-[0_0_25px_rgba(0,255,255,0.15)]">
      {/* Header */}
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold font-[Inter] text-cyan-400">
          Create Account
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Join us by filling in your details below.
        </p>
      </header>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Full Name */}
        <input
          className="w-full border border-zinc-700 bg-zinc-800/50 rounded-2xl px-4 py-3 text-cyan-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        {/* LinkedIn ID */}
        <label className="block relative group">
          <input
            className="w-full border border-zinc-700 bg-zinc-800/50 rounded-2xl px-4 py-3 text-cyan-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
            type="text"
            placeholder="LinkedIn ID"
            value={linkedinId}
            onChange={(e) => setLinkedinId(e.target.value)}
            required
          />
          <span className="absolute left-0 -top-8 bg-zinc-950 text-cyan-100 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg shadow-cyan-500/20">
            Eg. https://www.linkedin.com/in/akshat-srivastava-5a52b1240/
          </span>
        </label>

        {/* Email */}
        <input
          className="w-full border border-zinc-700 bg-zinc-800/50 rounded-2xl px-4 py-3 text-cyan-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* Password */}
        <label className="block relative">
          <input
            className="w-full border border-zinc-700 bg-zinc-800/50 rounded-2xl px-4 py-3 pr-12 text-cyan-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-magenta-400 transition"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-400 hover:text-cyan-300"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </label>

        {/* Submit */}
        <motion.button
          whileHover={{ scale: 1.03, boxShadow: "0 0 15px rgba(0,255,255,0.6)" }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 rounded-2xl border border-cyan-400 px-4 py-3 font-medium text-cyan-100 bg-gradient-to-r from-cyan-500/20 to-violet-500/20 hover:from-cyan-500/30 hover:to-violet-500/30 transition"
        >
          {loading ? (
            <svg
              className="h-5 w-5 animate-spin text-cyan-400"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray="60"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            "Sign Up"
          )}
        </motion.button>
      </form>

      {/* Login link */}
      <div className="mt-6 text-center text-sm">
        <span className="text-zinc-500">Already have an account?</span>
        <a
          href="/login"
          className="ml-2 text-cyan-400 border-b border-cyan-400 hover:no-underline"
        >
          Sign in
        </a>
      </div>
    </div>
  </motion.div>
</div>
  );
}
