import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';

interface Column {
  name: string;
  type: string;
}

interface TableData {
  name: string;
  columns: Column[];
  rows: any[];
  rowCount: number;
}

export default function DatabasePage() {
  const { isDarkMode } = useTheme();
  const [tables, setTables] = useState<TableData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTable, setActiveTable] = useState<string>('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    const fetchDatabase = async () => {
      try {
        const response = await axios.get('/api/admin/database');
        const data = response.data;
        
        const tableData: TableData[] = [
          {
            name: 'users',
            columns: [
              { name: 'id', type: 'INTEGER' },
              { name: 'username', type: 'TEXT' },
              { name: 'email', type: 'TEXT' },
              { name: 'avatar', type: 'TEXT' },
              { name: 'role', type: 'TEXT' },
              { name: 'created_at', type: 'TIMESTAMP' },
            ],
            rows: (data.users || []).map((user: any) => ({
              id: user.id,
              username: user.username,
              email: user.email,
              avatar: user.avatar || 'NULL',
              role: user.role === 'admin' ? '管理员' : '普通用户',
              created_at: user.created_at,
            })),
            rowCount: data.user_count || 0,
          },
          {
            name: 'todos',
            columns: [
              { name: 'id', type: 'INTEGER' },
              { name: 'user_id', type: 'INTEGER' },
              { name: 'title', type: 'TEXT' },
              { name: 'description', type: 'TEXT' },
              { name: 'completed', type: 'BOOLEAN' },
              { name: 'priority', type: 'INTEGER' },
              { name: 'category', type: 'TEXT' },
              { name: 'due_date', type: 'DATE' },
              { name: 'created_at', type: 'TIMESTAMP' },
            ],
            rows: (data.todos || []).map((todo: any) => ({
              id: todo.id,
              user_id: todo.user_id,
              title: todo.title,
              description: todo.description || 'NULL',
              completed: todo.completed ? '已完成' : '待完成',
              priority: todo.priority === 3 ? '高' : todo.priority === 2 ? '中' : '低',
              category: todo.category || '其他',
              due_date: todo.due_date || 'NULL',
              created_at: todo.created_at,
            })),
            rowCount: data.todo_count || 0,
          },
          {
            name: 'audit_logs',
            columns: [
              { name: 'id', type: 'INTEGER' },
              { name: 'user_id', type: 'INTEGER' },
              { name: 'username', type: 'TEXT' },
              { name: 'action', type: 'TEXT' },
              { name: 'resource', type: 'TEXT' },
              { name: 'details', type: 'TEXT' },
              { name: 'created_at', type: 'TIMESTAMP' },
            ],
            rows: (data.logs || []).map((log: any) => ({
              id: log.id,
              user_id: log.user_id || 'NULL',
              username: log.username || 'NULL',
              action: log.action,
              resource: log.resource || 'NULL',
              details: log.details || 'NULL',
              created_at: log.created_at,
            })),
            rowCount: data.log_count || 0,
          },
        ];

        setTables(tableData);
        if (tableData.length > 0) {
          setActiveTable(tableData[0].name);
        }
      } catch (error) {
        console.error('Failed to fetch database data:', error);
        const mockData: TableData[] = [
          {
            name: 'users',
            columns: [
              { name: 'id', type: 'INTEGER' },
              { name: 'username', type: 'TEXT' },
              { name: 'email', type: 'TEXT' },
              { name: 'password', type: 'TEXT' },
              { name: 'avatar', type: 'TEXT' },
              { name: 'role', type: 'TEXT' },
              { name: 'created_at', type: 'TIMESTAMP' },
            ],
            rows: [
              { id: 1, username: 'admin', email: 'admin@example.com', password: '******', avatar: 'NULL', role: '管理员', created_at: '2026-07-18 12:47:01' },
              { id: 2, username: 'testuser', email: 'test@example.com', password: '******', avatar: 'NULL', role: '普通用户', created_at: '2026-07-18 14:52:13' },
              { id: 3, username: 'demo', email: 'demo@example.com', password: '******', avatar: 'NULL', role: '普通用户', created_at: '2026-07-19 09:17:31' },
            ],
            rowCount: 3,
          },
          {
            name: 'todos',
            columns: [
              { name: 'id', type: 'INTEGER' },
              { name: 'user_id', type: 'INTEGER' },
              { name: 'title', type: 'TEXT' },
              { name: 'description', type: 'TEXT' },
              { name: 'completed', type: 'BOOLEAN' },
              { name: 'priority', type: 'INTEGER' },
              { name: 'category', type: 'TEXT' },
              { name: 'due_date', type: 'DATE' },
              { name: 'created_at', type: 'TIMESTAMP' },
            ],
            rows: [
              { id: 1, user_id: 1, title: '完成项目文档', description: '编写项目说明文档', completed: '已完成', priority: '高', category: '工作', due_date: '2026-07-19', created_at: '2026-07-18 15:55:39' },
              { id: 2, user_id: 1, title: '代码审查', description: '审查团队代码', completed: '待完成', priority: '中', category: '工作', due_date: '2026-07-20', created_at: '2026-07-18 16:30:00' },
              { id: 3, user_id: 2, title: '学习React', description: '学习React Hooks', completed: '待完成', priority: '低', category: '学习', due_date: 'NULL', created_at: '2026-07-19 09:21:07' },
            ],
            rowCount: 3,
          },
          {
            name: 'audit_logs',
            columns: [
              { name: 'id', type: 'INTEGER' },
              { name: 'user_id', type: 'INTEGER' },
              { name: 'username', type: 'TEXT' },
              { name: 'action', type: 'TEXT' },
              { name: 'resource', type: 'TEXT' },
              { name: 'details', type: 'TEXT' },
              { name: 'created_at', type: 'TIMESTAMP' },
            ],
            rows: [
              { id: 1, user_id: 1, username: 'admin', action: 'user_login', resource: 'user', details: '用户登录', created_at: '2026-07-18 12:47:01' },
              { id: 2, user_id: 1, username: 'admin', action: 'todo_create', resource: 'todo', details: '创建待办: 完成项目文档', created_at: '2026-07-18 15:55:39' },
              { id: 3, user_id: 2, username: 'testuser', action: 'user_register', resource: 'user', details: '用户注册', created_at: '2026-07-18 14:52:13' },
            ],
            rowCount: 3,
          },
        ];
        setTables(mockData);
        setActiveTable('users');
      } finally {
        setLoading(false);
      }
    };

    fetchDatabase();
  }, []);

  const activeTableData = tables.find(t => t.name === activeTable);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>数据库管理</h1>
          <p className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>查看数据库表结构和数据记录</p>
        </div>

        <div className="flex gap-6">
          <div className={`w-64 flex-shrink-0 rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} shadow-lg`}>
            <div className="p-4 border-b border-slate-700">
              <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>TABLES</h3>
            </div>
            <div className="p-2">
              {tables.map(table => (
                <button
                  key={table.name}
                  onClick={() => setActiveTable(table.name)}
                  className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition-colors flex items-center justify-between ${
                    activeTable === table.name
                      ? isDarkMode ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700'
                      : isDarkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <span className="capitalize">{table.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    isDarkMode ? 'bg-white/20' : 'bg-gray-200'
                  }`}>
                    {table.rowCount}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className={`flex-1 rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} shadow-lg overflow-hidden`}>
            {loading ? (
              <div className="p-8 flex items-center justify-center">
                <div className={`w-8 h-8 border-4 border-${isDarkMode ? 'white/30' : 'gray-300'} border-t-purple-500 rounded-full animate-spin`}></div>
              </div>
            ) : activeTableData ? (
              <>
                <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                  <div>
                    <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {activeTableData.name}
                    </h2>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                      {activeTableData.columns.length} 列 | {activeTableData.rowCount} 行
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-3 py-1 rounded-full ${isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'}`}>
                      SQLite
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <div className={`mb-4 p-3 rounded-xl ${isDarkMode ? 'bg-slate-900/50' : 'bg-gray-50'}`}>
                    <h4 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>表结构</h4>
                    <div className="flex flex-wrap gap-2">
                      {activeTableData.columns.map(col => (
                        <span key={col.name} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
                          isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-white border border-gray-200 text-gray-700'
                        }`}>
                          <span className="font-medium">{col.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            isDarkMode ? 'bg-white/10' : 'bg-gray-100'
                          }`}>
                            {col.type}
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className={`border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                          {activeTableData.columns.map(col => (
                            <th key={col.name} className={`px-4 py-3 text-left text-sm font-semibold ${
                              isDarkMode ? 'text-slate-400' : 'text-gray-500'
                            }`}>
                              {col.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {activeTableData.rows.map((row, index) => (
                          <tr 
                            key={index} 
                            className={`border-b ${isDarkMode ? 'border-slate-700 hover:bg-slate-700/50' : 'border-gray-100 hover:bg-gray-50'}`}
                          >
                            {activeTableData.columns.map(col => (
                              <td key={col.name} className={`px-4 py-3 text-sm ${
                                isDarkMode ? 'text-slate-200' : 'text-gray-700'
                              }`}>
                                {String(row[col.name])}
                              </td>
                            ))}
                          </tr>
                        ))}
                        {activeTableData.rows.length === 0 && (
                          <tr>
                            <td colSpan={activeTableData.columns.length} className={`py-8 text-center ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                              暂无数据
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
