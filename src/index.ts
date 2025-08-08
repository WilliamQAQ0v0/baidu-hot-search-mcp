#!/usr/bin/env node
import { BaiduHotSearchMCPServer } from './mcp-server.js';

async function main() {
  try {
    // 解析命令行参数
    const args = process.argv.slice(2);
    const transportArg = args[0] || 'stdio';
    const portArg = args[1] ? parseInt(args[1]) : undefined;

    // 验证传输类型
    if (transportArg !== 'stdio' && transportArg !== 'sse') {
      console.error('❌ 无效的传输类型。使用 "stdio" 或 "sse"');
      console.error('📖 用法: node dist/index.js [stdio|sse] [port]');
      console.error('📖 示例: node dist/index.js sse 3000');
      process.exit(1);
    }

    // 创建并启动服务器
    const server = new BaiduHotSearchMCPServer();
    await server.start(transportArg as 'stdio' | 'sse', portArg);
  } catch (error) {
    console.error('❌ MCP服务器启动失败:', error);
    process.exit(1);
  }
}

// 优雅关闭处理
process.on('SIGINT', () => {
  console.error('\n👋 MCP服务器正在关闭...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error('\n👋 MCP服务器正在关闭...');
  process.exit(0);
});

main().catch((error) => {
  console.error('💥 未处理的错误:', error);
  process.exit(1);
});