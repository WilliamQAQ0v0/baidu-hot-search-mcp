# 热门内容 MCP 服务器

🔥 为 Claude 和 Cherry Studio 提供多平台热门内容数据的 Model Context Protocol (MCP) 服务器。

**支持平台：**
- 🔥 百度热搜榜
- 📺 B站热门视频

## 开发日志
后续可能会支持更多平台

## ⚡ 快速开始

**⚠️ 重要：请先设置环境变量或创建配置文件再运行命令！**

### 第一步：设置环境变量（推荐）

**获取 API 凭据**：请访问 [API盒子](https://www.apihz.cn/?shareid=10004969) 获取您的 API ID 和密钥。

**方法1：设置环境变量（最简单）**

```bash
# Linux/Mac
export HOT_CONTENT_API_ID="your_actual_api_id"
export HOT_CONTENT_API_KEY="your_actual_api_key"

# Windows
set HOT_CONTENT_API_ID=your_actual_api_id
set HOT_CONTENT_API_KEY=your_actual_api_key
```

使用cherry studio时，在环境变量内配置也可运行
```
HOT_CONTENT_API_ID=your_actual_api_id
HOT_CONTENT_API_KEY=your_actual_api_key
```

**方法2：创建配置文件（传统方式）**

如果不使用环境变量，可以创建 `config.json` 文件：

```json
{
  "api": {
    "id": "your_actual_api_id", 
    "key": "your_actual_api_key"
  }
}
```



### 第二步：运行服务

环境变量或配置文件设置完成后，即可运行：

```bash
# 直接运行（无需安装）
npx hot-content-mcp@2.4.0

# 启动SSE模式用于Web应用
npx hot-content-mcp@2.4.0 sse 3000

# 使用自定义配置文件位置
npx hot-content-mcp@2.4.0 --config /path/to/config.json
```

### 本地开发

```bash
# 确保已设置环境变量或创建 config.json 文件后再运行
npm install && npm run build && npm run start
```

## 🎯 功能特性

### 百度热搜工具

- **get_baidu_hot_search** - 获取百度热搜榜数据（支持count参数，默认10条，最大50条）
- **search_baidu_hot_search** - 搜索包含特定关键词的百度热搜
- **clear_baidu_cache** - 清除百度热搜数据缓存

### B站热门视频工具

- **get_bilibili_hot** - 获取B站热门视频数据（支持count参数，默认10条，最大50条）
- **search_bilibili_videos** - 搜索B站视频（根据标题或UP主名称）
- **clear_bilibili_cache** - 清除B站视频数据缓存

### MCP 资源  

- **baidu://hot-search/current** - 当前完整热搜榜数据
- **baidu://hot-search/top5** - TOP5热搜数据
- **bilibili://videos/current** - 当前B站热门视频数据
- **bilibili://videos/top5** - TOP5 B站热门视频

## 📖 配置方式

### Cherry Studio

**配置文件位置**: Cherry Studio 设置 → MCP服务器

**方式1：环境变量配置（推荐）**

1. 设置系统环境变量：
   - `HOT_CONTENT_API_ID` = your_actual_api_id
   - `HOT_CONTENT_API_KEY` = your_actual_api_key

2. Cherry Studio MCP配置：
```json
{
  "mcpServers": {
    "hot-content": {
      "command": "npx",
      "args": ["hot-content-mcp@2.4.0"]
    }
  }
}
```

**方式2：配置文件**

1. 首先创建配置文件 `config.json`：
   ```json
   {
     "api": {
       "id": "your_actual_api_id",
       "key": "your_actual_api_key"
     }
   }
   ```

2. 将配置文件保存到以下任一位置：
   - **用户目录** (推荐): `C:\Users\用户名\config.json` (Windows) 或 `~/config.json` (Mac/Linux)
   - **应用数据目录**: `%APPDATA%\hot-content-mcp\config.json` (Windows) 或 `~/.config/hot-content-mcp/config.json` (Mac/Linux)

3. Cherry Studio MCP配置：
```json
{
  "mcpServers": {
    "hot-content": {
      "command": "npx",
      "args": ["hot-content-mcp@2.4.0"]
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
   - **参数**: `hot-content-mcp@2.4.0` （**建议指定版本号确保使用最新版**）
5. 保存并重启

**版本更新说明**：
- 如果遇到版本显示不正确，请在配置中指定版本号：`hot-content-mcp@2.4.0`
- 或者清除npx缓存：`npx clear-npx-cache` 或 `npm cache clean --force`

**高级选项**：如需自定义配置文件位置，可以使用：
```json
{
  "mcpServers": {
    "hot-content": {
      "command": "npx", 
      "args": ["hot-content-mcp@2.4.0", "--config", "/path/to/your/config.json"]
    }
  }
}
```

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

**从 v2.3.1 开始，支持环境变量配置，无需创建配置文件！**

### 配置优先级

1. **环境变量**（推荐） - 更安全、更方便
2. **配置文件** - 传统方式

### 方式1：环境变量配置（推荐）

设置以下环境变量即可直接使用，无需创建配置文件：

```bash
# 设置环境变量
export HOT_CONTENT_API_ID="your_actual_api_id"
export HOT_CONTENT_API_KEY="your_actual_api_key"

# 直接运行
npx hot-content-mcp@2.4.0
```

**Windows 用户：**
```cmd
set HOT_CONTENT_API_ID=your_actual_api_id
set HOT_CONTENT_API_KEY=your_actual_api_key
npx hot-content-mcp@2.4.0
```

### 方式2：配置文件

如果未设置环境变量，系统会自动查找配置文件：

**当前配置格式（推荐）**

```json
{
  "api": {
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
