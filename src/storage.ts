/**
 * 存储模块 - 负责 JSON 文件的读写
 */

import * as fs from 'fs';
import * as path from 'path';
import { MemoryStore } from './types';
import * as os from 'os';

// 数据存储在用户主目录下的 .memory-lib 文件夹
const DATA_DIR = path.join(os.homedir(), '.memory-lib');
const DATA_FILE = path.join(DATA_DIR, 'memories.json');
const VERSION = '1.0.0';

// 确保数据目录存在
function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// 初始化空记忆库
function createEmptyStore(): MemoryStore {
  return {
    memories: [],
    version: VERSION,
    lastUpdate: Date.now()
  };
}

// 读取记忆库
export function loadStore(): MemoryStore {
  ensureDataDir();
  
  if (!fs.existsSync(DATA_FILE)) {
    const store = createEmptyStore();
    saveStore(store);
    return store;
  }

  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data) as MemoryStore;
  } catch (error) {
    console.error('读取数据文件失败:', error);
    return createEmptyStore();
  }
}

// 保存记忆库
export function saveStore(store: MemoryStore): void {
  ensureDataDir();
  store.lastUpdate = Date.now();
  fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
}

// 获取数据文件路径（用于导入导出）
export function getDataFilePath(): string {
  return DATA_FILE;
}