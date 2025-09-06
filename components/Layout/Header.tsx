'use client'

import { useState, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/lib/store'
import { toggleDarkMode, toggleSidebar, setSearchQuery, setActiveSection } from '@/lib/features/uiSlice'
import { searchContent, clearSearchResults } from '@/lib/features/contentSlice'
import { useDebounce } from '@/hooks/useDebounce'
import { SearchIcon, MenuIcon, SunIcon, MoonIcon, BellIcon, UserIcon } from '@/components/Icons'

export function Header() {
  const dispatch = useDispatch()
  const { darkMode, searchQuery } = useSelector((state: RootState) => state.ui)
  const { profile, isAuthenticated } = useSelector((state: RootState) => state.user)
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery)

  const debouncedSearch = useDebounce((query: string) => {
    dispatch(setSearchQuery(query))
    if (query.trim()) {
      dispatch(searchContent(query))
      dispatch(setActiveSection('search'))
    } else {
      dispatch(clearSearchResults())
    }
  }, 300)

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocalSearchQuery(value)
    debouncedSearch(value)
  }, [debouncedSearch])

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle sidebar"
          >
            <MenuIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Content Dashboard
          </h1>
        </div>

        {/* Center - Search */}
        <div className="flex-1 max-w-2xl mx-8">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search news, movies, or social posts..."
              value={localSearchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-primary-500 focus:border-transparent
                         placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-3">
          {/* Dark mode toggle */}
          <button
            onClick={() => dispatch(toggleDarkMode())}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <SunIcon className="w-5 h-5 text-yellow-500" />
            ) : (
              <MoonIcon className="w-5 h-5 text-gray-600" />
            )}
          </button>

          {/* Notifications */}
          <button
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative"
            aria-label="Notifications"
          >
            <BellIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User profile */}
          <div className="flex items-center space-x-2">
            {isAuthenticated && profile ? (
              <div className="flex items-center space-x-2">
                <img
                  src={profile.avatar || '/default-avatar.png'}
                  alt={profile.name}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {profile.name}
                </span>
              </div>
            ) : (
              <button className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <UserIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sign In
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}