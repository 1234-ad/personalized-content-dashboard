import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface UserPreferences {
  categories: string[]
  language: string
  notifications: boolean
}

export interface UserState {
  preferences: UserPreferences
  isAuthenticated: boolean
  profile: {
    name: string
    email: string
    avatar: string
  } | null
}

const initialState: UserState = {
  preferences: {
    categories: ['technology', 'business', 'entertainment'],
    language: 'en',
    notifications: true,
  },
  isAuthenticated: false,
  profile: null,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updatePreferences: (state, action: PayloadAction<Partial<UserPreferences>>) => {
      state.preferences = { ...state.preferences, ...action.payload }
    },
    setCategories: (state, action: PayloadAction<string[]>) => {
      state.preferences.categories = action.payload
    },
    toggleCategory: (state, action: PayloadAction<string>) => {
      const category = action.payload
      const categories = state.preferences.categories
      if (categories.includes(category)) {
        state.preferences.categories = categories.filter(c => c !== category)
      } else {
        state.preferences.categories.push(category)
      }
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.preferences.language = action.payload
    },
    toggleNotifications: (state) => {
      state.preferences.notifications = !state.preferences.notifications
    },
    login: (state, action: PayloadAction<{ name: string; email: string; avatar: string }>) => {
      state.isAuthenticated = true
      state.profile = action.payload
    },
    logout: (state) => {
      state.isAuthenticated = false
      state.profile = null
    },
  },
})

export const {
  updatePreferences,
  setCategories,
  toggleCategory,
  setLanguage,
  toggleNotifications,
  login,
  logout,
} = userSlice.actions

export default userSlice.reducer