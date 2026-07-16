import sqlite3
import os

DATABASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'todos.db')

conn = sqlite3.connect(DATABASE)
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

cursor.execute('SELECT * FROM todos')
rows = cursor.fetchall()

print(f'总共 {len(rows)} 条记录')
print('-' * 120)
print(f'{"ID":<4} {"标题":<20} {"完成":<6} {"优先级":<6} {"截止日期":<12} {"计划日期":<12} {"照片":<10}')
print('-' * 120)

for row in rows:
    completed = '是' if row['completed'] else '否'
    photo = '有' if row['photo'] else '无'
    print(f'{row["id"]:<4} {row["title"][:20]:<20} {completed:<6} {row["priority"]:<6} {row["due_date"] or "-":<12} {row["planned_date"] or "-":<12} {photo:<10}')

conn.close()