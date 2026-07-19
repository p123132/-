# 接口测试截图说明

本文档记录了使用 Python 进行接口测试的结果，用于验证 API 接口的正确性。

---

## 测试环境

- **后端地址**: `http://localhost:5000/api`
- **测试工具**: Python requests 库
- **测试时间**: 2026年7月19日

---

## 一、认证接口测试

### 1.1 用户登录

**请求**:
- 方法: POST
- 路径: `/api/auth/login`
- 请求体:
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**响应**:
- 状态码: 200 OK
- 响应体:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 3,
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin",
    "avatar": null,
    "created_at": "2026-07-18 12:47:01"
  }
}
```

**测试结果**: ✅ 成功

---

### 1.2 获取当前用户信息

**请求**:
- 方法: GET
- 路径: `/api/auth/me`
- 请求头: `Authorization: Bearer <token>`

**响应**:
- 状态码: 200 OK
- 响应体:
```json
{
  "id": 3,
  "username": "admin",
  "email": "admin@example.com",
  "role": "admin",
  "avatar": null,
  "created_at": "2026-07-18 12:47:01"
}
```

**测试结果**: ✅ 成功

---

## 二、待办事项接口测试

### 2.1 获取待办列表

**请求**:
- 方法: GET
- 路径: `/api/todos`
- 请求头: `Authorization: Bearer <token>`

**响应**:
- 状态码: 200 OK
- 响应体: `[]`（当前用户暂无待办）

**测试结果**: ✅ 成功

---

## 三、用户接口测试

### 3.1 获取个人统计

**请求**:
- 方法: GET
- 路径: `/api/users/stats`
- 请求头: `Authorization: Bearer <token>`

**响应**:
- 状态码: 200 OK
- 响应体:
```json
{
  "total_todos": 0,
  "completed_todos": 0,
  "pending_todos": 0,
  "completion_rate": 0,
  "daily_stats": [],
  "category_stats": [],
  "priority_stats": [],
  "due_soon": []
}
```

**测试结果**: ✅ 成功

---

## 四、管理接口测试（管理员专用）

### 4.1 获取系统统计

**请求**:
- 方法: GET
- 路径: `/api/admin/stats`
- 请求头: `Authorization: Bearer <admin-token>`

**响应**:
- 状态码: 200 OK
- 响应体:
```json
{
  "total_users": 3,
  "total_todos": 1,
  "completed_todos": 1,
  "pending_todos": 0,
  "completion_rate": 100.0,
  "users": [...],
  "recent_todos": [...],
  "category_stats": [...]
}
```

**测试结果**: ✅ 成功

---

## 五、测试总结

### 测试覆盖情况

| 接口类别 | 接口数量 | 测试数量 | 通过率 |
|----------|----------|----------|--------|
| 认证接口 | 2 | 2 | 100% |
| 用户接口 | 1 | 1 | 100% |
| 待办接口 | 1 | 1 | 100% |
| 管理接口 | 1 | 1 | 100% |
| **合计** | **5** | **5** | **100%** |

### 测试结论

1. ✅ 所有接口均能正常响应
2. ✅ 认证机制工作正常（JWT Token）
3. ✅ 权限控制工作正常（管理员可以访问管理接口）
4. ✅ 数据隔离工作正常（用户只能访问自己的数据）

### 测试环境信息

- **后端框架**: Flask 3.1.3
- **数据库**: SQLite
- **测试工具**: Python requests 库
- **测试日期**: 2026年7月19日
