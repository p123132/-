from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import os
import bcrypt
import jwt
import datetime
import uuid

default_static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'frontend_dist')
if not os.path.exists(default_static_dir):
    default_static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'frontend', 'out')
static_dir = os.environ.get('STATIC_DIR', default_static_dir)
app = Flask(__name__, static_folder=static_dir, static_url_path='')
CORS(app, origins=['http://localhost:3000', 'http://localhost:5000', 'https://todo-adventure.vercel.app', 'https://todo-adventure-backend-production.up.railway.app', '*'])

DATABASE = os.environ.get('TODO_DB_PATH', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'todos.db'))
SECRET_KEY = 'your-secret-key-change-in-production'

ROLES = {
    'USER': 'user',
    'ADMIN': 'admin'
}

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    with conn:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                email TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                avatar TEXT,
                role TEXT DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        conn.execute('''
            CREATE TABLE IF NOT EXISTS todos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                completed BOOLEAN DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                priority INTEGER DEFAULT 1,
                photo TEXT,
                due_date DATE,
                planned_date DATE,
                category TEXT DEFAULT '其他',
                share_token TEXT,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        conn.execute('''
            CREATE TABLE IF NOT EXISTS audit_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                action TEXT NOT NULL,
                resource TEXT,
                resource_id INTEGER,
                details TEXT,
                ip_address TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        try:
            conn.execute('ALTER TABLE todos ADD COLUMN user_id INTEGER NOT NULL DEFAULT 1')
        except sqlite3.OperationalError:
            pass
        try:
            conn.execute('ALTER TABLE todos ADD COLUMN photo TEXT')
        except sqlite3.OperationalError:
            pass
        try:
            conn.execute('ALTER TABLE todos ADD COLUMN due_date DATE')
        except sqlite3.OperationalError:
            pass
        try:
            conn.execute('ALTER TABLE todos ADD COLUMN planned_date DATE')
        except sqlite3.OperationalError:
            pass
        try:
            conn.execute('ALTER TABLE todos ADD COLUMN category TEXT DEFAULT "其他"')
        except sqlite3.OperationalError:
            pass
        try:
            conn.execute('ALTER TABLE users ADD COLUMN avatar TEXT')
        except sqlite3.OperationalError:
            pass
        try:
            conn.execute('ALTER TABLE todos ADD COLUMN share_token TEXT')
        except sqlite3.OperationalError:
            pass
        try:
            conn.execute('ALTER TABLE users ADD COLUMN role TEXT DEFAULT "user"')
        except sqlite3.OperationalError:
            pass
        
        admin_exists = conn.execute('SELECT * FROM users WHERE role = "admin"').fetchone()
        if not admin_exists:
            hashed_password = bcrypt.hashpw('admin123'.encode('utf-8'), bcrypt.gensalt())
            conn.execute('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)', 
                        ('admin', 'admin@example.com', hashed_password, 'admin'))
            conn.commit()
            print('Admin user created: username=admin, password=admin123')
    
    conn.close()

def generate_token(user_id, role):
    payload = {
        'user_id': user_id,
        'role': role,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')

def verify_token(token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def get_user_id_from_request():
    token = request.headers.get('Authorization')
    if not token:
        return None
    if token.startswith('Bearer '):
        token = token[7:]
    payload = verify_token(token)
    return payload.get('user_id') if payload else None

def get_user_role_from_request():
    token = request.headers.get('Authorization')
    if not token:
        return None
    if token.startswith('Bearer '):
        token = token[7:]
    payload = verify_token(token)
    return payload.get('role') if payload else None

def is_admin():
    role = get_user_role_from_request()
    return role == 'admin'

def log_action(action, resource=None, resource_id=None, details=None):
    user_id = get_user_id_from_request()
    ip_address = request.remote_addr
    conn = get_db()
    conn.execute('''
        INSERT INTO audit_logs (user_id, action, resource, resource_id, details, ip_address)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (user_id, action, resource, resource_id, details, ip_address))
    conn.commit()
    conn.close()

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or 'username' not in data or 'email' not in data or 'password' not in data:
        return jsonify({'error': 'Username, email and password are required'}), 400
    
    conn = get_db()
    try:
        hashed_password = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
        cursor = conn.execute('''
            INSERT INTO users (username, email, password, role)
            VALUES (?, ?, ?, ?)
        ''', (data['username'], data['email'], hashed_password, 'user'))
        conn.commit()
        user = conn.execute('SELECT id, username, email, role, created_at FROM users WHERE id = ?', (cursor.lastrowid,)).fetchone()
        token = generate_token(user['id'], user['role'])
        conn.close()
        
        log_action('user_register', 'user', cursor.lastrowid, f"Username: {data['username']}, Email: {data['email']}")
        
        return jsonify({
            'message': 'User registered successfully',
            'user': dict(user),
            'token': token
        }), 201
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({'error': 'Username or email already exists'}), 409

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or ('email' not in data and 'username' not in data) or 'password' not in data:
        return jsonify({'error': 'Email/username and password are required'}), 400
    
    conn = get_db()
    if 'email' in data:
        user = conn.execute('SELECT * FROM users WHERE email = ?', (data['email'],)).fetchone()
    else:
        user = conn.execute('SELECT * FROM users WHERE username = ?', (data['username'],)).fetchone()
    
    if not user:
        conn.close()
        return jsonify({'error': 'Invalid credentials'}), 401
    
    if not bcrypt.checkpw(data['password'].encode('utf-8'), user['password']):
        conn.close()
        return jsonify({'error': 'Invalid credentials'}), 401
    
    token = generate_token(user['id'], user['role'])
    conn.close()
    
    log_action('user_login', 'user', user['id'], f"Username: {user['username']}")
    
    return jsonify({
        'message': 'Login successful',
        'user': {
            'id': user['id'],
            'username': user['username'],
            'email': user['email'],
            'role': user['role'],
            'avatar': user['avatar'],
            'created_at': user['created_at']
        },
        'token': token
    })

@app.route('/api/auth/me', methods=['GET'])
def get_current_user():
    user_id = get_user_id_from_request()
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    
    conn = get_db()
    user = conn.execute('SELECT id, username, email, role, avatar, created_at FROM users WHERE id = ?', (user_id,)).fetchone()
    conn.close()
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify(dict(user))

@app.route('/api/users/profile', methods=['PUT'])
def update_profile():
    user_id = get_user_id_from_request()
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.get_json()
    conn = get_db()
    
    conn.execute('''
        UPDATE users SET username = ?, email = ?, avatar = ?
        WHERE id = ?
    ''', (data.get('username'), data.get('email'), data.get('avatar', ''), user_id))
    conn.commit()
    
    user = conn.execute('SELECT id, username, email, role, avatar, created_at FROM users WHERE id = ?', (user_id,)).fetchone()
    conn.close()
    
    log_action('profile_update', 'user', user_id, f"Updated profile for user {user_id}")
    
    return jsonify(dict(user))

@app.route('/api/users/change-password', methods=['POST'])
def change_password():
    user_id = get_user_id_from_request()
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.get_json()
    if not data or 'current_password' not in data or 'new_password' not in data:
        return jsonify({'error': 'Current and new password are required'}), 400
    
    conn = get_db()
    user = conn.execute('SELECT * FROM users WHERE id = ?', (user_id,)).fetchone()
    
    if not bcrypt.checkpw(data['current_password'].encode('utf-8'), user['password']):
        conn.close()
        return jsonify({'error': 'Current password is incorrect'}), 401
    
    hashed_password = bcrypt.hashpw(data['new_password'].encode('utf-8'), bcrypt.gensalt())
    conn.execute('UPDATE users SET password = ? WHERE id = ?', (hashed_password, user_id))
    conn.commit()
    conn.close()
    
    log_action('password_change', 'user', user_id, f"Changed password for user {user_id}")
    
    return jsonify({'message': 'Password changed successfully'})

@app.route('/api/users/stats', methods=['GET'])
def user_stats():
    user_id = get_user_id_from_request()
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    
    conn = get_db()
    
    total_todos = conn.execute('SELECT COUNT(*) as count FROM todos WHERE user_id = ?', (user_id,)).fetchone()['count']
    completed_todos = conn.execute('SELECT COUNT(*) as count FROM todos WHERE user_id = ? AND completed = 1', (user_id,)).fetchone()['count']
    
    daily_stats = conn.execute('''
        SELECT DATE(created_at) as date, COUNT(*) as count,
               SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed
        FROM todos
        WHERE user_id = ? AND created_at >= DATE('now', '-7 days')
        GROUP BY DATE(created_at)
        ORDER BY date
    ''', (user_id,)).fetchall()
    
    category_stats = conn.execute('''
        SELECT category, COUNT(*) as count,
               SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed
        FROM todos
        WHERE user_id = ?
        GROUP BY category
        ORDER BY count DESC
    ''', (user_id,)).fetchall()
    
    priority_stats = conn.execute('''
        SELECT priority, COUNT(*) as count
        FROM todos
        WHERE user_id = ?
        GROUP BY priority
        ORDER BY priority DESC
    ''', (user_id,)).fetchall()
    
    due_soon = conn.execute('''
        SELECT * FROM todos WHERE user_id = ? AND completed = 0 AND due_date IS NOT NULL AND due_date <= DATE('now', '+3 days')
        ORDER BY due_date
        LIMIT 5
    ''', (user_id,)).fetchall()
    
    conn.close()
    
    return jsonify({
        'total_todos': total_todos,
        'completed_todos': completed_todos,
        'pending_todos': total_todos - completed_todos,
        'completion_rate': round((completed_todos / total_todos * 100) if total_todos > 0 else 0, 1),
        'daily_stats': [dict(d) for d in daily_stats],
        'category_stats': [dict(c) for c in category_stats],
        'priority_stats': [dict(p) for p in priority_stats],
        'due_soon': [dict(d) for d in due_soon]
    })

@app.route('/api/todos', methods=['GET'])
def get_todos():
    user_id = get_user_id_from_request()
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    
    conn = get_db()
    todos = conn.execute('SELECT * FROM todos WHERE user_id = ? ORDER BY priority DESC, created_at DESC', (user_id,)).fetchall()
    conn.close()
    return jsonify([dict(todo) for todo in todos])

@app.route('/api/todos', methods=['POST'])
def create_todo():
    user_id = get_user_id_from_request()
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.get_json()
    if not data or 'title' not in data:
        return jsonify({'error': 'Title is required'}), 400
    
    conn = get_db()
    cursor = conn.execute('''
        INSERT INTO todos (user_id, title, description, priority, photo, due_date, planned_date, category)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (user_id, data['title'], data.get('description', ''), data.get('priority', 1),
          data.get('photo', ''), data.get('due_date', ''), data.get('planned_date', ''),
          data.get('category', '其他')))
    conn.commit()
    todo = conn.execute('SELECT * FROM todos WHERE id = ?', (cursor.lastrowid,)).fetchone()
    conn.close()
    
    log_action('todo_create', 'todo', cursor.lastrowid, f"Title: {data['title']}")
    
    return jsonify(dict(todo)), 201

@app.route('/api/todos/<int:id>', methods=['PUT'])
def update_todo(id):
    user_id = get_user_id_from_request()
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.get_json()
    conn = get_db()
    todo = conn.execute('SELECT * FROM todos WHERE id = ? AND user_id = ?', (id, user_id)).fetchone()
    if not todo:
        conn.close()
        return jsonify({'error': 'Todo not found'}), 404
    
    conn.execute('''
        UPDATE todos SET title = ?, description = ?, completed = ?, priority = ?, photo = ?, due_date = ?, planned_date = ?, category = ?
        WHERE id = ? AND user_id = ?
    ''', (data.get('title', todo['title']), data.get('description', todo['description']), 
          data.get('completed', todo['completed']), data.get('priority', todo['priority']),
          data.get('photo', todo['photo']), data.get('due_date', todo['due_date']),
          data.get('planned_date', todo['planned_date']), data.get('category', todo['category']), id, user_id))
    conn.commit()
    updated_todo = conn.execute('SELECT * FROM todos WHERE id = ?', (id,)).fetchone()
    conn.close()
    
    log_action('todo_update', 'todo', id, f"Updated todo {id}")
    
    return jsonify(dict(updated_todo))

@app.route('/api/todos/<int:id>', methods=['DELETE'])
def delete_todo(id):
    user_id = get_user_id_from_request()
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    
    conn = get_db()
    todo = conn.execute('SELECT * FROM todos WHERE id = ? AND user_id = ?', (id, user_id)).fetchone()
    if not todo:
        conn.close()
        return jsonify({'error': 'Todo not found'}), 404
    
    conn.execute('DELETE FROM todos WHERE id = ? AND user_id = ?', (id, user_id))
    conn.commit()
    conn.close()
    
    log_action('todo_delete', 'todo', id, f"Deleted todo {id}")
    
    return jsonify({'message': 'Todo deleted successfully'}), 200

@app.route('/api/todos/batch', methods=['DELETE'])
def batch_delete_todos():
    user_id = get_user_id_from_request()
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.get_json()
    if not data or not isinstance(data.get('ids'), list):
        return jsonify({'error': 'IDs list is required'}), 400
    
    conn = get_db()
    placeholders = ','.join('?' * len(data['ids']))
    conn.execute(f'DELETE FROM todos WHERE id IN ({placeholders}) AND user_id = ?', data['ids'] + [user_id])
    conn.commit()
    conn.close()
    
    log_action('todo_batch_delete', 'todo', None, f"Deleted {len(data['ids'])} todos")
    
    return jsonify({'message': f'{len(data["ids"])} todos deleted successfully'}), 200

@app.route('/api/todos/<int:id>/complete', methods=['POST'])
def toggle_complete(id):
    user_id = get_user_id_from_request()
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    
    conn = get_db()
    todo = conn.execute('SELECT * FROM todos WHERE id = ? AND user_id = ?', (id, user_id)).fetchone()
    if not todo:
        conn.close()
        return jsonify({'error': 'Todo not found'}), 404
    
    new_status = not todo['completed']
    conn.execute('UPDATE todos SET completed = ? WHERE id = ? AND user_id = ?', (new_status, id, user_id))
    conn.commit()
    updated_todo = conn.execute('SELECT * FROM todos WHERE id = ?', (id,)).fetchone()
    conn.close()
    
    log_action('todo_toggle', 'todo', id, f"Toggle todo {id} to {'completed' if new_status else 'pending'}")
    
    return jsonify(dict(updated_todo))

TEMPLATES = {
    'daily_report': {
        'name': '日报模板',
        'items': ['今日完成任务', '明日计划', '遇到的问题', '需要的帮助']
    },
    'weekly_report': {
        'name': '周报模板',
        'items': ['本周完成', '下周计划', '问题与风险', '改进建议']
    },
    'habit_tracker': {
        'name': '习惯打卡',
        'items': ['早起', '运动', '阅读', '喝水', '冥想']
    },
    'meeting_notes': {
        'name': '会议记录',
        'items': ['会议主题', '参会人员', '讨论内容', '决议事项', '待办事项']
    }
}

@app.route('/api/templates', methods=['GET'])
def get_templates():
    user_id = get_user_id_from_request()
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    return jsonify(TEMPLATES)

@app.route('/api/templates/<name>/apply', methods=['POST'])
def apply_template(name):
    user_id = get_user_id_from_request()
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    
    if name not in TEMPLATES:
        return jsonify({'error': 'Template not found'}), 404
    
    template = TEMPLATES[name]
    conn = get_db()
    created_ids = []
    
    for item in template['items']:
        cursor = conn.execute('''
            INSERT INTO todos (user_id, title, category)
            VALUES (?, ?, ?)
        ''', (user_id, item, '其他'))
        created_ids.append(cursor.lastrowid)
    
    conn.commit()
    conn.close()
    
    log_action('template_apply', 'template', None, f"Applied template '{template['name']}' creating {len(created_ids)} todos")
    
    return jsonify({
        'message': f'Template "{template["name"]}" applied successfully',
        'created_count': len(created_ids),
        'template_name': template['name']
    })

@app.route('/api/todos/<int:id>/share', methods=['POST'])
def share_todo(id):
    user_id = get_user_id_from_request()
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    
    conn = get_db()
    todo = conn.execute('SELECT * FROM todos WHERE id = ? AND user_id = ?', (id, user_id)).fetchone()
    
    if not todo:
        conn.close()
        return jsonify({'error': 'Todo not found'}), 404
    
    share_token = jwt.encode({
        'todo_id': id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }, SECRET_KEY, algorithm='HS256')
    
    share_url = f'http://localhost:3000/share/{share_token}'
    
    conn.execute('UPDATE todos SET share_token = ? WHERE id = ?', (share_token, id))
    conn.commit()
    conn.close()
    
    log_action('todo_share', 'todo', id, f"Shared todo {id}")
    
    return jsonify({
        'share_url': share_url,
        'share_token': share_token,
        'expires_in': 86400
    })

@app.route('/api/share/<token>', methods=['GET'])
def get_shared_todo(token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        todo_id = payload.get('todo_id')
        
        conn = get_db()
        todo = conn.execute('SELECT todos.*, users.username FROM todos LEFT JOIN users ON todos.user_id = users.id WHERE todos.id = ?', (todo_id,)).fetchone()
        conn.close()
        
        if not todo:
            return jsonify({'error': 'Todo not found'}), 404
        
        return jsonify(dict(todo))
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Share link expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Invalid share link'}), 401

@app.route('/api/admin/stats', methods=['GET'])
def admin_stats():
    if not is_admin():
        return jsonify({'error': 'Unauthorized - Admin access required'}), 403
    
    conn = get_db()
    
    total_users = conn.execute('SELECT COUNT(*) as count FROM users').fetchone()['count']
    total_todos = conn.execute('SELECT COUNT(*) as count FROM todos').fetchone()['count']
    completed_todos = conn.execute('SELECT COUNT(*) as count FROM todos WHERE completed = 1').fetchone()['count']
    pending_todos = conn.execute('SELECT COUNT(*) as count FROM todos WHERE completed = 0').fetchone()['count']
    
    users = conn.execute('''
        SELECT users.id, users.username, users.email, users.created_at, users.avatar, users.role,
               COUNT(todos.id) as todo_count,
               SUM(CASE WHEN todos.completed = 1 THEN 1 ELSE 0 END) as completed_count
        FROM users
        LEFT JOIN todos ON users.id = todos.user_id
        GROUP BY users.id
        ORDER BY users.created_at DESC
    ''').fetchall()
    
    recent_todos = conn.execute('''
        SELECT todos.*, users.username
        FROM todos
        LEFT JOIN users ON todos.user_id = users.id
        ORDER BY todos.created_at DESC
        LIMIT 20
    ''').fetchall()
    
    category_stats = conn.execute('''
        SELECT category, COUNT(*) as count
        FROM todos
        GROUP BY category
        ORDER BY count DESC
    ''').fetchall()
    
    conn.close()
    
    log_action('admin_stats_view', 'stats', None, 'Viewed admin stats')
    
    return jsonify({
        'total_users': total_users,
        'total_todos': total_todos,
        'completed_todos': completed_todos,
        'pending_todos': pending_todos,
        'completion_rate': round((completed_todos / total_todos * 100) if total_todos > 0 else 0, 1),
        'users': [dict(u) for u in users],
        'recent_todos': [dict(t) for t in recent_todos],
        'category_stats': [dict(c) for c in category_stats]
    })

@app.route('/api/admin/users', methods=['GET'])
def admin_get_users():
    if not is_admin():
        return jsonify({'error': 'Unauthorized - Admin access required'}), 403
    
    conn = get_db()
    users = conn.execute('SELECT id, username, email, role, avatar, created_at FROM users ORDER BY created_at DESC').fetchall()
    conn.close()
    
    log_action('admin_users_view', 'users', None, 'Viewed all users')
    
    return jsonify([dict(u) for u in users])

@app.route('/api/admin/users/<int:id>', methods=['PUT'])
def admin_update_user(id):
    if not is_admin():
        return jsonify({'error': 'Unauthorized - Admin access required'}), 403
    
    data = request.get_json()
    conn = get_db()
    
    if 'role' in data:
        conn.execute('UPDATE users SET role = ? WHERE id = ?', (data['role'], id))
        conn.commit()
    
    user = conn.execute('SELECT id, username, email, role, avatar, created_at FROM users WHERE id = ?', (id,)).fetchone()
    conn.close()
    
    log_action('admin_user_update', 'user', id, f"Updated user {id} role to {data.get('role')}")
    
    return jsonify(dict(user))

@app.route('/api/admin/users/<int:id>', methods=['DELETE'])
def admin_delete_user(id):
    if not is_admin():
        return jsonify({'error': 'Unauthorized - Admin access required'}), 403
    
    if id == get_user_id_from_request():
        return jsonify({'error': 'Cannot delete yourself'}), 400
    
    conn = get_db()
    conn.execute('DELETE FROM todos WHERE user_id = ?', (id,))
    conn.execute('DELETE FROM users WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    
    log_action('admin_user_delete', 'user', id, f"Deleted user {id}")
    
    return jsonify({'message': 'User deleted successfully'}), 200

@app.route('/api/admin/logs', methods=['GET'])
def admin_get_logs():
    if not is_admin():
        return jsonify({'error': 'Unauthorized - Admin access required'}), 403
    
    conn = get_db()
    logs = conn.execute('''
        SELECT audit_logs.*, users.username
        FROM audit_logs
        LEFT JOIN users ON audit_logs.user_id = users.id
        ORDER BY audit_logs.created_at DESC
        LIMIT 50
    ''').fetchall()
    conn.close()
    
    return jsonify([dict(log) for log in logs])

@app.route('/api/admin/health', methods=['GET'])
def admin_health():
    if not is_admin():
        return jsonify({'error': 'Unauthorized - Admin access required'}), 403
    
    conn = get_db()
    user_count = conn.execute('SELECT COUNT(*) as count FROM users').fetchone()['count']
    todo_count = conn.execute('SELECT COUNT(*) as count FROM todos').fetchone()['count']
    log_count = conn.execute('SELECT COUNT(*) as count FROM audit_logs').fetchone()['count']
    conn.close()
    
    return jsonify({
        'status': 'healthy',
        'database': 'connected',
        'users': user_count,
        'todos': todo_count,
        'logs': log_count
    })

@app.route('/api/admin/database', methods=['GET'])
def admin_database():
    conn = get_db()
    
    users = conn.execute('SELECT id, username, email, avatar, role, created_at FROM users ORDER BY id LIMIT 20').fetchall()
    todos = conn.execute('SELECT id, user_id, title, description, completed, priority, category, due_date, created_at FROM todos ORDER BY id LIMIT 20').fetchall()
    logs = conn.execute('SELECT audit_logs.id, audit_logs.user_id, users.username, audit_logs.action, audit_logs.resource, audit_logs.details, audit_logs.created_at FROM audit_logs LEFT JOIN users ON audit_logs.user_id = users.id ORDER BY audit_logs.id DESC LIMIT 20').fetchall()
    
    conn.close()
    
    return jsonify({
        'users': [dict(u) for u in users],
        'todos': [dict(t) for t in todos],
        'logs': [dict(l) for l in logs],
        'user_count': len(users),
        'todo_count': len(todos),
        'log_count': len(logs)
    })

from flask import send_from_directory

@app.route('/')
def serve_index():
    return send_from_directory(static_dir, 'index.html')

@app.route('/register')
def serve_register():
    return send_from_directory(static_dir, 'register.html')

@app.route('/login')
def serve_login():
    return send_from_directory(static_dir, 'login.html')

@app.route('/todos')
def serve_todos():
    return send_from_directory(static_dir, 'todos.html')

@app.route('/admin')
def serve_admin():
    return send_from_directory(static_dir, 'admin.html')

@app.route('/profile')
def serve_profile():
    return send_from_directory(static_dir, 'profile.html')

@app.route('/stats')
def serve_stats():
    return send_from_directory(static_dir, 'stats.html')

@app.route('/decision')
def serve_decision():
    return send_from_directory(static_dir, 'decision.html')

@app.route('/<path:path>')
def serve_static_file(path):
    if path.startswith('api/'):
        return jsonify({'error': 'Not found'}), 404
    try:
        return send_from_directory(static_dir, path)
    except:
        return send_from_directory(static_dir, 'index.html')

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5000, debug=True)