import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useTheme } from '../context/ThemeContext';

interface DailyStat {
  date: string;
  count: number;
  completed: number;
}

interface CategoryStat {
  category: string;
  count: number;
  completed: number;
}

interface PriorityStat {
  priority: number;
  count: number;
}

interface Todo {
  id: number;
  title: string;
  due_date: string;
}

interface Stats {
  total_todos: number;
  completed_todos: number;
  pending_todos: number;
  completion_rate: number;
  daily_stats: DailyStat[];
  category_stats: CategoryStat[];
  priority_stats: PriorityStat[];
  due_soon: Todo[];
}

const CATEGORY_COLORS: Record<string, string> = {
  '工作': 'bg-blue-500',
  '学习': 'bg-green-500',
  '生活': 'bg-orange-500',
  '其他': 'bg-gray-500',
};

const PRIORITY_COLORS: Record<number, string> = { 1: 'bg-green-500', 2: 'bg-blue-500', 3: 'bg-yellow-500', 4: 'bg-orange-500', 5: 'bg-red-500' };
const PRIORITY_LABELS: Record<number, string> = { 1: '低', 2: '中', 3: '高', 4: '紧急', 5: '非常紧急' };

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isDarkMode } = useTheme();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    axios.get('/api/users/stats', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      setStats(res.data);
      setIsLoading(false);
    }).catch(() => {
      localStorage.removeItem('token');
      router.push('/login');
    });
  }, []);

  const getMaxDailyCount = () => {
    if (!stats) return 10;
    return Math.max(...stats.daily_stats.map(d => Math.max(d.count, d.completed)), 10);
  };

  const getMaxCategoryCount = () => {
    if (!stats) return 10;
    return Math.max(...stats.category_stats.map(c => c.count), 10);
  };

  const exportStatsToCSV = () => {
    if (!stats) return;
    
    const headers = ['日期', '创建数量', '完成数量'];
    const rows = stats.daily_stats.map(day => [
      day.date,
      day.count,
      day.completed
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `stats_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-slate-900' : 'bg-gray-100'}`}>
        <div className="flex flex-col items-center gap-4">
          <div className={`w-12 h-12 border-4 rounded-full animate-spin ${isDarkMode ? 'border-purple-500/30 border-t-purple-500' : 'border-purple-200 border-t-purple-500'}`}></div>
          <p className={`text-lg ${isDarkMode ? 'text-white/60' : 'text-gray-500'}`}>加载数据中...</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'}`}>
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>我的统计</h1>
            <p className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>查看你的待办完成情况和数据趋势</p>
          </div>
          <button
            onClick={exportStatsToCSV}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${isDarkMode ? 'bg-white/10 text-white/70 hover:bg-white/20' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            导出CSV
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className={`backdrop-blur-lg rounded-2xl p-6 border transition-all duration-300 ${isDarkMode ? 'bg-purple-600/20 border-purple-500/20' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                <span className="text-2xl">📋</span>
              </div>
            </div>
            <p className={`text-3xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.total_todos}</p>
            <p className={`text-sm ${isDarkMode ? 'text-purple-300' : 'text-purple-600'}`}>总待办</p>
          </div>
          <div className={`backdrop-blur-lg rounded-2xl p-6 border transition-all duration-300 ${isDarkMode ? 'bg-green-600/20 border-green-500/20' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-green-500/20' : 'bg-green-100'}`}>
                <span className="text-2xl">✅</span>
              </div>
            </div>
            <p className="text-3xl font-bold mb-1 text-green-400">{stats.completed_todos}</p>
            <p className={`text-sm ${isDarkMode ? 'text-green-300' : 'text-green-600'}`}>已完成</p>
          </div>
          <div className={`backdrop-blur-lg rounded-2xl p-6 border transition-all duration-300 ${isDarkMode ? 'bg-yellow-600/20 border-yellow-500/20' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-yellow-500/20' : 'bg-yellow-100'}`}>
                <span className="text-2xl">⏳</span>
              </div>
            </div>
            <p className="text-3xl font-bold mb-1 text-yellow-400">{stats.pending_todos}</p>
            <p className={`text-sm ${isDarkMode ? 'text-yellow-300' : 'text-yellow-600'}`}>待完成</p>
          </div>
          <div className={`backdrop-blur-lg rounded-2xl p-6 border transition-all duration-300 ${isDarkMode ? 'bg-orange-600/20 border-orange-500/20' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-orange-500/20' : 'bg-orange-100'}`}>
                <span className="text-2xl">📊</span>
              </div>
            </div>
            <p className="text-3xl font-bold mb-1 text-orange-400">{stats.completion_rate}%</p>
            <p className={`text-sm ${isDarkMode ? 'text-orange-300' : 'text-orange-600'}`}>完成率</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className={`backdrop-blur-lg rounded-2xl p-6 border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>近7天趋势</h3>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>每日创建与完成情况</p>
              </div>
            </div>
            <div className="h-52 flex items-end justify-between gap-3">
              {stats.daily_stats.map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full h-40 relative flex items-end justify-center gap-1">
                    <div 
                      className="absolute bottom-0 w-4 bg-blue-500/60 rounded-t-lg transition-all duration-500"
                      style={{ height: `${(day.count / getMaxDailyCount()) * 100}%` }}
                      title={`创建: ${day.count}`}
                    ></div>
                    <div 
                      className="absolute bottom-0 w-4 bg-green-500 rounded-t-lg transition-all duration-500"
                      style={{ height: `${(day.completed / getMaxDailyCount()) * 100}%` }}
                      title={`完成: ${day.completed}`}
                    ></div>
                  </div>
                  <span className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>{day.date.slice(5)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500/60 rounded"></div>
                <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>创建</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>完成</span>
              </div>
            </div>
          </div>

          <div className={`backdrop-blur-lg rounded-2xl p-6 border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>分类统计</h3>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>各分类任务完成情况</p>
              </div>
            </div>
            <div className="space-y-4">
              {stats.category_stats.map((cat, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${CATEGORY_COLORS[cat.category] || 'bg-gray-500'}`}></div>
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{cat.category}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{cat.completed}/{cat.count}</span>
                      <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{cat.count}</span>
                    </div>
                  </div>
                  <div className={`h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`}>
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-700"
                      style={{ width: `${cat.count > 0 ? (cat.completed / cat.count) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className={`backdrop-blur-lg rounded-2xl p-6 border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>优先级分布</h3>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>各优先级任务数量</p>
              </div>
            </div>
            <div className="space-y-4">
              {stats.priority_stats.map((p, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${PRIORITY_COLORS[p.priority]}`}></div>
                  <span className={`text-sm w-20 ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>{PRIORITY_LABELS[p.priority]}</span>
                  <div className={`flex-1 h-3 rounded-full overflow-hidden ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`}>
                    <div 
                      className={`h-full ${PRIORITY_COLORS[p.priority]} rounded-full transition-all duration-700`}
                      style={{ width: `${stats.total_todos > 0 ? (p.count / stats.total_todos) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className={`text-sm font-medium w-8 text-right ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{p.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={`backdrop-blur-lg rounded-2xl p-6 border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>即将到期</h3>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>未来3天内到期的任务</p>
              </div>
              <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-semibold rounded-full">
                {stats.due_soon.length} 项
              </span>
            </div>
            {stats.due_soon.length > 0 ? (
              <div className="space-y-3">
                {stats.due_soon.map((todo, index) => (
                  <div key={index} className={`flex items-center justify-between p-4 rounded-xl hover:transition-colors ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'}`}>
                    <span className={isDarkMode ? 'text-white/80' : 'text-gray-700'}>{todo.title}</span>
                    <span className="text-yellow-400 text-sm">{todo.due_date}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
                  <span className="text-3xl">🎉</span>
                </div>
                <p className={isDarkMode ? 'text-slate-400' : 'text-gray-500'}>暂无即将到期的待办</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
