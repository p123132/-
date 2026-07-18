import urllib.request
import json

url = 'http://localhost:5000/api/admin/stats'
response = urllib.request.urlopen(url)
data = json.loads(response.read())

print("=== 管理后台数据统计 ===")
print(f"总用户数: {data['total_users']}")
print(f"总待办数: {data['total_todos']}")
print(f"已完成: {data['completed_todos']}")
print(f"待完成: {data['pending_todos']}")
print(f"完成率: {data['completion_rate']}%")

print("\n=== 用户列表 ===")
for user in data['users']:
    print(f"  #{user['id']} {user['username']} - {user['email']}")
    print(f"    待办: {user['todo_count']} | 已完成: {user['completed_count']}")

print("\n=== 分类统计 ===")
for cat in data['category_stats']:
    print(f"  {cat['category']}: {cat['count']}")

print("\n=== 最近待办 ===")
for todo in data['recent_todos'][:5]:
    print(f"  #{todo['id']} {todo['title']} ({todo['username']}) - {todo['category']}")

print("\n✅ 管理后台API正常工作!")