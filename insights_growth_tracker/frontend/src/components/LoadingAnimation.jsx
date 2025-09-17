import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LoadingAnimation = ({ isVisible }) => {
  const [currentStage, setCurrentStage] = useState(0);
  const [currentEmoji, setCurrentEmoji] = useState(0);

  const stages = useMemo(() => [
    {
      text: "Fetching data...",
      emoji: "🔍",
      duration: 2000
    },
    {
      text: "Analyzing profile...",
      emoji: "🧠",
      duration: 2000
    },
    {
      text: "Processing connections...",
      emoji: "🔗",
      duration: 1500
    },
    {
      text: "Calculating insights...",
      emoji: "📊",
      duration: 1500
    },
    {
      text: "Almost ready...",
      emoji: "⚡",
      duration: 1000
    },
    {
      text: "Finalizing...",
      emoji: "✨",
      duration: 1000
    }
  ], []);

  const floatingEmojis = useMemo(() => ["🚀", "💡", "🎯", "📈", "🌟", "🔥", "💫", "🎨", "⭐", "🎪"], []);

  useEffect(() => {
    if (!isVisible) {
      setCurrentStage(0);
      setCurrentEmoji(0);
      return;
    }

    const stageTimer = setTimeout(() => {
      if (currentStage < stages.length - 1) {
        setCurrentStage(prev => prev + 1);
      }
    }, stages[currentStage]?.duration || 2000);

    return () => clearTimeout(stageTimer);
  }, [currentStage, isVisible, stages]);

  useEffect(() => {
    if (!isVisible) return;

    const emojiTimer = setInterval(() => {
      setCurrentEmoji(prev => (prev + 1) % floatingEmojis.length);
    }, 800);

    return () => clearInterval(emojiTimer);
  }, [isVisible, floatingEmojis.length]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      >
        <div className="relative">
          {/* Floating background emojis */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-4xl opacity-20"
              style={{
                left: `${Math.cos((i * Math.PI * 2) / 8) * 200}px`,
                top: `${Math.sin((i * Math.PI * 2) / 8) * 200}px`,
              }}
              animate={{
                y: [0, -20, 0],
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeInOut"
              }}
            >
              {floatingEmojis[currentEmoji]}
            </motion.div>
          ))}

          {/* Main loading card */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="backdrop-blur-xl bg-white/10 border border-white/30 rounded-3xl p-12 shadow-2xl text-center min-w-[400px]"
          >
            {/* Main emoji */}
            <motion.div
              key={currentStage}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="text-8xl mb-8"
            >
              {stages[currentStage]?.emoji}
            </motion.div>

            {/* Progress ring */}
            <div className="relative w-32 h-32 mx-auto mb-8">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="8"
                  fill="none"
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                  animate={{ 
                    strokeDashoffset: 2 * Math.PI * 40 * (1 - (currentStage + 1) / stages.length)
                  }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="50%" stopColor="#EC4899" />
                    <stop offset="100%" stopColor="#06B6D4" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-lg font-bold">
                  {Math.round(((currentStage + 1) / stages.length) * 100)}%
                </span>
              </div>
            </div>

            {/* Loading text */}
            <motion.div
              key={currentStage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <h3 className="text-2xl font-bold text-white">
                {stages[currentStage]?.text}
              </h3>
              
              {/* Animated dots */}
              <div className="flex justify-center space-x-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-white rounded-full"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            </motion.div>

            {/* Fun messages */}
            <motion.div
              className="mt-6 text-gray-300 text-sm"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {currentStage < 2 && "🌟 Gathering your professional insights..."}
              {currentStage >= 2 && currentStage < 4 && "🚀 Building your profile strength..."}
              {currentStage >= 4 && "✨ Almost there! Preparing your dashboard..."}
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LoadingAnimation;