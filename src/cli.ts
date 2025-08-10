#!/usr/bin/env node
import { HotContentMCPServer } from './mcp-server.js';
import { existsSync } from 'fs';
import { join, resolve } from 'path';

// CLI入口
console.error('🔥 启动热门内容 MCP 服务器');

// 解析命令行参数
const args = process.argv.slice(2);
let customConfigPath: string | undefined;

// 检查 --config 参数
const configIndex = args.findIndex(arg => arg === '--config');
if (configIndex !== -1 && configIndex + 1 < args.length) {
  customConfigPath = resolve(args[configIndex + 1]);
}

// 配置文件搜索路径（按优先级排序）
const searchPaths = [
  // 1. 自定义路径（如果指定）
  customConfigPath,
  // 2. 当前工作目录
  join(process.cwd(), 'config.json'),
  // 3. 用户主目录
  join(process.env.HOME || process.env.USERPROFILE || '', 'config.json'),
  // 4. Windows用户配置目录
  process.platform === 'win32' ? join(process.env.APPDATA || '', 'hot-content-mcp', 'config.json') : null,
  // 5. Unix/Linux用户配置目录
  process.platform !== 'win32' ? join(process.env.HOME || '', '.config', 'hot-content-mcp', 'config.json') : null,
  // 6. 当前目录的父目录（适用于某些项目结构）
  join(process.cwd(), '..', 'config.json'),
].filter(Boolean) as string[];

let configPath: string | undefined;

// 按优先级查找配置文件
for (const path of searchPaths) {
  if (existsSync(path)) {
    configPath = path;
    if (customConfigPath && path === customConfigPath) {
      console.error(`📂 使用自定义配置文件: ${path}`);
    } else {
      console.error(`📂 使用配置文件: ${path}`);
    }
    break;
  }
}

// 如果指定了自定义路径但文件不存在
if (customConfigPath && !configPath) {
  console.error(`❌ 指定的配置文件不存在: ${customConfigPath}`);
  process.exit(1);
}

// 如果没有找到任何配置文件
if (!configPath) {
  console.error('❌ 找不到 config.json 配置文件');
  console.error('📝 请在以下任一位置创建配置文件:');
  console.error(`   1. 当前目录: ${join(process.cwd(), 'config.json')}`);
  console.error(`   2. 用户目录: ${join(process.env.HOME || process.env.USERPROFILE || '', 'config.json')}`);
  if (process.platform === 'win32') {
    console.error(`   3. 应用数据目录: ${join(process.env.APPDATA || '', 'hot-content-mcp', 'config.json')}`);
  } else {
    console.error(`   3. 用户配置目录: ${join(process.env.HOME || '', '.config', 'hot-content-mcp', 'config.json')}`);
  }
  console.error(`   4. 或使用 --config 参数指定配置文件路径`);
  console.error('');
  console.error('📋 配置文件格式:');
  console.error(JSON.stringify({
    "api": {
      "id": "your_actual_api_id",
      "key": "your_actual_api_key"
    }
  }, null, 2));
  console.error('');
  console.error('🔗 获取API凭据: https://www.apihz.cn/?shareid=10004969');
  process.exit(1);
}

const server = new HotContentMCPServer(configPath);
await server.start();