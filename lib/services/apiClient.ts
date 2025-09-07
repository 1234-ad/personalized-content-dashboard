// Enhanced API Client with caching, retry logic, and better error handling

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
  cached?: boolean;
}

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
}

class ApiCache {
  private cache = new Map<string, CacheEntry<any>>();
  
  set<T>(key: string, data: T, ttl: number = 300000): void { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }
  
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  delete(key: string): void {
    this.cache.delete(key);
  }
}

export class EnhancedApiClient {
  private static instance: EnhancedApiClient;
  private cache = new ApiCache();
  private defaultRetryConfig: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
  };
  
  private constructor() {}
  
  public static getInstance(): EnhancedApiClient {
    if (!EnhancedApiClient.instance) {
      EnhancedApiClient.instance = new EnhancedApiClient();
    }
    return EnhancedApiClient.instance;
  }
  
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  private calculateBackoffDelay(attempt: number, config: RetryConfig): number {
    const delay = config.baseDelay * Math.pow(2, attempt);
    return Math.min(delay, config.maxDelay);
  }
  
  private async fetchWithRetry(
    url: string,
    options: RequestInit = {},
    retryConfig: Partial<RetryConfig> = {}
  ): Promise<Response> {
    const config = { ...this.defaultRetryConfig, ...retryConfig };
    let lastError: Error;
    
    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });
        
        if (response.ok) {
          return response;
        }
        
        // Don't retry on client errors (4xx)
        if (response.status >= 400 && response.status < 500) {
          throw new Error(`Client error: ${response.status} ${response.statusText}`);
        }
        
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < config.maxRetries) {
          const delay = this.calculateBackoffDelay(attempt, config);
          console.warn(`API request failed (attempt ${attempt + 1}/${config.maxRetries + 1}), retrying in ${delay}ms:`, error);
          await this.delay(delay);
        }
      }
    }
    
    throw lastError!;
  }
  
  async get<T>(
    url: string,
    options: RequestInit = {},
    cacheKey?: string,
    cacheTtl?: number
  ): Promise<ApiResponse<T>> {
    try {
      // Check cache first
      if (cacheKey) {
        const cachedData = this.cache.get<T>(cacheKey);
        if (cachedData) {
          return {
            data: cachedData,
            success: true,
            cached: true,
          };
        }
      }
      
      const response = await this.fetchWithRetry(url, {
        ...options,
        method: 'GET',
      });
      
      const data = await response.json();
      
      // Cache the response
      if (cacheKey) {
        this.cache.set(cacheKey, data, cacheTtl);
      }
      
      return {
        data,
        success: true,
        cached: false,
      };
    } catch (error) {
      console.error('API GET request failed:', error);
      return {
        data: null as T,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
  
  async post<T>(
    url: string,
    body: any,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.fetchWithRetry(url, {
        ...options,
        method: 'POST',
        body: JSON.stringify(body),
      });
      
      const data = await response.json();
      
      return {
        data,
        success: true,
      };
    } catch (error) {
      console.error('API POST request failed:', error);
      return {
        data: null as T,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
  
  clearCache(): void {
    this.cache.clear();
  }
  
  deleteCacheEntry(key: string): void {
    this.cache.delete(key);
  }
}

// News API Service
export class NewsApiService {
  private apiClient = EnhancedApiClient.getInstance();
  private baseUrl = 'https://newsapi.org/v2';
  
  private getApiKey(): string {
    const apiKey = process.env.NEXT_PUBLIC_NEWS_API_KEY;
    if (!apiKey) {
      throw new Error('News API key is not configured. Please add NEXT_PUBLIC_NEWS_API_KEY to your environment variables.');
    }
    return apiKey;
  }
  
  async getTopHeadlines(
    categories: string[] = ['general'],
    country: string = 'us',
    pageSize: number = 20
  ): Promise<ApiResponse<any[]>> {
    const category = categories.join(',');
    const cacheKey = `news-headlines-${category}-${country}-${pageSize}`;
    
    const url = `${this.baseUrl}/top-headlines?category=${category}&country=${country}&pageSize=${pageSize}&apiKey=${this.getApiKey()}`;
    
    const response = await this.apiClient.get<any>(url, {}, cacheKey, 300000); // 5 minutes cache
    
    if (response.success && response.data) {
      const articles = response.data.articles || [];
      return {
        ...response,
        data: articles.map((article: any, index: number) => ({
          ...article,
          id: `news-${Date.now()}-${index}`,
          type: 'news',
          category,
        })),
      };
    }
    
    return response;
  }
  
  async searchNews(
    query: string,
    sortBy: string = 'publishedAt',
    pageSize: number = 20
  ): Promise<ApiResponse<any[]>> {
    const cacheKey = `news-search-${query}-${sortBy}-${pageSize}`;
    
    const url = `${this.baseUrl}/everything?q=${encodeURIComponent(query)}&sortBy=${sortBy}&pageSize=${pageSize}&apiKey=${this.getApiKey()}`;
    
    const response = await this.apiClient.get<any>(url, {}, cacheKey, 180000); // 3 minutes cache
    
    if (response.success && response.data) {
      const articles = response.data.articles || [];
      return {
        ...response,
        data: articles.map((article: any, index: number) => ({
          ...article,
          id: `news-search-${Date.now()}-${index}`,
          type: 'news',
          query,
        })),
      };
    }
    
    return response;
  }
}

// TMDB API Service
export class TmdbApiService {
  private apiClient = EnhancedApiClient.getInstance();
  private baseUrl = 'https://api.themoviedb.org/3';
  
  private getApiKey(): string {
    const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
    if (!apiKey) {
      throw new Error('TMDB API key is not configured. Please add NEXT_PUBLIC_TMDB_API_KEY to your environment variables.');
    }
    return apiKey;
  }
  
  async getPopularMovies(page: number = 1): Promise<ApiResponse<any[]>> {
    const cacheKey = `tmdb-popular-${page}`;
    
    const url = `${this.baseUrl}/movie/popular?api_key=${this.getApiKey()}&page=${page}`;
    
    const response = await this.apiClient.get<any>(url, {}, cacheKey, 600000); // 10 minutes cache
    
    if (response.success && response.data) {
      const movies = response.data.results || [];
      return {
        ...response,
        data: movies.map((movie: any) => ({
          ...movie,
          id: `movie-${movie.id}`,
          type: 'movies',
          description: movie.overview,
          urlToImage: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
        })),
      };
    }
    
    return response;
  }
  
  async searchMovies(query: string, page: number = 1): Promise<ApiResponse<any[]>> {
    const cacheKey = `tmdb-search-${query}-${page}`;
    
    const url = `${this.baseUrl}/search/movie?api_key=${this.getApiKey()}&query=${encodeURIComponent(query)}&page=${page}`;
    
    const response = await this.apiClient.get<any>(url, {}, cacheKey, 300000); // 5 minutes cache
    
    if (response.success && response.data) {
      const movies = response.data.results || [];
      return {
        ...response,
        data: movies.map((movie: any) => ({
          ...movie,
          id: `movie-search-${movie.id}`,
          type: 'movies',
          description: movie.overview,
          urlToImage: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
          query,
        })),
      };
    }
    
    return response;
  }
  
  async getTrendingMovies(timeWindow: 'day' | 'week' = 'week'): Promise<ApiResponse<any[]>> {
    const cacheKey = `tmdb-trending-${timeWindow}`;
    
    const url = `${this.baseUrl}/trending/movie/${timeWindow}?api_key=${this.getApiKey()}`;
    
    const response = await this.apiClient.get<any>(url, {}, cacheKey, 3600000); // 1 hour cache
    
    if (response.success && response.data) {
      const movies = response.data.results || [];
      return {
        ...response,
        data: movies.map((movie: any) => ({
          ...movie,
          id: `movie-trending-${movie.id}`,
          type: 'movies',
          description: movie.overview,
          urlToImage: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
          trending: true,
        })),
      };
    }
    
    return response;
  }
}

// Mock Social Media API Service
export class SocialApiService {
  private apiClient = EnhancedApiClient.getInstance();
  
  // Mock data for social media posts
  private generateMockPosts(count: number = 10): any[] {
    const platforms = ['twitter', 'instagram', 'facebook'];
    const authors = ['TechGuru', 'NewsDaily', 'TrendWatcher', 'SocialBuzz', 'ContentCreator'];
    const hashtags = ['#tech', '#news', '#trending', '#social', '#content', '#digital', '#innovation'];
    
    return Array.from({ length: count }, (_, index) => ({
      id: `social-${Date.now()}-${index}`,
      type: 'socialPosts',
      title: `Social Post ${index + 1}`,
      description: `This is a mock social media post about trending topics. ${hashtags[Math.floor(Math.random() * hashtags.length)]}`,
      author: authors[Math.floor(Math.random() * authors.length)],
      platform: platforms[Math.floor(Math.random() * platforms.length)],
      createdAt: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(), // Random date within last week
      likes: Math.floor(Math.random() * 1000),
      shares: Math.floor(Math.random() * 100),
      comments: Math.floor(Math.random() * 50),
      urlToImage: `https://picsum.photos/400/300?random=${index}`,
      url: `https://example.com/post/${index}`,
    }));
  }
  
  async getTrendingPosts(count: number = 20): Promise<ApiResponse<any[]>> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const posts = this.generateMockPosts(count);
    
    return {
      data: posts,
      success: true,
      cached: false,
    };
  }
  
  async searchPosts(query: string, count: number = 20): Promise<ApiResponse<any[]>> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const posts = this.generateMockPosts(count).map(post => ({
      ...post,
      description: `${post.description} - Related to: ${query}`,
      query,
    }));
    
    return {
      data: posts,
      success: true,
      cached: false,
    };
  }
  
  async getPostsByHashtag(hashtag: string, count: number = 20): Promise<ApiResponse<any[]>> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const posts = this.generateMockPosts(count).map(post => ({
      ...post,
      description: `${post.description} ${hashtag}`,
      hashtag,
    }));
    
    return {
      data: posts,
      success: true,
      cached: false,
    };
  }
}

// Export singleton instances
export const newsAPI = new NewsApiService();
export const tmdbAPI = new TmdbApiService();
export const socialAPI = new SocialApiService();

// Export the enhanced API client for custom usage
export const apiClient = EnhancedApiClient.getInstance();