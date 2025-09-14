import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { auth, db } from "../firebase/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";



function LoginCard({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Theme detection
  const darkMode = localStorage.getItem("insight_theme") === "dark";

  //apply theme on the current page load
  const mode= darkMode?document.body.style.backgroundColor = "rgb(0, 0, 0)": document.body.style.backgroundColor = "rgb(207, 207, 207)";

  // Theme-based helpers
  const borderColor = darkMode ? 'border-white' : 'border-black';
  const textColor = darkMode ? 'text-white' : 'text-gray-900';
  const secondaryText = darkMode ? 'text-gray-400' : 'text-gray-600';
  const cardBg = darkMode ? '' : '';
  const inputBg = darkMode ? 'bg-gray-800' : '';

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Get LinkedIn ID from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        throw new Error("User profile not found");
      }

      const data = userDoc.data();
      const linkedinId = data.linkedinId;
      const insight_username = data.name;
      const insight_email = data.email;
      localStorage.setItem("insight_username", insight_username);
      localStorage.setItem("insight_email", insight_email);
      localStorage.setItem("linkedin_id", linkedinId);

  
      let userInfo = null;



      // ---  fetch from backend ---
      
        console.log("⏳ Fetching user info from backend...");
        const response = await fetch(`http://127.0.0.1:5000/senduserinfo?userid=${linkedinId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        userInfo = await response.json();
        localStorage.setItem("insight_user_info", JSON.stringify(userInfo));
      

      console.log("User Info:", userInfo);

      navigate("/me");
    } catch (err) {
      console.error(err.message);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };



  return (
<div
  className="min-h-screen flex items-center justify-center bg-black px-6 py-12"
>
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.98 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ type: "spring", stiffness: 180, damping: 20 }}
    className="w-full max-w-md"
  >
    <div className="bg-zinc-900/70 backdrop-blur-md rounded-2xl p-8 border border-zinc-800 shadow-[0_0_25px_rgba(0,255,255,0.15)]">
      {/* Header */}
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold font-[Inter] text-cyan-400">
          Sign in
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Welcome back — please enter your details.
        </p>
      </header>

      {/* Form */}
      <form onSubmit={handleLogin} className="space-y-6">
        {/* Email */}
        <label className="block">
          <input
            className="w-full border border-zinc-700 bg-zinc-800/50 rounded-2xl px-4 py-3 text-cyan-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        {/* Password */}
        <label className="block relative">
          <input
            className="w-full border border-zinc-700 bg-zinc-800/50 rounded-2xl px-4 py-3 pr-12 text-cyan-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-magenta-400 focus:border-magenta-400 transition"
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

        {/* Remember + Forgot */}
        <div className="flex items-center justify-between text-sm">
          <label className="inline-flex items-center gap-2 text-zinc-400">
            <input
              type="checkbox"
              className="accent-cyan-400 rounded-md focus:ring-cyan-400"
            />
            <span>Remember me</span>
          </label>
          <a href="#" className="text-magenta-400 hover:underline">
            Forgot?
          </a>
        </div>

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
            "Sign in"
          )}
        </motion.button>
      </form>

      {/* Signup link */}
      <div className="mt-6 text-center text-sm">
        <span className="text-zinc-500">Don’t have an account?</span>
        <a
          href="/signup"
          className="ml-2 text-cyan-400 border-b border-cyan-400 hover:no-underline"
        >
          Create one
        </a>
      </div>
    </div>

    {/* Footer Terms */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.25 }}
      className="mt-6 text-center text-xs text-zinc-500"
    >
      <p>By continuing you agree to our terms and privacy.</p>
    </motion.div>
  </motion.div>
</div>

  );
}

export default LoginCard;
