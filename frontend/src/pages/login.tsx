import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/login', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      router.push('/decision');
    } catch (err: any) {
      setError(err.response?.data?.error || '登录失败，请检查邮箱和密码');
    } finally {
      setLoading(false);
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
        </>
      )}

      <div className="relative z-10 w-full max-w-md mx-6">
        {isMounted && (
          <button
            onClick={toggleTheme}
            className="absolute -top-4 -right-4 p-3 rounded-full dark:bg-white/10 bg-gray-200 hover:dark:bg-white/20 hover:bg-gray-300 transition-colors z-20"
            title={isDarkMode ? '切换到明亮模式' : '切换到暗黑模式'}
          >
            {isDarkMode ? (
              <svg className="w-5 h-5 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
              <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
        )}
        <div className={`backdrop-blur-lg rounded-2xl p-8 shadow-2xl border overflow-hidden ${
          isDarkMode 
            ? 'bg-white/10 border-white/20' 
            : 'bg-white border-gray-100 shadow-gray-200/50'
        }`}>
          <div className="text-center mb-8">
            <svg 
              className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-white' : 'text-purple-600'}`} 
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
            <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>欢迎回来</h1>
            <p className={`mt-2 ${isDarkMode ? 'text-white/60' : 'text-gray-500'}`}>请登录您的账户</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white/80' : 'text-gray-700'}`}>邮箱</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="请输入邮箱"
                className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all ${
                  isDarkMode 
                    ? 'bg-white/10 border border-white/20 text-white placeholder-white/40' 
                    : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400'
                }`}
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white/80' : 'text-gray-700'}`}>密码</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="请输入密码"
                className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all ${
                  isDarkMode 
                    ? 'bg-white/10 border border-white/20 text-white placeholder-white/40' 
                    : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400'
                }`}
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg px-4 py-3 text-red-300 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className={`text-sm ${isDarkMode ? 'text-white/60' : 'text-gray-500'}`}>
              还没有账户？{' '}
              <a href="/register" className="text-purple-400 hover:text-purple-300 transition-colors font-medium">
                立即注册
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
