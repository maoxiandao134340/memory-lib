#!/usr/bin/env node

/**
 * 记忆库 CLI 入口
 * 使用方法: node dist/index.js <command> [options]
 */

import { Command } from 'commander';
import { addMemory, readMemories, searchMemories, deleteMemory, updateMemory, getMemoryById, cleanExpiredMemories } from './memory';
import { exportMemories, importMemories } from './import-export';
import { showStats } from './stats';
import { MemoryCategory } from './types';

const program = new Command();

program
  .name('mem')
  .description('🧠 记忆库管理系统')
  .version('1.0.0');

// ========== 添加记忆 ==========
program
  .command('add')
  .description('添加一条新记忆')
  .requiredOption('-c, --content <text>', '记忆内容')
  .option('-t, --tag <tags>', '标签（逗号分隔）', '')
  .option('-cat, --category <cat>', '分类 (深层/日常/日记/写文)', '日常')
  .option('-s, --source <source>', '来源', '')
  .action((options) => {
    const tags = options.tag ? options.tag.split(',').map(t => t.trim()) : [];
    addMemory({
      content: options.content,
      category: options.category as MemoryCategory,
      tags,
      source: options.source
    });
  });

// ========== 读取记忆 ==========
program
  .command('read')
  .description('读取记忆（支持按分类、标签、关键词筛选）')
  .option('-cat, --category <cat>', '按分类筛选 (深层/日常/日记/写文)')
  .option('-t, --tag <tag>', '按标签筛选')
  .option('-k, --keyword <keyword>', '按关键词筛选')
  .option('-l, --list', '列出所有记忆（不加筛选条件）')
  .action((options) => {
    if (options.list) {
      const results = readMemories({});
      displayMemories(results);
      return;
    }
    
    const results = readMemories({
      category: options.category as MemoryCategory,
      tag: options.tag,
      keyword: options.keyword
    });
    
    if (results.length === 0) {
      console.log('未找到匹配的记忆');
    } else {
      displayMemories(results);
    }
  });

// ========== 搜索记忆 ==========
program
  .command('search <keyword>')
  .description('全文搜索记忆')
  .action((keyword) => {
    const results = searchMemories(keyword);
    if (results.length === 0) {
      console.log(`未找到包含 "${keyword}" 的记忆`);
    } else {
      console.log(`找到 ${results.length} 条相关记忆:\n`);
      displayMemories(results);
    }
  });

// ========== 删除记忆 ==========
program
  .command('delete <id>')
  .description('删除指定ID的记忆')
  .action((id) => {
    deleteMemory(id);
  });

// ========== 更新记忆 ==========
program
  .command('update <id>')
  .description('更新指定ID的记忆')
  .option('-c, --content <text>', '新内容')
  .option('-t, --tag <tags>', '新标签（逗号分隔）', '')
  .option('-cat, --category <cat>', '新分类 (深层/日常/日记/写文)')
  .option('-s, --source <source>', '新来源')
  .action((id, options) => {
    const tags = options.tag ? options.tag.split(',').map(t => t.trim()) : undefined;
    updateMemory(id, {
      content: options.content,
      category: options.category as MemoryCategory,
      tags: tags,
      source: options.source
    });
  });

// ========== 查看单条记忆 ==========
program
  .command('view <id>')
  .description('查看指定ID的记忆详情')
  .action((id) => {
    const memory = getMemoryById(id);
    if (!memory) {
      console.log(`未找到 ID 为 "${id}" 的记忆`);
      return;
    }
    displayOneMemory(memory);
  });

// ========== 统计信息 ==========
program
  .command('stats')
  .description('查看记忆库统计信息')
  .action(() => {
    showStats();
  });

// ========== 导出 ==========
program
  .command('export')
  .description('导出记忆库')
  .requiredOption('-f, --format <format>', '格式 (json/md/txt)')
  .option('-o, --output <path>', '输出文件路径')
  .action((options) => {
    exportMemories(options.format, options.output);
  });

// ========== 导入 ==========
program
  .command('import')
  .description('导入记忆库')
  .requiredOption('-f, --format <format>', '格式 (json/md/txt)')
  .requiredOption('-p, --path <path>', '文件路径')
  .action((options) => {
    importMemories(options.format, options.path);
  });

// ========== 清理过期 ==========
program
  .command('clean')
  .description('清理过期的日常记忆（默认7天）')
  .option('-d, --days <days>', '过期天数', '7')
  .action((options) => {
    cleanExpiredMemories(parseInt(options.days));
  });

// ========== 辅助函数 ==========
function displayMemories(memories: any[]): void {
  console.log('━'.repeat(60));
  for (const m of memories) {
    console.log(`ID: ${m.id}`);
    console.log(`分类: ${m.category} | 标签: ${m.tags.join(', ') || '无'} | 来源: ${m.source || '无'}`);
    console.log(`内容: ${m.content}`);
    console.log(`时间: ${new Date(m.timestamp).toLocaleString()}`);
    console.log('━'.repeat(60));
  }
}

function displayOneMemory(m: any): void {
  console.log('\n📝 记忆详情');
  console.log('━'.repeat(40));
  console.log(`ID:       ${m.id}`);
  console.log(`分类:     ${m.category}`);
  console.log(`标签:     ${m.tags.join(', ') || '无'}`);
  console.log(`来源:     ${m.source || '无'}`);
  console.log(`创建时间: ${new Date(m.timestamp).toLocaleString()}`);
  if (m.updateTime) {
    console.log(`更新时间: ${new Date(m.updateTime).toLocaleString()}`);
  }
  console.log(`\n内容:`);
  console.log(m.content);
  console.log('━'.repeat(40) + '\n');
}

program.parse();