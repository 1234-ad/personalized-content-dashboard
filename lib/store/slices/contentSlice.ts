import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface ContentItem {
  id: string;
  type: 'news' | 'movie' | 'music' | 'social';
  title: string;
  description: string;
  image?: string;
  url?: string;
  category: string;
  publishedAt: string;
  source: string;
  isFavorite?: boolean;
}

interface ContentState {
  items: ContentItem[];
  trendingItems: ContentItem[];
  favoriteItems: ContentItem[];
  loading: boolean;
  error: string | null;
  searchResults: ContentItem[];
  searchLoading: boolean;
  currentPage: number;
  hasMore: boolean;
}

const initialState: ContentState = {
  items: [],
  trendingItems: [],
  favoriteItems: [],
  loading: false,
  error: null,
  searchResults: [],
  searchLoading: false,
  currentPage: 1,
  hasMore: true,
};

// Async thunks for API calls
export const fetchNews = createAsyncThunk(
  'content/fetchNews',
  async (categories: string[]) => {
    // Mock API call - replace with actual NewsAPI
    const mockNews: ContentItem[] = [
      {
        id: 'news-1',
        type: 'news',
        title: 'Latest Tech Innovations in 2024',
        description: 'Discover the groundbreaking technologies shaping our future.',
        image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400',
        url: '#',
        category: 'technology',
        publishedAt: new Date().toISOString(),
        source: 'TechNews',
      },
      {
        id: 'news-2',
        type: 'news',
        title: 'Sports Championship Results',
        description: 'Latest updates from the championship games.',
        image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400',
        url: '#',
        category: 'sports',
        publishedAt: new Date().toISOString(),
        source: 'SportsTimes',
      },
      {
        id: 'news-3',
        type: 'news',
        title: 'Market Analysis: Q4 2024',
        description: 'Financial markets show strong performance in Q4.',
        image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400',
        url: '#',
        category: 'finance',
        publishedAt: new Date().toISOString(),
        source: 'FinanceDaily',
      },
    ];
    
    return mockNews.filter(item => categories.includes(item.category));
  }
);

export const fetchRecommendations = createAsyncThunk(
  'content/fetchRecommendations',
  async (preferences: string[]) => {
    // Mock API call - replace with actual TMDB/Spotify API
    const mockRecommendations: ContentItem[] = [
      {
        id: 'movie-1',
        type: 'movie',
        title: 'The Future of AI',
        description: 'A documentary exploring artificial intelligence.',
        image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400',
        url: '#',
        category: 'technology',
        publishedAt: new Date().toISOString(),
        source: 'MovieDB',
      },
      {
        id: 'music-1',
        type: 'music',
        title: 'Electronic Beats 2024',
        description: 'Latest electronic music compilation.',
        image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
        url: '#',
        category: 'music',
        publishedAt: new Date().toISOString(),
        source: 'MusicStream',
      },
    ];
    
    return mockRecommendations;
  }
);

export const fetchSocialPosts = createAsyncThunk(
  'content/fetchSocialPosts',
  async (hashtags: string[]) => {
    // Mock API call - replace with actual social media API
    const mockSocial: ContentItem[] = [
      {
        id: 'social-1',
        type: 'social',
        title: '#TechTrends is trending',
        description: 'Latest discussions about technology trends.',
        image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400',
        url: '#',
        category: 'technology',
        publishedAt: new Date().toISOString(),
        source: 'Social',
      },
    ];
    
    return mockSocial;
  }
);

export const searchContent = createAsyncThunk(
  'content/searchContent',
  async (query: string) => {
    // Mock search API
    const allContent: ContentItem[] = [
      {
        id: 'search-1',
        type: 'news',
        title: `Search result for: ${query}`,
        description: 'This is a mock search result.',
        image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400',
        url: '#',
        category: 'general',
        publishedAt: new Date().toISOString(),
        source: 'Search',
      },
    ];
    
    return allContent;
  }
);

const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {
    reorderItems: (state, action: PayloadAction<ContentItem[]>) => {
      state.items = action.payload;
    },
    clearSearch: (state) => {
      state.searchResults = [];
      state.searchLoading = false;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    updateFavoriteStatus: (state, action: PayloadAction<{ id: string; isFavorite: boolean }>) => {
      const { id, isFavorite } = action.payload;
      
      // Update in main items
      const item = state.items.find(item => item.id === id);
      if (item) {
        item.isFavorite = isFavorite;
      }
      
      // Update in trending items
      const trendingItem = state.trendingItems.find(item => item.id === id);
      if (trendingItem) {
        trendingItem.isFavorite = isFavorite;
      }
      
      // Update favorites list
      if (isFavorite) {
        const itemToAdd = item || trendingItem;
        if (itemToAdd && !state.favoriteItems.find(fav => fav.id === id)) {
          state.favoriteItems.push(itemToAdd);
        }
      } else {
        state.favoriteItems = state.favoriteItems.filter(fav => fav.id !== id);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch News
      .addCase(fetchNews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNews.fulfilled, (state, action) => {
        state.loading = false;
        state.items = [...state.items, ...action.payload];
      })
      .addCase(fetchNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch news';
      })
      
      // Fetch Recommendations
      .addCase(fetchRecommendations.fulfilled, (state, action) => {
        state.items = [...state.items, ...action.payload];
        state.trendingItems = action.payload;
      })
      
      // Fetch Social Posts
      .addCase(fetchSocialPosts.fulfilled, (state, action) => {
        state.items = [...state.items, ...action.payload];
      })
      
      // Search Content
      .addCase(searchContent.pending, (state) => {
        state.searchLoading = true;
      })
      .addCase(searchContent.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchContent.rejected, (state) => {
        state.searchLoading = false;
      });
  },
});

export const {
  reorderItems,
  clearSearch,
  setCurrentPage,
  updateFavoriteStatus,
} = contentSlice.actions;

export default contentSlice.reducer;