import sqlite3
import os

DATABASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'todos.db')

def view_photos():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute('SELECT id, title, photo, LENGTH(photo) as photo_length FROM todos WHERE photo IS NOT NULL')
    rows = cursor.fetchall()
    
    if not rows:
        print("数据库中没有照片数据")
        conn.close()
        return
    
    print(f"找到 {len(rows)} 条带照片的记录：")
    print("-" * 80)
    
    for row in rows:
        print(f"ID: {row['id']}")
        print(f"标题: {row['title']}")
        print(f"照片长度: {row['photo_length']} 字符")
        print(f"照片类型: {row['photo'][:50]}...")
        print("-" * 80)
    
    conn.close()

if __name__ == '__main__':
    view_photos()