# Todo Adventure - 待办事项冒险应用

一个基于 Next.js + Flask 的待办事项管理应用，融合了摇骰子/选数字的趣味决策机制。

## 🎯 项目特色

- **炫酷欢迎页面**：带有渐变背景和流畅出场动画
- **命运决策系统**：摇骰子(1-6)或选数字(1-10)决定是否执行待办
  - 偶数 → 去完成待办事项
  - 奇数 → 休息一下
- **3D骰子动画**：真实的CSS3 3D骰子滚动效果
- **待办事项管理**：完整的CRUD操作，支持优先级和状态管理

## 🛠️ 技术栈

### 前端
- **框架**: Next.js 14.2.3
- **语言**: TypeScript
- **样式**: Tailwind CSS 3.4.3
- **HTTP客户端**: Axios

### 后端
- **框架**: Flask 3.1.3
- **数据库**: SQLite
- **跨域**: Flask-CORS

## 📁 项目结构

```
pbypp/
├── backend/                    # 后端 Flask 项目
│   ├── app.py                  # 主应用文件
│   ├── requirements.txt        # Python 依赖
│   └── venv/                   # 虚拟环境（需自行创建）
├── frontend/                   # 前端 Next.js 项目
│   ├── src/
│   │   ├── pages/
│   │   │   ├── index.tsx       # 欢迎页面
│   │   │   ├── decision.tsx    # 决策页面（摇骰子/选数字）
│   │   │   ├── todos.tsx       # 待办事项页面
│   │   │   ├── _app.tsx        # 应用入口
│   │   │   └── _document.tsx   # 文档模板
│   │   └── styles/
│   │       └── globals.css     # 全局样式
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
└── README.md                   # 项目说明文档
```

## 🚀 快速开始

### 1. 安装依赖

#### 后端
```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate
pip install -r requirements.txt
```

#### 前端
```bash
cd frontend
npm install
```

### 2. 启动服务

#### 后端（端口 5000）
```bash
cd backend
# Windows
venv\Scripts\activate
python app.py
```

#### 前端（端口 3000）
```bash
cd frontend
npm run dev
```

### 3. 访问应用

打开浏览器访问 `http://localhost:3000`

## 📡 API 接口

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/todos` | 获取所有待办事项 |
| POST | `/api/todos` | 创建新待办事项 |
| PUT | `/api/todos/:id` | 更新待办事项 |
| DELETE | `/api/todos/:id` | 删除待办事项 |
| POST | `/api/todos/:id/complete` | 切换完成状态 |

### 请求示例

**创建待办事项**
```bash
curl -X POST http://localhost:5000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "学习编程", "description": "每天学习2小时", "priority": 2}'
```

**响应示例**
```json
{
  "id": 1,
  "title": "学习编程",
  "description": "每天学习2小时",
  "completed": 0,
  "priority": 2,
  "created_at": "2024-01-01 12:00:00"
}
```

## 🎮 使用说明

1. **欢迎页面**：点击"开始冒险"进入决策页面
2. **决策页面**：
   - 选择"摇骰子"或"选数字"模式
   - 点击按钮进行随机决策
   - 偶数结果 → 点击"去完成待办"进入待办页面
   - 奇数结果 → 可以再试一次
3. **待办页面**：
   - 查看、添加、编辑、删除待办事项
   - 标记待办为完成状态
   - 根据优先级（高/中/低）管理待办

## ✨ 功能亮点

- 🎲 **3D骰子动画**：使用纯CSS3实现真实的骰子旋转效果
- 🎨 **渐变设计**：现代化的渐变背景和玻璃拟态效果
- 📱 **响应式布局**：支持桌面端和移动端
- ⚡ **流畅动画**：页面切换和交互都有精心设计的动画效果

## 📄 许可证

MIT License