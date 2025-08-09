import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { BaiduHotSearchService, SimplifiedHotSearchItem } from './api.js';
import { ConfigManager } from './config.js';
import * as http from 'http';
import * as url from 'url';

export class BaiduHotSearchMCPServer {
  private server: Server;
  private hotSearchService: BaiduHotSearchService;
  private configManager: ConfigManager;

  constructor(configPath?: string) {
    // 初始化配置管理器并立即验证配置
    this.configManager = new ConfigManager(configPath);
    
    // 在构造函数中就验证配置，确保配置文件存在且有效
    try {
      this.configManager.loadConfig();
      console.error('✅ 配置文件加载成功');
    } catch (error) {
      console.error('❌ 配置文件加载失败:', error instanceof Error ? error.message : '未知错误');
      console.error('💡 请确保 config.json 文件存在且包含有效的百度API配置');
      console.error('📝 配置文件格式示例:');
      console.error(JSON.stringify({
        "baidu_api": {
          "id": "your_user_id",
          "key": "your_api_key"
        }
      }, null, 2));
      throw new Error('配置验证失败，服务器无法启动');
    }

    this.server = new Server(
      {
        name: 'baidu-hot-search-mcp',
        version: '1.1.1',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    // 使用已验证的配置管理器创建服务
    this.hotSearchService = new BaiduHotSearchService(this.configManager);
    this.setupToolHandlers();
    this.setupResourceHandlers();
  }

  /**
   * 设置工具处理器
   */
  private setupToolHandlers(): void {
    // 列出所有可用工具
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'get_hot_search',
          description: '获取百度热搜榜数据',
          inputSchema: {
            type: 'object',
            properties: {
              count: {
                type: 'number',
                description: '要获取的热搜条数，默认为10，最大50',
                minimum: 1,
                maximum: 50,
                default: 10,
              },
              use_cache: {
                type: 'boolean',
                description: '是否使用缓存数据，默认为true',
                default: true,
              },
            },
            additionalProperties: false,
          },
        },
        {
          name: 'search_hot_search',
          description: '搜索包含特定关键词的热搜',
          inputSchema: {
            type: 'object',
            properties: {
              keyword: {
                type: 'string',
                description: '搜索关键词',
                minLength: 1,
              },
            },
            required: ['keyword'],
            additionalProperties: false,
          },
        },
        {
          name: 'clear_cache',
          description: '清除热搜数据缓存',
          inputSchema: {
            type: 'object',
            properties: {},
            additionalProperties: false,
          },
        },
      ],
    }));

    // 处理工具调用
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'get_hot_search':
            return await this.handleGetHotSearch(args);
          case 'search_hot_search':
            return await this.handleSearchHotSearch(args);
          case 'clear_cache':
            return await this.handleClearCache();
          default:
            throw new Error(`未知工具: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `工具执行失败: ${error instanceof Error ? error.message : '未知错误'}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  /**
   * 设置资源处理器
   */
  private setupResourceHandlers(): void {
    // 列出所有可用资源
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [
        {
          uri: 'baidu://hot-search/current',
          name: '当前百度热搜榜',
          description: '实时的百度热搜榜数据',
          mimeType: 'application/json',
        },
      ],
    }));

    // 处理资源读取
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      try {
        switch (uri) {
          case 'baidu://hot-search/current':
            return await this.handleReadCurrentHotSearch();
          default:
            throw new Error(`未知资源: ${uri}`);
        }
      } catch (error) {
        throw new Error(`读取资源失败: ${error instanceof Error ? error.message : '未知错误'}`);
      }
    });
  }

  /**
   * 处理获取热搜工具
   */
  private async handleGetHotSearch(args: any) {
    const count = args?.count ?? 10;
    const useCache = args?.use_cache ?? true;

    const data = await this.hotSearchService.getHotSearchData(useCache);
    const results = data.slice(0, Math.min(count, data.length));

    return {
      content: [
        {
          type: 'text',
          text: this.formatHotSearchResults(results, `百度热搜榜 TOP ${count}`),
        },
      ],
    };
  }

  /**
   * 处理搜索热搜工具
   */
  private async handleSearchHotSearch(args: any) {
    const keyword = args.keyword;
    const results = await this.hotSearchService.searchHotSearch(keyword);

    if (results.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: `没有找到包含关键词"${keyword}"的热搜。`,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: this.formatHotSearchResults(results, `搜索"${keyword}"的结果`),
        },
      ],
    };
  }


  /**
   * 处理清除缓存工具
   */
  private async handleClearCache() {
    this.hotSearchService.clearCache();

    return {
      content: [
        {
          type: 'text',
          text: '✅ 缓存已清除，下次请求将获取最新数据。',
        },
      ],
    };
  }

  /**
   * 处理读取当前热搜资源
   */
  private async handleReadCurrentHotSearch() {
    const data = await this.hotSearchService.getHotSearchData();
    
    return {
      contents: [
        {
          uri: 'baidu://hot-search/current',
          mimeType: 'application/json',
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }


  /**
   * 格式化热搜结果为可读文本
   */
  private formatHotSearchResults(results: SimplifiedHotSearchItem[], title: string): string {
    let output = `## ${title}\n\n`;
    
    if (results.length === 0) {
      output += '暂无数据\n';
      return output;
    }

    results.forEach((item, index) => {
      output += `### ${item.rank}. ${item.title}\n`;
      output += `- **热度**: ${item.hotScore}\n`;
      output += `- **趋势**: ${item.trend}\n`;
      if (item.description) {
        output += `- **描述**: ${item.description}\n`;
      }
      if (item.url) {
        output += `- **链接**: ${item.url}\n`;
      }
      output += '\n';
    });

    output += `*数据获取时间: ${new Date().toLocaleString('zh-CN')}*\n`;
    
    return output;
  }

  /**
   * 启动MCP服务器
   */
  public async start(transport: 'stdio' | 'sse' = 'stdio', port?: number): Promise<void> {
    if (transport === 'sse') {
      await this.startSSEServer(port || 3000);
    } else {
      await this.startStdioServer();
    }
  }

  /**
   * 启动STDIO传输
   */
  private async startStdioServer(): Promise<void> {
    const serverTransport = new StdioServerTransport();
    await this.server.connect(serverTransport);
    console.error('📱 启动 STDIO 传输模式');
    console.error('🚀 百度热搜榜 MCP 服务器已启动');
    console.error('📋 可用工具: get_hot_search, search_hot_search, clear_cache');
    console.error('📚 可用资源: baidu://hot-search/current');
  }

  /**
   * 启动SSE传输
   */
  private async startSSEServer(port: number): Promise<void> {
    const httpServer = http.createServer();

    httpServer.on('request', async (req, res) => {
      const parsedUrl = url.parse(req.url || '', true);
      
      // 设置CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }

      if (parsedUrl.pathname === '/') {
        // 提供简单的HTML客户端
        res.setHeader('Content-Type', 'text/html');
        res.writeHead(200);
        res.end(this.getTestPage());
        return;
      }

      if (parsedUrl.pathname === '/sse' && req.method === 'GET') {
        // SSE连接
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        });

        res.write('data: {"type":"connection","message":"Connected to Baidu Hot Search MCP Server"}\\n\\n');
        
        // 发送服务器信息
        const serverInfo = {
          type: 'server-info',
          name: 'baidu-hot-search-mcp',
          version: '1.0.0',
          tools: ['get_hot_search', 'search_hot_search', 'clear_cache'],
          resources: ['baidu://hot-search/current']
        };
        res.write(`data: ${JSON.stringify(serverInfo)}\\n\\n`);

        // 保持连接活跃
        const keepAlive = setInterval(() => {
          res.write('data: {"type":"ping","timestamp":' + Date.now() + '}\\n\\n');
        }, 30000);

        req.on('close', () => {
          clearInterval(keepAlive);
        });

        return;
      }

      if (parsedUrl.pathname === '/api' && req.method === 'POST') {
        // 处理MCP请求
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });

        req.on('end', async () => {
          try {
            const request = JSON.parse(body);
            const response = await this.handleMCPRequest(request);
            
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(200);
            res.end(JSON.stringify(response));
          } catch (error) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: 'Invalid request' }));
          }
        });
        return;
      }

      res.writeHead(404);
      res.end('Not found');
    });

    httpServer.listen(port, () => {
      console.error(`🌐 启动 SSE 传输模式，端口: ${port}`);
      console.error(`🔗 访问地址: http://localhost:${port}`);
      console.error('🚀 百度热搜榜 MCP 服务器已启动');
      console.error('📋 可用工具: get_hot_search, search_hot_search, clear_cache');
      console.error('📚 可用资源: baidu://hot-search/current');
      console.error('💡 在浏览器中访问上述地址测试SSE连接');
    });
  }

  /**
   * 处理MCP请求
   */
  private async handleMCPRequest(request: any): Promise<any> {
    switch (request.method) {
      case 'tools/list':
        return {
          tools: [
            {
              name: 'get_hot_search',
              description: '获取百度热搜榜数据',
              inputSchema: {
                type: 'object',
                properties: {
                  count: { type: 'number', description: '要获取的热搜条数，默认为10，最大50' }
                }
              }
            },
            {
              name: 'search_hot_search', 
              description: '搜索包含特定关键词的热搜',
              inputSchema: {
                type: 'object',
                properties: {
                  keyword: { type: 'string', description: '搜索关键词' }
                },
                required: ['keyword']
              }
            }
          ]
        };

      case 'tools/call':
        const toolName = request.params.name;
        const args = request.params.arguments || {};
        
        switch (toolName) {
          case 'get_hot_search':
            const data = await this.hotSearchService.getHotSearchData();
            const count = args.count || 10;
            const results = data.slice(0, Math.min(count, data.length));
            return {
              content: [
                {
                  type: 'text',
                  text: this.formatHotSearchResults(results, `百度热搜榜 TOP ${count}`)
                }
              ]
            };

          case 'search_hot_search':
            const searchResults = await this.hotSearchService.searchHotSearch(args.keyword);
            return {
              content: [
                {
                  type: 'text', 
                  text: searchResults.length > 0 
                    ? this.formatHotSearchResults(searchResults, `搜索"${args.keyword}"的结果`)
                    : `没有找到包含关键词"${args.keyword}"的热搜。`
                }
              ]
            };

          default:
            throw new Error(`未知工具: ${toolName}`);
        }

      default:
        throw new Error(`不支持的方法: ${request.method}`);
    }
  }

  /**
   * 获取测试页面HTML
   */
  private getTestPage(): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>百度热搜榜 MCP 服务器</title>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .container { max-width: 800px; margin: 0 auto; }
        .status { padding: 10px; border-radius: 5px; margin: 10px 0; }
        .connected { background: #d4edda; color: #155724; }
        .error { background: #f8d7da; color: #721c24; }
        .message { background: #f8f9fa; padding: 10px; margin: 5px 0; border-left: 3px solid #007bff; }
        button { padding: 10px 15px; margin: 5px; background: #007bff; color: white; border: none; border-radius: 3px; cursor: pointer; }
        button:hover { background: #0056b3; }
        #messages { height: 400px; overflow-y: auto; border: 1px solid #ccc; padding: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔥 百度热搜榜 MCP 服务器</h1>
        <div id="status" class="status">准备连接...</div>
        
        <div>
            <button onclick="testGetHotSearch()">获取热搜榜</button>
            <button onclick="testSearch()">搜索热搜</button>
            <button onclick="clearMessages()">清空消息</button>
        </div>
        
        <div id="messages"></div>
    </div>

    <script>
        let eventSource;
        const messagesDiv = document.getElementById('messages');
        const statusDiv = document.getElementById('status');

        function connectSSE() {
            eventSource = new EventSource('/sse');
            
            eventSource.onopen = function(event) {
                statusDiv.className = 'status connected';
                statusDiv.textContent = '✅ 已连接到 MCP 服务器';
                addMessage('连接成功', 'info');
            };

            eventSource.onmessage = function(event) {
                try {
                    const data = JSON.parse(event.data);
                    addMessage(JSON.stringify(data, null, 2), 'data');
                } catch (e) {
                    addMessage(event.data, 'raw');
                }
            };

            eventSource.onerror = function(event) {
                statusDiv.className = 'status error';
                statusDiv.textContent = '❌ 连接错误';
                addMessage('连接错误', 'error');
            };
        }

        async function testGetHotSearch() {
            try {
                const response = await fetch('/api', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        method: 'tools/call',
                        params: {
                            name: 'get_hot_search',
                            arguments: { count: 5 }
                        }
                    })
                });
                const result = await response.json();
                addMessage('获取热搜榜结果:', 'info');
                addMessage(JSON.stringify(result, null, 2), 'success');
            } catch (error) {
                addMessage('获取热搜榜失败: ' + error.message, 'error');
            }
        }

        async function testSearch() {
            const keyword = prompt('请输入搜索关键词:');
            if (!keyword) return;

            try {
                const response = await fetch('/api', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        method: 'tools/call',
                        params: {
                            name: 'search_hot_search',
                            arguments: { keyword }
                        }
                    })
                });
                const result = await response.json();
                addMessage('搜索结果:', 'info');
                addMessage(JSON.stringify(result, null, 2), 'success');
            } catch (error) {
                addMessage('搜索失败: ' + error.message, 'error');
            }
        }

        function addMessage(message, type) {
            const div = document.createElement('div');
            div.className = 'message ' + type;
            div.innerHTML = '<strong>' + new Date().toLocaleTimeString() + ':</strong><br><pre>' + message + '</pre>';
            messagesDiv.appendChild(div);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }

        function clearMessages() {
            messagesDiv.innerHTML = '';
        }

        // 自动连接
        connectSSE();
    </script>
</body>
</html>
    `;
  }

  /**
   * 获取服务器实例
   */
  public getServer(): Server {
    return this.server;
  }
}