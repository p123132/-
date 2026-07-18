# API 文档

## 基础路径

所有接口的基础路径为: `http://localhost:5000/api`

## 认证机制

本系统使用 JWT (JSON Web Token) 进行身份认证。

### 获取 Token
登录或注册成功后，接口会返回 `token` 字段。

### 使用 Token
在请求头中添加 `Authorization` 字段：
```
Authorization: Bearer <your-token>
```

### Token 有效期
Token 有效期为 7 天。

---

## 接口列表

### 一、认证接口

#### 1. 用户注册

**POST** `/api/auth/register`

创建新用户账户。

**请求体**：
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | 是 | 用户名（唯一） |
| email | string | 是 | 邮箱（唯一） |
| password | string | 是 | 密码 |

**示例**：
```json
{
  "username": "zhangsan",
  "email": "zhangsan@example.com",
  "password": "password123"
}
```

**响应**（201 Created）：
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "zhangsan",
    "email": "zhangsan@example.com",
    "role": "user",
    "created_at": "2024-01-01 12:00:00"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**错误响应**（400 Bad Request）：
```json
{
  "error": "Username, email and password are required"
}
```

**错误响应**（409 Conflict）：
```json
{
  "error": "Username or email already exists"
}
```

#### 2. 用户登录

**POST** `/api/auth/login`

用户登录系统。

**请求体**：
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| email | string | 二选一 | 邮箱 |
| username | string | 二选一 | 用户名 |
| password | string | 是 | 密码 |

**示例**：
```json
{
  "email": "zhangsan@example.com",
  "password": "password123"
}
```

或者使用用户名登录：
```json
{
  "username": "zhangsan",
  "password": "password123"
}
```

**响应**（200 OK）：
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "zhangsan",
    "email": "zhangsan@example.com",
    "role": "user",
    "avatar": "",
    "created_at": "2024-01-01 12:00:00"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**错误响应**（401 Unauthorized）：
```json
{
  "error": "Invalid credentials"
}
```

#### 3. 获取当前用户信息

**GET** `/api/auth/me`

获取当前登录用户的信息。

**请求头**：
```
Authorization: Bearer <token>
```

**响应**（200 OK）：
```json
{
  "id": 1,
  "username": "zhangsan",
  "email": "zhangsan@example.com",
  "role": "user",
  "avatar": "",
  "created_at": "2024-01-01 12:00:00"
}
```

**错误响应**（401 Unauthorized）：
```json
{
  "error": "Unauthorized"
}
```

---

### 二、用户接口

#### 4. 更新个人资料

**PUT** `/api/users/profile`

更新当前用户的个人资料。

**请求头**：
```
Authorization: Bearer <token>
```

**请求体**：
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | 否 | 新用户名 |
| email | string | 否 | 新邮箱 |
| avatar | string | 否 | 头像（Base64或URL） |

**示例**：
```json
{
  "username": "张三",
  "email": "zhangsan_new@example.com",
  "avatar": "https://example.com/avatar.png"
}
```

**响应**（200 OK）：
```json
{
  "id": 1,
  "username": "张三",
  "email": "zhangsan_new@example.com",
  "role": "user",
  "avatar": "https://example.com/avatar.png",
  "created_at": "2024-01-01 12:00:00"
}
```

#### 5. 修改密码

**POST** `/api/users/change-password`

修改当前用户的密码。

**请求头**：
```
Authorization: Bearer <token>
```

**请求体**：
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| current_password | string | 是 | 当前密码 |
| new_password | string | 是 | 新密码 |

**示例**：
```json
{
  "current_password": "old_password",
  "new_password": "new_password123"
}
```

**响应**（200 OK）：
```json
{
  "message": "Password changed successfully"
}
```

**错误响应**（401 Unauthorized）：
```json
{
  "error": "Current password is incorrect"
}
```

#### 6. 获取个人统计

**GET** `/api/users/stats`

获取当前用户的任务统计数据。

**请求头**：
```
Authorization: Bearer <token>
```

**响应**（200 OK）：
```json
{
  "total_todos": 20,
  "completed_todos": 15,
  "pending_todos": 5,
  "completion_rate": 75.0,
  "daily_stats": [
    {
      "date": "2024-01-10",
      "count": 3,
      "completed": 2
    }
  ],
  "category_stats": [
    {
      "category": "工作",
      "count": 10,
      "completed": 8
    }
  ],
  "priority_stats": [
    {
      "priority": 3,
      "count": 5
    }
  ],
  "due_soon": [
    {
      "id": 1,
      "title": "紧急任务",
      "due_date": "2024-01-15"
    }
  ]
}
```

---

### 三、待办事项接口

#### 7. 获取待办列表

**GET** `/api/todos`

获取当前用户的所有待办事项，按优先级和创建时间排序。

**请求头**：
```
Authorization: Bearer <token>
```

**响应**（200 OK）：
```json
[
  {
    "id": 1,
    "user_id": 1,
    "title": "学习编程",
    "description": "每天学习2小时",
    "completed": 0,
    "priority": 2,
    "created_at": "2024-01-01 12:00:00",
    "photo": "",
    "due_date": "2024-01-15",
    "planned_date": "2024-01-10",
    "category": "学习",
    "share_token": null
  }
]
```

#### 8. 创建待办事项

**POST** `/api/todos`

创建新的待办事项。

**请求头**：
```
Authorization: Bearer <token>
```

**请求体**：
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | string | 是 | 待办事项标题 |
| description | string | 否 | 待办事项描述 |
| priority | integer | 否 | 优先级（1=低，2=中，3=高），默认1 |
| photo | string | 否 | 照片Base64编码 |
| due_date | string | 否 | 截止日期（YYYY-MM-DD） |
| planned_date | string | 否 | 计划完成日期（YYYY-MM-DD） |
| category | string | 否 | 分类（工作/学习/生活/其他），默认"其他" |

**示例**：
```json
{
  "title": "完成作业",
  "description": "完成数学和英语作业",
  "priority": 3,
  "photo": "data:image/png;base64,iVBORw0KGgo...",
  "due_date": "2024-01-15",
  "planned_date": "2024-01-10",
  "category": "学习"
}
```

**响应**（201 Created）：
```json
{
  "id": 2,
  "user_id": 1,
  "title": "完成作业",
  "description": "完成数学和英语作业",
  "completed": 0,
  "priority": 3,
  "created_at": "2024-01-01 12:30:00",
  "photo": "data:image/png;base64,iVBORw0KGgo...",
  "due_date": "2024-01-15",
  "planned_date": "2024-01-10",
  "category": "学习",
  "share_token": null
}
```

**错误响应**（400 Bad Request）：
```json
{
  "error": "Title is required"
}
```

#### 9. 更新待办事项

**PUT** `/api/todos/:id`

更新指定ID的待办事项。

**请求头**：
```
Authorization: Bearer <token>
```

**路径参数**：
| 参数 | 类型 | 说明 |
|------|------|------|
| id | integer | 待办事项ID |

**请求体**：
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | string | 否 | 待办事项标题 |
| description | string | 否 | 待办事项描述 |
| completed | boolean | 否 | 完成状态 |
| priority | integer | 否 | 优先级 |
| photo | string | 否 | 照片Base64编码 |
| due_date | string | 否 | 截止日期（YYYY-MM-DD） |
| planned_date | string | 否 | 计划完成日期（YYYY-MM-DD） |
| category | string | 否 | 分类 |

**示例**：
```json
{
  "title": "完成作业（已修改）",
  "completed": 1,
  "due_date": "2024-01-15"
}
```

**响应**（200 OK）：
```json
{
  "id": 2,
  "user_id": 1,
  "title": "完成作业（已修改）",
  "description": "完成数学和英语作业",
  "completed": 1,
  "priority": 3,
  "created_at": "2024-01-01 12:30:00",
  "photo": "data:image/png;base64,iVBORw0KGgo...",
  "due_date": "2024-01-15",
  "planned_date": "2024-01-10",
  "category": "学习",
  "share_token": null
}
```

**错误响应**（404 Not Found）：
```json
{
  "error": "Todo not found"
}
```

#### 10. 删除待办事项

**DELETE** `/api/todos/:id`

删除指定ID的待办事项。

**请求头**：
```
Authorization: Bearer <token>
```

**路径参数**：
| 参数 | 类型 | 说明 |
|------|------|------|
| id | integer | 待办事项ID |

**响应**（200 OK）：
```json
{
  "message": "Todo deleted successfully"
}
```

**错误响应**（404 Not Found）：
```json
{
  "error": "Todo not found"
}
```

#### 11. 批量删除待办事项

**DELETE** `/api/todos/batch`

批量删除多个待办事项。

**请求头**：
```
Authorization: Bearer <token>
```

**请求体**：
```json
{
  "ids": [1, 2, 3]
}
```

**响应**（200 OK）：
```json
{
  "message": "3 todos deleted successfully"
}
```

**错误响应**（400 Bad Request）：
```json
{
  "error": "IDs list is required"
}
```

#### 12. 切换完成状态

**POST** `/api/todos/:id/complete`

切换待办事项的完成状态（已完成 ↔ 待完成）。

**请求头**：
```
Authorization: Bearer <token>
```

**路径参数**：
| 参数 | 类型 | 说明 |
|------|------|------|
| id | integer | 待办事项ID |

**响应**（200 OK）：
```json
{
  "id": 1,
  "user_id": 1,
  "title": "学习编程",
  "description": "每天学习2小时",
  "completed": 1,
  "priority": 2,
  "created_at": "2024-01-01 12:00:00"
}
```

**错误响应**（404 Not Found）：
```json
{
  "error": "Todo not found"
}
```

---

### 四、模板接口

#### 13. 获取模板列表

**GET** `/api/templates`

获取系统预设的任务模板。

**请求头**：
```
Authorization: Bearer <token>
```

**响应**（200 OK）：
```json
{
  "daily_report": {
    "name": "日报模板",
    "items": ["今日完成任务", "明日计划", "遇到的问题", "需要的帮助"]
  },
  "weekly_report": {
    "name": "周报模板",
    "items": ["本周完成", "下周计划", "问题与风险", "改进建议"]
  },
  "habit_tracker": {
    "name": "习惯打卡",
    "items": ["早起", "运动", "阅读", "喝水", "冥想"]
  },
  "meeting_notes": {
    "name": "会议记录",
    "items": ["会议主题", "参会人员", "讨论内容", "决议事项", "待办事项"]
  }
}
```

#### 14. 应用模板

**POST** `/api/templates/:name/apply`

将指定模板应用到当前用户，自动创建多个待办事项。

**请求头**：
```
Authorization: Bearer <token>
```

**路径参数**：
| 参数 | 类型 | 说明 |
|------|------|------|
| name | string | 模板名称（daily_report/weekly_report/habit_tracker/meeting_notes） |

**响应**（200 OK）：
```json
{
  "message": "Template \"日报模板\" applied successfully",
  "created_count": 4,
  "template_name": "日报模板"
}
```

**错误响应**（404 Not Found）：
```json
{
  "error": "Template not found"
}
```

---

### 五、分享接口

#### 15. 分享待办事项

**POST** `/api/todos/:id/share`

为待办事项生成分享链接，有效期24小时。

**请求头**：
```
Authorization: Bearer <token>
```

**路径参数**：
| 参数 | 类型 | 说明 |
|------|------|------|
| id | integer | 待办事项ID |

**响应**（200 OK）：
```json
{
  "share_url": "http://localhost:3000/share/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "share_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 86400
}
```

#### 16. 获取分享的待办事项

**GET** `/api/share/:token`

通过分享链接获取待办事项详情（无需登录）。

**路径参数**：
| 参数 | 类型 | 说明 |
|------|------|------|
| token | string | 分享Token |

**响应**（200 OK）：
```json
{
  "id": 1,
  "title": "学习编程",
  "description": "每天学习2小时",
  "completed": 0,
  "priority": 2,
  "created_at": "2024-01-01 12:00:00",
  "category": "学习",
  "username": "zhangsan"
}
```

**错误响应**（401 Unauthorized）：
```json
{
  "error": "Share link expired"
}
```

---

### 六、管理接口（管理员专用）

> 以下接口仅管理员角色可访问，普通用户访问会返回 403 Forbidden。

#### 17. 获取系统统计

**GET** `/api/admin/stats`

获取整个系统的数据统计。

**请求头**：
```
Authorization: Bearer <admin-token>
```

**响应**（200 OK）：
```json
{
  "total_users": 10,
  "total_todos": 50,
  "completed_todos": 35,
  "pending_todos": 15,
  "completion_rate": 70.0,
  "users": [
    {
      "id": 1,
      "username": "zhangsan",
      "email": "zhangsan@example.com",
      "role": "user",
      "created_at": "2024-01-01 12:00:00",
      "todo_count": 5,
      "completed_count": 3
    }
  ],
  "recent_todos": [
    {
      "id": 1,
      "title": "学习编程",
      "username": "zhangsan",
      "category": "学习",
      "completed": 0,
      "created_at": "2024-01-01 12:00:00"
    }
  ],
  "category_stats": [
    {
      "category": "工作",
      "count": 20
    }
  ]
}
```

**错误响应**（403 Forbidden）：
```json
{
  "error": "Unauthorized - Admin access required"
}
```

#### 18. 获取用户列表

**GET** `/api/admin/users`

获取所有用户列表。

**请求头**：
```
Authorization: Bearer <admin-token>
```

**响应**（200 OK）：
```json
[
  {
    "id": 1,
    "username": "zhangsan",
    "email": "zhangsan@example.com",
    "role": "user",
    "avatar": "",
    "created_at": "2024-01-01 12:00:00"
  },
  {
    "id": 2,
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin",
    "avatar": "",
    "created_at": "2024-01-01 10:00:00"
  }
]
```

#### 19. 更新用户角色

**PUT** `/api/admin/users/:id`

更新指定用户的角色。

**请求头**：
```
Authorization: Bearer <admin-token>
```

**路径参数**：
| 参数 | 类型 | 说明 |
|------|------|------|
| id | integer | 用户ID |

**请求体**：
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| role | string | 是 | 角色（user/admin） |

**示例**：
```json
{
  "role": "admin"
}
```

**响应**（200 OK）：
```json
{
  "id": 1,
  "username": "zhangsan",
  "email": "zhangsan@example.com",
  "role": "admin",
  "avatar": "",
  "created_at": "2024-01-01 12:00:00"
}
```

#### 20. 删除用户

**DELETE** `/api/admin/users/:id`

删除指定用户及其所有待办事项。

**请求头**：
```
Authorization: Bearer <admin-token>
```

**路径参数**：
| 参数 | 类型 | 说明 |
|------|------|------|
| id | integer | 用户ID |

**响应**（200 OK）：
```json
{
  "message": "User deleted successfully"
}
```

**错误响应**（400 Bad Request）：
```json
{
  "error": "Cannot delete yourself"
}
```

#### 21. 获取操作日志

**GET** `/api/admin/logs`

获取系统操作日志（最近50条）。

**请求头**：
```
Authorization: Bearer <admin-token>
```

**响应**（200 OK）：
```json
[
  {
    "id": 1,
    "user_id": 1,
    "action": "user_login",
    "resource": "user",
    "resource_id": 1,
    "details": "Username: zhangsan",
    "ip_address": "127.0.0.1",
    "created_at": "2024-01-01 12:00:00",
    "username": "zhangsan"
  }
]
```

#### 22. 健康检查

**GET** `/api/admin/health`

检查系统健康状态。

**请求头**：
```
Authorization: Bearer <admin-token>
```

**响应**（200 OK）：
```json
{
  "status": "healthy",
  "database": "connected",
  "users": 10,
  "todos": 50,
  "logs": 100
}
```

---

## 数据模型

### users 表结构

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键，自增 |
| username | TEXT | 用户名（唯一） |
| email | TEXT | 邮箱（唯一） |
| password | TEXT | 密码（bcrypt加密） |
| avatar | TEXT | 头像（Base64或URL） |
| role | TEXT | 角色（user/admin），默认user |
| created_at | TIMESTAMP | 创建时间 |

### todos 表结构

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键，自增 |
| user_id | INTEGER | 用户ID（外键） |
| title | TEXT | 待办事项标题 |
| description | TEXT | 待办事项描述 |
| completed | BOOLEAN | 完成状态（0=未完成，1=已完成） |
| priority | INTEGER | 优先级（1=低，2=中，3=高） |
| created_at | TIMESTAMP | 创建时间 |
| photo | TEXT | 照片Base64编码 |
| due_date | DATE | 截止日期 |
| planned_date | DATE | 计划完成日期 |
| category | TEXT | 分类（工作/学习/生活/其他），默认"其他" |
| share_token | TEXT | 分享Token |

### audit_logs 表结构

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键，自增 |
| user_id | INTEGER | 用户ID（外键） |
| action | TEXT | 操作类型 |
| resource | TEXT | 操作资源 |
| resource_id | INTEGER | 资源ID |
| details | TEXT | 操作详情 |
| ip_address | TEXT | IP地址 |
| created_at | TIMESTAMP | 创建时间 |

---

## 状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未授权（Token无效或过期） |
| 403 | 禁止访问（权限不足） |
| 404 | 资源未找到 |
| 409 | 冲突（用户名或邮箱已存在） |
| 500 | 服务器内部错误 |

---

## 操作类型说明

| 操作类型 | 说明 |
|----------|------|
| user_register | 用户注册 |
| user_login | 用户登录 |
| profile_update | 更新资料 |
| password_change | 修改密码 |
| todo_create | 创建待办 |
| todo_update | 更新待办 |
| todo_delete | 删除待办 |
| todo_batch_delete | 批量删除 |
| todo_toggle | 切换状态 |
| todo_share | 分享待办 |
| template_apply | 应用模板 |
| admin_stats_view | 查看统计 |
| admin_users_view | 查看用户 |
| admin_user_update | 更新用户 |
| admin_user_delete | 删除用户 |