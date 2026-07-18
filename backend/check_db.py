import sqlite3

conn = sqlite3.connect('todos.db')
cursor = conn.cursor()

print("=== Database Tables ===")
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()
print("Tables:", [row[0] for row in tables])

print("\n=== Users Table Structure ===")
cursor.execute("PRAGMA table_info(users)")
users_columns = cursor.fetchall()
print("Columns:", [row[1] for row in users_columns])

print("\n=== Users Data ===")
cursor.execute("SELECT * FROM users")
users_data = cursor.fetchall()
if users_data:
    for user in users_data:
        print(user)
else:
    print("No users yet")

print("\n=== Todos Table Structure ===")
cursor.execute("PRAGMA table_info(todos)")
todos_columns = cursor.fetchall()
print("Columns:", [row[1] for row in todos_columns])

print("\n=== Todos Data (with user_id) ===")
cursor.execute("SELECT id, user_id, title, completed FROM todos LIMIT 10")
todos_data = cursor.fetchall()
if todos_data:
    for todo in todos_data:
        print(todo)
else:
    print("No todos yet")

conn.close()
print("\n✅ Database check completed!")