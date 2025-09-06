'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/redux';
import { fetchNews, fetchRecommendations, fetchSocialPosts } from '@/lib/store/slices/contentSlice';
import Header from './Header';
import Sidebar from './Sidebar';
import ContentFeed from './ContentFeed';
import TrendingSection from './TrendingSection';
import FavoritesSection from './FavoritesSection';
import SearchResults from './SearchResults';
import SettingsPanel from './SettingsPanel';

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const { activeSection, darkMode, sidebarOpen, settingsOpen } = useAppSelector((state) => state.ui);
  const { preferences } = useAppSelector((state) => state.user);

  useEffect(() => {
    // Apply dark mode to document
    if (darkMode || preferences.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode, preferences.darkMode]);

  useEffect(() => {
    // Fetch initial content based on user preferences
    dispatch(fetchNews(preferences.categories));
    dispatch(fetchRecommendations(preferences.categories));
    dispatch(fetchSocialPosts(['tech', 'sports', 'finance']));
  }, [dispatch, preferences.categories]);

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'trending':
        return <TrendingSection />;
      case 'favorites':
        return <FavoritesSection />;
      case 'search':
        return <SearchResults />;
      default:
        return <ContentFeed />;
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 ${
      darkMode || preferences.darkMode ? 'dark' : ''
    }`}>
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-16'
        }`}>
          <div className="p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {renderActiveSection()}
            </motion.div>
          </div>
        </main>
      </div>

      {/* Settings Panel Overlay */}
      {settingsOpen && <SettingsPanel />}
    </div>
  );
};

export default Dashboard;