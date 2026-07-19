import sqlite3

conn = sqlite3.connect('todos.db')
conn.row_factory = sqlite3.Row

html_content = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>数据库可视化 - Todo Adventure</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        header {
            text-align: center;
            margin-bottom: 40px;
        }
        header h1 {
            color: #fff;
            font-size: 2.5rem;
            margin-bottom: 10px;
            text-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }
        header p {
            color: rgba(255,255,255,0.7);
            font-size: 1.1rem;
        }
        .table-card {
            background: rgba(255,255,255,0.05);
            backdrop-filter: blur(10px);
            border-radius: 16px;
            margin-bottom: 30px;
            overflow: hidden;
            border: 1px solid rgba(255,255,255,0.1);
            box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        }
        .table-header {
            padding: 20px 24px;
            background: rgba(139, 92, 246, 0.15);
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .table-header h2 {
            color: #fff;
            font-size: 1.5rem;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .table-header h2::before {
            content: '';
            width: 4px;
            height: 24px;
            background: linear-gradient(180deg, #a78bfa, #8b5cf6);
            border-radius: 2px;
        }
        .table-header .meta {
            color: rgba(255,255,255,0.6);
            font-size: 0.9rem;
            margin-top: 5px;
            display: flex;
            gap: 20px;
        }
        .table-header .meta span {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        .table-header .meta span::before {
            content: '•';
            color: #8b5cf6;
        }
        .columns-bar {
            padding: 16px 24px;
            background: rgba(0,0,0,0.2);
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }
        .column-tag {
            padding: 6px 14px;
            background: rgba(139, 92, 246, 0.2);
            border-radius: 20px;
            font-size: 0.85rem;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .column-tag .name {
            color: #a78bfa;
            font-weight: 600;
        }
        .column-tag .type {
            color: rgba(255,255,255,0.6);
            font-size: 0.75rem;
            background: rgba(255,255,255,0.1);
            padding: 2px 8px;
            border-radius: 10px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th {
            background: rgba(0,0,0,0.15);
            color: rgba(255,255,255,0.8);
            padding: 14px 24px;
            text-align: left;
            font-weight: 600;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        td {
            padding: 12px 24px;
            color: rgba(255,255,255,0.9);
            border-bottom: 1px solid rgba(255,255,255,0.05);
            font-size: 0.9rem;
        }
        tr:hover td {
            background: rgba(139, 92, 246, 0.1);
        }
        tr:last-child td {
            border-bottom: none;
        }
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
        }
        .status-completed {
            background: rgba(34, 197, 94, 0.2);
            color: #4ade80;
        }
        .status-pending {
            background: rgba(251, 191, 36, 0.2);
            color: #fbbf24;
        }
        .status-admin {
            background: rgba(239, 68, 68, 0.2);
            color: #f87171;
        }
        .status-user {
            background: rgba(59, 130, 246, 0.2);
            color: #60a5fa;
        }
        .priority-high {
            background: rgba(239, 68, 68, 0.2);
            color: #f87171;
        }
        .priority-medium {
            background: rgba(251, 191, 36, 0.2);
            color: #fbbf24;
        }
        .priority-low {
            background: rgba(34, 197, 94, 0.2);
            color: #4ade80;
        }
        .null-value {
            color: rgba(255,255,255,0.3);
            font-style: italic;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        .stat-card {
            background: rgba(255,255,255,0.05);
            backdrop-filter: blur(10px);
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            border: 1px solid rgba(255,255,255,0.1);
        }
        .stat-card .number {
            font-size: 2.5rem;
            font-weight: 700;
            color: #a78bfa;
            margin-bottom: 5px;
        }
        .stat-card .label {
            color: rgba(255,255,255,0.6);
            font-size: 0.9rem;
        }
        footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid rgba(255,255,255,0.1);
            color: rgba(255,255,255,0.4);
            font-size: 0.85rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🗄️ 数据库可视化</h1>
            <p>Todo Adventure - SQLite 数据库内容</p>
        </header>

        <div class="stats-grid">
"""

total_users = conn.execute('SELECT COUNT(*) as count FROM users').fetchone()['count']
total_todos = conn.execute('SELECT COUNT(*) as count FROM todos').fetchone()['count']
completed_todos = conn.execute('SELECT COUNT(*) as count FROM todos WHERE completed = 1').fetchone()['count']
total_logs = conn.execute('SELECT COUNT(*) as count FROM audit_logs').fetchone()['count']

html_content += f"""            <div class="stat-card">
                <div class="number">{total_users}</div>
                <div class="label">用户总数</div>
            </div>
            <div class="stat-card">
                <div class="number">{total_todos}</div>
                <div class="label">待办总数</div>
            </div>
            <div class="stat-card">
                <div class="number">{completed_todos}</div>
                <div class="label">已完成</div>
            </div>
            <div class="stat-card">
                <div class="number">{total_logs}</div>
                <div class="label">操作日志</div>
            </div>
        </div>
"""

tables = conn.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").fetchall()

for table in tables:
    table_name = table[0]
    if table_name == 'sqlite_sequence':
        continue
    
    columns = conn.execute(f"PRAGMA table_info({table_name})").fetchall()
    rows = conn.execute(f'SELECT * FROM {table_name} ORDER BY id DESC LIMIT 20').fetchall()
    
    html_content += f"""        <div class="table-card">
            <div class="table-header">
                <h2>{table_name}</h2>
                <div class="meta">
                    <span>{len(columns)} 列</span>
                    <span>{len(rows)} 行数据</span>
                </div>
            </div>
            <div class="columns-bar">
"""
    
    for col in columns:
        html_content += f"""                <div class="column-tag">
                    <span class="name">{col[1]}</span>
                    <span class="type">{col[2]}</span>
                </div>
"""
    
    html_content += """            </div>
            <table>
                <thead>
                    <tr>
"""
    
    for col in columns:
        html_content += f"""                        <th>{col[1]}</th>
"""
    
    html_content += """                    </tr>
                </thead>
                <tbody>
"""
    
    for row in rows:
        html_content += """                    <tr>
"""
        for col in columns:
            value = row[col[1]]
            if value is None:
                html_content += f"""                        <td class="null-value">NULL</td>
"""
            elif table_name == 'users' and col[1] == 'role':
                badge_class = 'status-admin' if value == 'admin' else 'status-user'
                label = '管理员' if value == 'admin' else '普通用户'
                html_content += f"""                        <td><span class="status-badge {badge_class}">{label}</span></td>
"""
            elif table_name == 'users' and col[1] == 'password':
                html_content += f"""                        <td class="null-value">******</td>
"""
            elif table_name == 'todos' and col[1] == 'completed':
                badge_class = 'status-completed' if value == 1 else 'status-pending'
                label = '已完成' if value == 1 else '待完成'
                html_content += f"""                        <td><span class="status-badge {badge_class}">{label}</span></td>
"""
            elif table_name == 'todos' and col[1] == 'priority':
                badge_class = 'priority-high' if value == 3 else 'priority-medium' if value == 2 else 'priority-low'
                label = '高' if value == 3 else '中' if value == 2 else '低'
                html_content += f"""                        <td><span class="status-badge {badge_class}">{label}</span></td>
"""
            else:
                html_content += f"""                        <td>{value}</td>
"""
        html_content += """                    </tr>
"""
    
    html_content += """                </tbody>
            </table>
        </div>
"""

html_content += """        <footer>
            <p>Todo Adventure Database Viewer | SQLite</p>
        </footer>
    </div>
</body>
</html>"""

conn.close()

with open('database_view.html', 'w', encoding='utf-8') as f:
    f.write(html_content)

print('数据库可视化报告已生成: database_view.html')
print('请在浏览器中打开此文件查看数据库内容')
