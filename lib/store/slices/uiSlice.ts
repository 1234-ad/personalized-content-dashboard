import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  sidebarOpen: boolean;
  activeSection: 'feed' | 'trending' | 'favorites' | 'search';
  darkMode: boolean;
  searchQuery: string;
  settingsOpen: boolean;
  loading: boolean;
}

const initialState: UIState = {
  sidebarOpen: true,
  activeSection: 'feed',
  darkMode: false,
  searchQuery: '',
  settingsOpen: false,
  loading: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setActiveSection: (state, action: PayloadAction<UIState['activeSection']>) => {
      state.activeSection = action.payload;
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    toggleSettings: (state) => {
      state.settingsOpen = !state.settingsOpen;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setActiveSection,
  toggleDarkMode,
  setSearchQuery,
  toggleSettings,
  setLoading,
  setSidebarOpen,
} = uiSlice.actions;

export default uiSlice.reducer;