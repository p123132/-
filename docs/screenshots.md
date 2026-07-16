# 项目截图说明

## 📸 截图清单

### 1. 欢迎页面
- 路径：`http://localhost:3000`
- 内容：带有渐变背景和出场动画的欢迎页面

### 2. 决策页面（摇骰子）
- 路径：`http://localhost:3000/decision`
- 内容：3D骰子动画、爱情公寓台词弹窗

### 3. 决策页面（选数字）
- 路径：`http://localhost:3000/decision`
- 内容：数字选择界面、爱情公寓台词弹窗

### 4. 待办事项页面
- 路径：`http://localhost:3000/todos`
- 内容：待办列表、添加/编辑/删除功能、照片上传、日期选择

### 5. API接口截图
- GET接口：`http://localhost:5000/api/todos`
- POST接口：使用Postman或浏览器开发者工具截图

### 6. 数据库截图
- 使用DB Browser for SQLite打开 `backend/todos.db`
- 截图todos表结构和数据

### 7. AI Code Review截图
- 截图本项目的AI代码审查结果

---

## 🖥️ 如何截图

### Windows系统
1. **全屏截图**：`Win + PrintScreen`（自动保存到 `Pictures/Screenshots`）
2. **窗口截图**：`Win + Shift + S`（选择区域截图）
3. **浏览器截图**：F12打开开发者工具 → 点击相机图标

### 推荐工具
- **Snipaste**：免费截图工具，支持标注和贴图
- **Greenshot**：开源截图工具

---

## 📦 截图文件夹结构

建议在项目根目录创建 `screenshots/` 文件夹：

```
screenshots/
├── 01_welcome.png          # 欢迎页面
├── 02_decision_dice.png    # 决策页面-摇骰子
├── 03_decision_number.png  # 决策页面-选数字
├── 04_todos.png            # 待办事项页面
├── 05_api_get.png          # API接口-GET
├── 06_api_post.png         # API接口-POST
├── 07_database.png         # 数据库截图
└── 08_code_review.png      # AI代码审查截图
```

---

## 🌐 线上部署URL

### 部署平台推荐

#### 免费方案
1. **Render**（后端）：https://render.com/
2. **Vercel**（前端）：https://vercel.com/

#### 部署步骤

**后端部署到 Render：**
1. 访问 https://render.com/ 注册账号
2. 点击 "New" → "Web Service"
3. 选择 GitHub 仓库
4. 配置：
   - Build Command: `pip install -r backend/requirements.txt`
   - Start Command: `gunicorn --chdir backend app:app`
5. 点击 "Create Web Service"

**前端部署到 Vercel：**
1. 访问 https://vercel.com/ 注册账号
2. 点击 "New Project"
3. 选择 GitHub 仓库
4. 设置环境变量：
   - NEXT_PUBLIC_API_BASE: `https://your-render-app.onrender.com/api`
5. 点击 "Deploy"

#### 部署完成后
- 后端URL：`https://your-render-app.onrender.com`
- 前端URL：`https://your-vercel-app.vercel.app`

---

## 📝 提交清单

根据作业要求，提交物应包含：

1. ✅ GitHub仓库地址（公开仓库）
2. ✅ 项目源码（备份）
3. ✅ 线上部署访问URL
4. ✅ 截图包（数据库、接口、AI Code Review）
5. ✅ 文档（README.md、prompt_log.md、API文档）
6. ✅ 项目演示录屏
7. ✅ 个人实训总结报告