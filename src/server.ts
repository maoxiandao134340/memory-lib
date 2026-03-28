/**
 * Web 服务器 - 提供 REST API 和前端界面
 */

import express from 'express';
import cors from 'cors';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

// 配置
const PORT = process.env.PORT || 3000;
const DATA_FILE = process.env.DATA_FILE || path.join(process.env.HOME || '', '.memory-lib', 'memories.json');

// 类型定义
type MemoryCategory = '深层' | '日常' | '日记' | '写文';

interface Memory {
  id: string;
  content: string;
  category: MemoryCategory;
  tags: string[];
  source: string;
  timestamp: number;
  updateTime?: number;
}

interface MemoryStore {
  memories: Memory[];
  version: string;
  lastUpdate: number;
}

const VERSION = '1.0.0';

// 确保数据目录存在
function ensureDataDir(): void {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// 读取记忆库
function loadStore(): MemoryStore {
  ensureDataDir();
  
  if (!fs.existsSync(DATA_FILE)) {
    const store: MemoryStore = {
      memories: [],
      version: VERSION,
      lastUpdate: Date.now()
    };
    saveStore(store);
    return store;
  }

  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data) as MemoryStore;
  } catch (error) {
    console.error('读取数据文件失败:', error);
    return { memories: [], version: VERSION, lastUpdate: Date.now() };
  }
}

// 保存记忆库
function saveStore(store: MemoryStore): void {
  ensureDataDir();
  store.lastUpdate = Date.now();
  fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
}

// 创建 Express 应用
const app = express();
app.use(cors());
app.use(express.json());

// 前端静态文件服务
app.use(express.static(path.join(__dirname, '..', 'public')));

// ========== REST API ==========

// 获取所有记忆（支持筛选）
app.get('/api/memories', (req, res) => {
  const { category, tag, keyword } = req.query;
  let results = loadStore().memories;
  
  if (category) {
    results = results.filter(m => m.category === category);
  }
  if (tag) {
    results = results.filter(m => m.tags.includes(tag as string));
  }
  if (keyword) {
    const kw = (keyword as string).toLowerCase();
    results = results.filter(m => 
      m.content.toLowerCase().includes(kw) ||
      m.tags.some(t => t.toLowerCase().includes(kw)) ||
      m.source.toLowerCase().includes(kw)
    );
  }
  
  res.json(results);
});

// 获取单条记忆
app.get('/api/memories/:id', (req, res) => {
  const memory = loadStore().memories.find(m => m.id === req.params.id);
  if (!memory) {
    return res.status(404).json({ error: 'Memory not found' });
  }
  res.json(memory);
});

// 添加记忆
app.post('/api/memories', (req, res) => {
  const { content, category = '日常', tags = [], source = '' } = req.body;
  
  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }
  
  const store = loadStore();
  const memory: Memory = {
    id: uuidv4(),
    content,
    category: category as MemoryCategory,
    tags,
    source,
    timestamp: Date.now()
  };
  
  store.memories.push(memory);
  saveStore(store);
  
  res.status(201).json(memory);
});

// 更新记忆
app.put('/api/memories/:id', (req, res) => {
  const store = loadStore();
  const memory = store.memories.find(m => m.id === req.params.id);
  
  if (!memory) {
    return res.status(404).json({ error: 'Memory not found' });
  }
  
  const { content, category, tags, source } = req.body;
  if (content !== undefined) memory.content = content;
  if (category !== undefined) memory.category = category as MemoryCategory;
  if (tags !== undefined) memory.tags = tags;
  if (source !== undefined) memory.source = source;
  memory.updateTime = Date.now();
  
  saveStore(store);
  res.json(memory);
});

// 删除记忆
app.delete('/api/memories/:id', (req, res) => {
  const store = loadStore();
  const index = store.memories.findIndex(m => m.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Memory not found' });
  }
  
  store.memories.splice(index, 1);
  saveStore(store);
  
  res.json({ success: true });
});

// 获取统计信息
app.get('/api/stats', (req, res) => {
  const store = loadStore();
  res.json({
    total: store.memories.length,
    byCategory: {
      '深层': store.memories.filter(m => m.category === '深层').length,
      '日常': store.memories.filter(m => m.category === '日常').length,
      '日记': store.memories.filter(m => m.category === '日记').length,
      '写文': store.memories.filter(m => m.category === '写文').length,
    },
    lastUpdate: store.lastUpdate
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🧠 记忆库服务器运行在 http://localhost:${PORT}`);
});

export default app;