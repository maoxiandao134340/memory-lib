/**
 * 核心记忆模块 - 增删改查逻辑
 */

import { v4 as uuidv4 } from 'uuid';
import { Memory, MemoryCategory, AddOptions, ReadOptions, UpdateOptions, MemoryStats } from './types';
import { loadStore, saveStore } from './storage';

// ========== 写记忆 ==========
export function addMemory(options: AddOptions): Memory {
  const store = loadStore();
  
  const memory: Memory = {
    id: uuidv4(),
    content: options.content,
    category: options.category || '日常',
    tags: options.tags || [],
    source: options.source || '',
    timestamp: Date.now()
  };
  
  store.memories.push(memory);
  saveStore(store);
  
  console.log(`✅ 记忆已添加 (ID: ${memory.id})`);
  return memory;
}

// ========== 读记忆 ==========
export function readMemories(options: ReadOptions): Memory[] {
  const store = loadStore();
  let results = store.memories;
  
  // 按分类筛选
  if (options.category) {
    results = results.filter(m => m.category === options.category);
  }
  
  // 按标签筛选
  if (options.tag) {
    results = results.filter(m => m.tags.includes(options.tag!));
  }
  
  // 按关键词筛选
  if (options.keyword) {
    const keyword = options.keyword.toLowerCase();
    results = results.filter(m => 
      m.content.toLowerCase().includes(keyword) ||
      m.tags.some(t => t.toLowerCase().includes(keyword)) ||
      m.source.toLowerCase().includes(keyword)
    );
  }
  
  return results;
}

// ========== 搜索记忆 ==========
export function searchMemories(keyword: string): Memory[] {
  const store = loadStore();
  const kw = keyword.toLowerCase();
  
  return store.memories.filter(m => 
    m.content.toLowerCase().includes(kw) ||
    m.tags.some(t => t.toLowerCase().includes(kw)) ||
    m.source.toLowerCase().includes(kw) ||
    m.category.toLowerCase().includes(kw)
  );
}

// ========== 删除记忆 ==========
export function deleteMemory(id: string): boolean {
  const store = loadStore();
  const index = store.memories.findIndex(m => m.id === id);
  
  if (index === -1) {
    console.log(`❌ 未找到 ID 为 "${id}" 的记忆`);
    return false;
  }
  
  store.memories.splice(index, 1);
  saveStore(store);
  console.log(`✅ 已删除记忆 (ID: ${id})`);
  return true;
}

// ========== 更新记忆 ==========
export function updateMemory(id: string, options: UpdateOptions): boolean {
  const store = loadStore();
  const memory = store.memories.find(m => m.id === id);
  
  if (!memory) {
    console.log(`❌ 未找到 ID 为 "${id}" 的记忆`);
    return false;
  }
  
  if (options.content !== undefined) memory.content = options.content;
  if (options.category !== undefined) memory.category = options.category;
  if (options.tags !== undefined) memory.tags = options.tags;
  if (options.source !== undefined) memory.source = options.source;
  memory.updateTime = Date.now();
  
  saveStore(store);
  console.log(`✅ 已更新记忆 (ID: ${id})`);
  return true;
}

// ========== 查看统计信息 ==========
export function getStats(): MemoryStats {
  const store = loadStore();
  
  const stats: MemoryStats = {
    total: store.memories.length,
    byCategory: {
      '深层': 0,
      '日常': 0,
      '日记': 0,
      '写文': 0
    },
    byTag: {},
    recentDays: 7
  };
  
  // 统计各分类数量
  store.memories.forEach(m => {
    stats.byCategory[m.category]++;
    
    // 统计标签
    m.tags.forEach(tag => {
      stats.byTag[tag] = (stats.byTag[tag] || 0) + 1;
    });
  });
  
  return stats;
}

// 根据ID获取单条记忆
export function getMemoryById(id: string): Memory | undefined {
  const store = loadStore();
  return store.memories.find(m => m.id === id);
}

// 清理过期记忆（日常分类超过指定天数）
export function cleanExpiredMemories(days: number = 7): number {
  const store = loadStore();
  const now = Date.now();
  const threshold = days * 24 * 60 * 60 * 1000;
  
  const initialCount = store.memories.length;
  
  store.memories = store.memories.filter(m => {
    // 日常分类超过天数则删除
    if (m.category === '日常') {
      return (now - m.timestamp) < threshold;
    }
    return true;
  });
  
  const deletedCount = initialCount - store.memories.length;
  
  if (deletedCount > 0) {
    saveStore(store);
    console.log(`🧹 已清理 ${deletedCount} 条过期的日常记忆`);
  }
  
  return deletedCount;
}