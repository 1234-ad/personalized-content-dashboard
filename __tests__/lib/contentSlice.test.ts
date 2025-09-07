import { configureStore } from '@reduxjs/toolkit'
import contentSlice, {
  addToFavorites,
  removeFromFavorites,
  reorderContent,
  setSearchResults,
  clearSearchResults,
  fetchNews,
  fetchMovies,
  fetchSocialPosts,
} from '../../lib/features/contentSlice'

// Mock API calls
jest.mock('../../lib/services/api', () => ({
  newsAPI: {
    getTopHeadlines: jest.fn(),
    searchNews: jest.fn(),
  },
  tmdbAPI: {
    getPopularMovies: jest.fn(),
    searchMovies: jest.fn(),
  },
  socialAPI: {
    getTrendingPosts: jest.fn(),
    searchPosts: jest.fn(),
  },
}))

describe('contentSlice', () => {
  let store: ReturnType<typeof configureStore>

  beforeEach(() => {
    store = configureStore({
      reducer: {
        content: contentSlice,
      },
    })
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = store.getState().content
      expect(state).toEqual({
        news: [],
        movies: [],
        socialPosts: [],
        favorites: [],
        loading: false,
        error: null,
        searchResults: [],
        searchLoading: false,
      })
    })
  })

  describe('synchronous actions', () => {
    it('should add item to favorites', () => {
      const item = {
        id: '1',
        title: 'Test Item',
        description: 'Test Description',
        type: 'news' as const,
        url: 'https://test.com',
        urlToImage: 'https://test.com/image.jpg',
        publishedAt: '2023-01-01',
        source: { name: 'Test Source' },
      }

      store.dispatch(addToFavorites(item))
      const state = store.getState().content
      
      expect(state.favorites).toHaveLength(1)
      expect(state.favorites[0]).toEqual(item)
    })

    it('should not add duplicate items to favorites', () => {
      const item = {
        id: '1',
        title: 'Test Item',
        description: 'Test Description',
        type: 'news' as const,
        url: 'https://test.com',
        urlToImage: 'https://test.com/image.jpg',
        publishedAt: '2023-01-01',
        source: { name: 'Test Source' },
      }

      store.dispatch(addToFavorites(item))
      store.dispatch(addToFavorites(item))
      const state = store.getState().content
      
      expect(state.favorites).toHaveLength(1)
    })

    it('should remove item from favorites', () => {
      const item = {
        id: '1',
        title: 'Test Item',
        description: 'Test Description',
        type: 'news' as const,
        url: 'https://test.com',
        urlToImage: 'https://test.com/image.jpg',
        publishedAt: '2023-01-01',
        source: { name: 'Test Source' },
      }

      store.dispatch(addToFavorites(item))
      store.dispatch(removeFromFavorites('1'))
      const state = store.getState().content
      
      expect(state.favorites).toHaveLength(0)
    })

    it('should reorder content correctly', () => {
      // First, add some news items to the state
      const initialState = {
        news: [
          { id: '1', title: 'News 1', type: 'news' as const },
          { id: '2', title: 'News 2', type: 'news' as const },
          { id: '3', title: 'News 3', type: 'news' as const },
        ],
        movies: [],
        socialPosts: [],
        favorites: [],
        loading: false,
        error: null,
        searchResults: [],
        searchLoading: false,
      }

      const storeWithData = configureStore({
        reducer: { content: contentSlice },
        preloadedState: { content: initialState },
      })

      storeWithData.dispatch(reorderContent({
        sourceIndex: 0,
        destinationIndex: 2,
        contentType: 'news',
      }))

      const state = storeWithData.getState().content
      expect(state.news[0].id).toBe('2')
      expect(state.news[1].id).toBe('3')
      expect(state.news[2].id).toBe('1')
    })

    it('should set search results', () => {
      const searchResults = [
        { id: '1', title: 'Search Result 1', type: 'news' as const },
        { id: '2', title: 'Search Result 2', type: 'movies' as const },
      ]

      store.dispatch(setSearchResults(searchResults))
      const state = store.getState().content
      
      expect(state.searchResults).toEqual(searchResults)
    })

    it('should clear search results', () => {
      const searchResults = [
        { id: '1', title: 'Search Result 1', type: 'news' as const },
      ]

      store.dispatch(setSearchResults(searchResults))
      store.dispatch(clearSearchResults())
      const state = store.getState().content
      
      expect(state.searchResults).toEqual([])
    })
  })

  describe('async actions', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('should handle fetchNews pending state', () => {
      store.dispatch(fetchNews.pending('', ['technology']))
      const state = store.getState().content
      
      expect(state.loading).toBe(true)
      expect(state.error).toBe(null)
    })

    it('should handle fetchNews fulfilled state', () => {
      const mockNews = [
        {
          id: '1',
          title: 'Test News',
          description: 'Test Description',
          url: 'https://test.com',
          urlToImage: 'https://test.com/image.jpg',
          publishedAt: '2023-01-01',
          source: { name: 'Test Source' },
          type: 'news' as const,
        },
      ]

      store.dispatch(fetchNews.fulfilled(mockNews, '', ['technology']))
      const state = store.getState().content
      
      expect(state.loading).toBe(false)
      expect(state.news).toEqual(mockNews)
      expect(state.error).toBe(null)
    })

    it('should handle fetchNews rejected state', () => {
      const error = 'Failed to fetch news'
      store.dispatch(fetchNews.rejected(new Error(error), '', ['technology']))
      const state = store.getState().content
      
      expect(state.loading).toBe(false)
      expect(state.error).toBe(error)
    })

    it('should handle fetchMovies pending state', () => {
      store.dispatch(fetchMovies.pending('', undefined))
      const state = store.getState().content
      
      expect(state.loading).toBe(true)
      expect(state.error).toBe(null)
    })

    it('should handle fetchMovies fulfilled state', () => {
      const mockMovies = [
        {
          id: '1',
          title: 'Test Movie',
          description: 'Test Description',
          type: 'movies' as const,
          poster_path: '/test.jpg',
          release_date: '2023-01-01',
          vote_average: 8.5,
        },
      ]

      store.dispatch(fetchMovies.fulfilled(mockMovies, '', undefined))
      const state = store.getState().content
      
      expect(state.loading).toBe(false)
      expect(state.movies).toEqual(mockMovies)
      expect(state.error).toBe(null)
    })

    it('should handle fetchSocialPosts pending state', () => {
      store.dispatch(fetchSocialPosts.pending('', undefined))
      const state = store.getState().content
      
      expect(state.loading).toBe(true)
      expect(state.error).toBe(null)
    })

    it('should handle fetchSocialPosts fulfilled state', () => {
      const mockPosts = [
        {
          id: '1',
          title: 'Test Post',
          description: 'Test Description',
          type: 'socialPosts' as const,
          author: 'Test Author',
          platform: 'twitter',
          createdAt: '2023-01-01',
        },
      ]

      store.dispatch(fetchSocialPosts.fulfilled(mockPosts, '', undefined))
      const state = store.getState().content
      
      expect(state.loading).toBe(false)
      expect(state.socialPosts).toEqual(mockPosts)
      expect(state.error).toBe(null)
    })
  })

  describe('edge cases', () => {
    it('should handle reordering with invalid indices', () => {
      const initialState = {
        news: [
          { id: '1', title: 'News 1', type: 'news' as const },
          { id: '2', title: 'News 2', type: 'news' as const },
        ],
        movies: [],
        socialPosts: [],
        favorites: [],
        loading: false,
        error: null,
        searchResults: [],
        searchLoading: false,
      }

      const storeWithData = configureStore({
        reducer: { content: contentSlice },
        preloadedState: { content: initialState },
      })

      storeWithData.dispatch(reorderContent({
        sourceIndex: 0,
        destinationIndex: 10, // Invalid index
        contentType: 'news',
      }))

      const state = storeWithData.getState().content
      // Should not crash and maintain original order
      expect(state.news).toHaveLength(2)
    })

    it('should handle removing non-existent favorite', () => {
      store.dispatch(removeFromFavorites('non-existent-id'))
      const state = store.getState().content
      
      expect(state.favorites).toHaveLength(0)
    })
  })
})