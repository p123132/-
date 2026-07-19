# Todo Adventure - 待办事项冒险应用

一个基于 Next.js + Flask 的待办事项管理应用，融合了摇骰子/选数字的趣味决策机制，支持用户认证、角色权限管理、数据统计、任务分享等完整功能。

## 🎯 项目特色

### 🎲 命运决策系统
- **摇骰子模式**：3D骰子动画，随机生成1-6的结果
- **选数字模式**：数字1-10倒计时选择，增加趣味性
- **决策规则**：偶数 → 去完成待办事项，奇数 → 休息一下
- **真实3D动画**：使用纯CSS3实现真实的骰子旋转效果

### 📝 待办事项管理
- **完整CRUD操作**：添加、编辑、删除、标记完成
- **优先级管理**：高/中/低三级优先级，不同颜色标识
- **分类管理**：工作、学习、生活、其他四大分类
- **日期管理**：截止日期、计划完成日期
- **图片支持**：可为待办事项添加照片
- **批量操作**：支持批量选择和批量删除
- **搜索筛选**：支持标题搜索和分类筛选
- **提前完成**：醒目的绿色完成按钮，方便提前完成任务

### 🔐 用户认证系统
- **用户注册**：支持用户名、邮箱、密码注册
- **用户登录**：支持邮箱或用户名登录
- **资料编辑**：支持修改用户名、邮箱、头像
- **密码修改**：安全的密码修改功能
- **JWT认证**：基于Token的身份验证
- **数据隔离**：每个用户只能访问自己的数据

### 👑 角色权限管理
- **管理员角色**：完整的系统管理权限
- **普通用户**：只能管理自己的待办事项
- **权限控制**：管理接口只对管理员开放
- **默认管理员**：admin / admin123

### 📊 数据统计分析
- **个人统计**：总任务数、完成数、完成率
- **分类统计**：各分类任务数量占比
- **趋势分析**：近7天任务创建与完成趋势
- **优先级统计**：各优先级任务分布
- **逾期提醒**：即将到期的任务提醒

### 🎨 管理后台
- **数据概览**：系统总用户数、总任务数统计
- **用户管理**：查看、编辑角色、删除用户
- **待办数据**：查看所有用户的待办事项
- **操作日志**：记录所有关键操作，便于审计
- **健康检查**：系统健康状态监控

### ✨ 高级功能
- **任务模板**：提供日报、周报、习惯打卡、会议记录等模板
- **任务分享**：生成分享链接，24小时有效
- **浏览器通知**：逾期任务自动提醒
- **CSV导出**：支持导出待办数据为CSV格式
- **响应式设计**：完美适配桌面端和移动端

## 🛠️ 技术栈

### 前端
- **框架**: Next.js 14.2.3
- **语言**: TypeScript
- **样式**: Tailwind CSS 3.4.3
- **HTTP客户端**: Axios
- **图标**: Lucide React

### 后端
- **框架**: Flask 3.1.3
- **数据库**: SQLite
- **跨域**: Flask-CORS
- **加密**: bcrypt（密码加密）
- **认证**: JWT（身份验证）

## 📁 项目结构

```
pbypp/
├── backend/                    # 后端 Flask 项目
│   ├── app.py                  # 主应用文件（所有API接口）
│   ├── requirements.txt        # Python 依赖
│   ├── test_admin.py           # 管理员接口测试
│   ├── check_db.py             # 数据库检查脚本
│   ├── view_db.py              # 数据库查看脚本
│   ├── view_photos.py          # 照片查看脚本
│   └── run_with_ngrok.py       # ngrok运行脚本
├── frontend/                   # 前端 Next.js 项目
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.tsx      # 全局导航组件
│   │   ├── pages/
│   │   │   ├── index.tsx       # 欢迎页面
│   │   │   ├── login.tsx       # 登录页面
│   │   │   ├── register.tsx    # 注册页面
│   │   │   ├── decision.tsx    # 决策页面（摇骰子/选数字）
│   │   │   ├── todos.tsx       # 待办事项页面
│   │   │   ├── stats.tsx       # 数据统计页面
│   │   │   ├── profile.tsx     # 个人中心页面
│   │   │   ├── admin.tsx       # 管理后台页面
│   │   │   ├── _app.tsx        # 应用入口
│   │   │   └── _document.tsx   # 文档模板
│   │   └── styles/
│   │       └── globals.css     # 全局样式（含动画效果）
│   ├── .env.local.example      # 环境变量示例
│   ├── next-env.d.ts           # Next.js类型定义
│   ├── next.config.js          # Next.js配置
│   ├── package-lock.json       # npm依赖锁文件
│   ├── package.json            # npm依赖配置
│   ├── postcss.config.js       # PostCSS配置
│   ├── tailwind.config.js      # Tailwind配置
│   └── tsconfig.json           # TypeScript配置
├── docs/                       # 项目文档
│   ├── API.md                  # API接口文档
│   ├── ai_code_review.md       # AI代码审查报告
│   ├── prompt_log.md           # AI使用Prompt日志
│   ├── screenshots.md          # 截图说明文档
│   ├── screenshots/            # 截图包目录
│   │   ├── README.md           # 截图包说明
│   │   ├── database/           # 数据库截图
│   │   ├── api/                # API接口测试截图
│   │   └── ai_code_review/     # AI代码审查截图
│   └── 总结报告.md             # 个人总结报告
├── .gitignore                  # Git忽略文件
├── README.md                   # 项目说明文档
└── render.yaml                 # Render部署配置
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

### 2. 配置环境变量

复制 `.env.local.example` 为 `.env.local`：
```bash
cd frontend
cp .env.local.example .env.local
```

修改 `.env.local` 中的 API 地址：
```
NEXT_PUBLIC_API_BASE=http://localhost:5000/api
```

### 3. 启动服务

#### 后端（端口 5000）
```bash
cd backend
venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux
python app.py
```

#### 前端（端口 3000）
```bash
cd frontend
npm run dev
```

### 4. 访问应用

打开浏览器访问 `http://localhost:3000`

### 5. 测试账户

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | admin123 | 管理员 |

## 📡 API 接口

### 基础路径
所有接口基础路径：`http://localhost:5000/api`

### 认证接口
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/auth/register` | 用户注册 |
| POST | `/api/auth/login` | 用户登录 |
| GET | `/api/auth/me` | 获取当前用户 |

### 用户接口
| 方法 | 路径 | 描述 |
|------|------|------|
| PUT | `/api/users/profile` | 更新个人资料 |
| POST | `/api/users/change-password` | 修改密码 |
| GET | `/api/users/stats` | 获取个人统计 |

### 待办接口
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/todos` | 获取待办列表 |
| POST | `/api/todos` | 创建待办 |
| PUT | `/api/todos/:id` | 更新待办 |
| DELETE | `/api/todos/:id` | 删除待办 |
| DELETE | `/api/todos/batch` | 批量删除 |
| POST | `/api/todos/:id/complete` | 切换完成状态 |
| POST | `/api/todos/:id/share` | 分享待办 |

### 模板接口
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/templates` | 获取模板列表 |
| POST | `/api/templates/:name/apply` | 应用模板 |

### 分享接口
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/share/:token` | 获取分享的待办 |

### 管理接口（管理员专用）
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/admin/stats` | 获取系统统计 |
| GET | `/api/admin/users` | 获取用户列表 |
| PUT | `/api/admin/users/:id` | 更新用户角色 |
| DELETE | `/api/admin/users/:id` | 删除用户 |
| GET | `/api/admin/logs` | 获取操作日志 |
| GET | `/api/admin/health` | 健康检查 |

### 完整文档
详细的API文档请查看 [docs/API.md](docs/API.md)

## 🎮 使用说明

### 1. 欢迎页面
- 点击"开始冒险"按钮进入决策页面

### 2. 登录/注册
- 点击右上角用户图标进行登录或注册
- 注册成功后自动登录

### 3. 决策页面
- 选择"摇骰子"或"选数字"模式
- 点击按钮进行随机决策
- 偶数结果：点击"去完成待办"自动打开添加待办弹窗
- 奇数结果：可以再试一次

### 4. 待办页面
- 查看、添加、编辑、删除待办事项
- 点击"提前完成"按钮标记任务完成
- 根据优先级和分类管理待办
- 支持搜索和筛选功能
- 支持批量删除

### 5. 统计页面
- 查看个人任务统计数据
- 查看分类统计和趋势分析

### 6. 个人中心
- 修改个人资料和头像
- 修改密码
- 查看注册时间

### 7. 管理后台（管理员）
- 查看系统数据概览
- 管理用户（修改角色、删除用户）
- 查看所有待办数据
- 查看操作日志

## ✨ 功能亮点

### 🎲 3D骰子动画
- 使用纯CSS3实现真实的骰子旋转效果
- 6个面的点数布局符合标准骰子
- 旋转角度与实际结果一致

### 🎨 视觉设计
- 现代化的渐变背景和玻璃拟态效果
- 紫色/粉色主题配色
- 流畅的页面切换和交互动画
- 响应式布局，支持移动端

### 🔐 安全性
- 密码使用bcrypt加密存储
- JWT Token认证
- 接口权限控制
- 数据隔离（用户只能访问自己的数据）
- 操作日志记录

### 📊 数据可视化
- 统计卡片展示关键指标
- 分类统计进度条
- 趋势分析图表
- 管理后台数据表格

## 🚀 部署方案

### 前端部署（Vercel）

1. 访问 [Vercel](https://vercel.com/) 并登录
2. 点击 "New Project"，选择 GitHub 仓库
3. 选择前端目录 `frontend/`
4. 设置环境变量：
   - `NEXT_PUBLIC_API_BASE`: 后端API地址（如 `https://your-backend.onrender.com/api`）
5. 点击 "Deploy" 完成部署

### 后端部署（Render）

1. 访问 [Render](https://render.com/) 并登录
2. 点击 "New" → "Web Service"
3. 选择 GitHub 仓库
4. 设置配置：
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `python backend/app.py`
5. 点击 "Create Web Service" 完成部署

### 部署注意事项

- 确保后端部署后配置了正确的 CORS 允许域名
- SQLite 数据库在 Render 上可能会有持久化问题，建议使用外部数据库（如 PostgreSQL）
- 部署完成后更新前端环境变量中的API地址

## 🔍 AI Code Review

### 审查工具
- Trae AI 代码助手

### 审查结果

**后端代码审查**：
1. ✅ API接口设计符合 RESTful 规范
2. ✅ 使用了参数校验和错误处理
3. ✅ 数据库操作使用参数化查询，防止SQL注入
4. ✅ 配置了 CORS 支持跨域请求
5. ✅ 使用 bcrypt 加密存储密码
6. ✅ JWT Token 认证机制
7. ✅ 角色权限控制
8. ✅ 操作日志记录
9. ⚠️ 建议添加 API 文档生成（如 Flask-RESTX）
10. ⚠️ 建议添加请求日志记录

**前端代码审查**：
1. ✅ 组件结构清晰，职责分明
2. ✅ 使用了 TypeScript 类型定义
3. ✅ 动画效果流畅，用户体验良好
4. ✅ 响应式设计，支持移动端
5. ✅ 完整的用户认证流程
6. ✅ 错误处理和加载状态
7. ⚠️ 建议添加错误边界处理
8. ⚠️ 建议使用 React Query 进行数据缓存
9. ⚠️ API地址应使用环境变量配置（已实现）

### 优化建议

1. **性能优化**：添加数据缓存机制，减少重复请求
2. **安全性**：添加更严格的输入验证和限流机制
3. **可维护性**：抽取公共组件，减少代码重复
4. **测试**：添加单元测试和集成测试
5. **监控**：添加错误监控和性能监控

## 📄 许可证

MIT License

## 🚀 线上部署

### 前端部署（Vercel）
- **部署平台**: Vercel
- **部署命令**: `npx vercel --prod`

### 后端部署（PythonAnywhere）
- **URL**: `https://your-pythonanywhere-domain.pythonanywhere.com`
- **部署平台**: PythonAnywhere

## 📷 截图包

截图包位于 `docs/screenshots/` 目录，包含：
- **数据库截图**: 数据库表结构和数据
- **API接口测试截图**: 所有API接口的测试结果
- **AI Code Review截图**: AI代码审查报告

详细说明请查看 [docs/screenshots/README.md](docs/screenshots/README.md)

## 🎬 项目演示录屏

项目演示视频展示了以下功能：
1. 用户注册和登录
2. 摇骰子决策系统
3. 待办事项管理（添加、编辑、删除、完成）
4. 数据统计分析
5. 个人中心（资料修改、密码修改）
6. 管理后台（用户管理、数据概览）
7. 任务模板和分享功能

演示视频文件：`docs/demo.mp4`

## 📄 AI Code Review 报告

详细的AI代码审查报告请查看 [docs/ai_code_review.md](docs/ai_code_review.md)

## 📧 联系方式

如有问题或建议，欢迎联系！