import axios, { AxiosResponse } from 'axios';
import { ConfigManager, ApiConfig } from './config.js';

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

// B站视频数据接口
export interface BilibiliVideoItem {
  title: string;
  desc: string;
  pic: string;
  firstframe: string;
  url: string;
  publocation: string;
  aid: number;
  bvid: string;
  mid: number;
  name: string;
  face: string;
  view: number;
  vv: number;
  danmaku: number;
  reply: number;
  favorite: number;
  coin: number;
  share: number;
  like: number;
}

// 百度API响应接口
export interface BaiduApiResponse {
  code: number;
  time: number;
  time2: string;
  data: BaiduHotSearchItem[];
}

// B站API响应接口
export interface BilibiliApiResponse {
  code: number;
  time: number;
  time2: string;
  data: BilibiliVideoItem[];
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

// 简化的B站视频数据，用于MCP返回
export interface SimplifiedBilibiliItem {
  rank: number;
  title: string;
  author: string;
  views: number;
  likes: number;
  coins: number;
  url: string;
  bvid: string;
  description?: string;
  publishLocation?: string;
  stats: {
    danmaku: number;
    reply: number;
    favorite: number;
    share: number;
  };
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
  private buildApiUrl(config: ApiConfig): string {
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
   * 获取特定排名范围的热搜
   */
  public async getTopHotSearch(count: number = 10): Promise<SimplifiedHotSearchItem[]> {
    const allData = await this.getHotSearchData();
    return allData.slice(0, Math.min(count, allData.length));
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

export class BilibiliHotSearchService {
  private configManager: ConfigManager;
  private baseUrl = 'https://cn.apihz.cn/api/bang/bilibili1.php';
  private lastFetchTime: number = 0;
  private cacheData: SimplifiedBilibiliItem[] | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000;

  constructor(configManager?: ConfigManager) {
    this.configManager = configManager || new ConfigManager();
  }

  public async getBilibiliHotData(useCache: boolean = true): Promise<SimplifiedBilibiliItem[]> {
    if (useCache && this.isCacheValid()) {
      console.log('📋 使用B站缓存数据');
      return this.cacheData!;
    }

    if (!this.configManager.hasBilibiliConfig()) {
      throw new Error('未配置API，请检查config.json配置文件');
    }

    try {
      console.log('🌐 开始获取B站热门视频数据...');
      
      const apiConfig = this.configManager.getApiConfig();
      const url = this.buildApiUrl(apiConfig);
      const response = await this.makeApiRequest(url);
      
      this.validateResponse(response.data);
      const simplifiedData = this.transformData(response.data);
      this.updateCache(simplifiedData);
      
      console.log(`✅ 成功获取 ${simplifiedData.length} 条B站视频数据`);
      return simplifiedData;
      
    } catch (error) {
      console.error('❌ 获取B站数据失败:', error);
      throw this.handleError(error);
    }
  }

  private buildApiUrl(config: ApiConfig): string {
    const params = new URLSearchParams({
      id: config.id,
      key: config.key
    });
    
    return `${this.baseUrl}?${params.toString()}`;
  }

  private async makeApiRequest(url: string): Promise<AxiosResponse<BilibiliApiResponse>> {
    const response = await axios.get<BilibiliApiResponse>(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    return response;
  }

  private validateResponse(response: BilibiliApiResponse): void {
    if (!response) {
      throw new Error('B站API响应为空');
    }
    
    if (response.code !== 200) {
      throw new Error(`B站API返回错误状态码: ${response.code}`);
    }
    
    if (!response.data || !Array.isArray(response.data)) {
      throw new Error('B站API响应数据格式错误：data字段无效');
    }
    
    if (response.data.length === 0) {
      throw new Error('B站API返回的视频数据为空');
    }
  }

  private transformData(response: BilibiliApiResponse): SimplifiedBilibiliItem[] {
    return response.data.map((item, index) => ({
      rank: index + 1,
      title: item.title || '未知标题',
      author: item.name || '未知UP主',
      views: item.view || item.vv || 0,
      likes: item.like || 0,
      coins: item.coin || 0,
      url: item.url || '',
      bvid: item.bvid || '',
      description: item.desc || undefined,
      publishLocation: item.publocation || undefined,
      stats: {
        danmaku: item.danmaku || 0,
        reply: item.reply || 0,
        favorite: item.favorite || 0,
        share: item.share || 0
      }
    })).sort((a, b) => a.rank - b.rank);
  }

  private isCacheValid(): boolean {
    return this.cacheData !== null && 
           (Date.now() - this.lastFetchTime) < this.CACHE_DURATION;
  }

  private updateCache(data: SimplifiedBilibiliItem[]): void {
    this.cacheData = data;
    this.lastFetchTime = Date.now();
  }

  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        return new Error(`B站API请求失败: ${error.response.status} - ${error.response.statusText}`);
      } else if (error.request) {
        return new Error('B站API网络请求超时或无响应');
      }
    }
    
    if (error instanceof Error) {
      return error;
    }
    
    return new Error('B站API未知错误');
  }

  public async getTopBilibiliVideos(count: number = 10): Promise<SimplifiedBilibiliItem[]> {
    const allData = await this.getBilibiliHotData();
    return allData.slice(0, Math.min(count, allData.length));
  }

  public async searchBilibiliVideos(keyword: string): Promise<SimplifiedBilibiliItem[]> {
    const allData = await this.getBilibiliHotData();
    return allData.filter(item => 
      item.title.toLowerCase().includes(keyword.toLowerCase()) ||
      item.author.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  public clearCache(): void {
    this.cacheData = null;
    this.lastFetchTime = 0;
    console.log('🗑️ B站缓存已清除');
  }
}