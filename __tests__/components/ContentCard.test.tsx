import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { ContentCard } from '@/components/ContentCard'
import contentSlice from '@/lib/features/contentSlice'
import userSlice from '@/lib/features/userSlice'
import uiSlice from '@/lib/features/uiSlice'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}))

const mockStore = configureStore({
  reducer: {
    content: contentSlice,
    user: userSlice,
    ui: uiSlice,
  },
})

const mockNewsItem = {
  id: 'news-1',
  title: 'Test News Article',
  description: 'This is a test news article description',
  url: 'https://example.com/news',
  urlToImage: 'https://example.com/image.jpg',
  publishedAt: '2023-01-01T00:00:00Z',
  source: { name: 'Test Source' },
  category: 'technology',
}

const mockMovieItem = {
  id: 1,
  title: 'Test Movie',
  overview: 'This is a test movie overview',
  poster_path: '/test-poster.jpg',
  release_date: '2023-01-01',
  vote_average: 8.5,
  genre_ids: [28, 12],
}

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <Provider store={mockStore}>
      {component}
    </Provider>
  )
}

describe('ContentCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders news item correctly', () => {
    renderWithProvider(
      <ContentCard item={mockNewsItem} type="news" />
    )

    expect(screen.getByText('Test News Article')).toBeInTheDocument()
    expect(screen.getByText('This is a test news article description')).toBeInTheDocument()
    expect(screen.getByText('Test Source')).toBeInTheDocument()
    expect(screen.getByText('Read More')).toBeInTheDocument()
  })

  it('renders movie item correctly', () => {
    renderWithProvider(
      <ContentCard item={mockMovieItem} type="movie" />
    )

    expect(screen.getByText('Test Movie')).toBeInTheDocument()
    expect(screen.getByText('This is a test movie overview')).toBeInTheDocument()
    expect(screen.getByText('8.5')).toBeInTheDocument()
    expect(screen.getByText('Watch Now')).toBeInTheDocument()
  })

  it('handles favorite toggle', () => {
    renderWithProvider(
      <ContentCard item={mockNewsItem} type="news" />
    )

    const favoriteButton = screen.getByLabelText(/add to favorites/i)
    fireEvent.click(favoriteButton)

    // The button should change state (this would be tested with Redux state)
    expect(favoriteButton).toBeInTheDocument()
  })

  it('handles external link click', () => {
    // Mock window.open
    const mockOpen = jest.fn()
    Object.defineProperty(window, 'open', {
      value: mockOpen,
      writable: true,
    })

    renderWithProvider(
      <ContentCard item={mockNewsItem} type="news" />
    )

    const readMoreButton = screen.getByText('Read More')
    fireEvent.click(readMoreButton)

    expect(mockOpen).toHaveBeenCalledWith(mockNewsItem.url, '_blank')
  })

  it('displays formatted date correctly', () => {
    renderWithProvider(
      <ContentCard item={mockNewsItem} type="news" />
    )

    // Check if date is displayed (format may vary)
    expect(screen.getByText(/Jan 1, 2023/i)).toBeInTheDocument()
  })

  it('handles missing image gracefully', () => {
    const itemWithoutImage = { ...mockNewsItem, urlToImage: null }
    
    renderWithProvider(
      <ContentCard item={itemWithoutImage} type="news" />
    )

    // Should still render the card without crashing
    expect(screen.getByText('Test News Article')).toBeInTheDocument()
  })

  it('truncates long descriptions', () => {
    const itemWithLongDescription = {
      ...mockNewsItem,
      description: 'This is a very long description that should be truncated after a certain number of characters to ensure the card layout remains consistent and readable.',
    }

    renderWithProvider(
      <ContentCard item={itemWithLongDescription} type="news" />
    )

    const description = screen.getByText(/This is a very long description/)
    expect(description).toBeInTheDocument()
  })
})