from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import os
import bcrypt
import jwt
import datetime

app = Flask(__name__)
CORS(app)

DATABASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'todos.db')
SECRET_KEY = 'your-secret-key-change-in-production'

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
    conn.close()

def generate_token(user_id):
    payload = {
        'user_id': user_id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')

def verify_token(token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return payload.get('user_id')
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
    return verify_token(token)

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or 'username' not in data or 'email' not in data or 'password' not in data:
        return jsonify({'error': 'Username, email and password are required'}), 400
    
    conn = get_db()
    try:
        hashed_password = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
        cursor = conn.execute('''
            INSERT INTO users (username, email, password)
            VALUES (?, ?, ?)
        ''', (data['username'], data['email'], hashed_password))
        conn.commit()
        user = conn.execute('SELECT id, username, email, created_at FROM users WHERE id = ?', (cursor.lastrowid,)).fetchone()
        token = generate_token(user['id'])
        conn.close()
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
    
    token = generate_token(user['id'])
    conn.close()
    return jsonify({
        'message': 'Login successful',
        'user': {
            'id': user['id'],
            'username': user['username'],
            'email': user['email'],
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
    user = conn.execute('SELECT id, username, email, created_at FROM users WHERE id = ?', (user_id,)).fetchone()
    conn.close()
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify(dict(user))

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
    return jsonify(dict(updated_todo))

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5000, debug=True)