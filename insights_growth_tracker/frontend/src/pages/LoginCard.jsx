import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { auth, db } from "../firebase/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Particles from "../components/Particles";
import BlurText from "../components/BlurText";

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
        const response = await fetch(`https://insights-sih-tf-lva.fly.dev/senduserinfo?userid=${linkedinId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        userInfo = await response.json();
        localStorage.setItem("insight_user_info", JSON.stringify(userInfo));
      

      console.log("User Info:", userInfo);
      localStorage.setItem("insight_theme","dark");

      navigate("/me");
    } catch (err) {
      console.error(err.message);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black">
      {/* Particles Background - positioned absolutely behind everything */}
      <div className="absolute inset-0 w-full h-full">
        <Particles
          particleColors={['#ffffff', '#ffffff', '#ffffff']}
          particleCount={200}
          particleSpread={10}
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

      {/* Main login card - positioned relative to stay above particles */}
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
              text="Welcome back"
              delay={150}
              animateBy="words"
              direction="top"
              className="text-4xl font-bold text-white mb-3 text-center w-full"
            />
            <BlurText
              text="Sign in to continue your journey"
              delay={100}
              animateBy="words"
              direction="top"
              className="text-gray-200 text-lg text-center w-full"
            />
          </motion.div>

          {/* Form */}
          <motion.form 
            onSubmit={handleLogin} 
            className="space-y-6"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0 }}
          >
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

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-gray-200">
                  Password
                </label>
                <motion.a 
                  href="#" 
                  className="text-sm text-purple-400 hover:text-pink-400 transition-colors duration-200 font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Forgot?
                </motion.a>
              </div>
              <motion.div 
                className="relative"
                whileFocus={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
              >
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-4 pr-12 bg-white/10 border border-white/30 rounded-2xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm hover:bg-white/15"
                  placeholder="Enter your password"
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

            {/* Remember Me Checkbox */}
            <motion.div 
              className="flex items-center"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-cyan-400 focus:ring-cyan-400 border-white/30 rounded bg-white/10 backdrop-blur-sm"
              />
              <label htmlFor="remember-me" className="ml-3 block text-sm text-gray-200">
                Remember me
              </label>
            </motion.div>

            {/* Sign In Button */}
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
                  Signing in...
                </div>
              ) : (
                <span className="flex items-center">
                  Sign in
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

          {/* Sign Up Link */}
          <motion.div 
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <p className="text-gray-200">
              Don't have an account?{' '}
              <motion.a
                href="/signup"
                className="font-medium text-purple-400 hover:text-pink-400 transition-colors duration-200 underline decoration-purple-400/30 hover:decoration-pink-400/50 underline-offset-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Create one
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
            By continuing you agree to our terms and privacy.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default LoginCard;