import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserPreferences {
  categories: string[];
  favoriteItems: string[];
  darkMode: boolean;
  language: string;
}

interface UserState {
  preferences: UserPreferences;
  isAuthenticated: boolean;
  profile: {
    name: string;
    email: string;
    avatar?: string;
  } | null;
}

const initialState: UserState = {
  preferences: {
    categories: ['technology', 'sports', 'finance'],
    favoriteItems: [],
    darkMode: false,
    language: 'en',
  },
  isAuthenticated: false,
  profile: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updatePreferences: (state, action: PayloadAction<Partial<UserPreferences>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('userPreferences', JSON.stringify(state.preferences));
      }
    },
    toggleDarkMode: (state) => {
      state.preferences.darkMode = !state.preferences.darkMode;
      if (typeof window !== 'undefined') {
        localStorage.setItem('userPreferences', JSON.stringify(state.preferences));
      }
    },
    addFavorite: (state, action: PayloadAction<string>) => {
      if (!state.preferences.favoriteItems.includes(action.payload)) {
        state.preferences.favoriteItems.push(action.payload);
        if (typeof window !== 'undefined') {
          localStorage.setItem('userPreferences', JSON.stringify(state.preferences));
        }
      }
    },
    removeFavorite: (state, action: PayloadAction<string>) => {
      state.preferences.favoriteItems = state.preferences.favoriteItems.filter(
        (id) => id !== action.payload
      );
      if (typeof window !== 'undefined') {
        localStorage.setItem('userPreferences', JSON.stringify(state.preferences));
      }
    },
    loadUserPreferences: (state) => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('userPreferences');
        if (saved) {
          state.preferences = { ...state.preferences, ...JSON.parse(saved) };
        }
      }
    },
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
    setProfile: (state, action: PayloadAction<UserState['profile']>) => {
      state.profile = action.payload;
    },
  },
});

export const {
  updatePreferences,
  toggleDarkMode,
  addFavorite,
  removeFavorite,
  loadUserPreferences,
  setAuthenticated,
  setProfile,
} = userSlice.actions;

export default userSlice.reducer;