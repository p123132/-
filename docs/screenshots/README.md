# 截图包说明

本文档记录了项目的截图说明，包括数据库结构、API接口测试和AI Code Review截图。

## 目录结构

```
screenshots/
├── database/          # 数据库结构截图
│   ├── users_table.png      # 用户表结构
│   ├── todos_table.png      # 待办表结构
│   ├── audit_logs_table.png # 操作日志表结构
│   └── database_overview.png# 数据库概览
├── api/               # API接口测试截图
│   ├── auth_register.png    # 用户注册
│   ├── auth_login.png       # 用户登录
│   ├── todos_create.png     # 创建待办
│   ├── todos_list.png       # 获取待办列表
│   ├── users_profile.png    # 更新个人资料
│   ├── admin_stats.png      # 管理后台统计
│   └── templates_apply.png  # 应用模板
└── ai_code_review/    # AI代码审查截图
    ├── review_overview.png  # 审查概览
    ├── security_review.png  # 安全审查
    ├── code_quality.png     # 代码质量
    └── suggestions.png      # 改进建议
```

## 截图说明

### 数据库截图
- 使用SQLite数据库，包含3个表：users、todos、audit_logs
- 用户表：存储用户注册信息和角色
- 待办表：存储用户的待办事项
- 操作日志表：记录系统关键操作

### API接口测试截图
- 使用Postman进行接口测试
- 覆盖所有22个API接口
- 包含认证、用户、待办、模板、分享、管理等模块

### AI Code Review截图
- 使用AI工具进行代码审查
- 检查代码质量、安全漏洞、最佳实践
- 提供改进建议和优化方案

## 使用方法

1. 打开对应目录查看截图
2. 截图按照功能模块分类
3. 配合API文档和测试说明使用
