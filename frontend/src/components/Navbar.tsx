import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

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
        ? 'bg-slate-900/95 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20' 
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
              <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
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
                      ? 'text-white'
                      : 'text-slate-400 hover:text-white'
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
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold border-2 border-white/20 group-hover:border-white/40 transition-colors">
                    {user.avatar || user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-white font-medium">{user.username}</span>
                  <svg className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </button>

                {isDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsDropdownOpen(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-56 bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 py-2 z-50 animate-scale-in">
                      <div className="px-4 py-3 border-b border-white/10">
                        <p className="text-white font-semibold">{user.username}</p>
                        <p className="text-slate-400 text-sm">{user.email}</p>
                      </div>
                      <button
                        onClick={() => { router.push('/profile'); setIsDropdownOpen(false); }}
                        className="w-full px-4 py-3 flex items-center gap-3 text-left text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
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
                          className="w-full px-4 py-3 flex items-center gap-3 text-left text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
                          </svg>
                          数据管理
                        </button>
                        <div className="border-t border-white/10 my-2"></div>
                      </>
                    )}
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-3 flex items-center gap-3 text-left text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
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