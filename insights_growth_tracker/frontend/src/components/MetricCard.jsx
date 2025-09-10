export const MetricCard = ({ icon: Icon, title, value, subtitle, trend, color, additionalInfo }) => {
  const colorClasses = {
    blue: 'from-blue-500/20 to-blue-500/5 text-blue-600 dark:text-blue-400',
    green: 'from-green-500/20 to-green-500/5 text-green-600 dark:text-green-400',
    yellow: 'from-yellow-500/20 to-yellow-500/5 text-yellow-600 dark:text-yellow-400',
    purple: 'from-purple-500/20 to-purple-500/5 text-purple-600 dark:text-purple-400',
    red: 'from-red-500/20 to-red-500/5 text-red-600 dark:text-red-400',
    indigo: 'from-indigo-500/20 to-indigo-500/5 text-indigo-600 dark:text-indigo-400'
  };

  return (
    <div className={`rounded-2xl p-6 bg-gradient-to-br ${colorClasses[color]} shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:scale-[1.03] transition-all duration-300`}>
      <div className="flex items-center justify-between mb-4">
        <Icon className="w-8 h-8" />
        {trend !== undefined && (
          <div className={`flex items-center text-sm font-medium ${trend > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            <TrendingUp className={`w-4 h-4 mr-1 ${trend < 0 ? 'rotate-180' : ''}`} />
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <h3 className="text-3xl font-bold mb-1 text-gray-900 dark:text-gray-100">{value}</h3>
        <p className="font-medium text-gray-700 dark:text-gray-300">{title}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>
        {additionalInfo && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{additionalInfo}</p>
        )}
      </div>
    </div>
  );
};