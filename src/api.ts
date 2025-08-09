import axios, { AxiosResponse } from 'axios';
import { ConfigManager, BaiduApiConfig } from './config.js';

// 百度热搜榜条目接口
export interface BaiduHotSearchItem {
  appUrl: string;
  desc: string;
  hotChange: string;
  hotScore: string;
  hotTag: string;
  hotTagImg: string;
  img: string;
  index: number;
  indexUrl: string;
  query: string;
  rawUrl: string;
  show: any[];
  url: string;
  word: string;
}

// API响应接口
export interface BaiduApiResponse {
  code: number;
  time: number;
  time2: string;
  data: BaiduHotSearchItem[];
}

// 简化的热搜条目，用于MCP返回
export interface SimplifiedHotSearchItem {
  rank: number;
  title: string;
  hotScore: string;
  trend: string;
  url: string;
  description?: string;
}

export class BaiduHotSearchService {
  private configManager: ConfigManager;
  private baseUrl = 'https://cn.apihz.cn/api/xinwen/baidu.php';
  private lastFetchTime: number = 0;
  private cacheData: SimplifiedHotSearchItem[] | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

  constructor(configManager?: ConfigManager) {
    this.configManager = configManager || new ConfigManager();
  }

  /**
   * 获取百度热搜榜数据
   */
  public async getHotSearchData(useCache: boolean = true): Promise<SimplifiedHotSearchItem[]> {
    // 检查缓存
    if (useCache && this.isCacheValid()) {
      console.log('📋 使用缓存数据');
      return this.cacheData!;
    }

    try {
      console.log('🌐 开始获取百度热搜榜数据...');
      
      // 获取API配置
      const apiConfig = this.configManager.getBaiduConfig();
      
      // 构建请求URL
      const url = this.buildApiUrl(apiConfig);
      
      // 发送请求
      const response = await this.makeApiRequest(url);
      
      // 验证响应
      this.validateResponse(response.data);
      
      // 转换数据格式
      const simplifiedData = this.transformData(response.data);
      
      // 更新缓存
      this.updateCache(simplifiedData);
      
      console.log(`✅ 成功获取 ${simplifiedData.length} 条热搜数据`);
      return simplifiedData;
      
    } catch (error) {
      console.error('❌ 获取热搜数据失败:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 构建API请求URL
   */
  private buildApiUrl(config: BaiduApiConfig): string {
    const params = new URLSearchParams({
      id: config.id,
      key: config.key
    });
    
    return `${this.baseUrl}?${params.toString()}`;
  }

  /**
   * 发送API请求
   */
  private async makeApiRequest(url: string): Promise<AxiosResponse<BaiduApiResponse>> {
    const response = await axios.get<BaiduApiResponse>(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    return response;
  }

  /**
   * 验证API响应
   */
  private validateResponse(response: BaiduApiResponse): void {
    if (!response) {
      throw new Error('API响应为空');
    }
    
    if (response.code !== 200) {
      throw new Error(`API返回错误状态码: ${response.code}`);
    }
    
    if (!response.data || !Array.isArray(response.data)) {
      throw new Error('API响应数据格式错误：data字段无效');
    }
    
    if (response.data.length === 0) {
      throw new Error('API返回的热搜数据为空');
    }
  }

  /**
   * 转换数据格式为简化版本
   */
  private transformData(response: BaiduApiResponse): SimplifiedHotSearchItem[] {
    return response.data.map((item, index) => ({
      rank: item.index + 1, // 排名从1开始
      title: item.word || item.query || '未知标题',
      hotScore: item.hotScore || '0',
      trend: this.getTrendText(item.hotChange),
      url: item.url || item.rawUrl || '',
      description: item.desc || undefined
    })).sort((a, b) => a.rank - b.rank); // 确保按排名排序
  }

  /**
   * 获取趋势文本描述
   */
  private getTrendText(hotChange: string): string {
    const trendMap: { [key: string]: string } = {
      'up': '↗️ 上升',
      'down': '↘️ 下降', 
      'same': '➡️ 持平',
      'new': '🆕 新上榜',
      'hot': '🔥 热门'
    };
    
    return trendMap[hotChange] || '➡️ 无变化';
  }

  /**
   * 检查缓存是否有效
   */
  private isCacheValid(): boolean {
    return this.cacheData !== null && 
           (Date.now() - this.lastFetchTime) < this.CACHE_DURATION;
  }

  /**
   * 更新缓存
   */
  private updateCache(data: SimplifiedHotSearchItem[]): void {
    this.cacheData = data;
    this.lastFetchTime = Date.now();
  }

  /**
   * 错误处理
   */
  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        return new Error(`API请求失败: ${error.response.status} - ${error.response.statusText}`);
      } else if (error.request) {
        return new Error('网络请求超时或无响应');
      }
    }
    
    if (error instanceof Error) {
      return error;
    }
    
    return new Error('未知错误');
  }


  /**
   * 搜索特定关键词的热搜
   */
  public async searchHotSearch(keyword: string): Promise<SimplifiedHotSearchItem[]> {
    const allData = await this.getHotSearchData();
    return allData.filter(item => 
      item.title.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  /**
   * 清除缓存
   */
  public clearCache(): void {
    this.cacheData = null;
    this.lastFetchTime = 0;
    console.log('🗑️ 缓存已清除');
  }
}