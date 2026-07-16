from pyngrok import ngrok
import subprocess
import time

print("正在启动后端服务...")

flask_process = subprocess.Popen([
    r'C:\Users\pp230\Documents\trae_projects\pbypp\backend\venv\Scripts\python.exe',
    r'C:\Users\pp230\Documents\trae_projects\pbypp\backend\app.py'
])

time.sleep(3)

print("正在创建公开URL...")
http_tunnel = ngrok.connect(5000)
public_url = http_tunnel.public_url

print(f"\n🎉 后端服务已上线！")
print(f"本地地址: http://localhost:5000")
print(f"线上地址: {public_url}")
print(f"\nAPI接口:")
print(f"  - GET  {public_url}/api/todos")
print(f"  - POST {public_url}/api/todos")
print(f"  - PUT  {public_url}/api/todos/:id")
print(f"  - DELETE {public_url}/api/todos/:id")
print(f"\n按 Ctrl+C 停止服务")

try:
    flask_process.wait()
except KeyboardInterrupt:
    print("\n正在停止服务...")
    flask_process.terminate()
    ngrok.kill()