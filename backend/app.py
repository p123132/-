from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import os

app = Flask(__name__)
CORS(app)

DATABASE = 'todos.db'

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    with conn:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS todos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                completed BOOLEAN DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                priority INTEGER DEFAULT 1
            )
        ''')
    conn.close()

@app.route('/api/todos', methods=['GET'])
def get_todos():
    conn = get_db()
    todos = conn.execute('SELECT * FROM todos ORDER BY priority DESC, created_at DESC').fetchall()
    conn.close()
    return jsonify([dict(todo) for todo in todos])

@app.route('/api/todos', methods=['POST'])
def create_todo():
    data = request.get_json()
    if not data or 'title' not in data:
        return jsonify({'error': 'Title is required'}), 400
    
    conn = get_db()
    cursor = conn.execute('''
        INSERT INTO todos (title, description, priority)
        VALUES (?, ?, ?)
    ''', (data['title'], data.get('description', ''), data.get('priority', 1)))
    conn.commit()
    todo = conn.execute('SELECT * FROM todos WHERE id = ?', (cursor.lastrowid,)).fetchone()
    conn.close()
    return jsonify(dict(todo)), 201

@app.route('/api/todos/<int:id>', methods=['PUT'])
def update_todo(id):
    data = request.get_json()
    conn = get_db()
    todo = conn.execute('SELECT * FROM todos WHERE id = ?', (id,)).fetchone()
    if not todo:
        conn.close()
        return jsonify({'error': 'Todo not found'}), 404
    
    conn.execute('''
        UPDATE todos SET title = ?, description = ?, completed = ?, priority = ?
        WHERE id = ?
    ''', (data.get('title', todo['title']), data.get('description', todo['description']), 
          data.get('completed', todo['completed']), data.get('priority', todo['priority']), id))
    conn.commit()
    updated_todo = conn.execute('SELECT * FROM todos WHERE id = ?', (id,)).fetchone()
    conn.close()
    return jsonify(dict(updated_todo))

@app.route('/api/todos/<int:id>', methods=['DELETE'])
def delete_todo(id):
    conn = get_db()
    todo = conn.execute('SELECT * FROM todos WHERE id = ?', (id,)).fetchone()
    if not todo:
        conn.close()
        return jsonify({'error': 'Todo not found'}), 404
    
    conn.execute('DELETE FROM todos WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Todo deleted successfully'}), 200

@app.route('/api/todos/<int:id>/complete', methods=['POST'])
def toggle_complete(id):
    conn = get_db()
    todo = conn.execute('SELECT * FROM todos WHERE id = ?', (id,)).fetchone()
    if not todo:
        conn.close()
        return jsonify({'error': 'Todo not found'}), 404
    
    new_status = not todo['completed']
    conn.execute('UPDATE todos SET completed = ? WHERE id = ?', (new_status, id))
    conn.commit()
    updated_todo = conn.execute('SELECT * FROM todos WHERE id = ?', (id,)).fetchone()
    conn.close()
    return jsonify(dict(updated_todo))

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5000, debug=True)