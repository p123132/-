import sys
import os
import webbrowser
import threading
import time

def resource_path(relative_path):
    if hasattr(sys, '_MEIPASS'):
        return os.path.join(sys._MEIPASS, relative_path)
    return os.path.join(os.path.dirname(os.path.abspath(__file__)), relative_path)

def get_data_dir():
    if hasattr(sys, '_MEIPASS'):
        exe_dir = os.path.dirname(sys.executable)
    else:
        exe_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(exe_dir, 'data')
    return data_dir

data_dir = get_data_dir()
os.makedirs(data_dir, exist_ok=True)

os.environ['TODO_DB_PATH'] = os.path.join(data_dir, 'todos.db')
os.environ['TODO_PHOTOS_PATH'] = os.path.join(data_dir, 'photos')
os.environ['STATIC_DIR'] = resource_path('frontend_dist')

from app import app

def open_browser():
    time.sleep(2)
    webbrowser.open('http://localhost:5000')

if __name__ == '__main__':
    threading.Thread(target=open_browser, daemon=True).start()
    app.run(host='0.0.0.0', port=5000, debug=False)