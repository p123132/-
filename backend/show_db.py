import sqlite3

conn = sqlite3.connect('todos.db')
cursor = conn.cursor()

print('=== 数据库表结构 ===')
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()
for table in tables:
    print(f'\n--- {table[0]} 表 ---')
    cursor.execute(f'PRAGMA table_info({table[0]})')
    columns = cursor.fetchall()
    print('字段名\t\t类型\t\t是否主键')
    for col in columns:
        pk = '是' if col[5] == 1 else '否'
        print(f'{col[1]}\t\t{col[2]}\t\t{pk}')
    
    cursor.execute(f'SELECT COUNT(*) FROM {table[0]}')
    count = cursor.fetchone()[0]
    print(f'\n记录数: {count}')
    
    if count > 0:
        cursor.execute(f'SELECT * FROM {table[0]} LIMIT 5')
        rows = cursor.fetchall()
        print('\n前5条数据:')
        col_names = [col[1] for col in columns]
        print('\t'.join(col_names))
        for row in rows:
            print('\t'.join(str(r) for r in row))

conn.close()
