import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTheme } from '../context/ThemeContext';

export default function WelcomePage() {
  const [showContent, setShowContent] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    const timer1 = setTimeout(() => setShowContent(true), 300);
    const timer2 = setTimeout(() => setShowButton(true), 1200);
    
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const handleStart = () => {
    if (isLoggedIn) {
      router.push('/decision');
    } else {
      router.push('/login');
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center relative overflow-hidden ${
      isDarkMode 
        ? 'bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800' 
        : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
    }`}>
      <div className="absolute inset-0 bg-gradient-radial"></div>
      
      {isDarkMode && (
        <>
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
        </>
      )}

      <div className="relative z-10 text-center px-6">
        {isMounted && (
          <button
            onClick={toggleTheme}
            className="absolute top-0 right-0 p-4 rounded-full dark:bg-white/10 bg-gray-200/50 hover:dark:bg-white/20 hover:bg-gray-300/50 transition-colors"
            title={isDarkMode ? '切换到明亮模式' : '切换到暗黑模式'}
          >
            {isDarkMode ? (
              <svg className="w-6 h-6 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg className="w-6 h-6 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
        )}
        <div 
          className={`transform transition-all duration-1000 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <div className="mb-8">
            <svg 
              className={`w-24 h-24 mx-auto mb-6 animate-float ${isDarkMode ? 'text-white' : 'text-purple-600'}`} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" className={isDarkMode ? 'text-white/30' : 'text-purple-200'}/>
              <polyline points="12 6 12 12 16 14" className={isDarkMode ? 'text-white' : 'text-purple-600'}/>
            </svg>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            <span className={`block ${isDarkMode ? 'text-gradient' : 'text-purple-600'}`}>Todo</span>
            <span className={`block ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Adventure</span>
          </h1>

          <p className={`text-xl md:text-2xl max-w-md mx-auto mb-12 leading-relaxed ${isDarkMode ? 'text-white/80' : 'text-gray-600'}`}>
            让命运决定你的下一步<br />
            摇骰子，开启今日待办之旅
          </p>
        </div>

        <div 
          className={`transform transition-all duration-700 delay-500 ${showButton ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
        >
          <button
            onClick={handleStart}
            className="group relative px-12 py-4 bg-white text-purple-700 font-semibold rounded-full text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14"/>
                <path d="m12 5 7 7-7 7"/>
              </svg>
              {isLoggedIn ? '开始冒险' : '登录/注册'}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="absolute inset-0 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14"/>
                <path d="m12 5 7 7-7 7"/>
              </svg>
              {isLoggedIn ? '开始冒险' : '登录/注册'}
            </span>
          </button>

          {!isLoggedIn && (
            <div className="mt-6 flex justify-center gap-4">
              <a 
                href="/login" 
                className={`font-medium transition-colors ${isDarkMode ? 'text-white/70 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
              >
                已有账户？登录
              </a>
              <span className={isDarkMode ? 'text-white/30' : 'text-gray-300'}>|</span>
              <a 
                href="/register" 
                className={`font-medium transition-colors ${isDarkMode ? 'text-white/70 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
              >
                新用户？注册
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className={`flex flex-col items-center animate-bounce ${isDarkMode ? 'text-white/50' : 'text-gray-400'}`}>
          <span className="text-sm mb-2">向下滚动</span>
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </div>
      </div>
    </div>
  );
}
