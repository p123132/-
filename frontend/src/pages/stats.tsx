import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Navbar from '../components/Navbar';

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
          <p className="text-white/60 text-lg">加载数据中...</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">我的统计</h1>
          <p className="text-slate-400">查看你的待办完成情况和数据趋势</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <span className="text-2xl">📋</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stats.total_todos}</p>
            <p className="text-purple-300 text-sm">总待办</p>
          </div>
          <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 backdrop-blur-lg rounded-2xl p-6 border border-green-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stats.completed_todos}</p>
            <p className="text-green-300 text-sm">已完成</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 backdrop-blur-lg rounded-2xl p-6 border border-yellow-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <span className="text-2xl">⏳</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stats.pending_todos}</p>
            <p className="text-yellow-300 text-sm">待完成</p>
          </div>
          <div className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 backdrop-blur-lg rounded-2xl p-6 border border-orange-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stats.completion_rate}%</p>
            <p className="text-orange-300 text-sm">完成率</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white">近7天趋势</h3>
                <p className="text-slate-400 text-sm mt-1">每日创建与完成情况</p>
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
                  <span className="text-slate-500 text-xs">{day.date.slice(5)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500/60 rounded"></div>
                <span className="text-slate-400 text-sm">创建</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-slate-400 text-sm">完成</span>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white">分类统计</h3>
                <p className="text-slate-400 text-sm mt-1">各分类任务完成情况</p>
              </div>
            </div>
            <div className="space-y-4">
              {stats.category_stats.map((cat, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${CATEGORY_COLORS[cat.category] || 'bg-gray-500'}`}></div>
                      <span className="text-white font-medium">{cat.category}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 text-sm">{cat.completed}/{cat.count}</span>
                      <span className="text-white font-semibold">{cat.count}</span>
                    </div>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
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
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white">优先级分布</h3>
                <p className="text-slate-400 text-sm mt-1">各优先级任务数量</p>
              </div>
            </div>
            <div className="space-y-4">
              {stats.priority_stats.map((p, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${PRIORITY_COLORS[p.priority]}`}></div>
                  <span className="text-white/70 text-sm w-20">{PRIORITY_LABELS[p.priority]}</span>
                  <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${PRIORITY_COLORS[p.priority]} rounded-full transition-all duration-700`}
                      style={{ width: `${stats.total_todos > 0 ? (p.count / stats.total_todos) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-white text-sm font-medium w-8 text-right">{p.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white">即将到期</h3>
                <p className="text-slate-400 text-sm mt-1">未来3天内到期的任务</p>
              </div>
              <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-semibold rounded-full">
                {stats.due_soon.length} 项
              </span>
            </div>
            {stats.due_soon.length > 0 ? (
              <div className="space-y-3">
                {stats.due_soon.map((todo, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                    <span className="text-white/80">{todo.title}</span>
                    <span className="text-yellow-400 text-sm">{todo.due_date}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🎉</span>
                </div>
                <p className="text-slate-400">暂无即将到期的待办</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}