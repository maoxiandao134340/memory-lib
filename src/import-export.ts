/**
 * 导入导出模块
 */

import * as fs from 'fs';
import * as path from 'path';
import { Memory, MemoryStore } from './types';
import { loadStore, saveStore, getDataFilePath } from './storage';

// ========== 导出 ==========
export function exportMemories(format: 'json' | 'md' | 'txt', outputPath?: string): string {
  const store = loadStore();
  let content = '';
  let filePath = outputPath;

  if (!filePath) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    filePath = path.join(process.cwd(), `memories_${timestamp}.${format}`);
  }

  switch (format) {
    case 'json':
      content = JSON.stringify(store.memories, null, 2);
      break;
    case 'md':
      content = formatAsMarkdown(store.memories);
      break;
    case 'txt':
      content = formatAsText(store.memories);
      break;
  }

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`✅ 已导出到: ${filePath}`);
  return filePath;
}

// ========== 导入 ==========
export function importMemories(format: 'json' | 'md' | 'txt', filePath: string): number {
  if (!fs.existsSync(filePath)) {
    console.log(`❌ 文件不存在: ${filePath}`);
    return 0;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  let memories: Memory[] = [];

  try {
    switch (format) {
      case 'json':
        memories = parseJson(content);
        break;
      case 'md':
        memories = parseMarkdown(content);
        break;
      case 'txt':
        memories = parseText(content);
        break;
    }
  } catch (error) {
    console.log(`❌ 解析文件失败: ${error}`);
    return 0;
  }

  if (memories.length === 0) {
    console.log('⚠️ 未解析到任何记忆');
    return 0;
  }

  // 合并到现有记忆库
  const store = loadStore();
  store.memories = [...store.memories, ...memories];
  saveStore(store);

  console.log(`✅ 已导入 ${memories.length} 条记忆`);
  return memories.length;
}

// ========== 格式化工具 ==========
function formatAsMarkdown(memories: Memory[]): string {
  let md = '# 记忆库导出\n\n';
  md += `导出时间: ${new Date().toLocaleString()}\n`;
  md += `总计: ${memories.length} 条记忆\n\n---\n\n`;

  // 按分类组织
  const categories = ['深层', '日常', '日记', '写文'];
  
  for (const cat of categories) {
    const filtered = memories.filter(m => m.category === cat);
    if (filtered.length === 0) continue;

    md += `## ${cat}\n\n`;
    
    for (const m of filtered) {
      md += `### ${m.id}\n`;
      md += `- **内容**: ${m.content}\n`;
      md += `- **标签**: ${m.tags.join(', ') || '无'}\n`;
      md += `- **来源**: ${m.source || '无'}\n`;
      md += `- **时间**: ${new Date(m.timestamp).toLocaleString()}\n`;
      if (m.updateTime) {
        md += `- **更新时间**: ${new Date(m.updateTime).toLocaleString()}\n`;
      }
      md += '\n';
    }
  }

  return md;
}

function formatAsText(memories: Memory[]): string {
  let txt = '=======================================\n';
  txt += '           记忆库导出\n';
  txt += '=======================================\n';
  txt += `导出时间: ${new Date().toLocaleString()}\n`;
  txt += `总计: ${memories.length} 条记忆\n\n`;

  for (const m of memories) {
    txt += '---------------------------------------\n';
    txt += `[${m.category}] ${m.id}\n`;
    txt += `内容: ${m.content}\n`;
    txt += `标签: ${m.tags.join(', ') || '无'}\n`;
    txt += `来源: ${m.source || '无'}\n`;
    txt += `创建时间: ${new Date(m.timestamp).toLocaleString()}\n`;
    if (m.updateTime) {
      txt += `更新时间: ${new Date(m.updateTime).toLocaleString()}\n`;
    }
    txt += '\n';
  }

  return txt;
}

// ========== 解析工具 ==========
function parseJson(content: string): Memory[] {
  const data = JSON.parse(content);
  if (Array.isArray(data)) {
    return data as Memory[];
  }
  return [];
}

function parseMarkdown(content: string): Memory[] {
  // 简单解析：从 MD 中提取记忆
  // 格式: ### ID 后面跟着内容
  const memories: Memory[] = [];
  const lines = content.split('\n');
  
  let currentId = '';
  let currentContent = '';
  let currentCategory = '日常';
  let currentTags: string[] = [];
  let currentSource = '';
  let currentTimestamp = Date.now();

  for (const line of lines) {
    const idMatch = line.match(/^###\s+([a-f0-9-]+)/i);
    if (idMatch) {
      if (currentId) {
        memories.push({
          id: currentId,
          content: currentContent.trim(),
          category: currentCategory as any,
          tags: currentTags,
          source: currentSource,
          timestamp: currentTimestamp
        });
      }
      currentId = idMatch[1];
      currentContent = '';
      currentTags = [];
      currentCategory = '日常';
      currentSource = '';
      currentTimestamp = Date.now();
    }

    const catMatch = line.match(/\*\*分类\*\*:\s*(\S+)/);
    if (catMatch) currentCategory = catMatch[1];

    const tagMatch = line.match(/\*\*标签\*\*:\s*(.+)/);
    if (tagMatch) currentTags = tagMatch[1].split(',').map(t => t.trim());

    const sourceMatch = line.match(/\*\*来源\*\*:\s*(.+)/);
    if (sourceMatch) currentSource = sourceMatch[1];

    const timeMatch = line.match(/\*\*时间\*\*:\s*(.+)/);
    if (timeMatch) {
      const dt = new Date(timeMatch[1]);
      if (!isNaN(dt.getTime())) currentTimestamp = dt.getTime();
    }

    const contentMatch = line.match(/\*\*内容\*\*:\s*(.+)/);
    if (contentMatch) currentContent = contentMatch[1];
  }

  if (currentId) {
    memories.push({
      id: currentId,
      content: currentContent.trim(),
      category: currentCategory as any,
      tags: currentTags,
      source: currentSource,
      timestamp: currentTimestamp
    });
  }

  return memories;
}

function parseText(content: string): Memory[] {
  // 简单解析：从 TXT 中提取记忆
  const memories: Memory[] = [];
    const blocks = content.split(/-+/);
  
  for (const block of blocks) {
    const lines = block.trim().split('\n');
    if (lines.length < 3) continue;

    const idMatch = lines[0].match(/[a-f0-9-]{36}/i);
    const catMatch = lines[0].match(/\[(.+?)\]/);
    
    if (idMatch) {
      let content = '';
      let tags: string[] = [];
      let source = '';
      let timestamp = Date.now();

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (line.startsWith('内容:')) content = line.substring(3).trim();
        else if (line.startsWith('标签:')) tags = line.substring(3).split(',').map(t => t.trim());
        else if (line.startsWith('来源:')) source = line.substring(3).trim();
        else if (line.startsWith('创建时间:')) {
          const dt = new Date(line.substring(5).trim());
          if (!isNaN(dt.getTime())) timestamp = dt.getTime();
        }
      }

      memories.push({
        id: idMatch[0],
        content,
        category: (catMatch ? catMatch[1] : '日常') as any,
        tags,
        source,
        timestamp
      });
    }
  }

  return memories;
}