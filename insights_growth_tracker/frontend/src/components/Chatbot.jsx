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
  // The API key is retrieved here. Please replace "YOUR_API_KEY_HERE" with your actual Gemini API key.
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

  // Enhanced AI response function with user data context
  const fetchAIResponse = async (userInput) => {
    if (!userInput) return;

    // Build context from user_data
    let contextInfo = "";
    if (user_data) {
      const { github_data, resume_data, post_to_no, total_points } = user_data;
      
      contextInfo = `
      Context about the person:
      
      **Personal Info:**
      - Name: ${resume_data?.data?.personal_information?.name || github_data?.profile?.name || "Not specified"}
      - Location: ${resume_data?.data?.personal_information?.location || github_data?.profile?.location || "Not specified"}
      - Email: ${resume_data?.data?.personal_information?.email || "Not specified"}
      - Phone: ${resume_data?.data?.personal_information?.phone || "Not specified"}
      - GitHub: ${github_data?.profile?.github_url || "Not specified"}
      - Bio: ${github_data?.profile?.bio || "Not specified"}
      
      **Education:**
      ${resume_data?.data?.education?.map(edu => 
        `- ${edu.degree} from ${edu.institution} (${edu.start_date}-${edu.end_date}) - ${edu.gpa_or_percentage || ""}`
      ).join('\n') || "Not specified"}
      
      **Skills:**
      - Programming: ${resume_data?.data?.skills?.programming_languages?.join(', ') || "Not specified"}
      - Web Technologies: ${resume_data?.data?.skills?.web_technologies?.join(', ') || "Not specified"}
      - Tools: ${resume_data?.data?.skills?.tools_and_platforms?.join(', ') || "Not specified"}
      
      **Projects:**
      ${resume_data?.data?.projects?.map(project => 
        `- ${project.title}: ${project.description?.[0] || ""} (${project.technologies?.join(', ') || ""})`
      ).join('\n') || "Not specified"}
      
      **Experience:**
      ${resume_data?.data?.experience?.map(exp => 
        `- ${exp.title} at ${exp.company} (${exp.start_date} - ${exp.end_date})`
      ).join('\n') || "Not specified"}
      
      **Achievements & Leadership:**
      - Total Points: ${total_points || 0}
      ${post_to_no?.leadership?.map(item => 
        `- ${item.position} (${item.points} points): ${item.why}`
      ).join('\n') || ""}
      ${post_to_no?.project?.map(item => 
        `- Project (${item.points} points): ${item.why}`
      ).join('\n') || ""}
      
      **GitHub Info:**
      - Username: ${github_data?.profile?.username || "Not specified"}
      - Repositories: ${github_data?.profile?.public_repos || 0}
      - Followers: ${github_data?.profile?.followers || 0}
      - Following: ${github_data?.profile?.following || 0}
      - Public Gists: ${github_data?.profile?.public_gists || 0}
      
      **Repository Details:**
      ${github_data?.repositories?.map(repo => 
        `- ${repo.name}: ${repo.description || "No description"} 
          * Primary Language: ${repo.primary_language || "Not specified"}
          * Languages: ${repo.repo_languages?.join(', ') || "Not specified"}
          * Stars: ${repo.total_stars || 0}, Forks: ${repo.total_forks || 0}
          * URL: ${repo.repo_url}
          * Topics: ${repo.topics?.join(', ') || "None"}
          * Open Issues: ${repo.open_issues_count || 0}`
      ).join('\n') || "No repositories found"}
      `;
    }

    // Conversation history for context
    const conversationHistory = messages.map(msg => 
      `${msg.user ? 'User' : 'Assistant'}: ${msg.text}`
    ).join('\n');

    const prompt = `
    ${contextInfo}
    
    Previous conversation:
    ${conversationHistory}
    
    Current user question: ${userInput}
    
    Please provide a helpful, informative response based on the context above. 
    If the question is about the person's background, use the provided information.
    Keep responses concise but comprehensive. Use markdown formatting for better readability.
    If you don't have specific information, let the user know politely.
    `;

    try {
      // Use actual Gemini API
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

        // Process bold text (**text**)
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

  // Get user name for personalized greeting
  const userName = user_data?.resume_data?.data?.personal_information?.name || 
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
                <p className="text-sm">
                  Hello! I'm here to help you learn more about {userName}. 
                  Ask me about their skills, projects, experience, or anything else!
                </p>
                <div className="mt-4 text-xs text-gray-400">
                  <p>Try asking:</p>
                  <p>• "What are their skills?"</p>
                  <p>• "Tell me about their projects"</p>
                  <p>• "What's their experience?"</p>
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
