import React, { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { auth, db } from "../firebase/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Particles from '../components/Particles';
import BlurText from '../components/BlurText';

function SignupCard() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [linkedinId, setLinkedinId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  //apply theme on the current page load
  const mode = localStorage.getItem("insight_theme") === "dark" ? document.body.style.backgroundColor = "rgb(0, 0, 0)" : document.body.style.backgroundColor = "rgb(207, 207, 207)";

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
    // Step 1: Try to fetch existing user info
    const checkRes = await fetch(`https://ba7b80716e18.ngrok-free.app/senduserinfo?userid=${linkedinId}`);
    let userInfo = await checkRes.json();

    // If valid user data exists, skip scraping
    if (userInfo && Object.keys(userInfo).length > 0 && userInfo.name) {
      localStorage.setItem("insight_user_info", JSON.stringify(userInfo));
      setMessage({ type: 'info', text: 'User info loaded from backend cache.' });
      return; // ✅ Exit early, no need to scrape again
    }

    // Step 2: Scrape only if user not found or data incomplete
    const scrapeRes = await fetch(
      `https://ba7b80716e18.ngrok-free.app/scrapdata?userid=${encodeURIComponent(linkedinId)}`,
      { method: "POST" }
    );

    const data = await scrapeRes.json();

    if (data.success) {
      // Step 3: Fetch updated user info after scraping
      try {
        const response = await fetch(`https://ba7b80716e18.ngrok-free.app/senduserinfo?userid=${linkedinId}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        userInfo = await response.json();

        // Store the new info in localStorage
        if (userInfo && typeof userInfo === "object") {
          localStorage.setItem("insight_user_info", JSON.stringify(userInfo));
        }
        setMessage({ type: 'success', text: data.message || 'Data refreshed successfully!' });
      } catch (error) {
        console.error("Error fetching user info after scraping:", error);
      }
    } else {
      console.log(data.error || 'Something went wrong during scraping.');
    }
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    setLoading(false);
  }
};





  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black">
      {/* Enhanced Particles Background - positioned absolutely behind everything */}
      <div className="absolute inset-0 w-full h-full">
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

      {/* Main signup card - positioned relative to stay above particles */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 260, 
          damping: 20,
          duration: 0.6 
        }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Glassmorphism card */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/20 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-center mb-8"
          >
            <BlurText
              text="Join the Journey"
              delay={150}
              animateBy="words"
              direction="top"
              className="text-4xl font-bold text-white mb-3 text-center w-full"
            />
            <BlurText
              text="Create your account to get started"
              delay={100}
              animateBy="words"
              direction="top"
              className="text-gray-200 text-lg text-center w-full"
            />
          </motion.div>

          {/* Form */}
          <motion.form 
            onSubmit={handleSubmit} 
            className="space-y-6"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0 }}
          >
            {/* Full Name Field */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-200">
                Full Name
              </label>
              <motion.div
                whileFocus={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
              >
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-4 bg-white/10 border border-white/30 rounded-2xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm hover:bg-white/15"
                  placeholder="Enter your full name"
                />
              </motion.div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-200">
                Email Address
              </label>
              <motion.div
                whileFocus={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
              >
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-4 bg-white/10 border border-white/30 rounded-2xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm hover:bg-white/15"
                  placeholder="Enter your email"
                />
              </motion.div>
            </div>

            {/* LinkedIn ID Field */}
            <div className="space-y-2">
              <label htmlFor="linkedinId" className="block text-sm font-medium text-gray-200">
                LinkedIn ID
              </label>
              <motion.div
                whileFocus={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
              >
                <input
                  id="linkedinId"
                  name="linkedinId"
                  type="text"
                  required
                  value={linkedinId}
                  onChange={(e) => setLinkedinId(e.target.value)}
                  className="w-full px-4 py-4 bg-white/10 border border-white/30 rounded-2xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm hover:bg-white/15"
                  placeholder="Enter your LinkedIn ID"
                />
              </motion.div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-200">
                Password
              </label>
              <motion.div 
                className="relative"
                whileFocus={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
              >
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-4 pr-12 bg-white/10 border border-white/30 rounded-2xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm hover:bg-white/15"
                  placeholder="Create a password"
                />
                <motion.button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-300 hover:text-white transition-colors duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </motion.button>
              </motion.div>
            </div>

            {/* Sign Up Button */}
            <motion.button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-lg font-semibold rounded-2xl text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
              whileHover={{ 
                scale: 1.02, 
                boxShadow: "0 20px 25px -5px rgba(147, 51, 234, 0.1), 0 10px 10px -5px rgba(147, 51, 234, 0.04)" 
              }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              {loading ? (
                <div className="flex items-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3"
                  />
                  Creating account...
                </div>
              ) : (
                <span className="flex items-center">
                  Create Account
                  <motion.svg
                    className="ml-2 -mr-1 w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    initial={{ x: 0 }}
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </motion.svg>
                </span>
              )}
            </motion.button>
          </motion.form>

          {/* Sign In Link */}
          <motion.div 
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <p className="text-gray-200">
              Already have an account?{' '}
              <motion.a
                href="/login"
                className="font-medium text-purple-400 hover:text-pink-400 transition-colors duration-200 underline decoration-purple-400/30 hover:decoration-pink-400/50 underline-offset-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Sign in
              </motion.a>
            </p>
          </motion.div>
        </div>

        {/* Legal Text */}
        <motion.div 
          className="mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <p className="text-xs text-gray-300">
            By creating an account you agree to our terms and privacy policy.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default SignupCard;