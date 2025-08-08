# 百度热搜榜 MCP 服务器

🔥 为 Claude 和 Cherry Studio 提供百度热搜榜数据的 Model Context Protocol (MCP) 服务器。

## ⚡ 快速开始

**⚠️ 重要：请先创建配置文件再运行命令！**

### 第一步：创建配置文件

在运行任何命令之前，必须先创建 `config.json` 文件：

```json
{
  "baidu_api": {
    "id": "your_actual_api_id", 
    "key": "your_actual_api_key"
  }
}
```

**注意**：请替换为您的真实 API 凭据，不能使用示例值。

### 第二步：运行服务

配置文件创建完成后，即可运行：

```bash
# 直接运行（无需安装）
npx baidu-hot-search-mcp

# 启动SSE模式用于Web应用
npx baidu-hot-search-mcp sse 3000

# 使用自定义配置文件位置
npx baidu-hot-search-mcp --config /path/to/config.json

# 备用方式：从GitHub运行
npx https://github.com/WilliamQAQ0v0/baidu-hot-search-mcp
```

### 本地开发

```bash
# 确保已创建 config.json 文件后再运行
npm install && npm run build && npm run start
```

## 🎯 功能特性

### MCP 工具

- **get_hot_search** - 获取百度热搜榜数据
- **search_hot_search** - 搜索包含特定关键词的热搜
- **get_top_hot_search** - 获取排名前N的热搜
- **clear_cache** - 清除热搜数据缓存

### MCP 资源  

- **baidu://hot-search/current** - 当前完整热搜榜数据
- **baidu://hot-search/top5** - TOP5热搜数据

## 📖 配置方式

### Cherry Studio

**配置文件位置**: Cherry Studio 设置 → MCP服务器

**推荐配置**:

```json
{
  "mcpServers": {
    "baidu-hot-search": {
      "command": "npx",
      "args": ["baidu-hot-search-mcp"]
    }
  }
}
```

**配置步骤**:

1. 打开 Cherry Studio 设置
2. 找到 **MCP 服务器** 选项  
3. 点击 **添加服务器**
4. 填写：
   - **名称**: `baidu-hot-search`
   - **命令**: `npx`
   - **参数**: `baidu-hot-search-mcp`
5. 保存并重启

### Claude Desktop

**配置文件位置**: `~/.claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "baidu-hot-search": {
      "command": "npx",
      "args": ["baidu-hot-search-mcp"]
    }
  }
}
```

## 🔧 配置说明

**从 v1.1.0 开始，API 配置是必需的。**

### 配置文件格式

```json
{
  "baidu_api": {
    "id": "your_actual_api_id", 
    "key": "your_actual_api_key"
  }
}
```

### 配置文件位置

- **默认位置**: 运行命令的目录下的 `config.json`
- **自定义位置**: 使用 `--config` 参数指定路径

### ⚠️ 配置验证要求

- ✅ 配置文件必须存在
- ✅ API ID 和 Key 不能为空或纯空格
- ✅ 不能使用示例值（如 `your_api_id`、`your_actual_api_id` 等）
- ��� ID 至少 3 个字符，Key 至少 8 个字符

**如果配置不符合要求，服务器将拒绝启动并显示详细的错误信息。**

## 🤖 AI 使用示例

### 基础调用

```
请获取当前百度热搜榜前10条内容，并分析热点话题类型。
```

### 高级分析

```
作为热点趋势分析师，请：
1. 获取当前百度热搜榜数据
2. 分析热搜内容的主要类别（娱乐、科技、社会等）
3. 提供简要趋势分析报告
```

## 📋 项目结构

```
baidu-hot-search-mcp/
├── src/
│   ├── cli.ts           # CLI入口文件
│   ├── index.ts         # 主入口文件
│   ├── mcp-server.ts    # MCP服务器实现
│   ├── api.ts           # 百度API服务
│   └── config.ts        # 配置管理
├── dist/                # 编译输出
├── mcp-config.json      # MCP配置示例
└── package.json         # 项目配置
```

## 🔗 相关链接

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Cherry Studio](https://github.com/kangfenmao/cherry-studio)
- [Claude Desktop](https://claude.ai/desktop)

## 📄 许可证

MIT License