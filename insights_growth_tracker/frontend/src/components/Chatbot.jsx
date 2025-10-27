import React, { useState } from "react";
import { Send, Bot, X } from "lucide-react";

import { GoogleGenerativeAI } from "@google/generative-ai";

const ChatBot = ({ user_data = null, theme_card_color = "pink" }) => {
  // Color map to dynamically set Tailwind classes based on the theme_card_color prop.
  const colorMap = {
    pink: {
      primary: "pink",
      secondary: "cyan",
    },
    blue: {
      primary: "blue",
      secondary: "sky",
    },
    green: {
      primary: "green",
      secondary: "emerald",
    },
    purple: {
      primary: "purple",
      secondary: "indigo",
    },
    yellow: {
      primary: "yellow",
      secondary: "orange",
    },
    red: {
      primary: "red",
      secondary: "rose",
    },
  };

  const colors = colorMap[theme_card_color] || colorMap.pink;
  const primaryColor = colors.primary;
  const secondaryColor = colors.secondary;

  // Initialize Google Generative AI
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GENAI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleChat = () => setIsOpen(!isOpen);

  const sendMessage = async () => {
    if (input.trim() === "") return;

    const userMessage = { text: input, user: true };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setLoading(true);

    try {
      const botReply = await fetchAIResponse(currentInput);
      setMessages(prev => [...prev, { text: botReply, user: false }]);
    } catch (error) {
      console.error("Error fetching AI response:", error);
      setMessages(prev => [
        ...prev,
        { text: "Sorry, something went wrong. Please try again.", user: false },
      ]);
    }

    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      sendMessage();
    }
  };

  // Check if data is in simplified mode (only post_to_no and original_scrapping)
  const isSimplifiedMode = user_data && !user_data.resume_data && !user_data.github_data;

  // Enhanced AI response function with optimized context
  const fetchAIResponse = async (userInput) => {
    if (!userInput) return;

    let contextInfo = "";
    
    if (user_data) {
      if (isSimplifiedMode) {
        // Simplified mode - only LinkedIn activity and achievements
        const { post_to_no, total_points, original_scrapping } = user_data;
        
        const queryLower = userInput.toLowerCase();
        const needsAchievements = queryLower.includes('achieve') || queryLower.includes('award') || queryLower.includes('hackathon') || queryLower.includes('win') || queryLower.includes('score') || queryLower.includes('point') || queryLower.includes('certificate') || queryLower.includes('leadership');
        const needsPosts = queryLower.includes('post') || queryLower.includes('linkedin') || queryLower.includes('recent') || queryLower.includes('activity') || queryLower.includes('what') || queryLower.includes('tell');
        
        // Extract name from first post if available
        const userName = original_scrapping?.[0]?.author_name?.split('View: ')?.[1]?.split(' 3rd')?.[0] || "User";
        
        contextInfo = `
PROFILE: ${userName}
Based on LinkedIn Activity & Achievements

TOTAL PLACEMENT SCORE: ${total_points || 0} points
`;

        // Add achievements if relevant or if it's a general query
        if (needsAchievements || (!needsPosts && !needsAchievements)) {
          contextInfo += `
ACHIEVEMENTS BREAKDOWN:

${post_to_no?.hackathon?.length > 0 ? `🏆 HACKATHONS & COMPETITIONS:
${post_to_no.hackathon.map((h, i) => 
  `${i+1}. ${h.position === 'participated' ? 'Participated' : `Position ${h.position}`} (${h.points}pts)
   Event: ${h.source_post_excerpt?.[0]?.substring(0, 100)}...
   When: ${h.timestamp?.join(', ')} ago
   Engagement: ${h.reaction} reactions, ${h.comments} comments
   Scoring: ${h.why}`
).join('\n\n')}` : ''}

${post_to_no?.certification?.length > 0 ? `\n📜 CERTIFICATIONS:
${post_to_no.certification.map((c, i) => 
  `${i+1}. ${c.type || 'Certification'} (${c.points}pt)
   Details: ${c.source_post_excerpt?.[0]?.substring(0, 100)}...
   When: ${c.timestamp?.join(', ')} ago
   Engagement: ${c.reaction} reactions, ${c.comments} comments
   Scoring: ${c.why}`
).join('\n\n')}` : ''}

${post_to_no?.leadership?.length > 0 ? `\n👔 LEADERSHIP ROLES:
${post_to_no.leadership.map((l, i) => 
  `${i+1}. ${l.type || 'Leadership Position'} (${l.points}pts)
   Details: ${l.source_post_excerpt?.[0]?.substring(0, 100)}...
   When: ${l.timestamp?.join(', ')} ago
   Engagement: ${l.reaction} reactions, ${l.comments} comments
   Scoring: ${l.why}`
).join('\n\n')}` : ''}

${post_to_no?.internship?.length > 0 ? `\n💼 INTERNSHIPS:
${post_to_no.internship.map((intern, i) => 
  `${i+1}. ${intern.type || 'Internship'} (${intern.points}pts)
   Details: ${intern.source_post_excerpt?.[0]?.substring(0, 100)}...
   When: ${intern.timestamp?.join(', ')} ago
   Engagement: ${intern.reaction} reactions, ${intern.comments} comments
   Scoring: ${intern.why}`
).join('\n\n')}` : ''}

${post_to_no?.project?.length > 0 ? `\n💡 PROJECT RECOGNITION:
${post_to_no.project.map((proj, i) => 
  `${i+1}. ${proj.type || 'Project'} (${proj.points}pts)
   Details: ${proj.source_post_excerpt?.[0]?.substring(0, 100)}...
   When: ${proj.timestamp?.join(', ')} ago
   Engagement: ${proj.reaction} reactions, ${proj.comments} comments
   Scoring: ${proj.why}`
).join('\n\n')}` : ''}
`;
        }

        // Add recent posts if relevant
        if (needsPosts || (!needsAchievements && !needsPosts)) {
          contextInfo += `
RECENT LINKEDIN ACTIVITY:
${original_scrapping?.slice(0, 5).map((post, i) => 
  `${i+1}. [${post.timestamp?.split('•')[0]?.trim() || 'Recent'}]
   ${post.text?.substring(0, 200) || 'Media post'}${post.text?.length > 200 ? '...' : ''}
   📊 Engagement: ${post.reactions} | ${post.comments || '0 comments'}
   ${post.images?.length > 0 ? `📸 ${post.images.length} image(s)` : ''}`
).join('\n\n') || 'No recent posts available'}
`;
        }

      } else {
        // Full mode - comprehensive profile data
        const { github_data, resume_data, post_to_no, total_points, original_scrapping } = user_data;
        const personalInfo = resume_data?.data?.personalInfo || {};
        const skills = resume_data?.data?.skills || {};
        const technicalSkills = skills.technicalSkills || {};
        
        const queryLower = userInput.toLowerCase();
        const needsSkills = queryLower.includes('skill') || queryLower.includes('tech') || queryLower.includes('language') || queryLower.includes('tool');
        const needsExperience = queryLower.includes('work') || queryLower.includes('experience') || queryLower.includes('intern') || queryLower.includes('job');
        const needsProjects = queryLower.includes('project') || queryLower.includes('built') || queryLower.includes('created');
        const needsGithub = queryLower.includes('github') || queryLower.includes('repo') || queryLower.includes('code');
        const needsAchievements = queryLower.includes('achieve') || queryLower.includes('award') || queryLower.includes('hackathon') || queryLower.includes('win') || queryLower.includes('score') || queryLower.includes('point');
        const needsPosts = queryLower.includes('post') || queryLower.includes('linkedin') || queryLower.includes('recent') || queryLower.includes('activity');
        
        contextInfo = `
PROFILE: ${personalInfo.name || github_data?.profile?.name}
Location: ${personalInfo.location || github_data?.profile?.location || 'Not specified'}
Contact: ${personalInfo.email || ''} | ${personalInfo.phone || ''}
Links: GitHub: ${personalInfo.github || ''} | LinkedIn: ${personalInfo.linkedin || ''}

EDUCATION:
${resume_data?.data?.education?.slice(0, 2).map(edu => 
  `${edu.degree} - ${edu.institution} (${edu.endDate || 'Present'}) | GPA: ${edu.gpa || 'N/A'}`
).join('\n') || 'Not specified'}

OBJECTIVE: ${resume_data?.data?.objective || 'Not specified'}
`;

        if (needsSkills || !needsExperience && !needsProjects && !needsGithub && !needsAchievements && !needsPosts) {
          contextInfo += `
SKILLS:
• Programming: ${technicalSkills.programmingLanguages?.join(', ') || 'N/A'}
• Web: ${technicalSkills.webDevelopment?.join(', ') || 'N/A'}
• AI/ML: ${technicalSkills.aiMlTools?.join(', ') || 'N/A'}
• Databases: ${technicalSkills.databases?.join(', ') || 'N/A'}
• DevOps: ${technicalSkills.devOpsTools?.join(', ') || 'N/A'}
• Languages: ${skills.languages?.map(l => `${l.name} (${l.proficiency})`).join(', ') || 'N/A'}
• Soft Skills: ${skills.softSkills?.join(', ') || 'N/A'}
`;
        }

        if (needsExperience || needsAchievements) {
          contextInfo += `
EXPERIENCE:
${resume_data?.data?.experience?.map(exp => 
  `• ${exp.title} @ ${exp.company} (${exp.startDate} - ${exp.endDate})
  Key: ${exp.responsibilities?.[0] || 'N/A'}`
).join('\n') || 'None listed'}
`;
        }

        if (needsProjects) {
          contextInfo += `
PROJECTS:
${resume_data?.data?.projects?.slice(0, 5).map(p => 
  `• ${p.name}: ${p.description?.substring(0, 100) || 'N/A'}
  Tech: ${p.technologies?.join(', ') || 'N/A'}`
).join('\n') || 'None listed'}
`;
        }

        if (needsGithub) {
          contextInfo += `
GITHUB (${github_data?.profile?.username}):
Stats: ${github_data?.profile?.public_repos || 0} repos | ${github_data?.profile?.followers || 0} followers
Top Repos:
${github_data?.repositories?.filter(r => !r.is_fork).slice(0, 5).map(repo => 
  `• ${repo.name}: ${repo.description?.substring(0, 80) || 'No desc'} [${repo.primary_language || 'N/A'}] ⭐${repo.total_stars || 0}`
).join('\n') || 'None'}
`;
        }

        if (needsAchievements) {
          contextInfo += `
ACHIEVEMENTS (Total: ${total_points} points):
${post_to_no?.hackathon?.map(h => 
  `• Position ${h.position} at hackathon (${h.points}pts): ${h.source_post_excerpt?.[0]?.substring(0, 120)}`
).join('\n') || ''}
${post_to_no?.internship?.map(i => 
  `• ${i.type} (${i.points}pts): ${i.source_post_excerpt?.[0]?.substring(0, 120)}`
).join('\n') || ''}
${post_to_no?.project?.map(p => 
  `• ${p.type} (${p.points}pts): ${p.source_post_excerpt?.[0]?.substring(0, 120)}`
).join('\n') || ''}
Certifications: ${resume_data?.data?.certificationsAchievements?.join(' | ') || 'None'}
`;
        }

        if (needsPosts) {
          contextInfo += `
RECENT LINKEDIN POSTS:
${original_scrapping?.slice(0, 3).map((post, i) => 
  `${i+1}. [${post.timestamp?.split('•')[0]}] ${post.text?.substring(0, 150)}... 
  Engagement: ${post.reactions} | ${post.comments || '0 comments'}`
).join('\n\n') || 'None available'}
`;
        }
      }
    }

    // Conversation history
    const conversationHistory = messages.slice(-4).map(msg => 
      `${msg.user ? 'User' : 'Assistant'}: ${msg.text}`
    ).join('\n');

    const prompt = `
Context: ${contextInfo}

Previous conversation:
${conversationHistory}

User question: ${userInput}

Instructions:
- Provide accurate, engaging responses based on the context
- When discussing achievements, always mention placement matrix points
- ${isSimplifiedMode ? 'Focus on LinkedIn activity and achievement scoring since no resume/GitHub data is available' : 'Draw from all available data sources'}
- Be conversational yet professional
- Use markdown formatting (bold for emphasis, bullets for lists)
- Keep responses 3-6 sentences unless more detail is requested
- If information is missing, suggest related topics
- Be specific and cite actual details from the context
- When discussing engagement, mention reactions and comments
`;

    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response?.candidates?.[0]?.content?.parts?.[0]?.text || 
                          "I couldn't process that request.";
      return responseText;
    } catch (error) {
      console.error("Error generating AI response:", error);
      return "I'm unable to process your request at the moment. Please try again.";
    }
  };

  // Enhanced message formatting function
  const formatMessage = (text) => {
    if (!text) return null;

    const lines = text.split('\n');
    const elements = [];

    lines.forEach((line, lineIndex) => {
      if (line.trim() === '') {
        elements.push(<div key={`empty-${lineIndex}`} className="h-2" />);
        return;
      }

      const processLine = (text) => {
        const parts = [];
        let currentIndex = 0;

        const boldRegex = /\*\*(.*?)\*\*/g;
        let match;

        while ((match = boldRegex.exec(text)) !== null) {
          if (match.index > currentIndex) {
            const beforeText = text.substring(currentIndex, match.index);
            parts.push(...processLinksInText(beforeText));
          }
          
          parts.push(
            <strong key={`bold-${lineIndex}-${match.index}`} className={`font-bold text-${primaryColor}-800`}>
              {match[1]}
            </strong>
          );
          
          currentIndex = match.index + match[0].length;
        }

        if (currentIndex < text.length) {
          const remainingText = text.substring(currentIndex);
          parts.push(...processLinksInText(remainingText));
        }

        return parts.length > 0 ? parts : [text];
      };

      const processLinksInText = (text) => {
        const parts = [];
        let currentIndex = 0;

        const urlRegex = /(https?:\/\/[^\s<>]+|\/[a-zA-Z][a-zA-Z0-9\-_]*(?:\/[a-zA-Z0-9\-_]*)*)/g;
        const hashLinkRegex = /(\/#\w+)/g;
        const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
        const phoneRegex = /(\+\d{2}\s?\d{6}\s?\d{4}|\+\d{2}\s?\d{9})/g;

        const allRegex = [urlRegex, hashLinkRegex, emailRegex, phoneRegex];
        const allMatches = [];
        
        allRegex.forEach(regex => {
          let match;
          while ((match = regex.exec(text)) !== null) {
            allMatches.push(match);
          }
        });

        allMatches.sort((a, b) => a.index - b.index);

        allMatches.forEach(match => {
          if (match.index > currentIndex) {
            parts.push(text.substring(currentIndex, match.index));
          }

          const url = match[1];
          const isRelativePath = url.startsWith('/');
          const isEmail = url.includes('@');
          const isPhone = url.startsWith('+');
          
          parts.push(
            <a 
              key={`link-${currentIndex}-${match.index}`}
              href={isEmail ? `mailto:${url}` : isPhone ? `tel:${url.replace(/\s/g, '')}` : url}
              className={`text-${primaryColor}-600 hover:text-${primaryColor}-800 underline font-medium hover:bg-${primaryColor}-50 px-1 rounded transition-all duration-200`}
              target={isRelativePath || isEmail || isPhone ? "_self" : "_blank"}
              rel={isRelativePath || isEmail || isPhone ? "" : "noopener noreferrer"}
            >
              {url}
            </a>
          );
          
          currentIndex = match.index + match[0].length;
        });

        if (currentIndex < text.length) {
          parts.push(text.substring(currentIndex));
        }

        return parts.length > 0 ? parts : [text];
      };

      const processedLine = processLine(line);

      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        elements.push(
          <div key={`bullet-${lineIndex}`} className="flex items-start ml-4 mb-2">
            <span className={`text-${primaryColor}-600 mr-2 flex-shrink-0`}>•</span>
            <span className="flex-1">{processedLine}</span>
          </div>
        );
      } else {
        elements.push(
          <div key={`line-${lineIndex}`} className="mb-2 leading-relaxed">
            {processedLine}
          </div>
        );
      }
    });

    return <div className="space-y-1">{elements}</div>;
  };

  // Get user name
  const userName = isSimplifiedMode 
    ? user_data?.original_scrapping?.[0]?.author_name?.split('View: ')?.[1]?.split(' 3rd')?.[0] || "this person"
    : user_data?.resume_data?.data?.personalInfo?.name || 
      user_data?.github_data?.profile?.name || 
      "this person";

  return (
    <div className="fixed bottom-6 right-6 flex flex-col items-end z-50">
      {/* Animated Bot Icon */}
      <div
        className={`p-4 bg-gradient-to-br from-${primaryColor}-400 via-${primaryColor}-500 to-${secondaryColor}-400 text-white rounded-full cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 ${isOpen ? 'rotate-12' : ''}`}
        onClick={toggleChat}
      >
        <Bot className="text-3xl w-8 h-8" />
      </div>

      {/* Chat Sidebar */}
      {isOpen && (
        <div
          className={`fixed bottom-0 right-0 w-96 h-[32rem] bg-gradient-to-br from-${primaryColor}-50 via-white to-${secondaryColor}-50 flex flex-col rounded-t-2xl shadow-2xl border border-${primaryColor}-200 transform transition-all duration-300 ease-out`}
          style={{
            animation: 'slideIn 0.3s ease-out'
          }}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 bg-black text-white rounded-t-2xl">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <h2 className="text-lg font-semibold">AI Assistant</h2>
            </div>
            <button
              onClick={toggleChat}
              className={`text-${primaryColor}-100 hover:text-white hover:bg-${primaryColor}-600 rounded-full p-1 transition duration-200`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-black">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-8">
                <Bot className={`w-12 h-12 mx-auto text-${primaryColor}-300 mb-2`} />
                <p className="text-sm font-medium mb-3">
                  👋 Hello! I'm here to help you learn more about {userName}.
                </p>
                <p className="text-xs mb-4">
                  {isSimplifiedMode 
                    ? "I have information about their LinkedIn activity, achievements, and placement matrix score!"
                    : "I have comprehensive information about their skills, projects, work experience, achievements, and more!"
                  }
                </p>
                <div className="mt-4 text-xs text-gray-400 text-left bg-gray-50 p-3 rounded-lg">
                  <p className="font-semibold mb-2">💡 Try asking:</p>
                  {isSimplifiedMode ? (
                    <>
                      <p>• "my placement matrix score?"</p>
                      <p>• "how many hackathons have I participated in?"</p>
                      <p>• "Tell me about my certifications"</p>
                      <p>• "What are my recent achievements?"</p>
                      <p>• "how many github repos I have"</p>
                      <p>• "What leadership roles I have done?"</p>
                    </>
                  ) : (
                    <>
                      <p>• "What are their key technical skills?"</p>
                      <p>• "Tell me about their work experience"</p>
                      <p>• "What hackathons have they won?"</p>
                      <p>• "Show me their top GitHub projects"</p>
                      <p>• "What's their placement matrix score?"</p>
                      <p>• "What recent achievements do they have?"</p>
                    </>
                  )}
                </div>
              </div>
            )}
            
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.user ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs p-3 text-sm leading-relaxed ${
                    msg.user
                      ? `bg-gradient-to-r from-${primaryColor}-500 to-${secondaryColor}-500 text-white rounded-l-2xl rounded-tr-md shadow-md`
                      : `bg-white text-gray-800 rounded-r-2xl rounded-tl-md shadow-md border border-${primaryColor}-100`
                  }`}
                >
                  {msg.user ? msg.text : formatMessage(msg.text)}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className={`bg-white text-gray-800 rounded-r-2xl rounded-tl-md shadow-md border border-${primaryColor}-100 p-3 max-w-xs`}>
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className={`w-2 h-2 bg-${primaryColor}-400 rounded-full animate-bounce`}></div>
                      <div className={`w-2 h-2 bg-${primaryColor}-400 rounded-full animate-bounce`} style={{animationDelay: '0.1s'}}></div>
                      <div className={`w-2 h-2 bg-${primaryColor}-400 rounded-full animate-bounce`} style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <span className="text-sm text-gray-500">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Box */}
          <div className="p-4 bg-black border-t border-pink-200">
            <div className={`flex items-center gap-2 bg-black rounded-full shadow-sm border border-${primaryColor}-200 focus-within:border-${primaryColor}-400 focus-within:shadow-md transition-all duration-200`}>
              <input
                type="text"
                className="flex-1 p-3 bg-black text-white outline-none placeholder-gray-400 rounded-l-full"
                placeholder={`Ask about ${userName}...`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                className={`p-3 rounded-full transition-all duration-200  ${
                  loading || input.trim() === ''
                    ? 'bg-black text-gray-400 cursor-not-allowed'
                    : `bg-gradient-to-r from-${primaryColor}-500 to-${secondaryColor}-500 hover:from-${primaryColor}-600 hover:to-${secondaryColor}-600 transform hover:scale-105`
                }`}
                disabled={loading || input.trim() === ''}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default ChatBot;