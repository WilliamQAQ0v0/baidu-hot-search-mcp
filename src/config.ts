import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface ApiConfig {
  id: string;
  key: string;
}

export interface Config {
  api: ApiConfig;
}

export class ConfigManager {
  private config: Config | null = null;
  private configPath: string;

  constructor(configPath?: string) {
    this.configPath = configPath || join(process.cwd(), 'config.json');
  }

  /**
   * 加载配置文件
   */
  public loadConfig(): Config {
    try {
      // 优先级：环境变量 > 配置文件
      
      // 1. 尝试从环境变量加载
      const envConfig = this.loadConfigFromEnv();
      if (envConfig) {
        this.validateConfig(envConfig);
        this.config = envConfig as Config;
        console.log('📂 使用环境变量配置');
        return this.config;
      }

      // 2. 尝试从配置文件加载
      if (!existsSync(this.configPath)) {
        throw new Error(`配置文件不存在且未设置环境变量: ${this.configPath}`);
      }

      const configContent = readFileSync(this.configPath, 'utf8');
      const parsedConfig = JSON.parse(configContent);

      // 验证配置结构
      this.validateConfig(parsedConfig);
      
      this.config = parsedConfig as Config;
      console.log(`📂 使用配置文件: ${this.configPath}`);
      return this.config;
    } catch (error) {
      throw new Error(`加载配置失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 从环境变量加载配置
   */
  private loadConfigFromEnv(): Config | null {
    const apiId = process.env.HOT_CONTENT_API_ID || process.env.BAIDU_API_ID; // 兼容旧的环境变量名
    const apiKey = process.env.HOT_CONTENT_API_KEY || process.env.BAIDU_API_KEY; // 兼容旧的环境变量名

    if (!apiId || !apiKey) {
      return null;
    }

    return {
      api: {
        id: apiId.trim(),
        key: apiKey.trim()
      }
    };
  }

  /**
   * 验证配置文件格式
   */
  private validateConfig(config: any): void {
    if (!config || typeof config !== 'object') {
      throw new Error('配置文件格式错误：根对象无效');
    }

    // 兼容旧格式的百度API配置
    if (config.baidu_api && !config.api) {
      config.api = config.baidu_api;
      console.log('🔄 自动将baidu_api配置转换为通用api配置');
    }

    if (!config.api || typeof config.api !== 'object') {
      throw new Error('配置文件格式错误：缺少 api 配置块');
    }

    this.validateApiConfig(config.api, 'api');
  }

  private validateApiConfig(apiConfig: any, apiName: string): void {
    if (!apiConfig.id || typeof apiConfig.id !== 'string' || apiConfig.id.trim() === '') {
      throw new Error(`配置文件格式错误：${apiName}.id 必须是非空字符串`);
    }

    if (!apiConfig.key || typeof apiConfig.key !== 'string' || apiConfig.key.trim() === '') {
      throw new Error(`配置文件格式错误：${apiName}.key 必须是非空字符串`);
    }

    const trimmedId = apiConfig.id.trim();
    const trimmedKey = apiConfig.key.trim();

    if (trimmedId === 'your_user_id' || trimmedId === 'your-user-id' || trimmedId === 'example_id') {
      throw new Error(`请在 config.json 中设置你的实际 ${apiName} 用户ID，当前值看起来是示例值`);
    }

    if (trimmedKey === 'your_api_key' || trimmedKey === 'your-api-key' || trimmedKey === 'example_key') {
      throw new Error(`请在 config.json 中设置你的实际 ${apiName} 密钥，当前值看起来是示例值`);
    }

    if (trimmedId.length < 3) {
      throw new Error(`${apiName} 用户ID 长度不能少于3个字符`);
    }

    if (trimmedKey.length < 8) {
      throw new Error(`${apiName} 密钥长度不能少于8个字符`);
    }

    console.log(`✅ ${apiName} 配置验证通过 - ID: ${trimmedId.substring(0, 3)}***, Key: ${trimmedKey.substring(0, 4)}***`);
  }

  /**
   * 获取API配置
   */
  public getApiConfig(): ApiConfig {
    if (!this.config) {
      this.loadConfig();
    }
    return this.config!.api;
  }

  /**
   * 获取百度API配置 (兼容性方法)
   */
  public getBaiduConfig(): ApiConfig {
    return this.getApiConfig();
  }

  /**
   * 获取B站API配置 (兼容性方法)
   */
  public getBilibiliConfig(): ApiConfig {
    return this.getApiConfig();
  }

  /**
   * 检查是否配置了B站API (兼容性方法)
   */
  public hasBilibiliConfig(): boolean {
    return true; // 现在统一使用一个配置
  }

  /**
   * 获取完整配置
   */
  public getConfig(): Config {
    if (!this.config) {
      this.loadConfig();
    }
    return this.config!;
  }

  /**
   * 重新加载配置
   */
  public reloadConfig(): Config {
    this.config = null;
    return this.loadConfig();
  }
}