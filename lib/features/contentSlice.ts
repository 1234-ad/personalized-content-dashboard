import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

export interface NewsItem {
  id: string
  title: string
  description: string
  url: string
  urlToImage: string
  publishedAt: string
  source: {
    name: string
  }
  category: string
}

export interface MovieItem {
  id: number
  title: string
  overview: string
  poster_path: string
  release_date: string
  vote_average: number
  genre_ids: number[]
}

export interface SocialPost {
  id: string
  content: string
  author: string
  timestamp: string
  likes: number
  hashtags: string[]
}

export interface ContentState {
  news: NewsItem[]
  movies: MovieItem[]
  socialPosts: SocialPost[]
  favorites: (NewsItem | MovieItem | SocialPost)[]
  loading: {
    news: boolean
    movies: boolean
    social: boolean
  }
  error: {
    news: string | null
    movies: string | null
    social: string | null
  }
  searchResults: any[]
  searchLoading: boolean
}

const initialState: ContentState = {
  news: [],
  movies: [],
  socialPosts: [],
  favorites: [],
  loading: {
    news: false,
    movies: false,
    social: false,
  },
  error: {
    news: null,
    movies: null,
    social: null,
  },
  searchResults: [],
  searchLoading: false,
}

// Async thunks for API calls
export const fetchNews = createAsyncThunk(
  'content/fetchNews',
  async (categories: string[]) => {
    const category = categories.join(',')
    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?category=${category}&country=us&apiKey=${process.env.NEXT_PUBLIC_NEWS_API_KEY}`
    )
    const data = await response.json()
    return data.articles.map((article: any, index: number) => ({
      ...article,
      id: `news-${index}`,
      category: category,
    }))
  }
)

export const fetchMovies = createAsyncThunk(
  'content/fetchMovies',
  async () => {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/popular?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
    )
    const data = await response.json()
    return data.results
  }
)

export const fetchSocialPosts = createAsyncThunk(
  'content/fetchSocialPosts',
  async () => {
    // Mock social posts since we can't use real Twitter API without authentication
    return [
      {
        id: 'social-1',
        content: 'Just discovered this amazing new tech trend! #technology #innovation',
        author: '@techguru',
        timestamp: new Date().toISOString(),
        likes: 42,
        hashtags: ['technology', 'innovation'],
      },
      {
        id: 'social-2',
        content: 'Great game last night! The team played exceptionally well. #sports #football',
        author: '@sportsfan',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        likes: 128,
        hashtags: ['sports', 'football'],
      },
    ]
  }
)

export const searchContent = createAsyncThunk(
  'content/searchContent',
  async (query: string) => {
    const results = []
    
    // Search news
    try {
      const newsResponse = await fetch(
        `https://newsapi.org/v2/everything?q=${query}&apiKey=${process.env.NEXT_PUBLIC_NEWS_API_KEY}`
      )
      const newsData = await newsResponse.json()
      results.push(...newsData.articles.slice(0, 5).map((article: any, index: number) => ({
        ...article,
        id: `search-news-${index}`,
        type: 'news',
      })))
    } catch (error) {
      console.error('News search failed:', error)
    }

    // Search movies
    try {
      const movieResponse = await fetch(
        `https://api.themoviedb.org/3/search/movie?query=${query}&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
      )
      const movieData = await movieResponse.json()
      results.push(...movieData.results.slice(0, 5).map((movie: any) => ({
        ...movie,
        type: 'movie',
      })))
    } catch (error) {
      console.error('Movie search failed:', error)
    }

    return results
  }
)

const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {
    addToFavorites: (state, action: PayloadAction<any>) => {
      const item = action.payload
      const exists = state.favorites.find(fav => fav.id === item.id)
      if (!exists) {
        state.favorites.push(item)
      }
    },
    removeFromFavorites: (state, action: PayloadAction<string>) => {
      state.favorites = state.favorites.filter(item => item.id !== action.payload)
    },
    reorderContent: (state, action: PayloadAction<{ sourceIndex: number; destinationIndex: number; contentType: 'news' | 'movies' | 'socialPosts' }>) => {
      const { sourceIndex, destinationIndex, contentType } = action.payload
      const items = state[contentType]
      const [reorderedItem] = items.splice(sourceIndex, 1)
      items.splice(destinationIndex, 0, reorderedItem)
    },
    clearSearchResults: (state) => {
      state.searchResults = []
    },
  },
  extraReducers: (builder) => {
    builder
      // News
      .addCase(fetchNews.pending, (state) => {
        state.loading.news = true
        state.error.news = null
      })
      .addCase(fetchNews.fulfilled, (state, action) => {
        state.loading.news = false
        state.news = action.payload
      })
      .addCase(fetchNews.rejected, (state, action) => {
        state.loading.news = false
        state.error.news = action.error.message || 'Failed to fetch news'
      })
      // Movies
      .addCase(fetchMovies.pending, (state) => {
        state.loading.movies = true
        state.error.movies = null
      })
      .addCase(fetchMovies.fulfilled, (state, action) => {
        state.loading.movies = false
        state.movies = action.payload
      })
      .addCase(fetchMovies.rejected, (state, action) => {
        state.loading.movies = false
        state.error.movies = action.error.message || 'Failed to fetch movies'
      })
      // Social Posts
      .addCase(fetchSocialPosts.pending, (state) => {
        state.loading.social = true
        state.error.social = null
      })
      .addCase(fetchSocialPosts.fulfilled, (state, action) => {
        state.loading.social = false
        state.socialPosts = action.payload
      })
      .addCase(fetchSocialPosts.rejected, (state, action) => {
        state.loading.social = false
        state.error.social = action.error.message || 'Failed to fetch social posts'
      })
      // Search
      .addCase(searchContent.pending, (state) => {
        state.searchLoading = true
      })
      .addCase(searchContent.fulfilled, (state, action) => {
        state.searchLoading = false
        state.searchResults = action.payload
      })
      .addCase(searchContent.rejected, (state) => {
        state.searchLoading = false
        state.searchResults = []
      })
  },
})

export const { addToFavorites, removeFromFavorites, reorderContent, clearSearchResults } = contentSlice.actions
export default contentSlice.reducer