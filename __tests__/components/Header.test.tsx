import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Header from '../../components/Header';
import { contentSlice } from '../../lib/features/contentSlice';
import { uiSlice } from '../../lib/features/uiSlice';
import { userSlice } from '../../lib/features/userSlice';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      content: contentSlice.reducer,
      ui: uiSlice.reducer,
      user: userSlice.reducer,
    },
    preloadedState: {
      content: {
        items: [],
        favorites: [],
        searchResults: [],
        isLoading: false,
        error: null,
        searchQuery: '',
        ...initialState.content,
      },
      ui: {
        darkMode: false,
        sidebarOpen: false,
        settingsOpen: false,
        currentLanguage: 'en',
        ...initialState.ui,
      },
      user: {
        preferences: {
          categories: ['technology'],
          language: 'en',
        },
        profile: null,
        isAuthenticated: false,
        ...initialState.user,
      },
    },
  });
};

const renderWithProvider = (component: React.ReactElement, initialState = {}) => {
  const store = createMockStore(initialState);
  return {
    ...render(
      <Provider store={store}>
        {component}
      </Provider>
    ),
    store,
  };
};

describe('Header Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders header with all main elements', () => {
    renderWithProvider(<Header />);
    
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search content/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /toggle dark mode/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument();
  });

  it('handles search input correctly', async () => {
    const { store } = renderWithProvider(<Header />);
    const searchInput = screen.getByPlaceholderText(/search content/i);
    
    fireEvent.change(searchInput, { target: { value: 'test query' } });
    
    await waitFor(() => {
      const state = store.getState();
      expect(state.content.searchQuery).toBe('test query');
    });
  });

  it('debounces search input', async () => {
    jest.useFakeTimers();
    const { store } = renderWithProvider(<Header />);
    const searchInput = screen.getByPlaceholderText(/search content/i);
    
    // Type multiple characters quickly
    fireEvent.change(searchInput, { target: { value: 't' } });
    fireEvent.change(searchInput, { target: { value: 'te' } });
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    // Fast-forward time to trigger debounce
    jest.advanceTimersByTime(500);
    
    await waitFor(() => {
      const state = store.getState();
      expect(state.content.searchQuery).toBe('test');
    });
    
    jest.useRealTimers();
  });

  it('toggles dark mode when button is clicked', () => {
    const { store } = renderWithProvider(<Header />);
    const darkModeButton = screen.getByRole('button', { name: /toggle dark mode/i });
    
    fireEvent.click(darkModeButton);
    
    const state = store.getState();
    expect(state.ui.darkMode).toBe(true);
  });

  it('opens settings panel when settings button is clicked', () => {
    const { store } = renderWithProvider(<Header />);
    const settingsButton = screen.getByRole('button', { name: /settings/i });
    
    fireEvent.click(settingsButton);
    
    const state = store.getState();
    expect(state.ui.settingsOpen).toBe(true);
  });

  it('displays user profile when authenticated', () => {
    const initialState = {
      user: {
        isAuthenticated: true,
        profile: {
          name: 'John Doe',
          email: 'john@example.com',
          avatar: 'https://example.com/avatar.jpg',
        },
      },
    };
    
    renderWithProvider(<Header />, initialState);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /user avatar/i })).toBeInTheDocument();
  });

  it('shows login button when not authenticated', () => {
    const initialState = {
      user: {
        isAuthenticated: false,
        profile: null,
      },
    };
    
    renderWithProvider(<Header />, initialState);
    
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('displays search results count when searching', () => {
    const initialState = {
      content: {
        searchQuery: 'test',
        searchResults: [
          { id: '1', title: 'Test Article 1', type: 'news' },
          { id: '2', title: 'Test Article 2', type: 'news' },
        ],
      },
    };
    
    renderWithProvider(<Header />, initialState);
    
    expect(screen.getByText(/2 results found/i)).toBeInTheDocument();
  });

  it('clears search when clear button is clicked', () => {
    const initialState = {
      content: {
        searchQuery: 'test query',
        searchResults: [{ id: '1', title: 'Test', type: 'news' }],
      },
    };
    
    const { store } = renderWithProvider(<Header />, initialState);
    const clearButton = screen.getByRole('button', { name: /clear search/i });
    
    fireEvent.click(clearButton);
    
    const state = store.getState();
    expect(state.content.searchQuery).toBe('');
    expect(state.content.searchResults).toEqual([]);
  });

  it('handles keyboard navigation for search', () => {
    renderWithProvider(<Header />);
    const searchInput = screen.getByPlaceholderText(/search content/i);
    
    fireEvent.keyDown(searchInput, { key: 'Enter' });
    fireEvent.keyDown(searchInput, { key: 'Escape' });
    
    // Should not throw any errors
    expect(searchInput).toBeInTheDocument();
  });

  it('applies correct ARIA labels for accessibility', () => {
    renderWithProvider(<Header />);
    
    expect(screen.getByRole('searchbox')).toHaveAttribute('aria-label', 'Search content');
    expect(screen.getByRole('button', { name: /toggle dark mode/i })).toHaveAttribute('aria-label');
    expect(screen.getByRole('button', { name: /settings/i })).toHaveAttribute('aria-label');
  });

  it('shows loading state during search', () => {
    const initialState = {
      content: {
        isLoading: true,
        searchQuery: 'test',
      },
    };
    
    renderWithProvider(<Header />, initialState);
    
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/searching/i)).toBeInTheDocument();
  });

  it('displays error message when search fails', () => {
    const initialState = {
      content: {
        error: 'Failed to fetch search results',
        searchQuery: 'test',
      },
    };
    
    renderWithProvider(<Header />, initialState);
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/failed to fetch search results/i)).toBeInTheDocument();
  });

  it('toggles mobile menu on small screens', () => {
    // Mock window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 640, // Mobile breakpoint
    });
    
    renderWithProvider(<Header />);
    const menuButton = screen.getByRole('button', { name: /toggle menu/i });
    
    fireEvent.click(menuButton);
    
    expect(screen.getByRole('navigation')).toHaveClass('mobile-menu-open');
  });
});