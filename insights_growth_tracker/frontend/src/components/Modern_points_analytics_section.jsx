import React from 'react'
import {  TrendingUp, Award, Trophy } from 'lucide-react';

export const Modern_points_analytics_section = ({darkMode,chartData,totalPoints,avgPointsPerAchievement,totalAchievements}) => {
  return (
    <div>
        <section className="relative py-16 px-4 sm:px-8 overflow-hidden">
            {/* Glassmorphism background container */}
            <div
                className={`absolute inset-4 rounded-3xl backdrop-blur-md border shadow-2xl ${
                darkMode
                    ? "bg-white/[0.02] border-white/5 shadow-black/20"
                    : "bg-black/[0.02] border-black/5 shadow-black/10"
                }`}
            ></div>

            <div className="relative z-10 max-w-7xl mx-auto">
                {/* Dashboard Header */}
                <div className="mb-12 sm:mb-16">
                <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-4">
                    <div className="text-center sm:text-left">
                    <h2
                        className={`text-3xl sm:text-4xl lg:text-6xl font-black mb-3 ${
                        darkMode ? "text-white" : "text-gray-900"
                        }`}
                    >
                        Analytics
                    </h2>
                    <div
                        className={`w-20 sm:w-24 h-1 mx-auto sm:mx-0 ${
                        darkMode
                            ? "bg-gradient-to-r from-emerald-400 to-blue-400"
                            : "bg-gradient-to-r from-emerald-600 to-blue-600"
                        } rounded-full`}
                    ></div>
                    </div>

                    <div
                    className={`px-4 sm:px-6 py-2 sm:py-3 rounded-2xl ${
                        darkMode
                        ? "bg-white/5 border border-white/10"
                        : "bg-black/5 border border-black/10"
                    } backdrop-blur-sm`}
                    >
                    <span
                        className={`text-xs sm:text-sm font-medium ${
                        darkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                    >
                        Performance Overview
                    </span>
                    </div>
                </div>
                </div>

                {/* Dashboard Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 mb-12 sm:mb-16">
                {/* Main Chart */}
                <div className="lg:col-span-8">
                    <div
                    className={`w-full h-auto sm:h-96 rounded-2xl sm:rounded-3xl p-4 sm:p-8 ${
                        darkMode
                        ? "bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10"
                        : "bg-gradient-to-br from-black/[0.02] to-black/[0.08] border border-black/10"
                    } backdrop-blur-xl`}
                    >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-2">
                        <h3
                        className={`text-lg sm:text-xl font-bold ${
                            darkMode ? "text-white" : "text-gray-900"
                        }`}
                        >
                        Achievement Distribution
                        </h3>
                        <div
                        className={`flex items-center gap-2 text-xs sm:text-sm ${
                            darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                        >
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <span>Active</span>
                        </div>
                    </div>

                    {/* Horizontal Bar Chart */}
                    {chartData.length > 0 && (
                        <div className="space-y-4">
                        {chartData.slice(0, 6).map((item, index) => (
                            <div key={index} className="group">
                            <div className="flex items-center justify-between mb-1 sm:mb-2">
                                <span
                                className={`text-xs sm:text-sm font-medium ${
                                    darkMode ? "text-gray-300" : "text-gray-700"
                                }`}
                                >
                                {item.category.length > 15
                                    ? item.category.substring(0, 15) + "..."
                                    : item.category}
                                </span>
                                <span
                                className={`text-xs sm:text-sm font-bold ${
                                    darkMode ? "text-emerald-400" : "text-emerald-600"
                                }`}
                                >
                                {item.points}pts
                                </span>
                            </div>
                            <div
                                className={`w-full h-2 sm:h-3 rounded-full ${
                                darkMode ? "bg-white/5" : "bg-black/5"
                                } overflow-hidden`}
                            >
                                <div
                                className={`h-full rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 transition-all duration-1000 ease-out group-hover:shadow-lg group-hover:shadow-emerald-500/30`}
                                style={{
                                    width: `${Math.min(
                                    (item.points /
                                        Math.max(...chartData.map((d) => d.points), 1)) *
                                        100,
                                    100
                                    )}%`,
                                    animationDelay: `${index * 200}ms`,
                                }}
                                ></div>
                            </div>
                            </div>
                        ))}
                        </div>
                    )}
                    </div>
                </div>

                {/* Sidebar Stats */}
                <div className="lg:col-span-4 space-y-4 sm:space-y-6">
                    {/* Total Points */}
                    <div
                    className={`rounded-2xl sm:rounded-3xl p-4 sm:p-6 ${
                        darkMode
                        ? "bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20"
                        : "bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200"
                    } backdrop-blur-xl`}
                    >
                    <div className="flex items-center justify-between mb-2 sm:mb-4">
                        <TrendingUp
                        className={`${
                            darkMode ? "text-emerald-400" : "text-emerald-600"
                        }`}
                        size={20}
                        />
                        <span
                        className={`text-[10px] sm:text-xs font-medium px-2 py-1 rounded-full ${
                            darkMode
                            ? "bg-emerald-400/20 text-emerald-300"
                            : "bg-emerald-200 text-emerald-800"
                        }`}
                        >
                        +12%
                        </span>
                    </div>
                    <div
                        className={`text-2xl sm:text-3xl font-black mb-1 ${
                        darkMode ? "text-white" : "text-gray-900"
                        }`}
                    >
                        {totalPoints}
                    </div>
                    <div
                        className={`text-xs sm:text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                    >
                        Total Points Earned
                    </div>
                    </div>

                    {/* Average per Achievement */}
                    <div
                    className={`rounded-2xl sm:rounded-3xl p-4 sm:p-6 ${
                        darkMode
                        ? "bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20"
                        : "bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200"
                    } backdrop-blur-xl`}
                    >
                    <div className="flex items-center justify-between mb-2 sm:mb-4">
                        <Award
                        className={`${darkMode ? "text-blue-400" : "text-blue-600"}`}
                        size={20}
                        />
                        <span
                        className={`text-[10px] sm:text-xs font-medium px-2 py-1 rounded-full ${
                            darkMode
                            ? "bg-blue-400/20 text-blue-300"
                            : "bg-blue-200 text-blue-800"
                        }`}
                        >
                        AVG
                        </span>
                    </div>
                    <div
                        className={`text-2xl sm:text-3xl font-black mb-1 ${
                        darkMode ? "text-white" : "text-gray-900"
                        }`}
                    >
                        {avgPointsPerAchievement}
                    </div>
                    <div
                        className={`text-xs sm:text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                    >
                        Average per Achievement
                    </div>
                    </div>

                    {/* Total Achievements */}
                    <div
                    className={`rounded-2xl sm:rounded-3xl p-4 sm:p-6 ${
                        darkMode
                        ? "bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20"
                        : "bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200"
                    } backdrop-blur-xl`}
                    >
                    <div className="flex items-center justify-between mb-2 sm:mb-4">
                        <Trophy
                        className={`${darkMode ? "text-purple-400" : "text-purple-600"}`}
                        size={20}
                        />
                        <span
                        className={`text-[10px] sm:text-xs font-medium px-2 py-1 rounded-full ${
                            darkMode
                            ? "bg-purple-400/20 text-purple-300"
                            : "bg-purple-200 text-purple-800"
                        }`}
                        >
                        TOTAL
                        </span>
                    </div>
                    <div
                        className={`text-2xl sm:text-3xl font-black mb-1 ${
                        darkMode ? "text-white" : "text-gray-900"
                        }`}
                    >
                        {totalAchievements}
                    </div>
                    <div
                        className={`text-xs sm:text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                    >
                        Achievements Unlocked
                    </div>
                    </div>
                </div>
                </div>
            </div>
            </section>

    </div>
  )
}
