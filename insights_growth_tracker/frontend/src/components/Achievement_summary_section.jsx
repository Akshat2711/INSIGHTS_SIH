import React from 'react'

export const Achievement_summary_section = ({darkMode,eventCategories}) => {
  return (
    <div>
              <section className="relative py-24 px-8 overflow-hidden pt-8">
        {/* Glassmorphism background container */}
        <div className={`absolute inset-4 rounded-3xl backdrop-blur-md border shadow-2xl ${
          darkMode 
            ? 'bg-white/[0.02] border-white/5 shadow-black/20' 
            : 'bg-black/[0.02] border-black/5 shadow-black/10'
        }`}></div>


        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className={`text-5xl font-black mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Achievement
              <span className={`block text-6xl ${darkMode ? 'bg-gradient-to-r from-purple-400 to-pink-400' : 'bg-gradient-to-r from-purple-600 to-pink-600'} bg-clip-text text-transparent`}>
                Summary
              </span>
            </h2>
            <div className={`w-32 h-1 mx-auto ${darkMode ? 'bg-gradient-to-r from-purple-400 to-pink-400' : 'bg-gradient-to-r from-purple-600 to-pink-600'} rounded-full`}></div>
          </div>

          {/* Masonry-style Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {eventCategories.map((category, index) => {
              const Icon = category.icon;
              const isSpecial = category.displayType === 'summary';
              return (
                <div
                  key={category.name}
                  className={`${isSpecial ? 'md:col-span-2 lg:col-span-1' : ''} rounded-3xl p-6 transition-all duration-700 hover:scale-105 hover:-translate-y-2 ${
                    darkMode 
                      ? 'bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 hover:border-purple-400/30' 
                      : 'bg-gradient-to-br from-white/90 to-white/60 border border-white/20 hover:border-purple-300/50'
                  } backdrop-blur-xl group cursor-pointer`}
                  style={{
                    animationDelay: `${index * 150}ms`,
                    animation: 'fadeInUp 0.8s ease-out forwards'
                  }}
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className={`p-3 rounded-2xl ${
                      darkMode 
                        ? 'bg-gradient-to-br from-purple-600/20 to-pink-600/20' 
                        : 'bg-gradient-to-br from-purple-100 to-pink-100'
                    } group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`${darkMode ? 'text-purple-400' : 'text-purple-600'}`} size={24} />
                    </div>
                    {!isSpecial && (
                      <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                        darkMode 
                          ? 'bg-purple-500/20 text-purple-300' 
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {category.points}pts
                      </div>
                    )}
                  </div>

                  {/* Category Name */}
                  <h3 className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'} group-hover:text-transparent group-hover:bg-gradient-to-r ${darkMode ? 'group-hover:from-purple-400 group-hover:to-pink-400' : 'group-hover:from-purple-600 group-hover:to-pink-600'} group-hover:bg-clip-text transition-all duration-300`}>
                    {category.name}
                  </h3>

                  {/* Count Display */}
                  <div className="flex items-end justify-between">
                    <div className={`text-4xl font-black ${darkMode ? 'text-white' : 'text-gray-900'} group-hover:scale-110 transition-transform duration-300`}>
                      {category.count}
                    </div>
                    <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} text-right`}>
                      {category.displayType === 'value' ? 'Current CGPA' :
                       category.displayType === 'summary' ? 'Total Score' : 'Achievements'}
                    </div>
                  </div>

                  {/* Progress Indicator */}
                  {!isSpecial && category.displayType !== 'value' && (
                    <div className="mt-4">
                      <div className={`w-full h-2 rounded-full ${darkMode ? 'bg-white/10' : 'bg-black/10'}`}>
                        <div 
                          className={`h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000 ease-out`}
                          style={{ 
                            width: `${Math.min((category.points / Math.max(...eventCategories.filter(c => c.displayType !== 'value' && c.displayType !== 'summary').map(c => c.points), 1)) * 100, 100)}%`,
                            animationDelay: `${index * 100 + 500}ms`
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  )
}
