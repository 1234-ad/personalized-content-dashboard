'use client'

import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/lib/store'
import { setActiveSection } from '@/lib/features/uiSlice'
import { 
  HomeIcon, 
  TrendingIcon, 
  HeartIcon, 
  SettingsIcon,
  NewsIcon,
  MovieIcon,
  SocialIcon 
} from '@/components/Icons'

const navigationItems = [
  { id: 'feed', label: 'Personalized Feed', icon: HomeIcon },
  { id: 'trending', label: 'Trending', icon: TrendingIcon },
  { id: 'favorites', label: 'Favorites', icon: HeartIcon },
]

const contentTypes = [
  { id: 'news', label: 'News', icon: NewsIcon },
  { id: 'movies', label: 'Movies', icon: MovieIcon },
  { id: 'social', label: 'Social', icon: SocialIcon },
]

export function Sidebar() {
  const dispatch = useDispatch()
  const { sidebarOpen, activeSection } = useSelector((state: RootState) => state.ui)
  const { favorites } = useSelector((state: RootState) => state.content)

  if (!sidebarOpen) return null

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full overflow-y-auto">
      <div className="p-4">
        {/* Navigation */}
        <nav className="space-y-2">
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Navigation
            </h3>
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = activeSection === item.id
              
              return (
                <button
                  key={item.id}
                  onClick={() => dispatch(setActiveSection(item.id as any))}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {item.id === 'favorites' && favorites.length > 0 && (
                    <span className="ml-auto bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 text-xs px-2 py-1 rounded-full">
                      {favorites.length}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Content Types */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Content Types
            </h3>
            {contentTypes.map((type) => {
              const Icon = type.icon
              
              return (
                <button
                  key={type.id}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors
                           text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{type.label}</span>
                </button>
              )
            })}
          </div>

          {/* Settings */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors
                       text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <SettingsIcon className="w-5 h-5" />
              <span className="font-medium">Settings</span>
            </button>
          </div>
        </nav>
      </div>
    </aside>
  )
}