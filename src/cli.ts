#!/usr/bin/env node
import { HotContentMCPServer } from './mcp-server.js';

// CLI入口
console.log('🔥 启动热门内容 MCP 服务器');

const server = new HotContentMCPServer();
await server.start();