import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { combineReducers } from '@reduxjs/toolkit'
import contentReducer from './features/contentSlice'
import userReducer from './features/userSlice'
import uiReducer from './features/uiSlice'

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user', 'ui'], // Only persist user preferences and UI state
}

const rootReducer = combineReducers({
  content: contentReducer,
  user: userReducer,
  ui: uiReducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch