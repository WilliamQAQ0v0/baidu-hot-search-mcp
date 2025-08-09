# 热门内容 MCP 服务器

🔥 为 Claude 和 Cherry Studio 提供多平台热门内容数据的 Model Context Protocol (MCP) 服务器。

**支持平台：**
- 🔥 百度热搜榜
- 📺 B站热门视频

## ⚡ 快速开始

**⚠️ 重要：请先创建配置文件再运行命令！**

### 第一步：创建配置文件

在运行任何命令之前，必须先创建 `config.json` 文件：

```json
{
  "api": {
    "id": "your_actual_api_id", 
    "key": "your_actual_api_key"
  }
}
```

**注意**：请替换为您的真实 API 凭据，不能使用示例值。

**获取 API 凭据**：请访问 [API盒子](https://www.apihz.cn/?shareid=10004969) 获取您的 API ID 和密钥。

### 第二步：运行服务

配置文件创建完成后，即可运行：

```bash
# 直接运行（无需安装）
npx hot-content-mcp

# 启动SSE模式用于Web应用
npx hot-content-mcp sse 3000

# 使用自定义配置文件位置
npx hot-content-mcp --config /path/to/config.json

# 备用方式：从GitHub运行
npx https://github.com/WilliamQAQ0v0/hot-content-mcp
```

### 本地开发

```bash
# 确保已创建 config.json 文件后再运行
npm install && npm run build && npm run start
```

## 🎯 功能特性

### 百度热搜工具

- **get_hot_search** - 获取百度热搜榜数据
- **search_hot_search** - 搜索包含特定关键词的热搜
- **get_top_hot_search** - 获取排名前N的热搜
- **clear_cache** - 清除百度热搜数据缓存

### B站热门视频工具

- **get_bilibili_hot** - 获取B站热门视频数据
- **search_bilibili_videos** - 搜索B站视频（根据标题或UP主名称）
- **get_top_bilibili_videos** - 获取排名前N的B站热门视频
- **clear_bilibili_cache** - 清除B站视频数据缓存

### MCP 资源  

- **baidu://hot-search/current** - 当前完整热搜榜数据
- **baidu://hot-search/top5** - TOP5热搜数据
- **bilibili://videos/current** - 当前B站热门视频数据
- **bilibili://videos/top5** - TOP5 B站热门视频

## 📖 配置方式

### Cherry Studio

**配置文件位置**: Cherry Studio 设置 → MCP服务器

**推荐配置**:

```json
{
  "mcpServers": {
    "hot-content": {
      "command": "npx",
      "args": ["hot-content-mcp"]
    }
  }
}
```

**配置步骤**:

1. 打开 Cherry Studio 设置
2. 找到 **MCP 服务器** 选项  
3. 点击 **添加服务器**
4. 填写：
   - **名称**: `hot-content`
   - **命令**: `npx`
   - **参数**: `hot-content-mcp`
5. 保存并重启

### Claude Desktop

**配置文件位置**: `~/.claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "hot-content": {
      "command": "npx",
      "args": ["hot-content-mcp"]
    }
  }
}
```

## 🔧 配置说明

**从 v2.0.0 开始，使用统一的 API 配置格式。**

### 当前配置格式（推荐）

```json
{
  "api": {
    "id": "your_actual_api_id", 
    "key": "your_actual_api_key"
  }
}
```

### 兼容的旧格式

```json
{
  "baidu_api": {
    "id": "your_actual_api_id", 
    "key": "your_actual_api_key"
  }
}
```

**注意**：旧格式会自动转换为新格式，建议更新到新格式。

### 配置文件位置

- **默认位置**: 运行命令的目录下的 `config.json`
- **自定义位置**: 使用 `--config` 参数指定路径

### ⚠️ 配置验证要求

- ✅ 配置文件必须存在
- ✅ API ID 和 Key 不能为空或纯空格
- ✅ 不能使用示例值（如 `your_api_id`、`your_actual_api_id` 等）

**如果配置不符合要求，服务器将拒绝启动并显示详细的错误信息。**

## 🤖 AI 使用示例

### 百度热搜分析

```
请获取当前百度热搜榜前10条内容，并分析热点话题类型。
```

### B站内容趋势

```
获取B站当前热门视频TOP5，分析内容类型和创作者特征。
```

### 综合热点分析

```
作为内容趋势分析师，请：
1. 获取百度热搜榜TOP5
2. 获取B站热门视频TOP5  
3. 对比分析两个平台的热点内容差异
4. 提供平台特色分析报告
```

### 关键词搜索

```
搜索关键词"游戏"在百度热搜和B站热门视频中的相关内容。
```

## 📋 项目结构

```
hot-content-mcp/
├── src/
│   ├── cli.ts           # CLI入口文件
│   ├── index.ts         # 主入口文件
│   ├── mcp-server.ts    # MCP服务器实现
│   ├── api.ts           # API服务（百度+B站）
│   └── config.ts        # 统一配置管理
├── dist/                # 编译输出
├── mcp-config.json      # MCP配置示例
├── bilibili_api_doc.md  # B站API技术文档
└── package.json         # 项目配置
```

## 🔗 相关链接

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Cherry Studio](https://github.com/kangfenmao/cherry-studio)
- [Claude Desktop](https://claude.ai/desktop)
- [API盒子 - 数据源](https://www.apihz.cn/)

## 📄 许可证

MIT License

## ⚠️ 免责声明

本项目使用第三方 API 服务（[API Hub](https://www.apihz.cn/)）获取热门内容数据，仅供学习和研究使用。使用本项目时请注意：

1. **API 服务**：本项目依赖第三方 API 服务，我们不对其可用性、稳定性或准确性承担责任。
2. **数据来源**：热门内容数据来源于各平台（百度、B站），本项目不对数据内容的真实性、完整性或时效性负责。
3. **使用风险**：用户自行承担使用本项目的风险，包括但不限于数据丢失、服务中断等。
4. **商业使用**：如需商业使用，请自行评估风险并遵守相关法律法规。
5. **API 费用**：第三方 API 可能产生费用，请用户自行了解并承担相关成本。

**本项目按"现状"提供，不提供任何明示或暗示的保证。**
