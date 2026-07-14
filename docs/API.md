# API 文档

## 基础路径

所有接口的基础路径为: `http://localhost:5000/api`

## 接口列表

### 1. 获取所有待办事项

**GET** `/api/todos`

获取数据库中所有待办事项，按优先级和创建时间排序。

**响应**：
```json
[
  {
    "id": 1,
    "title": "学习编程",
    "description": "每天学习2小时",
    "completed": 0,
    "priority": 2,
    "created_at": "2024-01-01 12:00:00"
  }
]
```

### 2. 创建待办事项

**POST** `/api/todos`

创建新的待办事项。

**请求体**：
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | string | 是 | 待办事项标题 |
| description | string | 否 | 待办事项描述 |
| priority | integer | 否 | 优先级（1=低，2=中，3=高），默认1 |

**示例**：
```json
{
  "title": "完成作业",
  "description": "完成数学和英语作业",
  "priority": 3
}
```

**响应**（201 Created）：
```json
{
  "id": 2,
  "title": "完成作业",
  "description": "完成数学和英语作业",
  "completed": 0,
  "priority": 3,
  "created_at": "2024-01-01 12:30:00"
}
```

**错误响应**（400 Bad Request）：
```json
{
  "error": "Title is required"
}
```

### 3. 更新待办事项

**PUT** `/api/todos/:id`

更新指定ID的待办事项。

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

**示例**：
```json
{
  "title": "完成作业（已修改）",
  "completed": 1
}
```

**响应**：
```json
{
  "id": 2,
  "title": "完成作业（已修改）",
  "description": "完成数学和英语作业",
  "completed": 1,
  "priority": 3,
  "created_at": "2024-01-01 12:30:00"
}
```

**错误响应**（404 Not Found）：
```json
{
  "error": "Todo not found"
}
```

### 4. 删除待办事项

**DELETE** `/api/todos/:id`

删除指定ID的待办事项。

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

### 5. 切换完成状态

**POST** `/api/todos/:id/complete`

切换待办事项的完成状态（已完成 ↔ 待完成）。

**路径参数**：
| 参数 | 类型 | 说明 |
|------|------|------|
| id | integer | 待办事项ID |

**响应**：
```json
{
  "id": 1,
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

## 数据模型

### Todo 表结构

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键，自增 |
| title | TEXT | 待办事项标题 |
| description | TEXT | 待办事项描述 |
| completed | BOOLEAN | 完成状态（0=未完成，1=已完成） |
| priority | INTEGER | 优先级（1=低，2=中，3=高） |
| created_at | TIMESTAMP | 创建时间 |

## 状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 404 | 资源未找到 |
| 500 | 服务器内部错误 |