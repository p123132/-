import sqlite3

conn = sqlite3.connect('todos.db')
conn.row_factory = sqlite3.Row

print('=== 数据库表结构 ===')
tables = conn.execute("SELECT name FROM sqlite_master WHERE type='table'")
for table in tables.fetchall():
    print(f'\n表: {table[0]}')
    columns = conn.execute(f"PRAGMA table_info({table[0]})")
    for col in columns.fetchall():
        print(f'  {col[1]} ({col[2]})')
    
    print(f'\n  数据:')
    rows = conn.execute(f'SELECT * FROM {table[0]} LIMIT 10').fetchall()
    if rows:
        headers = [col for col in rows[0].keys()]
        print(f'  {headers}')
        for row in rows:
            print(f'  {list(row)}')
    else:
        print('  (空)')

conn.close()
