import {React,useState } from "react";  
import { ChevronDown } from "lucide-react";

export const Resumestats_card = ({darkMode,resumeData}) => {


  /* for resume section */
  const [expandedResumeSection, setExpandedResumeSection] = useState(null);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [showAllExperience, setShowAllExperience] = useState(false);    

// Resume Analytics
const totalProjects = resumeData?.data?.projects?.length || 0;
const totalWorkExperience = resumeData?.data?.work_experience?.length || 0;
const totalAwards = resumeData?.data?.awards_and_recognitions?.length || 0;
const currentCGPA = resumeData?.data?.education?.[0]?.gpa || 'N/A';













  return (
    <section className="relative py-24 px-8 overflow-hidden pt-8">
  {/* Same glassmorphism background */}
  <div className={`absolute inset-4 rounded-3xl backdrop-blur-md border shadow-2xl ${
    darkMode 
      ? 'bg-white/[0.02] border-white/5 shadow-black/20' 
      : 'bg-black/[0.02] border-black/5 shadow-black/10'
  }`}></div>

  <div className="relative z-10 max-w-7xl mx-auto">
    {/* Resume Header */}
    <div className="text-center mb-16">
      <h2 className={`text-5xl font-black mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        Resume
        <span className={`block text-6xl ${darkMode ? 'bg-gradient-to-r from-orange-400 to-red-400' : 'bg-gradient-to-r from-orange-600 to-red-600'} bg-clip-text text-transparent`}>
          Overview
        </span>
      </h2>
    </div>

    {/* Resume Stats Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      <div className={`rounded-3xl p-6 ${darkMode ? 'bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20' : 'bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200'} backdrop-blur-xl`}>
        <div className={`text-3xl font-black mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{currentCGPA}</div>
        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Current CGPA</div>
      </div>
      
      <div className={`rounded-3xl p-6 ${darkMode ? 'bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20' : 'bg-gradient-to-br from-red-50 to-red-100 border border-red-200'} backdrop-blur-xl`}>
        <div className={`text-3xl font-black mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{totalWorkExperience}</div>
        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Work Experiences</div>
      </div>
      
      <div className={`rounded-3xl p-6 ${darkMode ? 'bg-gradient-to-br from-pink-500/10 to-pink-600/5 border border-pink-500/20' : 'bg-gradient-to-br from-pink-50 to-pink-100 border border-pink-200'} backdrop-blur-xl`}>
        <div className={`text-3xl font-black mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{totalProjects}</div>
        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Projects</div>
      </div>
      
      <div className={`rounded-3xl p-6 ${darkMode ? 'bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 border border-indigo-500/20' : 'bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200'} backdrop-blur-xl`}>
        <div className={`text-3xl font-black mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{totalAwards}</div>
        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Awards & Recognition</div>
      </div>
    </div>

    {/* Skills Overview */}
    <div className={`rounded-3xl p-8 mb-12 ${darkMode ? 'bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10' : 'bg-gradient-to-br from-black/[0.02] to-black/[0.08] border border-black/10'} backdrop-blur-xl`}>
      <h3 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Technical Skills</h3>
      <div className="flex flex-wrap gap-3">
        {resumeData?.data?.skills?.technical?.slice(0, 12).map((skill, index) => (
          <span key={skill} className={`px-4 py-2 rounded-xl text-sm font-medium ${darkMode ? 'bg-gradient-to-r from-indigo-600/30 to-purple-600/30 text-indigo-300' : 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700'}`}>
            {skill}
          </span>
        ))}
      </div>
    </div>

    {/* Work Experience Section */}
    <div className={`rounded-3xl p-8 mb-12 ${darkMode ? 'bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10' : 'bg-gradient-to-br from-black/[0.02] to-black/[0.08] border border-black/10'} backdrop-blur-xl`}>
      <div className="flex items-center justify-between mb-8">
        <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Work Experience ({totalWorkExperience})
        </h3>
        {resumeData?.data?.work_experience?.length > 2 && (
          <button
            onClick={() => setShowAllExperience(!showAllExperience)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:scale-105 ${
              darkMode 
                ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white hover:shadow-lg hover:shadow-red-500/30' 
                : 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:shadow-lg hover:shadow-red-200/50'
            }`}
          >
            {showAllExperience ? 'Show Less' : 'Show All'}
            <ChevronDown 
              size={18} 
              className={`transform transition-transform ${showAllExperience ? 'rotate-180' : ''}`}
            />
          </button>
        )}
      </div>

      <div className="space-y-6">
        {(showAllExperience ? resumeData?.data?.work_experience : resumeData?.data?.work_experience?.slice(0, 2))?.map((exp, index) => (
          <div
            key={index}
            className={`p-6 rounded-2xl border transition-all duration-300 hover:scale-[1.02] ${
              darkMode 
                ? 'bg-gradient-to-br from-white/[0.03] to-white/[0.01] border-white/10 hover:border-red-400/30' 
                : 'bg-gradient-to-br from-white/80 to-white/60 border-white/20 hover:border-red-300/50'
            } backdrop-blur-sm`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h4 className={`font-bold text-lg mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {exp.title}
                </h4>
                <p className={`font-semibold mb-2 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                  {exp.company}
                </p>
                <div className={`flex items-center gap-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <span>{exp.start_date} - {exp.end_date}</span>
                  <span>{exp.location}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              {exp.responsibilities?.slice(0, 2).map((resp, respIndex) => (
                <div key={respIndex} className={`flex items-start gap-3 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${darkMode ? 'bg-red-400' : 'bg-red-500'}`}></div>
                  <p>{resp}</p>
                </div>
              ))}
              {exp.responsibilities?.length > 2 && (
                <button
                  onClick={() => setExpandedResumeSection(expandedResumeSection === `exp-${index}` ? null : `exp-${index}`)}
                  className={`flex items-center gap-2 text-sm font-medium mt-3 ${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'} transition-colors`}
                >
                  {expandedResumeSection === `exp-${index}` ? 'Show Less' : `Show ${exp.responsibilities.length - 2} More`}
                  <ChevronDown 
                    size={14} 
                    className={`transform transition-transform ${expandedResumeSection === `exp-${index}` ? 'rotate-180' : ''}`}
                  />
                </button>
              )}
              
              {expandedResumeSection === `exp-${index}` && (
                <div className="space-y-2 mt-4">
                  {exp.responsibilities?.slice(2).map((resp, respIndex) => (
                    <div key={respIndex + 2} className={`flex items-start gap-3 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${darkMode ? 'bg-red-400' : 'bg-red-500'}`}></div>
                      <p>{resp}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Projects Section */}
    <div className={`rounded-3xl p-8 mb-12 ${darkMode ? 'bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10' : 'bg-gradient-to-br from-black/[0.02] to-black/[0.08] border border-black/10'} backdrop-blur-xl`}>
      <div className="flex items-center justify-between mb-8">
        <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Projects ({totalProjects})
        </h3>
        {resumeData?.data?.projects?.length > 2 && (
          <button
            onClick={() => setShowAllProjects(!showAllProjects)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:scale-105 ${
              darkMode 
                ? 'bg-gradient-to-r from-pink-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-pink-500/30' 
                : 'bg-gradient-to-r from-pink-500 to-indigo-500 text-white hover:shadow-lg hover:shadow-pink-200/50'
            }`}
          >
            {showAllProjects ? 'Show Less' : 'Show All'}
            <ChevronDown 
              size={18} 
              className={`transform transition-transform ${showAllProjects ? 'rotate-180' : ''}`}
            />
          </button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {(showAllProjects ? resumeData?.data?.projects : resumeData?.data?.projects?.slice(0, 2))?.map((project, index) => (
          <div
            key={index}
            className={`p-6 rounded-2xl border transition-all duration-300 hover:scale-[1.02] ${
              darkMode 
                ? 'bg-gradient-to-br from-white/[0.03] to-white/[0.01] border-white/10 hover:border-pink-400/30' 
                : 'bg-gradient-to-br from-white/80 to-white/60 border-white/20 hover:border-pink-300/50'
            } backdrop-blur-sm`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h4 className={`font-bold text-lg mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {project.title}
                </h4>
                {project.role && (
                  <p className={`text-sm font-medium mb-3 ${darkMode ? 'text-pink-400' : 'text-pink-600'}`}>
                    Role: {project.role}
                  </p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
            {Array.isArray(project.description) 
            ? project.description.slice(0, 2).map((desc, descIndex) => (
                <div key={descIndex} className={`flex items-start gap-3 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${darkMode ? 'bg-pink-400' : 'bg-pink-500'}`}></div>
                    <p>{desc}</p>
                </div>
                ))
            : project.description && (
                <div className={`flex items-start gap-3 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${darkMode ? 'bg-pink-400' : 'bg-pink-500'}`}></div>
                    <p>{project.description}</p>
                </div>
                )
            }

              {project.description?.length > 2 && (
                <button
                  onClick={() => setExpandedResumeSection(expandedResumeSection === `proj-${index}` ? null : `proj-${index}`)}
                  className={`flex items-center gap-2 text-sm font-medium mt-3 ${darkMode ? 'text-pink-400 hover:text-pink-300' : 'text-pink-600 hover:text-pink-700'} transition-colors`}
                >
                  {expandedResumeSection === `proj-${index}` ? 'Show Less' : `Show ${project.description.length - 2} More`}
                  <ChevronDown 
                    size={14} 
                    className={`transform transition-transform ${expandedResumeSection === `proj-${index}` ? 'rotate-180' : ''}`}
                  />
                </button>
              )}
              
                {expandedResumeSection === `proj-${index}` && (
                <div className="space-y-2 mt-4">
                    {Array.isArray(project.description) 
                    ? project.description.slice(2).map((desc, descIndex) => (
                        <div key={descIndex + 2} className={`flex items-start gap-3 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${darkMode ? 'bg-pink-400' : 'bg-pink-500'}`}></div>
                            <p>{desc}</p>
                        </div>
                        ))
                    : null
                    }
                </div>
                )}

            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Awards & Recognition */}
    {resumeData?.data?.awards_and_recognitions?.length > 0 && (
      <div className={`rounded-3xl p-8 ${darkMode ? 'bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10' : 'bg-gradient-to-br from-black/[0.02] to-black/[0.08] border border-black/10'} backdrop-blur-xl`}>
        <h3 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Awards & Recognition
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          {resumeData.data.awards_and_recognitions.map((award, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'}`}
            >
              <h4 className={`font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {award.title}
              </h4>
              <p className={`text-sm mb-2 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                {award.issuer} • {award.date}
              </p>
              {award.description && (
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {award.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
</section>

  )
}
