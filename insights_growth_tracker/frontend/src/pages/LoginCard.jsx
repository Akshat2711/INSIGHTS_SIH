import { useState, useEffect } from "react"; // Added useEffect
import { Eye, EyeOff, UserCheck } from "lucide-react"; // Added UserCheck icon
import { motion } from "framer-motion";
import { auth, db } from "../firebase/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Particles from "../components/Particles";
import BlurText from "../components/BlurText";
import { API_BASE_URL } from "../utils/apiConfig";

function LoginCard({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // --- Theme Management ---
  const darkMode = localStorage.getItem("insight_theme") === "dark";

  useEffect(() => {
    // Apply background color safely on mount
    document.body.style.backgroundColor = darkMode ? "rgb(0, 0, 0)" : "rgb(207, 207, 207)";
  }, [darkMode]);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    try {
      setLoading(true);

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

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

      console.log("⏳ Fetching user info from backend...");
      const response = await fetch(`${API_BASE_URL}/senduserinfo?userid=${linkedinId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const userInfo = await response.json();
      localStorage.setItem("insight_user_info", JSON.stringify(userInfo));

      localStorage.setItem("insight_theme", "dark");
      navigate("/me");
    } catch (err) {
      console.error(err.message);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper for testing credentials
  const fillTestCredentials = () => {
    setEmail("akshatsrivastava206@gmail.com");
    setPassword("12345678");
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black py-12">
      {/* Particles Background */}
      <div className="absolute inset-0 w-full h-full">
        <Particles
          particleColors={['#ffffff', '#ffffff', '#ffffff']}
          particleCount={200}
          speed={0.1}
          particleBaseSize={150}
          moveParticlesOnHover={true}
          alphaParticles={false}
          sizeRandomness={0.8}
          cameraDistance={25}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, duration: 0.6 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="backdrop-blur-xl bg-white/5 border border-white/20 rounded-3xl p-8 shadow-2xl transition-all duration-500">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
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
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-200">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-4 bg-white/10 border border-white/30 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all backdrop-blur-sm"
                placeholder="Enter your email"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-200">Password</label>
                <a href="#" className="text-sm text-purple-400 hover:text-pink-400 font-medium transition-colors">Forgot?</a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-4 pr-12 bg-white/10 border border-white/30 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all backdrop-blur-sm"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 text-gray-300 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-4 px-4 font-semibold rounded-2xl text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:shadow-purple-500/25 transition-all disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? "Signing in..." : "Sign in"}
            </motion.button>
          </form>

          {/* --- Testing Credentials Section --- */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-xs text-center text-gray-400 uppercase tracking-widest mb-4">Development Access</p>
            <motion.button
              onClick={fillTestCredentials}
              whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.15)" }}
              className="w-full flex items-center justify-between px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-left transition-colors group"
            >
              <div>
                <p className="text-xs text-purple-400 font-bold">TEST ACCOUNT</p>
                <p className="text-sm text-gray-300">akshatsrivastava206@gmail.com</p>
              </div>
              <UserCheck size={18} className="text-gray-500 group-hover:text-white transition-colors" />
            </motion.button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-200">
              Don't have an account?{' '}
              <a href="/signup" className="font-medium text-purple-400 hover:text-pink-400 underline underline-offset-2">Create one</a>
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          By continuing you agree to our terms and privacy.
        </p>
      </motion.div>
    </div>
  );
}

export default LoginCard;