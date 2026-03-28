# 🧠 记忆库管理系统

一个简单实用的记忆库 CLI 工具，支持分类管理、标签筛选、导入导出。

## 功能特性

| 功能 | 说明 |
|------|------|
| 写记忆 | 添加新记忆，支持分类和标签 |
| 读记忆 | 按分类、标签、关键词筛选 |
| 搜索记忆 | 全文搜索 |
| 删除记忆 | 按ID删除 |
| 更新记忆 | 按ID修改内容 |
| 统计信息 | 查看记忆库概览 |
| 导入/导出 | 支持 JSON、MD、TXT 格式 |

## 分类设计

| 分类 | 用途 | 特性 |
|------|------|------|
| 深层 | 身份设定、规则等长期不变的内容 | 永久存储 |
| 日常 | 最近几天发生的事 | 过期自动清理 |
| 日记 | 每日带感情的记录 | 按日期组织 |
| 写文 | 创作进度、故事进度 | 持续更新 |

## 安装

```bash
cd memory-lib
npm install
```

## 使用方法

```bash
# 添加记忆
node src/index.js add -c "我是AI助手" -t "身份" -cat 深层 -s "系统设定"

# 读取记忆（按分类）
node src/index.js read -cat 深层

# 读取记忆（按标签）
node src/index.js read -t "身份"

# 读取记忆（关键词）
node src/index.js read -k "关键词"

# 列出所有记忆
node src/index.js read -l

# 搜索
node src/index.js search "关键词"

# 查看单条
node src/index.js view <id>

# 删除
node src/index.js delete <id>

# 更新
node src/index.js update <id> -c "新内容"

# 统计
node src/index.js stats

# 导出
node src/index.js export -f json
node src/index.js export -f md
node src/index.js export -f txt

# 导入
node src/index.js import -f json -p ./file.json

# 清理过期记忆（默认7天）
node src/index.js clean
node src/index.js clean -d 30
```

## 项目结构

```
memory-lib/
├── src/
│   ├── index.ts       # CLI 入口
│   ├── types.ts       # 类型定义
│   ├── storage.ts    # 存储模块
│   ├── memory.ts     # 核心逻辑
│   ├── import-export.ts  # 导入导出
│   └── stats.ts      # 统计模块
├── data/
│   └── memories.json # 数据文件
├── docs/
│   ├── CHANGELOG.md  # 函数日志
│   └── ARCHITECTURE.md  # 项目架构
├── package.json
└── tsconfig.json
```

## 数据结构

每条记忆包含：
- **ID**: UUID 唯一标识
- **内容**: 记忆正文
- **分类**: 深层/日常/日记/写文
- **标签**: 字符串数组
- **来源**: 来源说明
- **时间戳**: 创建时间

## 注意事项

1. 数据存储在 `data/memories.json`
2. 删除操作不可恢复
3. 导入时合并到现有数据（不覆盖）
4. 日常分类记忆会自动过期清理

---

> 如有问题请查看 `docs/CHANGELOG.md` 和 `docs/ARCHITECTURE.md`