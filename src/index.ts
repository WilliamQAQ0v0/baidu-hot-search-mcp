#!/usr/bin/env node
import { BaiduHotSearchMCPServer } from './mcp-server.js';

async function main() {
  try {
    // 解析命令行参数
    const args = process.argv.slice(2);
    let configPath: string | undefined;
    let transportArg = 'stdio';
    let portArg: number | undefined;

    // 解析参数
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--config' || args[i] === '-c') {
        configPath = args[i + 1];
        i++; // 跳过下一个参数（配置文件路径）
      } else if (args[i] === 'stdio' || args[i] === 'sse') {
        transportArg = args[i];
      } else if (!isNaN(parseInt(args[i]))) {
        portArg = parseInt(args[i]);
      }
    }

    // 验证传输类型
    if (transportArg !== 'stdio' && transportArg !== 'sse') {
      console.error('❌ 无效的传输类型。使用 "stdio" 或 "sse"');
      console.error('📖 用法: node dist/index.js [stdio|sse] [port] [--config path/to/config.json]');
      console.error('📖 示例: node dist/index.js sse 3000 --config ./config.json');
      process.exit(1);
    }

    // 创建并启动服务器（配置验证将在构造函数中进行）
    const server = new BaiduHotSearchMCPServer(configPath);
    await server.start(transportArg as 'stdio' | 'sse', portArg);
  } catch (error) {
    console.error('❌ MCP服务器启动失败:', error instanceof Error ? error.message : error);
    console.error('');
    console.error('🔧 故障排除提示:');
    console.error('1. 检查 config.json 文件是否存在');
    console.error('2. 确保 config.json 格式正确');
    console.error('3. 验证 baidu_api 配置项是否完整');
    console.error('4. 检查 API 密钥是否有效');
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