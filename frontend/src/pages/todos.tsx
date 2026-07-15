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
  photo: string;
  due_date: string;
  planned_date: string;
}

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [newTodo, setNewTodo] = useState({ title: '', description: '', priority: 1, photo: '', due_date: '', planned_date: '' });
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showBatchDelete, setShowBatchDelete] = useState(false);
  const router = useRouter();

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000/api';

  useEffect(() => {
    fetchTodos();
  }, []);

  useEffect(() => {
    setShowBatchDelete(selectedIds.length > 0);
  }, [selectedIds]);

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
      setNewTodo({ title: '', description: '', priority: 1, photo: '', due_date: '', planned_date: '' });
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

  const isOverdue = (dueDate: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && dueDate !== '';
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

        {showBatchDelete && (
          <div className="mb-4 p-4 bg-white/10 rounded-xl flex items-center justify-between">
            <span className="text-white">已选中 {selectedIds.length} 项</span>
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedIds([])}
                className="px-4 py-2 bg-white/20 text-white rounded-lg font-semibold hover:bg-white/30 transition-all"
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
            <div className="flex items-center gap-4 px-4 py-2">
              <button
                onClick={toggleSelectAll}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                  selectedIds.length === filteredTodos.length && filteredTodos.length > 0
                    ? 'bg-purple-500 border-purple-500'
                    : 'border-white/30 hover:border-white'
                }`}
              >
                {selectedIds.length === filteredTodos.length && filteredTodos.length > 0 && (
                  <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </button>
              <span className="text-white/50 text-sm">全选</span>
            </div>
            {filteredTodos.map(todo => (
              <div
                key={todo.id}
                className={`glass-effect rounded-xl p-4 transition-all hover:bg-white/10 ${
                  todo.completed ? 'opacity-60' : ''
                } ${selectedIds.includes(todo.id) ? 'ring-2 ring-purple-500' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => toggleSelect(todo.id)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      selectedIds.includes(todo.id)
                        ? 'bg-purple-500 border-purple-500'
                        : 'border-white/30 hover:border-white'
                    }`}
                  >
                    {selectedIds.includes(todo.id) && (
                      <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                  </button>
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
                      {isOverdue(todo.due_date) && !todo.completed && (
                        <span className="ml-2 text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">已逾期</span>
                      )}
                    </h3>
                    {todo.description && (
                      <p className="text-white/60 mt-1 line-clamp-2">{todo.description}</p>
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
                        <span className={`text-xs px-2 py-1 rounded-full ${isOverdue(todo.due_date) && !todo.completed ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                          📅 截止: {new Date(todo.due_date).toLocaleDateString('zh-CN')}
                        </span>
                      )}
                      {todo.planned_date && (
                        <span className="text-xs px-2 py-1 rounded-full bg-orange-500/20 text-orange-400">
                          🗓️ 计划: {new Date(todo.planned_date).toLocaleDateString('zh-CN')}
                        </span>
                      )}
                      <span className="text-white/40 text-xs">
                        创建于: {new Date(todo.created_at).toLocaleDateString('zh-CN')}
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
          <div className="bg-slate-800 rounded-2xl w-full max-w-md p-6 animate-scale-in max-h-[90vh] overflow-y-auto">
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
                <label className="block text-white/70 text-sm mb-2">添加照片</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handlePhotoUpload(e, true)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
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
                  <label className="block text-white/70 text-sm mb-2">截止日期</label>
                  <input
                    type="date"
                    value={newTodo.due_date}
                    onChange={(e) => setNewTodo({ ...newTodo, due_date: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-2">计划完成日期</label>
                  <input
                    type="date"
                    value={newTodo.planned_date}
                    onChange={(e) => setNewTodo({ ...newTodo, planned_date: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
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
          <div className="bg-slate-800 rounded-2xl w-full max-w-md p-6 animate-scale-in max-h-[90vh] overflow-y-auto">
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
                <label className="block text-white/70 text-sm mb-2">添加照片</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handlePhotoUpload(e, false)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
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
                  <label className="block text-white/70 text-sm mb-2">截止日期</label>
                  <input
                    type="date"
                    value={editingTodo.due_date}
                    onChange={(e) => setEditingTodo({ ...editingTodo, due_date: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-2">计划完成日期</label>
                  <input
                    type="date"
                    value={editingTodo.planned_date}
                    onChange={(e) => setEditingTodo({ ...editingTodo, planned_date: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
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