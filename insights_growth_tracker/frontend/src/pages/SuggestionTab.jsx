import React, { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ComposedChart, Legend, Treemap } from 'recharts';
import { Trophy, TrendingUp, Users, Award, Calendar, Target, Activity, Star, Zap, BookOpen, Info, Medal, Code2, BookOpen as Certification, Building, GraduationCap, FileText, UserCheck, Brain, GitBranch, ThumbsUp,MessageCircle } from 'lucide-react';
import { DataProcessor } from '../utils/DataProcessor';
import { MetricCard } from '../components/MetricCard';
import { TimelineTooltip, RadarTooltip, PieTooltip } from '../components/Tooltips';
import Particles from '../components/Particles';

// Custom hook for localStorage data
const useLocalStorageData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    try {
      // Get user ID from localStorage
      const storedUserId = localStorage.getItem("linkedin_id");
      setUserId(storedUserId);

      // Get user data from localStorage
      const storedUserData = localStorage.getItem("insight_user_info");
      
      if (storedUserData) {
        const parsedData = JSON.parse(storedUserData);
        // Check if the data has the expected structure
        if (parsedData && parsedData.user_data) {
          setData(parsedData.user_data);
        } else if (parsedData) {
          // If the data is directly the user_data object
          setData(parsedData);
        } else {
          setError('Invalid data format in localStorage');
        }
      } else {
        setError('No user data found in localStorage');
      }
    } catch (err) {
      console.error('Error reading from localStorage:', err);
      setError('Failed to load data from localStorage');
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = () => {
    setLoading(true);
    setError(null);
    
    try {
      const storedUserData = localStorage.getItem("insight_user_info");
      
      if (storedUserData) {
        const parsedData = JSON.parse(storedUserData);
        if (parsedData && parsedData.user_data) {
          setData(parsedData.user_data);
        } else if (parsedData) {
          setData(parsedData);
        } else {
          setError('Invalid data format in localStorage');
        }
      } else {
        setError('No user data found in localStorage');
      }
    } catch (err) {
      console.error('Error reading from localStorage:', err);
      setError('Failed to load data from localStorage');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, userId, refetch };
};





const ChartContainer = ({ title, children, className = "", description, info }) => {
  // Detect theme at render
  const isDark =
    typeof window !== "undefined" &&
    localStorage.getItem("insight_theme") === "dark";

  return (
    <div
      className={`rounded-3xl backdrop-blur-2xl border transition-all duration-300 hover:scale-[1.01] p-6 ${
        isDark 
          ? 'bg-gradient-to-br from-white/5 via-white/[0.02] to-white/5 border-white/10 hover:border-purple-400/20' 
          : 'bg-gradient-to-br from-white/80 via-white/40 to-white/80 border-white/20 hover:border-purple-300/30'
      } shadow-lg ${className}`}
      style={{ fontFamily: "Inter, Roboto, sans-serif" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className={`text-xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </h3>
          {description && (
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{description}</p>
          )}
        </div>
        {info && (
          <div className="group relative">
            <Info
              className={`w-5 h-5 cursor-help transition-colors ${isDark ? 'text-purple-400' : 'text-purple-600'}`}
            />
            <div
              className={`
                absolute right-0 top-6 w-64 p-3 ${
                  isDark ? 'bg-black text-white' : 'bg-white text-gray-900'
                } 
                text-xs rounded-2xl shadow-lg border ${
                  isDark ? 'border-white/10' : 'border-gray-200'
                }
                opacity-0 group-hover:opacity-100 
                transition-opacity duration-300 z-20
              `}
            >
              {info}
            </div>
          </div>
        )}
      </div>

      {/* Chart body */}
      <div className="w-full h-80">
        {children}
      </div>
    </div>
  );
};




const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-12">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    <span className="ml-3 text-gray-600">Loading comprehensive analytics...</span>
  </div>
);

const ErrorMessage = ({ message, onRetry }) => (
  <div className="text-center p-12 border border-red-200 rounded-xl bg-red-50">
    <div className="text-red-600 mb-4">{message}</div>
    <button 
      onClick={onRetry}
      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
    >
      Reload Data
    </button>
    <p className="text-sm text-gray-600 mt-2">
      Make sure you're logged in and data has been fetched from the backend
    </p>
  </div>
);


// Main Dashboard Component
const SuggestionTab = () => {
  const { data, loading, error, userId, refetch } = useLocalStorageData();
  const [selectedView, setSelectedView] = useState('overview');

  // apply theme on the current page load
  const darkMode = (typeof window !== 'undefined' && localStorage.getItem("insight_theme") === "dark");
  useEffect(() => {
    document.body.style.backgroundColor = darkMode ? "rgb(0, 0, 0)" : "rgb(207, 207, 207)";
  }, [darkMode]);
  
  // common theme classes
  const containerBg = darkMode ? 'bg-black text-gray-100' : 'bg-white text-gray-900';
  const cardBg = darkMode ? 'bg-black' : 'bg-white';
  const borderClass = darkMode ? 'border-gray-800' : 'border-gray-200';
  const mutedText = darkMode ? 'text-gray-400' : 'text-gray-600';
  const headerGradient = darkMode ? 'bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400' : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600';
  const tableHeaderBg = darkMode ? 'bg-black' : 'bg-gray-50';

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;
  if (!data || !data.post_to_no) return <ErrorMessage message="No valid data available in localStorage" onRetry={refetch} />;

  // Process all data
  const timelineData = DataProcessor.processTimelineData(data);
  const metricsOverview = DataProcessor.processAllMetricsOverview(data);
  const radarData = DataProcessor.processPerformanceRadar(data);
  const pointsDistribution = DataProcessor.processPointsDistribution(data);
  const detailedMetrics = DataProcessor.processDetailedMetrics(data);
  const engagementData = DataProcessor.processEngagementData(data);
  const overallScore = DataProcessor.calculateOverallScore(data);

  // Calculate summary statistics
  const totalMetrics = Object.values(data.post_to_no).reduce((sum, items) => sum + (Array.isArray(items) ? items.length : 0), 0);
  const totalEngagement = engagementData.reduce((sum, item) => sum + item.total, 0);
  const avgEngagement = engagementData.length > 0 ? (totalEngagement / engagementData.length).toFixed(0) : 0;

  return (
  <div className="min-h-screen font-['Inter'] relative overflow-hidden bg-black">
      {/* Fixed Particles Background - covering entire page */}
      <div className="fixed inset-0 w-full h-full z-0">
        <Particles
          particleColors={['#ffffff', '#ffffff', '#ffffff']}
          particleCount={300}
          particleSpread={15}
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
    
    {/* Main Content */}
    <div className="relative z-10 pt-20 pb-16">
      <div className={`max-w-7xl mx-auto p-6 space-y-12 ${containerBg} font-['Roboto']`}>
      {/* Enhanced Header */}
      <section className="px-8 mb-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 mt-10">
            <div className="inline-flex items-center gap-4 mb-6">
              <div className={`p-4 rounded-3xl ${
                darkMode 
                  ? 'bg-gradient-to-r from-cyan-600/20 to-purple-600/20 border border-cyan-500/30' 
                  : 'bg-gradient-to-r from-cyan-100 to-purple-100 border border-cyan-200'
              } backdrop-blur-xl`}>
                <Activity className={`${darkMode ? "text-cyan-400" : "text-cyan-600"}`} size={36} />
              </div>
            </div>
            <h1 className={`text-6xl font-black mb-6 ${
              darkMode 
                ? 'bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400' 
                : 'bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600'
            } bg-clip-text text-transparent`}>
              Analytics
            </h1>
            <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto mb-6`}>
              Performance insights for{' '}
              <span className={`font-semibold ${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`}>{userId || 'User'}</span>
            </p>
            <div className={`w-32 h-1 mx-auto mt-6 ${
              darkMode 
                ? 'bg-gradient-to-r from-cyan-400 to-purple-400' 
                : 'bg-gradient-to-r from-cyan-600 to-purple-600'
            } rounded-full mb-8`}></div>
            
            {/* Grade and Stats */}
            <div className="flex justify-center items-center space-x-4 mb-6">
              <div
                className={`px-4 py-2 rounded-2xl text-sm font-semibold shadow-lg
                  ${
                    overallScore.grade === 'A+'
                      ? (darkMode ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-700')
                      : overallScore.grade.startsWith('A')
                      ? (darkMode ? 'bg-cyan-500/20 text-cyan-300' : 'bg-cyan-100 text-cyan-700')
                      : (darkMode ? 'bg-yellow-500/20 text-yellow-300' : 'bg-yellow-100 text-yellow-700')
                  }`}
              >
                Grade: {overallScore.grade}
              </div>
              <div className={`px-4 py-2 rounded-2xl text-sm font-semibold shadow-lg ${
                darkMode ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700'
              }`}>
                {overallScore.percentage}% Complete
              </div>
            </div>
            
            <div className="flex justify-center space-x-8 text-sm">
              <span className={`flex items-center transition-colors ${
                darkMode ? 'text-gray-400 hover:text-cyan-300' : 'text-gray-600 hover:text-cyan-700'
              }`}>
                <Trophy className={`w-4 h-4 mr-1 ${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`} />
                {overallScore.totalPoints} Total Points
              </span>
              <span className={`flex items-center transition-colors ${
                darkMode ? 'text-gray-400 hover:text-green-300' : 'text-gray-600 hover:text-green-700'
              }`}>
                <Activity className={`w-4 h-4 mr-1 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                {totalMetrics} Achievements
              </span>
              <span className={`flex items-center transition-colors ${
                darkMode ? 'text-gray-400 hover:text-pink-300' : 'text-gray-600 hover:text-pink-700'
              }`}>
                <Users className={`w-4 h-4 mr-1 ${darkMode ? 'text-pink-400' : 'text-pink-600'}`} />
                {totalEngagement} Total Engagement
              </span>
            </div>
          </div>
        </div>
      </section>

    {/* Metrics Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      <MetricCard
        icon={Trophy}
        title="Overall Score"
        value={`${overallScore.totalPoints}/${overallScore.maxPossiblePoints}`}
        subtitle="Total achievement points"
        color="cyan"
        additionalInfo={`${overallScore.percentage}% of maximum possible score`}
      />
      <MetricCard
        icon={Award}
        title="Grade"
        value={overallScore.grade}
        subtitle="Performance grade"
        color="violet"
        additionalInfo="Based on comprehensive evaluation"
      />
      <MetricCard
        icon={Target}
        title="Categories"
        value={metricsOverview.length}
        subtitle="Active metric categories"
        color="violet"
        additionalInfo={`${totalMetrics} total achievements`}
      />
      <MetricCard
        icon={Activity}
        title="Avg Engagement"
        value={avgEngagement}
        subtitle="Per achievement post"
        color="pink"
        additionalInfo={`${totalEngagement} total interactions`}
      />
    </div>

    {/* Metrics Overview Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {metricsOverview.map((metric, index) => (
        <div
          key={index}
          className={`rounded-3xl backdrop-blur-2xl border transition-all duration-300 hover:scale-[1.02] p-5 ${
            darkMode 
              ? 'bg-gradient-to-br from-white/5 via-white/[0.02] to-white/5 border-white/10 hover:border-cyan-400/20' 
              : 'bg-gradient-to-br from-white/80 via-white/40 to-white/80 border-white/20 hover:border-cyan-300/30'
          } shadow-lg`}
        >
           <div className="flex items-center justify-between mb-3">
             <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{metric.metric}</h4>
             <div
               className="w-3 h-3 rounded-full"
               style={{ backgroundColor: metric.color }}
             ></div>
           </div>
           <div className="grid grid-cols-3 gap-2 text-sm">
             <div>
               <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Points</p>
               <p className={`font-bold text-lg ${darkMode ? 'text-cyan-300' : 'text-cyan-600'}`}>
                 {metric.totalPoints}
               </p>
             </div>
             <div>
               <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Count</p>
               <p className={`font-bold text-lg ${darkMode ? 'text-green-300' : 'text-green-600'}`}>{metric.count}</p>
             </div>
             <div>
               <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Avg</p>
               <p className={`font-bold text-lg ${darkMode ? 'text-pink-300' : 'text-pink-600'}`}>
                 {metric.avgPoints}
               </p>
             </div>
           </div>
         </div>
      ))}
    </div>

    {/* Charts Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Timeline Performance */}
      {timelineData.length > 0 && (
        <ChartContainer
          title="Achievement Timeline"
          description="Chronological progression of achievements"
          info="Shows points earned over time across different categories."
          className={`${cardBg} rounded-2xl shadow-lg hover:shadow-cyan-500/30 transition`}
        >
          {timelineData && timelineData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e5e7eb"} />
                <XAxis dataKey="monthName" tick={{ fill: '#9ca3af' }} />
                <YAxis tick={{ fill: '#9ca3af' }} />
                <Tooltip content={<TimelineTooltip />} />
                  <Area type="monotone" dataKey="points" stroke={darkMode ? "#22d3ee" : "#0891b2"} fill={darkMode ? "#22d3ee" : "#0891b2"} fillOpacity={0.12} name="Points" />
                  <Area type="monotone" dataKey="engagement" stroke={darkMode ? "#a78bfa" : "#7c3aed"} fill={darkMode ? "#a78bfa" : "#7c3aed"} fillOpacity={0.08} name="Engagement" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">No timeline data available</div>
          )}
         </ChartContainer>
       )}
 
       {/* Performance Radar */}
       <ChartContainer
         title="Multi-Dimensional Skills Assessment"
         description="Comprehensive evaluation across all skill areas"
         info="Radar chart showing performance across different dimensions."
         className={`${cardBg} rounded-2xl shadow-lg hover:shadow-purple-500/30 transition`}
       >
        {radarData && radarData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid stroke={darkMode ? "#374151" : "#e5e7eb"} />
              <PolarAngleAxis dataKey="skill" tick={{ fill: '#9ca3af' }} />
              <PolarRadiusAxis angle={30} tick={{ fill: '#9ca3af' }} />
              <Radar name="Score" dataKey="value" stroke={darkMode ? "#a78bfa" : "#8b5cf6"} fill={darkMode ? "#a78bfa" : "#8b5cf6"} fillOpacity={0.6} />
              <Legend wrapperStyle={{ color: '#9ca3af' }} />
              <Tooltip content={<RadarTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">No radar data available</div>
        )}
       </ChartContainer>
 
       {/* Points Distribution */}
       <ChartContainer
         title="Points Distribution by Category"
         description="Breakdown of total points across achievement types"
         info="Shows how points are distributed across categories."
         className={`${cardBg} rounded-2xl shadow-lg hover:shadow-pink-500/30 transition`}
       >
        {pointsDistribution && pointsDistribution.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<PieTooltip />} />
              <Legend wrapperStyle={{ color: '#9ca3af' }} />
              <Pie
                data={pointsDistribution}
                dataKey="points"
                nameKey="category"
                innerRadius={40}
                outerRadius={90}
                paddingAngle={4}
                label={(entry) => `${entry.category}: ${entry.points}`}
              >
                {pointsDistribution.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={entry.fill || (darkMode ? ['#22d3ee','#a78bfa','#f472b6','#fbbf24'] : ['#0891b2','#7c3aed','#ec4899','#d97706'])[idx % 4]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">No distribution data available</div>
        )}
       </ChartContainer>
 
       {/* Engagement Analysis */}
       {engagementData.length > 0 && (
         <ChartContainer
           title="Community Engagement Analysis"
           description="Social interaction metrics for achievements"
           info="Shows reactions and comments on LinkedIn posts."
           className={`${cardBg} rounded-2xl shadow-lg hover:shadow-green-500/30 transition`}
         >
          {engagementData && engagementData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e5e7eb"} />
              
                <YAxis tick={{ fill: '#9ca3af' }} />
                <Tooltip contentStyle={{ backgroundColor: '#111', border: 'none' }} />
                <Legend wrapperStyle={{ color: '#9ca3af' }} />
                <Bar dataKey="total" name="Engagement" fill={darkMode ? "#cde0d9ff" : "#10b981"} />
                <Bar dataKey="comments" name="Comments" fill={darkMode ? "#22d3ee" : "#0891b2"} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">No engagement data available</div>
          )}
         </ChartContainer>
       )}
    </div>

    {/* Detailed Metrics Table */}
    <ChartContainer
      title="Detailed Achievement Breakdown"
      description="Complete list of all achievements with points and engagement"
      className={`col-span-full ${cardBg} rounded-2xl shadow-lg hover:shadow-cyan-500/30 transition`}
    >
      <div className="overflow-x-auto max-h-80 overflow-y-auto hide-scrollbar">
  <table className="w-full text-sm">
    <thead className={`sticky top-0 ${tableHeaderBg}`}>
      <tr>
        <th className="px-4 py-3 text-left font-semibold text-gray-400">Category</th>
        <th className="px-4 py-3 text-left font-semibold text-gray-400">Description</th>
        <th className="px-4 py-3 text-center font-semibold text-gray-400">Points</th>
        <th className="px-4 py-3 text-center font-semibold text-gray-400">Engagement</th>
        <th className="px-4 py-3 text-center font-semibold text-gray-400">Date</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-700">
      {detailedMetrics.map((metric, index) => (
        <tr key={metric.id} className={darkMode ? "hover:bg-white/5" : "hover:bg-gray-50"}>
          <td className="px-4 py-3">
            <div className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: DataProcessor.getColorForMetric(metric.metricType) }}
              ></div>
              <span className="font-medium text-gray-100">{metric.category}</span>
            </div>
          </td>
          <td className="px-4 py-3 text-gray-400">
            {metric.description.length > 50 
              ? `${metric.description.substring(0, 50)}...` 
              : metric.description
            }
          </td>
          <td className="px-4 py-3 text-center">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-300">
              {metric.points}
            </span>
          </td>
          <td className="px-4 py-3 text-center">
            {metric.engagement > 0 ? (
              <div className="flex items-center justify-center space-x-1">
                <span className="text-green-400"><ThumbsUp/> {metric.reactions}</span>
                <span className="text-yellow-400"><MessageCircle/> {metric.comments}</span>
              </div>
            ) : (
              <span className="text-gray-400">-</span>
            )}
          </td>
          <td className="px-4 py-3 text-center text-gray-400">
            {metric.timestamp || 'N/A'}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
    </ChartContainer>

    {/* Insights & Recommendations */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* AI Insights */}
      <div className={`border ${borderClass} rounded-2xl p-6 ${cardBg} shadow-lg hover:shadow-purple-500/30 transition`}>
        <h3 className="text-lg font-semibold mb-4 text-gray-100 flex items-center">
          <Brain className="w-5 h-5 mr-2 text-purple-400" />
          AI-Powered Insights
        </h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
            <Trophy className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-gray-100 font-medium">Performance Excellence</p>
              <p className="text-sm text-gray-400">
                Achieved {overallScore.totalPoints} points across {totalMetrics} achievements, 
                ranking in the top tier with grade {overallScore.grade}
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <Activity className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-gray-100 font-medium">Community Impact</p>
              <p className="text-sm text-gray-400">
                Generated {totalEngagement} total interactions with an average of {avgEngagement} per post, 
                indicating strong professional network engagement
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
            <TrendingUp className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-gray-100 font-medium">Diverse Skill Portfolio</p>
              <p className="text-sm text-gray-400">
                Active across {metricsOverview.length} different categories, 
                showcasing well-rounded professional development
              </p>
            </div>
          </div>

          {metricsOverview.slice(0, 2).map((metric, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <Star className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-gray-100 font-medium">Strength: {metric.metric}</p>
                <p className="text-sm text-gray-400">
                  Leading category with {metric.totalPoints} points from {metric.count} achievements 
                  (avg: {metric.avgPoints} pts each)
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strategic Recommendations */}
      <div className={`border ${borderClass} rounded-2xl p-6 ${cardBg} shadow-lg hover:shadow-green-500/30 transition`}>
        <h3 className="text-lg font-semibold mb-4 text-gray-100 flex items-center">
          <Target className="w-5 h-5 mr-2 text-green-400" />
          Strategic Recommendations
        </h3>
        <div className="space-y-3">
          {overallScore.percentage < 80 && (
            <div className="p-3 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-lg">
              <p className="text-sm font-medium text-cyan-300">🎯 Optimization Opportunity</p>
              <p className="text-xs text-gray-400 mt-1">
                You're at {overallScore.percentage}% of maximum potential. Focus on underrepresented categories to boost your overall score.
              </p>
            </div>
          )}
          
          {engagementData.length > 0 && avgEngagement > 50 && (
            <div className="p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg">
              <p className="text-sm font-medium text-green-300">📈 Leverage High Engagement</p>
              <p className="text-xs text-gray-400 mt-1">
                Your posts receive {avgEngagement} average interactions. Consider posting more frequently to maximize visibility and network growth.
              </p>
            </div>
          )}
          
          <div className="p-3 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-lg">
            <p className="text-sm font-medium text-indigo-300">🏆 Next Level Strategy</p>
            <p className="text-xs text-gray-400 mt-1">
              Focus on {metricsOverview[metricsOverview.length - 1]?.metric.toLowerCase()} to create a more balanced portfolio and increase overall impact.
            </p>
          </div>

          <div className="p-3 bg-gradient-to-r from-gray-500/10 to-slate-500/10 border border-gray-500/20 rounded-lg">
            <p className="text-sm font-medium text-gray-300">📊 Data-Driven Growth</p>
            <p className="text-xs text-gray-400 mt-1">
              Maintain consistent documentation of achievements to track progress and demonstrate continuous professional development.
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* Summary Statistics Cards */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      <div className="bg-gradient-to-r from-cyan-600/20 to-cyan-700/20 border border-cyan-500/30 rounded-2xl p-6 text-white hover:shadow-lg hover:shadow-cyan-500/20 transition">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-semibold">Completion Rate</h4>
            <p className="text-3xl font-bold mt-2 text-cyan-300">{overallScore.percentage}%</p>
            <p className="text-sm text-gray-400">Of maximum possible score</p>
          </div>
          <Target className="w-12 h-12 text-cyan-400/60" />
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-600/20 to-green-700/20 border border-green-500/30 rounded-2xl p-6 text-white hover:shadow-lg hover:shadow-green-500/20 transition">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-semibold">Active Categories</h4>
            <p className="text-3xl font-bold mt-2 text-green-300">{metricsOverview.length}</p>
            <p className="text-sm text-gray-400">Different skill areas</p>
          </div>
          <BookOpen className="w-12 h-12 text-green-400/60" />
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-600/20 to-purple-700/20 border border-purple-500/30 rounded-2xl p-6 text-white hover:shadow-lg hover:shadow-purple-500/20 transition">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-semibold">Total Achievements</h4>
            <p className="text-3xl font-bold mt-2 text-purple-300">{totalMetrics}</p>
            <p className="text-sm text-gray-400">Verified accomplishments</p>
          </div>
          <Award className="w-12 h-12 text-purple-400/60" />
        </div>
      </div>

      <div className="bg-gradient-to-r from-pink-600/20 to-pink-700/20 border border-pink-500/30 rounded-2xl p-6 text-white hover:shadow-lg hover:shadow-pink-500/20 transition">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-semibold">Network Impact</h4>
            <p className="text-3xl font-bold mt-2 text-pink-300">{totalEngagement}</p>
            <p className="text-sm text-gray-400">Total interactions</p>
          </div>
          <Users className="w-12 h-12 text-pink-400/60" />
        </div>
      </div>
    </div>

    {/* Footer */}
    <div className={`text-center py-8 border-t ${darkMode ? 'border-gray-800 text-gray-400' : 'border-gray-200 text-gray-600'} text-sm`}>
      Analytics generated on {new Date().toLocaleDateString()} • Based on {totalMetrics} achievements across {metricsOverview.length} categories
      <p className="text-xs mt-2">
        Scores calculated using industry-standard placement matrix
      </p>
      <p className="text-gray-600 text-xs mt-1">
        Data loaded from localStorage • Last updated when you logged in
      </p>
    </div>
      </div>
    </div>
  </div>
 );
 
 };
 
 export default SuggestionTab;