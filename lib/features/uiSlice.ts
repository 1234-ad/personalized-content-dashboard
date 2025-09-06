import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface UIState {
  darkMode: boolean
  sidebarOpen: boolean
  activeSection: 'feed' | 'trending' | 'favorites' | 'search'
  searchQuery: string
  notifications: Array<{
    id: string
    message: string
    type: 'success' | 'error' | 'info'
    timestamp: string
  }>
}

const initialState: UIState = {
  darkMode: false,
  sidebarOpen: true,
  activeSection: 'feed',
  searchQuery: '',
  notifications: [],
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload
    },
    setActiveSection: (state, action: PayloadAction<'feed' | 'trending' | 'favorites' | 'search'>) => {
      state.activeSection = action.payload
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
    },
    addNotification: (state, action: PayloadAction<{ message: string; type: 'success' | 'error' | 'info' }>) => {
      const notification = {
        id: Date.now().toString(),
        ...action.payload,
        timestamp: new Date().toISOString(),
      }
      state.notifications.push(notification)
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload)
    },
    clearNotifications: (state) => {
      state.notifications = []
    },
  },
})

export const {
  toggleDarkMode,
  setDarkMode,
  toggleSidebar,
  setSidebarOpen,
  setActiveSection,
  setSearchQuery,
  addNotification,
  removeNotification,
  clearNotifications,
} = uiSlice.actions

export default uiSlice.reducer