/**
 * 记忆库类型定义
 */

// 记忆分类
export type MemoryCategory = '深层' | '日常' | '日记' | '写文';

// 记忆结构
export interface Memory {
  id: string;           // 唯一标识 (UUID)
  content: string;      // 记忆内容
  category: MemoryCategory;  // 分类
  tags: string[];      // 标签数组
  source: string;      // 来源
  timestamp: number;   // 创建时间戳
  updateTime?: number; // 更新时间戳（可选）
}

// 记忆库整体结构
export interface MemoryStore {
  memories: Memory[];
  version: string;
  lastUpdate: number;
}

// CLI 命令选项
export interface AddOptions {
  content: string;
  category?: MemoryCategory;
  tags?: string[];
  source?: string;
}

export interface ReadOptions {
  category?: MemoryCategory;
  tag?: string;
  keyword?: string;
}

export interface UpdateOptions {
  content?: string;
  category?: MemoryCategory;
  tags?: string[];
  source?: string;
}

export interface ExportOptions {
  format: 'json' | 'md' | 'txt';
  outputPath?: string;
}

export interface ImportOptions {
  format: 'json' | 'md' | 'txt';
  filePath: string;
}

// 统计信息
export interface MemoryStats {
  total: number;
  byCategory: Record<MemoryCategory, number>;
  byTag: Record<string, number>;
  recentDays: number;
}