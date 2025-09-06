'use client';

import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/redux';
import { setActiveSection } from '@/lib/store/slices/uiSlice';

const Sidebar = () => {
  const dispatch = useAppDispatch();
  const { sidebarOpen, activeSection } = useAppSelector((state) => state.ui);
  const { favoriteItems } = useAppSelector((state) => state.content);

  const menuItems = [
    {
      id: 'feed',
      label: 'Personalized Feed',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7l2 2-2 2M5 13l-2-2 2-2m8-2v12" />
        </svg>
      ),
    },
    {
      id: 'trending',
      label: 'Trending',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
    {
      id: 'favorites',
      label: 'Favorites',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      badge: favoriteItems.length,
    },
  ];

  const categories = [
    { id: 'technology', label: 'Technology', color: 'bg-blue-500' },
    { id: 'sports', label: 'Sports', color: 'bg-green-500' },
    { id: 'finance', label: 'Finance', color: 'bg-yellow-500' },
    { id: 'entertainment', label: 'Entertainment', color: 'bg-purple-500' },
    { id: 'health', label: 'Health', color: 'bg-red-500' },
  ];

  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-40 ${
        sidebarOpen ? 'w-64' : 'w-16'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => dispatch(setActiveSection(item.id as any))}
              className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                activeSection === item.id
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <span className={`${activeSection === item.id ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                {item.icon}
              </span>
              {sidebarOpen && (
                <>
                  <span className="ml-3 font-medium">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="ml-auto bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          ))}
        </nav>

        {/* Categories */}
        {sidebarOpen && (
          <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Categories
            </h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${category.color} mr-3`}></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{category.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        {sidebarOpen && (
          <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <p>© 2024 Content Dashboard</p>
              <p>Personalized for you</p>
            </div>
          </div>
        )}
      </div>
    </motion.aside>
  );
};

export default Sidebar;