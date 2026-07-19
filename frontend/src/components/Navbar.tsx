import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';

interface User {
  id: number;
  username: string;
  email: string;
  avatar: string;
  role: string;
  created_at: string;
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token) {
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
        }).catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/login');
        });
      }
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const navItems = [
    { label: '首页', href: '/decision' },
    { label: '待办', href: '/todos' },
    { label: '统计', href: '/stats' },
    ...(user?.role === 'admin' ? [{ label: '管理', href: '/admin' }] : []),
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'dark:bg-slate-900/95 bg-white/95 backdrop-blur-xl border-b dark:border-white/10 border-gray-200 shadow-lg dark:shadow-black/20 shadow-gray-200/50' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <button 
              onClick={() => router.push('/decision')}
              className="flex items-center gap-2 group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center transform group-hover:scale-110 transition-transform">
                <span className="text-white text-xl font-bold">✨</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r dark:from-white dark:to-slate-300 from-gray-900 to-gray-700 bg-clip-text text-transparent">
                命运抉择
              </span>
            </button>
            
            <div className="hidden md:flex items-center gap-1">
              {navItems.map(item => (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    router.pathname === item.href
                      ? 'dark:text-white text-gray-900'
                      : 'dark:text-slate-400 text-gray-600 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {item.label}
                  {router.pathname === item.href && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl dark:bg-white/5 bg-gray-100 hover:dark:bg-white/10 hover:bg-gray-200 transition-colors group"
              title={isDarkMode ? '切换到明亮模式' : '切换到暗黑模式'}
            >
              {isDarkMode ? (
                <svg className="w-5 h-5 text-yellow-400 group-hover:text-yellow-300 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                <svg className="w-5 h-5 text-blue-400 group-hover:text-blue-300 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </button>
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl hover:dark:bg-white/5 hover:bg-gray-100 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold border-2 dark:border-white/20 border-white/40 group-hover:dark:border-white/40 group-hover:border-white/60 transition-colors">
                    {user.avatar || user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:block dark:text-white text-gray-900 font-medium">{user.username}</span>
                  <svg className={`w-4 h-4 dark:text-slate-400 text-gray-500 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </button>

                {isDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsDropdownOpen(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-56 dark:bg-slate-800/95 bg-white backdrop-blur-xl rounded-2xl shadow-2xl dark:border border-white/10 border-gray-200 py-2 z-50 animate-scale-in">
                      <div className="px-4 py-3 border-b dark:border-white/10 border-gray-200">
                        <p className="dark:text-white text-gray-900 font-semibold">{user.username}</p>
                        <p className="dark:text-slate-400 text-gray-500 text-sm">{user.email}</p>
                      </div>
                      <button
                        onClick={() => { router.push('/profile'); setIsDropdownOpen(false); }}
                        className="w-full px-4 py-3 flex items-center gap-3 text-left dark:text-slate-300 text-gray-700 hover:dark:text-white hover:text-gray-900 hover:dark:bg-white/5 hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-5 h-5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                        个人中心
                      </button>
                      {user?.role === 'admin' && (
                      <>
                        <button
                          onClick={() => { router.push('/admin'); setIsDropdownOpen(false); }}
                          className="w-full px-4 py-3 flex items-center gap-3 text-left dark:text-slate-300 text-gray-700 hover:dark:text-white hover:text-gray-900 hover:dark:bg-white/5 hover:bg-gray-50 transition-colors"
                        >
                          <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
                          </svg>
                          数据管理
                        </button>
                        <div className="border-t dark:border-white/10 border-gray-200 my-2"></div>
                      </>
                    )}
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-3 flex items-center gap-3 text-left text-red-400 hover:text-red-300 hover:dark:bg-red-500/10 hover:bg-red-50 transition-colors"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                          <polyline points="16 17 21 12 16 7"/>
                          <line x1="21" y1="12" x2="9" y2="12"/>
                        </svg>
                        退出登录
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={() => router.push('/login')}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/30 transform hover:scale-105 transition-all"
              >
                登录 / 注册
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
