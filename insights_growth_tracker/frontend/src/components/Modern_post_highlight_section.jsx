import { useState,useRef } from 'react';
import { ChevronDown, ChevronRight, ChevronLeft, Calendar, Award, Trophy, Code, BookOpen} from 'lucide-react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';



export const Modern_post_highlight_section = ({linkedInPosts,darkMode}) => {


  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef(null);
  const [expandedPost, setExpandedPost] = useState(null);


    const getTypeIcon = (type) => {
      switch(type) {
        case 'hackathon': return Trophy;
        case 'coding_platform': return Code;
        case 'certification': return BookOpen;
        case 'internship': return Award;
        case 'leadership': return Award;
        case 'project': return Code;
        case 'inhouse_project': return Code;
        case 'fsd_project': return Code;
        case 'membership': return Award;
        case 'assessment': return BookOpen;
        case 'research_publications': return BookOpen;
        default: return Award;
      }
    };
  

  
    const getReactionCount = (reactionsStr) => {
      if (!reactionsStr) return 0;
      if (typeof reactionsStr === 'number') return reactionsStr;
      const match = reactionsStr.match(/(\d+) reactions?/);
      if (match) return parseInt(match[1]);
      const andMatch = reactionsStr.match(/and (\d+) others/);
      return andMatch ? parseInt(andMatch[1]) + 1 : 1;
    };
  
    const getCommentCount = (commentsStr) => {
      if (!commentsStr) return 0;
      if (typeof commentsStr === 'number') return commentsStr;
      const match = commentsStr.match(/(\d+) comments?/);
      return match ? parseInt(match[1]) : 0;
    };
  
    // Carousel navigation functions
    const scrollToSlide = (slideIndex) => {
      if (carouselRef.current) {
        const cardWidth = 380; // Approximate card width including gap
        carouselRef.current.scrollTo({
          left: slideIndex * cardWidth,
          behavior: 'smooth'
        });
        setCurrentSlide(slideIndex);
      }
    };
  
    const nextSlide = () => {
      const maxSlides = Math.max(0, (linkedInPosts?.length || 0) - 3);
      const newSlide = Math.min(currentSlide + 1, maxSlides);
      scrollToSlide(newSlide);
    };
  
    const prevSlide = () => {
      const newSlide = Math.max(currentSlide - 1, 0);
      scrollToSlide(newSlide);
    };



  return (
    <div>
        <section className="relative  min-h-screen overflow-hidden pt-8 pb-16">
            {/* Glassmorphism background container */}
            <div className={`absolute inset-4 rounded-3xl backdrop-blur-md border shadow-2xl ${
            darkMode 
                ? 'bg-white/[0.02] border-white/5 shadow-black/20' 
                : 'bg-black/[0.02] border-black/5 shadow-black/10'
            }`}></div>


            <div className="relative z-10 max-w-7xl mx-auto pt-4">
            {/* Modern Header */}
            <div className="text-center mb-16 mt-4">
                <div className="inline-flex items-center gap-4 mb-6">
                <div className={`p-3 rounded-2xl ${darkMode ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30' : 'bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200'} backdrop-blur-xl`}>
                    <Calendar className={`${darkMode ? "text-purple-400" : "text-purple-600"}`} size={32} />
                </div>
                </div>
                <h2 className={`text-5xl font-bold mb-4 ${darkMode ? 'bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400' : 'bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600'} bg-clip-text text-transparent`}>
                Post Highlights
                </h2>
                <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
                Discover your most impactful moments and achievements across your professional journey
                </p>
            </div>

            {/* Cards Carousel Layout */}
            <div className="relative">
                {/* Navigation Arrows */}
                <button
                onClick={prevSlide}
                disabled={currentSlide === 0}
                className={`absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full backdrop-blur-xl border transition-all duration-300 ${
                    currentSlide === 0
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:scale-110 hover:shadow-lg'
                } ${
                    darkMode 
                    ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' 
                    : 'bg-black/10 border-black/20 text-black hover:bg-black/20'
                }`}
                >
                <ChevronLeft size={24} />
                </button>
                
                <button
                onClick={nextSlide}
                disabled={linkedInPosts && currentSlide >= Math.max(0, linkedInPosts.length - 3)}
                className={`absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full backdrop-blur-xl border transition-all duration-300 ${
                    linkedInPosts && currentSlide >= Math.max(0, linkedInPosts.length - 3)
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:scale-110 hover:shadow-lg'
                } ${
                    darkMode 
                    ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' 
                    : 'bg-black/10 border-black/20 text-black hover:bg-black/20'
                }`}
                >
                <ChevronRight size={24} />
                </button>

                {/* Carousel Container */}
                <div 
                ref={carouselRef}
                className="overflow-x-auto scrollbar-hide px-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                <div className="flex gap-6 pb-4" style={{ width: `${(linkedInPosts?.length || 0) * 380}px` }}>
                    {linkedInPosts?.map((post, index) => {
                    const TypeIcon = getTypeIcon(post.type);
                    const postText = post.text || "No content available";
                    const preview = postText.length > 120 ? postText.substring(0, 120) + "..." : postText;

                    return (
                        <div
                        key={post.id}
                        data-post-index={index}
                        className="flex-shrink-0 w-[360px] transform transition-all duration-500 hover:scale-[1.03] hover:-translate-y-2"
                        style={{ animationDelay: `${index * 100}ms` }}
                        >
                        {/* Enhanced Carousel Card */}
                        <div className={`rounded-3xl p-6 backdrop-blur-2xl border transition-all duration-500 group hover:shadow-2xl h-full ${
                            darkMode 
                            ? 'bg-gradient-to-br from-white/8 via-white/[0.03] to-white/8 border-white/15 hover:border-purple-400/40 hover:shadow-purple-500/30' 
                            : 'bg-gradient-to-br from-white/90 via-white/50 to-white/90 border-white/30 hover:border-purple-300/60 hover:shadow-purple-200/40'
                        }`}>
                            
                            {/* Enhanced floating gradient orb */}
                            <div className={`absolute -top-3 -right-3 w-20 h-20 ${
                            darkMode ? 'bg-gradient-to-br from-purple-500/30 to-pink-500/30' : 'bg-gradient-to-br from-purple-200/70 to-pink-200/70'
                            } rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700`}></div>
                            
                            {/* Card Header */}
                            <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className={`p-3 rounded-xl ${
                                darkMode ? 'bg-gradient-to-br from-purple-600/40 to-pink-600/40 shadow-lg' : 'bg-gradient-to-br from-purple-100 to-pink-100 shadow-md'
                                } backdrop-blur-sm flex-shrink-0`}>
                                <TypeIcon size={20} className={`${darkMode ? 'text-purple-300' : 'text-purple-700'}`} />
                                </div>
                                <div className="min-w-0 flex-1">
                                <h3 className={`font-bold text-base ${darkMode ? 'text-white' : 'text-gray-900'} line-clamp-1`}>
                                    {post.author_name}
                                </h3>
                                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {post.timestamp.split(" • ")[0]}
                                </p>
                                </div>
                            </div>
                            
                            {/* Enhanced Achievement Badge */}
                            <div className={`px-3 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 shadow-lg transform group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                                {post.achievement}
                            </div>
                            </div>

                            {/* Images Section - Enhanced */}
                            {post.images && post.images.length > 0 && (
                            <div className="mb-6">
                                <div className={`grid gap-3 rounded-xl overflow-hidden ${
                                post.images.length === 1 ? "grid-cols-1" : 
                                post.images.length === 2 ? "grid-cols-2" :
                                post.images.length === 3 ? "grid-cols-2" : "grid-cols-2"
                                }`}>
                                {post.images.slice(0, 4).map((img, i) => (
                                    <div 
                                    key={i} 
                                    className={`relative overflow-hidden rounded-lg ${
                                        post.images.length === 3 && i === 0 ? "col-span-2" : ""
                                    }`}
                                    >
                                   <LazyLoadImage
                                    src={img}
                                    alt="Post media"
                                    effect="blur" // other options: "opacity", "black-and-white"
                                    className="w-full h-28 object-cover transform group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    </div>
                                ))}
                                {post.images.length > 4 && (
                                    <div className={`flex items-center justify-center text-sm font-medium rounded-lg h-28 ${
                                    darkMode ? "bg-gray-800/60 text-gray-300" : "bg-gray-100/90 text-gray-600"
                                    }`}>
                                    +{post.images.length - 4}
                                    </div>
                                )}
                                </div>
                            </div>
                            )}

                            {/* Enhanced Content Section */}
                            <div className="space-y-4">
                            <div className={`overflow-hidden transition-all duration-500 ${
                                expandedPost === post.id ? 'max-h-none' : 'max-h-20'
                            }`}>
                                <p className={`text-sm leading-relaxed ${
                                darkMode ? 'text-gray-200' : 'text-gray-700'
                                }`}>
                                {expandedPost === post.id ? postText : preview}
                                </p>
                            </div>

                            {/* Enhanced Hashtags */}
                            {post.hashtags && post.hashtags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                {post.hashtags.slice(0, expandedPost === post.id ? post.hashtags.length : 3).map((tag, i) => (
                                    <span
                                    key={i}
                                    className={`text-xs px-3 py-1.5 rounded-lg font-medium backdrop-blur-sm ${
                                        darkMode 
                                        ? 'bg-purple-600/25 text-purple-300 border border-purple-500/40' 
                                        : 'bg-purple-100 text-purple-700 border border-purple-200'
                                    }`}
                                    >
                                    {tag}
                                    </span>
                                ))}
                                {post.hashtags.length > 3 && expandedPost !== post.id && (
                                    <span className={`text-xs px-3 py-1.5 rounded-lg ${
                                    darkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}>
                                    +{post.hashtags.length - 3}
                                    </span>
                                )}
                                </div>
                            )}

                            {/* Enhanced Stats Bar */}
                            <div className={`flex items-center justify-between pt-4 border-t ${
                                darkMode ? 'border-white/15' : 'border-gray-200/60'
                            }`}>
                                <div className="flex gap-6">
                                <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${
                                    darkMode ? 'from-purple-400 to-pink-400' : 'from-purple-500 to-pink-500'
                                    } shadow-sm`}></div>
                                    <span className={`text-sm font-medium ${
                                    darkMode ? 'text-gray-300' : 'text-gray-600'
                                    }`}>
                                    {getReactionCount(post.reactions)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${
                                    darkMode ? 'from-indigo-400 to-cyan-400' : 'from-indigo-500 to-cyan-500'
                                    } shadow-sm`}></div>
                                    <span className={`text-sm font-medium ${
                                    darkMode ? 'text-gray-300' : 'text-gray-600'
                                    }`}>
                                    {getCommentCount(post.comments)}
                                    </span>
                                </div>
                                </div>
                                
                                {/* Enhanced Expand Button */}
                                <button
                                onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                                className={`p-2.5 rounded-xl transition-all duration-300 backdrop-blur-sm ${
                                    darkMode 
                                    ? 'hover:bg-white/15 text-purple-400 hover:text-purple-300 border border-white/10' 
                                    : 'hover:bg-purple-50 text-purple-600 hover:text-purple-700 border border-purple-200'
                                } transform hover:scale-110 shadow-sm`}
                                >
                                {expandedPost === post.id ? (
                                    <ChevronDown size={18} />
                                ) : (
                                    <ChevronRight size={18} />
                                )}
                                </button>
                            </div>
                            </div>
                        </div>
                        </div>
                    );
                    })}
                </div>
                </div>
                

            </div>
            </div>
      </section>
    </div>
  )
}
