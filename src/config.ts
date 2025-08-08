import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface BaiduApiConfig {
  id: string;
  key: string;
}

export interface Config {
  baidu_api: BaiduApiConfig;
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
      if (!existsSync(this.configPath)) {
        throw new Error(`配置文件不存在: ${this.configPath}`);
      }

      const configContent = readFileSync(this.configPath, 'utf8');
      const parsedConfig = JSON.parse(configContent);

      // 验证配置结构
      this.validateConfig(parsedConfig);
      
      this.config = parsedConfig as Config;
      return this.config;
    } catch (error) {
      throw new Error(`加载配置文件失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 验证配置文件格式
   */
  private validateConfig(config: any): void {
    if (!config || typeof config !== 'object') {
      throw new Error('配置文件格式错误：根对象无效');
    }

    if (!config.baidu_api || typeof config.baidu_api !== 'object') {
      throw new Error('配置文件格式错误：缺少 baidu_api 配置块');
    }

    if (!config.baidu_api.id || typeof config.baidu_api.id !== 'string' || config.baidu_api.id.trim() === '') {
      throw new Error('配置文件格式错误：baidu_api.id 必须是非空字符串');
    }

    if (!config.baidu_api.key || typeof config.baidu_api.key !== 'string' || config.baidu_api.key.trim() === '') {
      throw new Error('配置文件格式错误：baidu_api.key 必须是非空字符串');
    }

    // 检查是否为默认值或示例值
    const trimmedId = config.baidu_api.id.trim();
    const trimmedKey = config.baidu_api.key.trim();

    if (trimmedId === 'your_user_id' || trimmedId === 'your-user-id' || trimmedId === 'example_id') {
      throw new Error('请在 config.json 中设置你的实际 API 用户ID，当前值看起来是示例值');
    }

    if (trimmedKey === 'your_api_key' || trimmedKey === 'your-api-key' || trimmedKey === 'example_key') {
      throw new Error('请在 config.json 中设置你的实际 API 密钥，当前值看起来是示例值');
    }

    // 检查ID和Key的基本格式
    if (trimmedId.length < 3) {
      throw new Error('API 用户ID 长度不能少于3个字符');
    }

    if (trimmedKey.length < 8) {
      throw new Error('API 密钥长度不能少于8个字符');
    }

    console.log(`✅ 配置验证通过 - ID: ${trimmedId.substring(0, 3)}***, Key: ${trimmedKey.substring(0, 4)}***`);
  }

  /**
   * 获取百度API配置
   */
  public getBaiduConfig(): BaiduApiConfig {
    if (!this.config) {
      this.loadConfig();
    }
    return this.config!.baidu_api;
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