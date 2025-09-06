import { configureStore } from '@reduxjs/toolkit'
import contentSlice, {
  addToFavorites,
  removeFromFavorites,
  reorderContent,
  clearSearchResults,
  fetchNews,
  fetchMovies,
  fetchSocialPosts,
  searchContent,
} from '@/lib/features/contentSlice'

// Mock the API service
jest.mock('@/lib/services/api', () => ({
  apiService: {
    fetchNews: jest.fn(),
    fetchMovies: jest.fn(),
    fetchSocialPosts: jest.fn(),
    searchNews: jest.fn(),
    searchMovies: jest.fn(),
    searchSocialPosts: jest.fn(),
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
      expect(state.news).toEqual([])
      expect(state.movies).toEqual([])
      expect(state.socialPosts).toEqual([])
      expect(state.favorites).toEqual([])
      expect(state.searchResults).toEqual([])
      expect(state.searchLoading).toBe(false)
      expect(state.loading).toEqual({
        news: false,
        movies: false,
        social: false,
      })
      expect(state.error).toEqual({
        news: null,
        movies: null,
        social: null,
      })
    })
  })

  describe('synchronous actions', () => {
    const mockItem = {
      id: 'test-1',
      title: 'Test Item',
      description: 'Test Description',
    }

    it('should add item to favorites', () => {
      store.dispatch(addToFavorites(mockItem))
      const state = store.getState().content
      expect(state.favorites).toContain(mockItem)
    })

    it('should not add duplicate items to favorites', () => {
      store.dispatch(addToFavorites(mockItem))
      store.dispatch(addToFavorites(mockItem))
      const state = store.getState().content
      expect(state.favorites).toHaveLength(1)
    })

    it('should remove item from favorites', () => {
      store.dispatch(addToFavorites(mockItem))
      store.dispatch(removeFromFavorites('test-1'))
      const state = store.getState().content
      expect(state.favorites).not.toContain(mockItem)
    })

    it('should clear search results', () => {
      // First add some search results
      const initialState = store.getState().content
      store.dispatch({
        type: 'content/searchContent/fulfilled',
        payload: [mockItem],
      })
      
      store.dispatch(clearSearchResults())
      const state = store.getState().content
      expect(state.searchResults).toEqual([])
    })

    it('should reorder news content', () => {
      const newsItems = [
        { id: 'news-1', title: 'News 1' },
        { id: 'news-2', title: 'News 2' },
        { id: 'news-3', title: 'News 3' },
      ]

      // Set initial news state
      store.dispatch({
        type: 'content/fetchNews/fulfilled',
        payload: newsItems,
      })

      // Reorder: move item from index 0 to index 2
      store.dispatch(reorderContent({
        sourceIndex: 0,
        destinationIndex: 2,
        contentType: 'news',
      }))

      const state = store.getState().content
      expect(state.news[0].id).toBe('news-2')
      expect(state.news[1].id).toBe('news-3')
      expect(state.news[2].id).toBe('news-1')
    })
  })

  describe('async thunks', () => {
    beforeEach(() => {
      // Reset all mocks
      jest.clearAllMocks()
      
      // Mock fetch globally
      global.fetch = jest.fn()
    })

    it('should handle fetchNews fulfilled', async () => {
      const mockNewsData = {
        articles: [
          {
            title: 'Test News',
            description: 'Test Description',
            url: 'https://example.com',
            urlToImage: 'https://example.com/image.jpg',
            publishedAt: '2023-01-01T00:00:00Z',
            source: { name: 'Test Source' },
          },
        ],
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockNewsData,
      })

      const action = await store.dispatch(fetchNews(['technology']))
      const state = store.getState().content

      expect(action.type).toBe('content/fetchNews/fulfilled')
      expect(state.news).toHaveLength(1)
      expect(state.news[0].title).toBe('Test News')
      expect(state.loading.news).toBe(false)
      expect(state.error.news).toBe(null)
    })

    it('should handle fetchNews rejected', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'))

      const action = await store.dispatch(fetchNews(['technology']))
      const state = store.getState().content

      expect(action.type).toBe('content/fetchNews/rejected')
      expect(state.news).toHaveLength(0)
      expect(state.loading.news).toBe(false)
      expect(state.error.news).toBe('API Error')
    })

    it('should handle fetchMovies fulfilled', async () => {
      const mockMoviesData = {
        results: [
          {
            id: 1,
            title: 'Test Movie',
            overview: 'Test Overview',
            poster_path: '/test.jpg',
            release_date: '2023-01-01',
            vote_average: 8.5,
            genre_ids: [28],
          },
        ],
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockMoviesData,
      })

      const action = await store.dispatch(fetchMovies())
      const state = store.getState().content

      expect(action.type).toBe('content/fetchMovies/fulfilled')
      expect(state.movies).toHaveLength(1)
      expect(state.movies[0].title).toBe('Test Movie')
      expect(state.loading.movies).toBe(false)
      expect(state.error.movies).toBe(null)
    })

    it('should handle fetchSocialPosts fulfilled', async () => {
      const action = await store.dispatch(fetchSocialPosts())
      const state = store.getState().content

      expect(action.type).toBe('content/fetchSocialPosts/fulfilled')
      expect(state.socialPosts.length).toBeGreaterThan(0)
      expect(state.loading.social).toBe(false)
      expect(state.error.social).toBe(null)
    })

    it('should handle searchContent', async () => {
      // Mock successful news search
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            articles: [
              {
                title: 'Search Result News',
                description: 'Search Description',
                url: 'https://example.com',
                urlToImage: 'https://example.com/image.jpg',
                publishedAt: '2023-01-01T00:00:00Z',
                source: { name: 'Search Source' },
              },
            ],
          }),
        })
        // Mock successful movie search
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            results: [
              {
                id: 1,
                title: 'Search Result Movie',
                overview: 'Search Overview',
                poster_path: '/search.jpg',
                release_date: '2023-01-01',
                vote_average: 7.5,
                genre_ids: [28],
              },
            ],
          }),
        })

      const action = await store.dispatch(searchContent('test query'))
      const state = store.getState().content

      expect(action.type).toBe('content/searchContent/fulfilled')
      expect(state.searchResults.length).toBeGreaterThan(0)
      expect(state.searchLoading).toBe(false)
    })
  })
})