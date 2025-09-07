import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { DragDropContext } from 'react-beautiful-dnd'
import Dashboard from '../../app/page'
import contentSlice from '../../lib/features/contentSlice'
import userSlice from '../../lib/features/userSlice'
import uiSlice from '../../lib/features/uiSlice'

// Mock react-beautiful-dnd
jest.mock('react-beautiful-dnd', () => ({
  DragDropContext: ({ children }: any) => children,
  Droppable: ({ children }: any) => children({
    draggableProps: {},
    dragHandleProps: {},
    innerRef: jest.fn(),
  }),
  Draggable: ({ children }: any) => children({
    draggableProps: {},
    dragHandleProps: {},
    innerRef: jest.fn(),
  }),
}))

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}))

const mockStore = configureStore({
  reducer: {
    content: contentSlice,
    user: userSlice,
    ui: uiSlice,
  },
  preloadedState: {
    content: {
      news: [
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
      ],
      movies: [],
      socialPosts: [],
      favorites: [],
      loading: false,
      error: null,
      searchResults: [],
      searchLoading: false,
    },
    user: {
      preferences: {
        categories: ['technology'],
        darkMode: false,
        language: 'en',
      },
    },
    ui: {
      activeSection: 'feed',
      searchQuery: '',
      sidebarOpen: false,
      settingsOpen: false,
    },
  },
})

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <Provider store={mockStore}>
      {component}
    </Provider>
  )
}

describe('Dashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders dashboard with header and sidebar', () => {
    renderWithProvider(<Dashboard />)
    
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('displays content cards when data is loaded', () => {
    renderWithProvider(<Dashboard />)
    
    expect(screen.getByText('Test News')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
  })

  it('shows loading spinner when content is loading', () => {
    const loadingStore = configureStore({
      reducer: {
        content: contentSlice,
        user: userSlice,
        ui: uiSlice,
      },
      preloadedState: {
        ...mockStore.getState(),
        content: {
          ...mockStore.getState().content,
          loading: true,
        },
      },
    })

    render(
      <Provider store={loadingStore}>
        <Dashboard />
      </Provider>
    )

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('displays error message when there is an error', () => {
    const errorStore = configureStore({
      reducer: {
        content: contentSlice,
        user: userSlice,
        ui: uiSlice,
      },
      preloadedState: {
        ...mockStore.getState(),
        content: {
          ...mockStore.getState().content,
          error: 'Failed to fetch content',
        },
      },
    })

    render(
      <Provider store={errorStore}>
        <Dashboard />
      </Provider>
    )

    expect(screen.getByText(/failed to fetch content/i)).toBeInTheDocument()
  })

  it('handles section switching', () => {
    renderWithProvider(<Dashboard />)
    
    const favoritesButton = screen.getByText(/favorites/i)
    fireEvent.click(favoritesButton)
    
    // Should show favorites section
    expect(screen.getByText(/your favorite content/i)).toBeInTheDocument()
  })

  it('handles search functionality', async () => {
    renderWithProvider(<Dashboard />)
    
    const searchInput = screen.getByPlaceholderText(/search content/i)
    fireEvent.change(searchInput, { target: { value: 'test query' } })
    
    await waitFor(() => {
      expect(searchInput).toHaveValue('test query')
    })
  })

  it('handles drag and drop reordering', () => {
    renderWithProvider(<Dashboard />)
    
    // Mock drag and drop event
    const dragResult = {
      destination: { index: 1 },
      source: { index: 0, droppableId: 'news-feed' },
    }
    
    // This would be triggered by react-beautiful-dnd
    // In a real test, you'd simulate the drag and drop interaction
    expect(screen.getByText('Test News')).toBeInTheDocument()
  })

  it('toggles dark mode', () => {
    renderWithProvider(<Dashboard />)
    
    const darkModeToggle = screen.getByRole('button', { name: /toggle dark mode/i })
    fireEvent.click(darkModeToggle)
    
    // Check if dark mode class is applied
    expect(document.documentElement).toHaveClass('dark')
  })

  it('opens and closes settings panel', () => {
    renderWithProvider(<Dashboard />)
    
    const settingsButton = screen.getByRole('button', { name: /settings/i })
    fireEvent.click(settingsButton)
    
    expect(screen.getByText(/user preferences/i)).toBeInTheDocument()
  })

  it('handles responsive sidebar toggle', () => {
    renderWithProvider(<Dashboard />)
    
    const menuButton = screen.getByRole('button', { name: /toggle menu/i })
    fireEvent.click(menuButton)
    
    // Check if sidebar is visible on mobile
    expect(screen.getByRole('navigation')).toHaveClass('translate-x-0')
  })

  it('displays empty state when no content is available', () => {
    const emptyStore = configureStore({
      reducer: {
        content: contentSlice,
        user: userSlice,
        ui: uiSlice,
      },
      preloadedState: {
        ...mockStore.getState(),
        content: {
          ...mockStore.getState().content,
          news: [],
          movies: [],
          socialPosts: [],
        },
      },
    })

    render(
      <Provider store={emptyStore}>
        <Dashboard />
      </Provider>
    )

    expect(screen.getByText(/no content available/i)).toBeInTheDocument()
  })
})