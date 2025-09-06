// API Service Layer for external API calls
export class ApiService {
  private static instance: ApiService;
  
  private constructor() {}
  
  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  // News API Service
  async fetchNews(categories: string[], country: string = 'us'): Promise<any> {
    const category = categories.join(',');
    const apiKey = process.env.NEXT_PUBLIC_NEWS_API_KEY;
    
    if (!apiKey) {
      throw new Error('News API key is not configured');
    }

    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?category=${category}&country=${country}&apiKey=${apiKey}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`News API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.articles.map((article: any, index: number) => ({
      ...article,
      id: `news-${Date.now()}-${index}`,
      category: category,
    }));
  }

  // TMDB API Service
  async fetchMovies(page: number = 1): Promise<any> {
    const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
    
    if (!apiKey) {
      throw new Error('TMDB API key is not configured');
    }

    const response = await fetch(
      `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&page=${page}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.results;
  }

  // Search Movies
  async searchMovies(query: string, page: number = 1): Promise<any> {
    const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
    
    if (!apiKey) {
      throw new Error('TMDB API key is not configured');
    }

    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&api_key=${apiKey}&page=${page}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`TMDB Search API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.results;
  }

  // Search News
  async searchNews(query: string, sortBy: string = 'publishedAt'): Promise<any> {
    const apiKey = process.env.NEXT_PUBLIC_NEWS_API_KEY;
    
    if (!apiKey) {
      throw new Error('News API key is not configured');
    }

    const response = await fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=${sortBy}&apiKey=${apiKey}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`News Search API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.articles.slice(0, 10).map((article: any, index: number) => ({
      ...article,
      id: `search-news-${Date.now()}-${index}`,
      type: 'news',
    }));
  }

  // Mock Social Media API (since real APIs require authentication)
  async fetchSocialPosts(hashtags: string[] = []): Promise<any> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const mockPosts = [
      {
        id: `social-${Date.now()}-1`,
        content: 'Just discovered this amazing new tech trend! The future is here. #technology #innovation #ai',
        author: '@techguru',
        timestamp: new Date().toISOString(),
        likes: Math.floor(Math.random() * 200) + 10,
        hashtags: ['technology', 'innovation', 'ai'],
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
      },
      {
        id: `social-${Date.now()}-2`,
        content: 'Great game last night! The team played exceptionally well. What a comeback! #sports #football #victory',
        author: '@sportsfan',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        likes: Math.floor(Math.random() * 300) + 50,
        hashtags: ['sports', 'football', 'victory'],
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
      },
      {
        id: `social-${Date.now()}-3`,
        content: 'Market analysis shows interesting trends in the finance sector. Time to diversify! #finance #investing #stocks',
        author: '@financepro',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        likes: Math.floor(Math.random() * 150) + 25,
        hashtags: ['finance', 'investing', 'stocks'],
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
      },
      {
        id: `social-${Date.now()}-4`,
        content: 'Beautiful sunset today! Nature never fails to amaze me. #nature #photography #sunset',
        author: '@naturelover',
        timestamp: new Date(Date.now() - 10800000).toISOString(),
        likes: Math.floor(Math.random() * 400) + 100,
        hashtags: ['nature', 'photography', 'sunset'],
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
      },
      {
        id: `social-${Date.now()}-5`,
        content: 'New health study reveals surprising benefits of meditation. Mind-body connection is real! #health #wellness #meditation',
        author: '@healthguru',
        timestamp: new Date(Date.now() - 14400000).toISOString(),
        likes: Math.floor(Math.random() * 250) + 75,
        hashtags: ['health', 'wellness', 'meditation'],
        avatar: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=40&h=40&fit=crop&crop=face',
      },
    ];

    // Filter by hashtags if provided
    if (hashtags.length > 0) {
      return mockPosts.filter(post => 
        post.hashtags.some(tag => hashtags.includes(tag))
      );
    }

    return mockPosts;
  }

  // Search Social Posts
  async searchSocialPosts(query: string): Promise<any> {
    const allPosts = await this.fetchSocialPosts();
    
    return allPosts.filter((post: any) => 
      post.content.toLowerCase().includes(query.toLowerCase()) ||
      post.hashtags.some((tag: string) => tag.toLowerCase().includes(query.toLowerCase()))
    ).map((post: any, index: number) => ({
      ...post,
      id: `search-social-${Date.now()}-${index}`,
      type: 'social',
    }));
  }
}

export const apiService = ApiService.getInstance();