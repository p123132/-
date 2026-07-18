import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';

interface Todo {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  priority: number;
  created_at: string;
  photo: string;
  due_date: string;
  planned_date: string;
  category: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  avatar: string;
  created_at: string;
}

interface Template {
  name: string;
  items: string[];
}

const CATEGORIES = ['工作', '学习', '生活', '其他'];

const CATEGORY_COLORS: Record<string, string> = {
  '工作': 'bg-blue-500',
  '学习': 'bg-green-500',
  '生活': 'bg-orange-500',
  '其他': 'bg-gray-500',
};

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [newTodo, setNewTodo] = useState({ title: '', description: '', priority: 1, photo: '', due_date: '', planned_date: '', category: '其他' });
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'created' | 'due' | 'priority'>('created');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showBatchDelete, setShowBatchDelete] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [templates, setTemplates] = useState<Record<string, Template>>({});
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [showShareSuccess, setShowShareSuccess] = useState(false);
  const [showNotificationPermission, setShowNotificationPermission] = useState(false);
  const router = useRouter();

  const API_BASE = '/api';

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token) {
      router.push('/login');
      return;
    }

    if (userData) {
      setUser(JSON.parse(userData));
    }

    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    fetchTodos();
    fetchTemplates();
    checkNotificationPermission();
  }, []);

  useEffect(() => {
    if (router.query.add === 'true') {
      setShowAddModal(true);
      router.push('/todos');
    }
  }, [router.query.add]);

  useEffect(() => {
    setShowBatchDelete(selectedIds.length > 0);
  }, [selectedIds]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const fetchTodos = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/todos`);
      setTodos(response.data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
      }
      console.error('Failed to fetch todos:', error);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    router.push('/login');
  };

  const handleAddTodo = async () => {
    if (!newTodo.title.trim()) return;
    try {
      await axios.post(`${API_BASE}/todos`, newTodo);
      setNewTodo({ title: '', description: '', priority: 1, photo: '', due_date: '', planned_date: '', category: '其他' });
      setShowAddModal(false);
      fetchTodos();
    } catch (error) {
      console.error('Failed to add todo:', error);
    }
  };

  const handleUpdateTodo = async () => {
    if (!editingTodo || !editingTodo.title.trim()) return;
    try {
      await axios.put(`${API_BASE}/todos/${editingTodo.id}`, editingTodo);
      setShowEditModal(false);
      setEditingTodo(null);
      fetchTodos();
    } catch (error) {
      console.error('Failed to update todo:', error);
    }
  };

  const handleDeleteTodo = async (id: number) => {
    if (!confirm('确定要删除这个待办事项吗？')) return;
    try {
      await axios.delete(`${API_BASE}/todos/${id}`);
      setSelectedIds(selectedIds.filter(i => i !== id));
      fetchTodos();
    } catch (error) {
      console.error('Failed to delete todo:', error);
    }
  };

  const handleBatchDelete = async () => {
    if (!confirm(`确定要删除选中的 ${selectedIds.length} 个待办事项吗？`)) return;
    try {
      await axios.delete(`${API_BASE}/todos/batch`, { data: { ids: selectedIds } });
      setSelectedIds([]);
      fetchTodos();
    } catch (error) {
      console.error('Failed to batch delete todos:', error);
    }
  };

  const handleToggleComplete = async (id: number) => {
    try {
      await axios.post(`${API_BASE}/todos/${id}/complete`);
      fetchTodos();
    } catch (error) {
      console.error('Failed to toggle todo:', error);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, isNew: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (isNew) {
        setNewTodo({ ...newTodo, photo: base64 });
      } else if (editingTodo) {
        setEditingTodo({ ...editingTodo, photo: base64 });
      }
    };
    reader.readAsDataURL(file);
  };

  const fetchTemplates = async () => {
    try {
      const response = await axios.get(`${API_BASE}/templates`);
      setTemplates(response.data);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    }
  };

  const applyTemplate = async (templateName: string) => {
    try {
      await axios.post(`${API_BASE}/templates/${templateName}/apply`);
      setShowTemplateModal(false);
      fetchTodos();
    } catch (error) {
      console.error('Failed to apply template:', error);
    }
  };

  const handleShareTodo = async (todoId: number) => {
    try {
      const response = await axios.post(`${API_BASE}/todos/${todoId}/share`);
      setShareUrl(response.data.share_url);
      setShowShareSuccess(true);
      navigator.clipboard.writeText(response.data.share_url);
    } catch (error) {
      console.error('Failed to share todo:', error);
    }
  };

  const checkNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      setShowNotificationPermission(true);
    }
  };

  const requestNotificationPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('通知已开启', { body: '你将收到待办任务的提醒通知' });
          checkOverdueTasks();
        }
        setShowNotificationPermission(false);
      });
    }
  };

  const checkOverdueTasks = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const overdueTasks = todos.filter(t => isOverdue(t.due_date) && !t.completed);
      if (overdueTasks.length > 0) {
        overdueTasks.slice(0, 3).forEach((task, index) => {
          setTimeout(() => {
            new Notification('任务逾期提醒', {
              body: `「${task.title}」已逾期，请尽快处理！`,
              icon: '/favicon.ico'
            });
          }, index * 1000);
        });
      }
    }
  };

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const interval = setInterval(checkOverdueTasks, 60000);
      return () => clearInterval(interval);
    }
  }, [todos]);

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const visibleIds = filteredTodos.map(t => t.id);
    if (selectedIds.length === visibleIds.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(visibleIds);
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', '标题', '描述', '完成状态', '优先级', '分类', '截止日期', '计划日期', '创建时间'];
    const rows = filteredTodos.map(todo => [
      todo.id,
      `"${todo.title.replace(/"/g, '""')}"`,
      `"${todo.description.replace(/"/g, '""')}"`,
      todo.completed ? '已完成' : '待完成',
      todo.priority === 3 ? '高' : todo.priority === 2 ? '中' : '低',
      todo.category,
      todo.due_date || '',
      todo.planned_date || '',
      new Date(todo.created_at).toLocaleString('zh-CN')
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `todos_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const getSortedTodos = (list: Todo[]) => {
    return [...list].sort((a, b) => {
      if (sortBy === 'priority') return b.priority - a.priority;
      if (sortBy === 'due') {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  };

  const filteredTodos = getSortedTodos(todos.filter(todo => {
    if (filter === 'active' && todo.completed) return false;
    if (filter === 'completed' && !todo.completed) return false;
    if (categoryFilter !== 'all' && todo.category !== categoryFilter) return false;
    if (searchQuery && !todo.title.toLowerCase().includes(searchQuery.toLowerCase()) && !todo.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  }));

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 3: return 'bg-red-500';
      case 2: return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  const getPriorityText = (priority: number) => {
    switch (priority) {
      case 3: return '高';
      case 2: return '中';
      default: return '低';
    }
  };

  const isOverdue = (dueDate: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && dueDate !== '';
  };

  const stats = {
    total: todos.length,
    completed: todos.filter(t => t.completed).length,
    active: todos.filter(t => !t.completed).length,
    overdue: todos.filter(t => isOverdue(t.due_date) && !t.completed).length,
    completionRate: todos.length > 0 ? Math.round((todos.filter(t => t.completed).length / todos.length) * 100) : 0,
    byCategory: CATEGORIES.map(cat => ({
      name: cat,
      count: todos.filter(t => t.category === cat).length
    }))
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50'}`}>
      <Navbar />
      
      {showNotificationPermission && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-xl flex items-center gap-4 transition-colors duration-300 ${darkMode ? 'bg-slate-800 border border-white/10' : 'bg-white shadow-lg'}`}>
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </div>
          <div>
            <p className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-800'}`}>启用浏览器通知</p>
            <p className={`text-sm ${darkMode ? 'text-white/60' : 'text-slate-500'}`}>接收待办任务到期提醒</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowNotificationPermission(false)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${darkMode ? 'bg-white/10 text-white/70 hover:bg-white/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              稍后
            </button>
            <button
              onClick={requestNotificationPermission}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition-all"
            >
              允许
            </button>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">待办清单</h1>
          <p className="text-slate-400">管理你的日常任务</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className={`backdrop-blur-lg rounded-2xl p-6 border transition-all duration-300 ${darkMode ? 'bg-purple-600/20 border-purple-500/20 hover:border-purple-500/40' : 'bg-white shadow-sm border-slate-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${darkMode ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                <span className="text-2xl">📋</span>
              </div>
            </div>
            <p className={`text-3xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-slate-800'}`}>{stats.total}</p>
            <p className={`text-sm ${darkMode ? 'text-purple-300' : 'text-purple-600'}`}>总任务数</p>
          </div>
          <div className={`backdrop-blur-lg rounded-2xl p-6 border transition-all duration-300 ${darkMode ? 'bg-blue-600/20 border-blue-500/20 hover:border-blue-500/40' : 'bg-white shadow-sm border-slate-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${darkMode ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                <span className="text-2xl">⏳</span>
              </div>
            </div>
            <p className="text-3xl font-bold mb-1 text-blue-400">{stats.active}</p>
            <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>待完成</p>
          </div>
          <div className={`backdrop-blur-lg rounded-2xl p-6 border transition-all duration-300 ${darkMode ? 'bg-green-600/20 border-green-500/20 hover:border-green-500/40' : 'bg-white shadow-sm border-slate-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${darkMode ? 'bg-green-500/20' : 'bg-green-100'}`}>
                <span className="text-2xl">✅</span>
              </div>
            </div>
            <p className="text-3xl font-bold mb-1 text-green-400">{stats.completed}</p>
            <p className={`text-sm ${darkMode ? 'text-green-300' : 'text-green-600'}`}>已完成</p>
          </div>
          <div className={`backdrop-blur-lg rounded-2xl p-6 border transition-all duration-300 ${darkMode ? 'bg-orange-600/20 border-orange-500/20 hover:border-orange-500/40' : 'bg-white shadow-sm border-slate-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${darkMode ? 'bg-orange-500/20' : 'bg-orange-100'}`}>
                <span className="text-2xl">📊</span>
              </div>
            </div>
            <p className="text-3xl font-bold mb-1 text-orange-400">{stats.completionRate}%</p>
            <p className={`text-sm ${darkMode ? 'text-orange-300' : 'text-orange-600'}`}>完成率</p>
          </div>
        </div>

        {stats.overdue > 0 && (
          <div className={`mb-8 p-5 rounded-2xl flex items-center justify-between transition-colors duration-300 border ${darkMode ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-200'}`}>
            <span className={`flex items-center gap-3 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <span className="font-medium">有 {stats.overdue} 个任务已逾期，请尽快处理！</span>
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.byCategory.map(cat => (
            <div key={cat.name} className={`backdrop-blur-lg rounded-xl p-4 border transition-all duration-300 ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${CATEGORY_COLORS[cat.name]}`}></div>
                  <span className={`text-sm font-medium ${darkMode ? 'text-white/80' : 'text-slate-700'}`}>{cat.name}</span>
                </div>
                <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{cat.count}</span>
              </div>
              <div className={`h-2 rounded-full overflow-hidden ${darkMode ? 'bg-white/10' : 'bg-slate-200'}`}>
                <div 
                  className={`h-full rounded-full transition-all duration-700 ${CATEGORY_COLORS[cat.name]}`}
                  style={{ width: stats.total > 0 ? `${(cat.count / stats.total) * 100}%` : '0%' }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className={`backdrop-blur-lg rounded-2xl p-6 border mb-8 ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <svg className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-white/30' : 'text-slate-400'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索待办事项..."
                className={`w-full pl-12 pr-4 py-3 rounded-xl ${darkMode ? 'bg-white/10 border border-white/20 text-white placeholder-white/30' : 'bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400'} focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all`}
              />
            </div>
            <div className="flex items-center gap-3">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className={`px-4 py-3 rounded-xl ${darkMode ? 'bg-white/10 border border-white/20 text-white' : 'bg-slate-50 border border-slate-200 text-slate-800'} focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all`}
              >
                <option value="all">全部分类</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'created' | 'due' | 'priority')}
                className={`px-4 py-3 rounded-xl ${darkMode ? 'bg-white/10 border border-white/20 text-white' : 'bg-slate-50 border border-slate-200 text-slate-800'} focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all`}
              >
                <option value="created">按创建时间</option>
                <option value="due">按截止日期</option>
                <option value="priority">按优先级</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                filter === 'all' 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25' 
                  : darkMode ? 'bg-white/10 text-white/70 hover:bg-white/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              全部 ({todos.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                filter === 'active' 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25' 
                  : darkMode ? 'bg-white/10 text-white/70 hover:bg-white/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              待完成 ({stats.active})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                filter === 'completed' 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25' 
                  : darkMode ? 'bg-white/10 text-white/70 hover:bg-white/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              已完成 ({stats.completed})
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={exportToCSV}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${darkMode ? 'bg-white/10 text-white/70 hover:bg-white/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              导出CSV
            </button>
            <button
              onClick={() => setShowTemplateModal(true)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${darkMode ? 'bg-white/10 text-white/70 hover:bg-white/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <path d="M3 9h18"/>
                <path d="M9 21V9"/>
              </svg>
              使用模板
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              添加待办
            </button>
          </div>
        </div>

        {showBatchDelete && (
          <div className={`mb-4 p-4 rounded-xl flex items-center justify-between transition-colors duration-300 ${darkMode ? 'bg-white/10' : 'bg-white shadow-sm'}`}>
            <span className={darkMode ? 'text-white' : 'text-slate-800'}>已选中 {selectedIds.length} 项</span>
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedIds([])}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${darkMode ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                取消选择
              </button>
              <button
                onClick={handleBatchDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18"/>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                </svg>
                批量删除
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className={`w-8 h-8 border-4 rounded-full animate-spin ${darkMode ? 'border-white/20 border-t-white' : 'border-slate-200 border-t-purple-500'}`}></div>
          </div>
        ) : filteredTodos.length === 0 ? (
          <div className="text-center py-16">
            <svg className={`w-16 h-16 mx-auto mb-4 transition-colors duration-300 ${darkMode ? 'text-white/30' : 'text-slate-300'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"/>
              <path d="M8 12h8"/>
              <path d="M12 8v8"/>
            </svg>
            <p className={`text-lg transition-colors duration-300 ${darkMode ? 'text-white/50' : 'text-slate-500'}`}>暂无待办事项</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 text-purple-400 hover:text-purple-300 font-semibold"
            >
              立即添加
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4 px-4 py-2">
              <button
                onClick={toggleSelectAll}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                  selectedIds.length === filteredTodos.length && filteredTodos.length > 0
                    ? 'bg-purple-500 border-purple-500'
                    : darkMode ? 'border-white/30 hover:border-white' : 'border-slate-300 hover:border-slate-500'
                }`}
              >
                {selectedIds.length === filteredTodos.length && filteredTodos.length > 0 && (
                  <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </button>
              <span className={`${darkMode ? 'text-white/50' : 'text-slate-500'} text-sm`}>全选</span>
            </div>
            {filteredTodos.map(todo => (
              <div
                key={todo.id}
                className={`rounded-xl p-4 transition-all hover:shadow-md ${
                  todo.completed ? 'opacity-60' : ''
                } ${selectedIds.includes(todo.id) ? 'ring-2 ring-purple-500' : ''} ${darkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-white hover:bg-slate-50'}`}
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => toggleSelect(todo.id)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all mt-2 ${
                      selectedIds.includes(todo.id)
                        ? 'bg-purple-500 border-purple-500'
                        : darkMode ? 'border-white/30 hover:border-white' : 'border-slate-300 hover:border-slate-500'
                    }`}
                  >
                    {selectedIds.includes(todo.id) && (
                      <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-semibold text-lg ${todo.completed ? (darkMode ? 'line-through text-white/50' : 'line-through text-slate-400') : (darkMode ? 'text-white' : 'text-slate-800')}`}>
                        {todo.title}
                      </h3>
                      {isOverdue(todo.due_date) && !todo.completed && (
                        <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">已逾期</span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${CATEGORY_COLORS[todo.category] || 'bg-gray-500'} text-white`}>
                        {todo.category}
                      </span>
                    </div>
                    {todo.description && (
                      <p className={darkMode ? 'text-white/60 mt-1 line-clamp-2' : 'text-slate-600 mt-1 line-clamp-2'}>{todo.description}</p>
                    )}
                    {todo.photo && (
                      <div className="mt-2">
                        <img 
                          src={todo.photo} 
                          alt="Todo photo" 
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-4 mt-3 flex-wrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(todo.priority)} text-white`}>
                        {getPriorityText(todo.priority)}优先级
                      </span>
                      {todo.due_date && (
                        <span className={`text-xs px-2 py-1 rounded-full ${isOverdue(todo.due_date) && !todo.completed ? 'bg-red-500/20 text-red-400' : (darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600')}`}>
                          📅 截止: {new Date(todo.due_date).toLocaleDateString('zh-CN')}
                        </span>
                      )}
                      {todo.planned_date && (
                        <span className={darkMode ? 'text-xs px-2 py-1 rounded-full bg-orange-500/20 text-orange-400' : 'text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-600'}>
                          🗓️ 计划: {new Date(todo.planned_date).toLocaleDateString('zh-CN')}
                        </span>
                      )}
                      <span className={darkMode ? 'text-white/40 text-xs' : 'text-slate-400 text-xs'}>
                        创建于: {new Date(todo.created_at).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <button
                      onClick={() => handleToggleComplete(todo.id)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl flex-shrink-0 transition-all duration-300 ${
                        todo.completed
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg hover:shadow-green-500/30 hover:-translate-y-0.5'
                      }`}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      <span className="text-sm font-semibold">{todo.completed ? '已完成' : '提前完成'}</span>
                    </button>
                    <div className="flex items-center gap-1 border-l border-white/10 pl-2">
                      <button
                        onClick={() => handleShareTodo(todo.id)}
                        className={`p-2 rounded-lg transition-all ${darkMode ? 'text-white/50 hover:text-blue-400 hover:bg-blue-500/10' : 'text-slate-500 hover:text-blue-500 hover:bg-blue-50'}`}
                        title="分享此任务"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="18" cy="5" r="3"/>
                          <circle cx="6" cy="12" r="3"/>
                          <circle cx="18" cy="19" r="3"/>
                          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => { setEditingTodo(todo); setShowEditModal(true); }}
                        className={`p-2 rounded-lg transition-all ${darkMode ? 'text-white/50 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                          <path d="m15 5 4 4"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteTodo(todo.id)}
                        className={`p-2 rounded-lg transition-all ${darkMode ? 'text-white/50 hover:text-red-400 hover:bg-red-500/10' : 'text-slate-500 hover:text-red-500 hover:bg-red-50'}`}
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18"/>
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className={`rounded-2xl w-full max-w-md p-6 animate-scale-in max-h-[90vh] overflow-y-auto transition-colors duration-300 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
            <h2 className={`text-2xl font-bold mb-4 transition-colors duration-300 ${darkMode ? 'text-white' : 'text-slate-800'}`}>添加新待办</h2>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm mb-2 transition-colors duration-300 ${darkMode ? 'text-white/70' : 'text-slate-600'}`}>标题 *</label>
                <input
                  type="text"
                  value={newTodo.title}
                  onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg placeholder-focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500 transition-colors duration-300 ${darkMode ? 'bg-white/10 border border-white/20 text-white placeholder-white/30' : 'bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400'}`}
                  placeholder="输入待办事项标题"
                />
              </div>
              <div>
                <label className={`block text-sm mb-2 transition-colors duration-300 ${darkMode ? 'text-white/70' : 'text-slate-600'}`}>描述</label>
                <textarea
                  value={newTodo.description}
                  onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                  rows={3}
                  className={`w-full px-4 py-3 rounded-lg resize-none focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500 transition-colors duration-300 ${darkMode ? 'bg-white/10 border border-white/20 text-white placeholder-white/30' : 'bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400'}`}
                  placeholder="输入待办事项描述"
                />
              </div>
              <div>
                <label className={`block text-sm mb-2 transition-colors duration-300 ${darkMode ? 'text-white/70' : 'text-slate-600'}`}>分类</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setNewTodo({ ...newTodo, category: cat })}
                      className={`px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
                        newTodo.category === cat
                          ? `${CATEGORY_COLORS[cat]} text-white`
                          : darkMode ? 'bg-white/10 text-white/70 hover:bg-white/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={`block text-sm mb-2 transition-colors duration-300 ${darkMode ? 'text-white/70' : 'text-slate-600'}`}>添加照片</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handlePhotoUpload(e, true)}
                  className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500 transition-colors duration-300 ${darkMode ? 'bg-white/10 border border-white/20 text-white' : 'bg-slate-50 border border-slate-200 text-slate-800'}`}
                />
                {newTodo.photo && (
                  <img 
                    src={newTodo.photo} 
                    alt="Preview" 
                    className="w-24 h-24 object-cover rounded-lg mt-2"
                  />
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm mb-2 transition-colors duration-300 ${darkMode ? 'text-white/70' : 'text-slate-600'}`}>截止日期</label>
                  <input
                    type="date"
                    value={newTodo.due_date}
                    onChange={(e) => setNewTodo({ ...newTodo, due_date: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500 transition-colors duration-300 ${darkMode ? 'bg-white/10 border border-white/20 text-white' : 'bg-slate-50 border border-slate-200 text-slate-800'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm mb-2 transition-colors duration-300 ${darkMode ? 'text-white/70' : 'text-slate-600'}`}>计划完成日期</label>
                  <input
                    type="date"
                    value={newTodo.planned_date}
                    onChange={(e) => setNewTodo({ ...newTodo, planned_date: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500 transition-colors duration-300 ${darkMode ? 'bg-white/10 border border-white/20 text-white' : 'bg-slate-50 border border-slate-200 text-slate-800'}`}
                  />
                </div>
              </div>
              <div>
                <label className={`block text-sm mb-2 transition-colors duration-300 ${darkMode ? 'text-white/70' : 'text-slate-600'}`}>优先级</label>
                <div className="flex gap-2">
                  {[1, 2, 3].map(p => (
                    <button
                      key={p}
                      onClick={() => setNewTodo({ ...newTodo, priority: p })}
                      className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-all ${
                        newTodo.priority === p
                          ? `${getPriorityColor(p)} text-white`
                          : darkMode ? 'bg-white/10 text-white/70 hover:bg-white/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {getPriorityText(p)}优先级
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${darkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                取消
              </button>
              <button
                onClick={handleAddTodo}
                disabled={!newTodo.title.trim()}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editingTodo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className={`rounded-2xl w-full max-w-md p-6 animate-scale-in max-h-[90vh] overflow-y-auto transition-colors duration-300 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
            <h2 className={`text-2xl font-bold mb-4 transition-colors duration-300 ${darkMode ? 'text-white' : 'text-slate-800'}`}>编辑待办</h2>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm mb-2 transition-colors duration-300 ${darkMode ? 'text-white/70' : 'text-slate-600'}`}>标题 *</label>
                <input
                  type="text"
                  value={editingTodo.title}
                  onChange={(e) => setEditingTodo({ ...editingTodo, title: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500 transition-colors duration-300 ${darkMode ? 'bg-white/10 border border-white/20 text-white' : 'bg-slate-50 border border-slate-200 text-slate-800'}`}
                />
              </div>
              <div>
                <label className={`block text-sm mb-2 transition-colors duration-300 ${darkMode ? 'text-white/70' : 'text-slate-600'}`}>描述</label>
                <textarea
                  value={editingTodo.description}
                  onChange={(e) => setEditingTodo({ ...editingTodo, description: e.target.value })}
                  rows={3}
                  className={`w-full px-4 py-3 rounded-lg resize-none focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500 transition-colors duration-300 ${darkMode ? 'bg-white/10 border border-white/20 text-white' : 'bg-slate-50 border border-slate-200 text-slate-800'}`}
                />
              </div>
              <div>
                <label className={`block text-sm mb-2 transition-colors duration-300 ${darkMode ? 'text-white/70' : 'text-slate-600'}`}>分类</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setEditingTodo({ ...editingTodo, category: cat })}
                      className={`px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
                        editingTodo.category === cat
                          ? `${CATEGORY_COLORS[cat]} text-white`
                          : darkMode ? 'bg-white/10 text-white/70 hover:bg-white/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={`block text-sm mb-2 transition-colors duration-300 ${darkMode ? 'text-white/70' : 'text-slate-600'}`}>添加照片</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handlePhotoUpload(e, false)}
                  className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500 transition-colors duration-300 ${darkMode ? 'bg-white/10 border border-white/20 text-white' : 'bg-slate-50 border border-slate-200 text-slate-800'}`}
                />
                {editingTodo.photo && (
                  <img 
                    src={editingTodo.photo} 
                    alt="Preview" 
                    className="w-24 h-24 object-cover rounded-lg mt-2"
                  />
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm mb-2 transition-colors duration-300 ${darkMode ? 'text-white/70' : 'text-slate-600'}`}>截止日期</label>
                  <input
                    type="date"
                    value={editingTodo.due_date}
                    onChange={(e) => setEditingTodo({ ...editingTodo, due_date: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500 transition-colors duration-300 ${darkMode ? 'bg-white/10 border border-white/20 text-white' : 'bg-slate-50 border border-slate-200 text-slate-800'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm mb-2 transition-colors duration-300 ${darkMode ? 'text-white/70' : 'text-slate-600'}`}>计划完成日期</label>
                  <input
                    type="date"
                    value={editingTodo.planned_date}
                    onChange={(e) => setEditingTodo({ ...editingTodo, planned_date: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500 transition-colors duration-300 ${darkMode ? 'bg-white/10 border border-white/20 text-white' : 'bg-slate-50 border border-slate-200 text-slate-800'}`}
                  />
                </div>
              </div>
              <div>
                <label className={`block text-sm mb-2 transition-colors duration-300 ${darkMode ? 'text-white/70' : 'text-slate-600'}`}>优先级</label>
                <div className="flex gap-2">
                  {[1, 2, 3].map(p => (
                    <button
                      key={p}
                      onClick={() => setEditingTodo({ ...editingTodo, priority: p })}
                      className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-all ${
                        editingTodo.priority === p
                          ? `${getPriorityColor(p)} text-white`
                          : darkMode ? 'bg-white/10 text-white/70 hover:bg-white/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {getPriorityText(p)}优先级
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={`block text-sm mb-2 transition-colors duration-300 ${darkMode ? 'text-white/70' : 'text-slate-600'}`}>完成状态</label>
                <button
                  onClick={() => setEditingTodo({ ...editingTodo, completed: !editingTodo.completed })}
                  className={`w-full py-2 rounded-lg font-semibold text-sm transition-all ${
                    editingTodo.completed
                      ? 'bg-green-500 text-white'
                      : darkMode ? 'bg-white/10 text-white/70 hover:bg-white/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {editingTodo.completed ? '已完成' : '待完成'}
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => { setShowEditModal(false); setEditingTodo(null); }}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${darkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                取消
              </button>
              <button
                onClick={handleUpdateTodo}
                disabled={!editingTodo.title.trim()}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className={`rounded-2xl w-full max-w-md p-6 animate-scale-in transition-colors duration-300 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
            <h2 className={`text-2xl font-bold mb-4 transition-colors duration-300 ${darkMode ? 'text-white' : 'text-slate-800'}`}>选择模板</h2>
            <div className="space-y-3">
              {Object.entries(templates).map(([key, template]) => (
                <button
                  key={key}
                  onClick={() => applyTemplate(key)}
                  className={`w-full p-4 rounded-xl text-left transition-all ${darkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-50 hover:bg-slate-100'}`}
                >
                  <h3 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>{template.name}</h3>
                  <div className="flex flex-wrap gap-1">
                    {template.items.slice(0, 3).map((item, index) => (
                      <span key={index} className={`px-2 py-0.5 rounded-full text-xs ${darkMode ? 'bg-white/10 text-white/70' : 'bg-slate-200 text-slate-600'}`}>
                        {item}
                      </span>
                    ))}
                    {template.items.length > 3 && (
                      <span className={`px-2 py-0.5 rounded-full text-xs ${darkMode ? 'bg-white/10 text-white/70' : 'bg-slate-200 text-slate-600'}`}>
                        +{template.items.length - 3}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowTemplateModal(false)}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${darkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {showShareSuccess && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className={`rounded-2xl w-full max-w-md p-6 animate-scale-in text-center transition-colors duration-300 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h2 className={`text-2xl font-bold mb-2 transition-colors duration-300 ${darkMode ? 'text-white' : 'text-slate-800'}`}>分享链接已复制</h2>
            <p className={`text-sm mb-4 ${darkMode ? 'text-white/60' : 'text-slate-500'}`}>链接已自动复制到剪贴板，24小时内有效</p>
            <div className={`p-3 rounded-lg text-left mb-6 ${darkMode ? 'bg-white/5' : 'bg-slate-50'}`}>
              <input
                type="text"
                value={shareUrl}
                readOnly
                className={`w-full bg-transparent ${darkMode ? 'text-white/80' : 'text-slate-600'} text-sm`}
              />
            </div>
            <button
              onClick={() => { setShowShareSuccess(false); setShareUrl(''); }}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              确定
            </button>
          </div>
        </div>
      )}
    </div>
  );
}