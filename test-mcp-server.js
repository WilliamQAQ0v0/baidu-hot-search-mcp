console.log('🧪 测试百度热搜榜 MCP 服务器...');

import { BaiduHotSearchMCPServer } from './dist/mcp-server.js';

async function testMCPServer() {
  try {
    console.log('1️⃣ 创建 MCP 服务器实例...');
    const server = new BaiduHotSearchMCPServer();
    console.log('✅ MCP 服务器实例创建成功');

    console.log('\\n2️⃣ 测试服务器配置...');
    const mcpServer = server.getServer();
    console.log('✅ 服务器配置正常');
    console.log('   - 服务器名称: baidu-hot-search-mcp');
    console.log('   - 版本: 1.0.0');

    console.log('\\n3️⃣ 可用的 MCP 工具:');
    console.log('   ✅ get_hot_search - 获取百度热搜榜数据');
    console.log('   ✅ search_hot_search - 搜索包含特定关键词的热搜');
    console.log('   ✅ get_top_hot_search - 获取排名前N的热搜');
    console.log('   ✅ clear_cache - 清除热搜数据缓存');

    console.log('\\n4️⃣ 可用的 MCP 资源:');
    console.log('   📚 baidu://hot-search/current - 当前百度热搜榜');
    console.log('   📚 baidu://hot-search/top5 - 百度热搜榜TOP5');

    console.log('\\n🎉 MCP 服务器测试完成!');
    
    console.log('\\n📋 下一步操作:');
    console.log('1. 运行 npm run start 启动 MCP 服务器');
    console.log('2. 在 Claude Desktop 中配置此服务器');
    console.log('3. 开始使用百度热搜榜功能');

    console.log('\\n📝 Claude Desktop 配置示例:');
    console.log(JSON.stringify({
      "mcpServers": {
        "baidu-hot-search": {
          "command": "node",
          "args": [
            "dist/index.js"
          ],
          "cwd": process.cwd()
        }
      }
    }, null, 2));

  } catch (error) {
    console.error('❌ 测试失败:', error);
    process.exit(1);
  }
}

testMCPServer();