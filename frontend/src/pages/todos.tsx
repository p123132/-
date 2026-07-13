import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

interface Todo {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  priority: number;
  created_at: string;
}

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [newTodo, setNewTodo] = useState({ title: '', description: '', priority: 1 });
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const router = useRouter();

  const API_BASE = 'http://localhost:5000/api';

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/todos`);
      setTodos(response.data);
    } catch (error) {
      console.error('Failed to fetch todos:', error);
    }
    setLoading(false);
  };

  const handleAddTodo = async () => {
    if (!newTodo.title.trim()) return;
    try {
      await axios.post(`${API_BASE}/todos`, newTodo);
      setNewTodo({ title: '', description: '', priority: 1 });
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
      fetchTodos();
    } catch (error) {
      console.error('Failed to delete todo:', error);
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

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
      <header className="bg-white/5 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <h1 className="text-2xl font-bold text-white">待办清单</h1>
          </div>
          <button
            onClick={() => router.push('/')}
            className="text-white/70 hover:text-white transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            返回首页
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                filter === 'all' ? 'bg-white text-purple-700' : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              全部 ({todos.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                filter === 'active' ? 'bg-white text-purple-700' : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              待完成 ({todos.filter(t => !t.completed).length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                filter === 'completed' ? 'bg-white text-purple-700' : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              已完成 ({todos.filter(t => t.completed).length})
            </button>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            添加待办
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
          </div>
        ) : filteredTodos.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-16 h-16 text-white/30 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"/>
              <path d="M8 12h8"/>
              <path d="M12 8v8"/>
            </svg>
            <p className="text-white/50 text-lg">暂无待办事项</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 text-purple-400 hover:text-purple-300 font-semibold"
            >
              立即添加
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTodos.map(todo => (
              <div
                key={todo.id}
                className={`glass-effect rounded-xl p-4 transition-all hover:bg-white/10 ${
                  todo.completed ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => handleToggleComplete(todo.id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      todo.completed
                        ? 'bg-green-500 border-green-500'
                        : 'border-white/30 hover:border-white'
                    }`}
                  >
                    {todo.completed && (
                      <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold text-lg ${todo.completed ? 'line-through text-white/50' : 'text-white'}`}>
                      {todo.title}
                    </h3>
                    {todo.description && (
                      <p className="text-white/60 mt-1 line-clamp-2">{todo.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(todo.priority)} text-white`}>
                        {getPriorityText(todo.priority)}优先级
                      </span>
                      <span className="text-white/40 text-xs">
                        {new Date(todo.created_at).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setEditingTodo(todo); setShowEditModal(true); }}
                      className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                        <path d="m15 5 4 4"/>
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteTodo(todo.id)}
                      className="p-2 text-white/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
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
            ))}
          </div>
        )}
      </main>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-md p-6 animate-scale-in">
            <h2 className="text-2xl font-bold text-white mb-4">添加新待办</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-white/70 text-sm mb-2">标题 *</label>
                <input
                  type="text"
                  value={newTodo.title}
                  onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-purple-500"
                  placeholder="输入待办事项标题"
                />
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-2">描述</label>
                <textarea
                  value={newTodo.description}
                  onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-purple-500 resize-none"
                  placeholder="输入待办事项描述"
                />
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-2">优先级</label>
                <div className="flex gap-2">
                  {[1, 2, 3].map(p => (
                    <button
                      key={p}
                      onClick={() => setNewTodo({ ...newTodo, priority: p })}
                      className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-all ${
                        newTodo.priority === p
                          ? `${getPriorityColor(p)} text-white`
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
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
                className="px-6 py-2 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-all"
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
          <div className="bg-slate-800 rounded-2xl w-full max-w-md p-6 animate-scale-in">
            <h2 className="text-2xl font-bold text-white mb-4">编辑待办</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-white/70 text-sm mb-2">标题 *</label>
                <input
                  type="text"
                  value={editingTodo.title}
                  onChange={(e) => setEditingTodo({ ...editingTodo, title: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-2">描述</label>
                <textarea
                  value={editingTodo.description}
                  onChange={(e) => setEditingTodo({ ...editingTodo, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-2">优先级</label>
                <div className="flex gap-2">
                  {[1, 2, 3].map(p => (
                    <button
                      key={p}
                      onClick={() => setEditingTodo({ ...editingTodo, priority: p })}
                      className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-all ${
                        editingTodo.priority === p
                          ? `${getPriorityColor(p)} text-white`
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      {getPriorityText(p)}优先级
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-2">完成状态</label>
                <button
                  onClick={() => setEditingTodo({ ...editingTodo, completed: !editingTodo.completed })}
                  className={`w-full py-2 rounded-lg font-semibold text-sm transition-all ${
                    editingTodo.completed
                      ? 'bg-green-500 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {editingTodo.completed ? '已完成' : '待完成'}
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => { setShowEditModal(false); setEditingTodo(null); }}
                className="px-6 py-2 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-all"
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
    </div>
  );
}