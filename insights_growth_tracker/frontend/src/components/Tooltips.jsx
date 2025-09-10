export const TimelineTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="backdrop-blur-md bg-white/90 dark:bg-gray-800/90 p-4 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-w-xs">
        <p className="font-semibold text-gray-800 dark:text-gray-100 mb-2">
          {data.monthName} — {data.category}
        </p>
        <div className="space-y-1 text-sm">
          <p className="text-blue-600 dark:text-blue-400"><strong>Points:</strong> {data.points}</p>
          <p className="text-green-600 dark:text-green-400"><strong>Type:</strong> {data.type}</p>
          <p className="text-purple-600 dark:text-purple-400"><strong>Engagement:</strong> {data.engagement}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">{data.details}</p>
        </div>
      </div>
    );
  }
  return null;
};

export const RadarTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="backdrop-blur-md bg-white/90 dark:bg-gray-800/90 p-3 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-w-xs">
        <p className="font-semibold text-gray-800 dark:text-gray-100">{data.skill}</p>
        <p className="text-blue-600 dark:text-blue-400 text-sm">Score: {data.value}/100</p>
        <p className="text-green-600 dark:text-green-400 text-sm">Points: {data.actualPoints}/{data.maxPoints}</p>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{data.description}</p>
      </div>
    );
  }
  return null;
};

export const PieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="backdrop-blur-md bg-white/90 dark:bg-gray-800/90 p-3 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-w-xs">
        <p className="font-semibold text-gray-800 dark:text-gray-100">{data.category}</p>
        <div className="space-y-1 text-sm mt-2">
          <p className="text-blue-600 dark:text-blue-400">
            <strong>Points:</strong> {data.points} ({data.percentage}%)
          </p>
          <p className="text-green-600 dark:text-green-400"><strong>Count:</strong> {data.count}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{data.description}</p>
        </div>
      </div>
    );
  }
  return null;
};