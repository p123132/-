import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useTheme } from '../context/ThemeContext';

const CATEGORY_COLORS: Record<string, string> = {
  '工作': 'bg-blue-500',
  '学习': 'bg-green-500',
  '生活': 'bg-orange-500',
  '其他': 'bg-gray-500',
};

const TAB_CONFIG = [
  { id: 'overview', label: '数据概览', icon: '📊' },
  { id: 'users', label: '用户管理', icon: '👥' },
  { id: 'todos', label: '待办数据', icon: '📝' },
  { id: 'logs', label: '操作日志', icon: '📋' },
];

const ACTION_LABELS: Record<string, string> = {
  'user_register': '用户注册',
  'user_login': '用户登录',
  'profile_update': '更新资料',
  'password_change': '修改密码',
  'todo_create': '创建待办',
  'todo_update': '更新待办',
  'todo_delete': '删除待办',
  'todo_batch_delete': '批量删除',
  'todo_toggle': '切换状态',
  'todo_share': '分享待办',
  'template_apply': '应用模板',
  'admin_stats_view': '查看统计',
  'admin_users_view': '查看用户',
  'admin_user_update': '更新用户',
  'admin_user_delete': '删除用户',
};

const ACTION_COLORS: Record<string, string> = {
  'user_register': 'text-green-400',
  'user_login': 'text-blue-400',
  'profile_update': 'text-purple-400',
  'password_change': 'text-orange-400',
  'todo_create': 'text-emerald-400',
  'todo_update': 'text-cyan-400',
  'todo_delete': 'text-red-400',
  'todo_batch_delete': 'text-red-400',
  'todo_toggle': 'text-yellow-400',
  'todo_share': 'text-pink-400',
  'template_apply': 'text-indigo-400',
  'admin_stats_view': 'text-blue-400',
  'admin_users_view': 'text-blue-400',
  'admin_user_update': 'text-purple-400',
  'admin_user_delete': 'text-red-400',
};

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'todos' | 'logs'>('overview');
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const { isDarkMode } = useTheme();

  const API_BASE = '/api';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    fetchStats();
    fetchUsers();
    fetchLogs();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE}/admin/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE}/admin/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await axios.get(`${API_BASE}/admin/logs`);
      setLogs(response.data);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    }
    setLoading(false);
  };

  const updateUserRole = async (userId: number, role: string) => {
    try {
      await axios.put(`${API_BASE}/admin/users/${userId}`, { role });
      fetchUsers();
      fetchStats();
    } catch (error) {
      console.error('Failed to update user role:', error);
    }
  };

  const deleteUser = async (userId: number) => {
    try {
      await axios.delete(`${API_BASE}/admin/users/${userId}`);
      fetchUsers();
      fetchStats();
      setConfirmDelete(null);
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

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

  const exportUsersToCSV = () => {
    const headers = ['ID', '用户名', '邮箱', '角色', '待办数', '注册时间'];
    const rows = users.map((user: any) => [
      user.id,
      `"${user.username.replace(/"/g, '""')}"`,
      `"${user.email.replace(/"/g, '""')}"`,
      user.role === 'admin' ? '管理员' : '普通用户',
      user.todo_count || 0,
      new Date(user.created_at).toLocaleDateString('zh-CN')
    ]);

    const csvContent = [headers.join(','), ...rows.map((row: any[]) => row.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportTodosToCSV = () => {
    if (!stats?.recent_todos) return;
    
    const headers = ['ID', '标题', '用户', '分类', '优先级', '状态', '截止日期', '创建时间'];
    const rows = stats.recent_todos.map((todo: any) => [
      todo.id,
      `"${todo.title.replace(/"/g, '""')}"`,
      todo.username || '',
      todo.category,
      getPriorityText(todo.priority),
      todo.completed ? '已完成' : '待完成',
      todo.due_date ? new Date(todo.due_date).toLocaleDateString('zh-CN') : '',
      new Date(todo.created_at).toLocaleString('zh-CN')
    ]);

    const csvContent = [headers.join(','), ...rows.map((row: any[]) => row.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `todos_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportLogsToCSV = () => {
    const headers = ['ID', '操作', '用户', '资源', '详情', '时间'];
    const rows = logs.map((log: any) => [
      log.id,
      ACTION_LABELS[log.action] || log.action,
      log.username || '',
      log.resource ? `${log.resource}#${log.resource_id || ''}` : '',
      `"${(log.details || '').replace(/"/g, '""')}"`,
      new Date(log.created_at).toLocaleString('zh-CN')
    ]);

    const csvContent = [headers.join(','), ...rows.map((row: any[]) => row.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `logs_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-slate-900' : 'bg-gray-100'}`}>
        <div className="flex flex-col items-center gap-4">
          <div className={`w-12 h-12 border-4 rounded-full animate-spin ${isDarkMode ? 'border-purple-500/30 border-t-purple-500' : 'border-purple-200 border-t-purple-500'}`}></div>
          <p className={`text-lg ${isDarkMode ? 'text-white/60' : 'text-gray-500'}`}>加载数据中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'}`}>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>管理控制台</h1>
          <p className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>监控和管理所有系统数据</p>
        </div>

        <div className={`backdrop-blur-lg rounded-2xl border p-6 mb-8 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-1">
              {TAB_CONFIG.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`relative px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
                      : isDarkMode ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-white rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              {activeTab === 'users' && (
                <button
                  onClick={exportUsersToCSV}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isDarkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  导出CSV
                </button>
              )}
              {activeTab === 'todos' && (
                <button
                  onClick={exportTodosToCSV}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isDarkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  导出CSV
                </button>
              )}
              {activeTab === 'logs' && (
                <>
                  <button
                    onClick={exportLogsToCSV}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isDarkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    导出CSV
                  </button>
                  <button
                    onClick={fetchLogs}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isDarkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="23 4 23 10 17 10"/>
                      <polyline points="1 20 1 14 7 14"/>
                      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                    </svg>
                    刷新日志
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {activeTab === 'overview' && stats && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className={`backdrop-blur-lg rounded-2xl p-6 border transition-all duration-300 ${isDarkMode ? 'bg-blue-600/20 border-blue-500/20' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                    <span className="text-2xl">👥</span>
                  </div>
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-full">
                    总用户
                  </span>
                </div>
                <p className={`text-3xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.total_users}</p>
                <p className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>个注册用户</p>
              </div>

              <div className={`backdrop-blur-lg rounded-2xl p-6 border transition-all duration-300 ${isDarkMode ? 'bg-purple-600/20 border-purple-500/20' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                    <span className="text-2xl">📋</span>
                  </div>
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs font-semibold rounded-full">
                    总待办
                  </span>
                </div>
                <p className={`text-3xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.total_todos}</p>
                <p className={`text-sm ${isDarkMode ? 'text-purple-300' : 'text-purple-600'}`}>条任务记录</p>
              </div>

              <div className={`backdrop-blur-lg rounded-2xl p-6 border transition-all duration-300 ${isDarkMode ? 'bg-green-600/20 border-green-500/20' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-green-500/20' : 'bg-green-100'}`}>
                    <span className="text-2xl">✅</span>
                  </div>
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full">
                    已完成
                  </span>
                </div>
                <p className={`text-3xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.completed_todos}</p>
                <p className={`text-sm ${isDarkMode ? 'text-green-300' : 'text-green-600'}`}>任务已完成</p>
              </div>

              <div className={`backdrop-blur-lg rounded-2xl p-6 border transition-all duration-300 ${isDarkMode ? 'bg-orange-600/20 border-orange-500/20' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-orange-500/20' : 'bg-orange-100'}`}>
                    <span className="text-2xl">📊</span>
                  </div>
                  <span className="px-3 py-1 bg-orange-500/20 text-orange-400 text-xs font-semibold rounded-full">
                    完成率
                  </span>
                </div>
                <p className={`text-3xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.completion_rate}%</p>
                <p className={`text-sm ${isDarkMode ? 'text-orange-300' : 'text-orange-600'}`}>任务完成比例</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className={`backdrop-blur-lg rounded-2xl p-6 border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>分类统计</h3>
                    <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>各分类任务数量分布</p>
                  </div>
                </div>
                <div className="space-y-5">
                  {stats.category_stats.map((cat: any) => (
                    <div key={cat.category}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${CATEGORY_COLORS[cat.category] || 'bg-gray-500'}`}></div>
                          <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{cat.category}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                            {stats.total_todos > 0 ? Math.round((cat.count / stats.total_todos) * 100) : 0}%
                          </span>
                          <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{cat.count}</span>
                        </div>
                      </div>
                      <div className={`h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`}>
                        <div
                          className={`h-full rounded-full transition-all duration-700 ease-out ${CATEGORY_COLORS[cat.category] || 'bg-gray-500'}`}
                          style={{ width: `${stats.total_todos > 0 ? (cat.count / stats.total_todos) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`backdrop-blur-lg rounded-2xl p-6 border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>最新用户</h3>
                    <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>最近注册的用户</p>
                  </div>
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs font-semibold rounded-full">
                    {stats.users.length} 位用户
                  </span>
                </div>
                <div className="space-y-4">
                  {stats.users.slice(0, 5).map((user: any) => (
                    <div key={user.id} className={`flex items-center justify-between p-4 rounded-xl hover:transition-colors ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'}`}>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-lg">
                          {user.avatar || user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user.username}</p>
                          <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-lg">
                            {user.todo_count} 待办
                          </span>
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded-lg">
                            {user.completed_count} 完成
                          </span>
                          {user.role === 'admin' && (
                            <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-semibold rounded-lg">
                              管理员
                            </span>
                          )}
                        </div>
                        <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                          {new Date(user.created_at).toLocaleDateString('zh-CN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className={`backdrop-blur-lg rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
            <div className={`p-6 border-b ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>用户管理</h3>
                  <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>共 {users.length} 位用户 | 管理员可管理用户角色</p>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={isDarkMode ? 'bg-white/5' : 'bg-gray-50'}>
                    <th className={`text-left px-6 py-4 font-medium text-sm uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>ID</th>
                    <th className={`text-left px-6 py-4 font-medium text-sm uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>用户</th>
                    <th className={`text-left px-6 py-4 font-medium text-sm uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>邮箱</th>
                    <th className={`text-center px-6 py-4 font-medium text-sm uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>角色</th>
                    <th className={`text-center px-6 py-4 font-medium text-sm uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>待办数</th>
                    <th className={`text-center px-6 py-4 font-medium text-sm uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>注册时间</th>
                    <th className={`text-center px-6 py-4 font-medium text-sm uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>操作</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-white/5' : 'divide-gray-200'}`}>
                  {users.map((user: any) => (
                    <tr key={user.id} className={`hover:transition-colors ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-mono ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>#{user.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                            {user.avatar || user.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{user.email}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <select
                          value={user.role}
                          onChange={(e) => updateUserRole(user.id, e.target.value)}
                          className={`px-3 py-1.5 rounded-lg text-sm border focus:outline-none focus:border-purple-500 ${isDarkMode ? 'bg-white/10 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                        >
                          <option value="user">普通用户</option>
                          <option value="admin">管理员</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user.todo_count || 0}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                          {new Date(user.created_at).toLocaleDateString('zh-CN')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {confirmDelete === user.id ? (
                            <>
                              <button
                                onClick={() => deleteUser(user.id)}
                                className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
                              >
                                确认删除
                              </button>
                              <button
                                onClick={() => setConfirmDelete(null)}
                                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${isDarkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                              >
                                取消
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setConfirmDelete(user.id)}
                              className="px-3 py-1.5 bg-red-500/20 text-red-400 text-sm rounded-lg hover:bg-red-500/30 transition-colors"
                            >
                              删除
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'todos' && stats && (
          <div className={`backdrop-blur-lg rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
            <div className={`p-6 border-b ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>待办列表</h3>
                  <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>显示最近 {stats.recent_todos.length} 条待办</p>
                </div>
                <div className="flex gap-3">
                  <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-semibold rounded-full">
                    {stats.pending_todos} 待完成
                  </span>
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full">
                    {stats.completed_todos} 已完成
                  </span>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={isDarkMode ? 'bg-white/5' : 'bg-gray-50'}>
                    <th className={`text-left px-6 py-4 font-medium text-sm uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>ID</th>
                    <th className={`text-left px-6 py-4 font-medium text-sm uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>标题</th>
                    <th className={`text-left px-6 py-4 font-medium text-sm uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>用户</th>
                    <th className={`text-left px-6 py-4 font-medium text-sm uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>分类</th>
                    <th className={`text-center px-6 py-4 font-medium text-sm uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>优先级</th>
                    <th className={`text-center px-6 py-4 font-medium text-sm uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>状态</th>
                    <th className={`text-left px-6 py-4 font-medium text-sm uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>截止日期</th>
                    <th className={`text-left px-6 py-4 font-medium text-sm uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>创建时间</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-white/5' : 'divide-gray-200'}`}>
                  {stats.recent_todos.map((todo: any) => (
                    <tr key={todo.id} className={`hover:transition-colors ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-mono ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>#{todo.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className={`font-medium ${todo.completed ? (isDarkMode ? 'text-slate-500 line-through' : 'text-gray-400 line-through') : (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
                            {todo.title}
                          </p>
                          {todo.description && (
                            <p className={`text-xs mt-1 line-clamp-1 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>{todo.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                            <span className="text-purple-400 text-xs font-semibold">
                              {todo.username?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{todo.username || '未知'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${CATEGORY_COLORS[todo.category] || 'bg-gray-500'} text-white`}>
                          {todo.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(todo.priority)} text-white`}>
                          {getPriorityText(todo.priority)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                          todo.completed 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {todo.completed ? (
                            <>
                              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                              已完成
                            </>
                          ) : (
                            <>
                              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <circle cx="12" cy="12" r="10"/>
                              </svg>
                              待完成
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm ${todo.due_date && new Date(todo.due_date) < new Date() && !todo.completed ? 'text-red-400' : (isDarkMode ? 'text-slate-400' : 'text-gray-500')}`}>
                          {todo.due_date ? new Date(todo.due_date).toLocaleDateString('zh-CN') : '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                          {new Date(todo.created_at).toLocaleString('zh-CN')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className={`backdrop-blur-lg rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
            <div className={`p-6 border-b ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>操作日志</h3>
                  <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>最近 {logs.length} 条系统操作记录</p>
                </div>
              </div>
            </div>
            <div className={`divide-y max-h-[600px] overflow-y-auto ${isDarkMode ? 'divide-white/5' : 'divide-gray-200'}`}>
              {logs.map((log: any) => (
                <div key={log.id} className={`flex items-start gap-4 p-4 hover:transition-colors ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}>
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                    <span className="text-purple-400 text-lg">📝</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-1">
                      <span className={`font-semibold ${ACTION_COLORS[log.action] || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
                        {ACTION_LABELS[log.action] || log.action}
                      </span>
                      {log.resource && (
                        <span className={`px-2 py-0.5 text-xs rounded ${isDarkMode ? 'bg-white/10 text-slate-400' : 'bg-gray-100 text-gray-500'}`}>
                          {log.resource}#{log.resource_id || ''}
                        </span>
                      )}
                      {log.username && (
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">
                          {log.username}
                        </span>
                      )}
                    </div>
                    {log.details && (
                      <p className={`text-sm mb-2 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>{log.details}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs">
                      <span className={isDarkMode ? 'text-slate-600' : 'text-gray-400'}>{new Date(log.created_at).toLocaleString('zh-CN')}</span>
                      {log.ip_address && (
                        <span className={isDarkMode ? 'text-slate-600' : 'text-gray-400'}>IP: {log.ip_address}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {logs.length === 0 && (
                <div className="py-12 text-center">
                  <span className="text-4xl">📭</span>
                  <p className={isDarkMode ? 'text-slate-500 mt-4' : 'text-gray-400 mt-4'}>暂无操作日志</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
