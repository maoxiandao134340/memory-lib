/**
 * 统计模块 - 显示记忆库统计信息
 */

import { getStats } from './memory';
import { MemoryStats } from './types';

export function showStats(): void {
  const stats = getStats();
  
  console.log('\n📊 记忆库统计信息\n');
  console.log(`  总记忆数: ${stats.total}`);
  console.log('\n  📁 按分类统计:');
  console.log(`    深层: ${stats.byCategory['深层']} 条`);
  console.log(`    日常: ${stats.byCategory['日常']} 条`);
  console.log(`    日记: ${stats.byCategory['日记']} 条`);
  console.log(`    写文: ${stats.byCategory['写文']} 条`);
  
  const tagCount = Object.keys(stats.byTag).length;
  if (tagCount > 0) {
    console.log('\n  🏷️ 按标签统计 (Top 10):');
    const sortedTags = Object.entries(stats.byTag)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    for (const [tag, count] of sortedTags) {
      console.log(`    ${tag}: ${count} 条`);
    }
  }
  
  console.log('\n');
}