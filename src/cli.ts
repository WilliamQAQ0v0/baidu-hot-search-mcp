#!/usr/bin/env node
import { BaiduHotSearchMCPServer } from './mcp-server.js';

// CLI入口
console.log('🔥 启动百度热搜榜 MCP 服务器');

const server = new BaiduHotSearchMCPServer();
await server.start();