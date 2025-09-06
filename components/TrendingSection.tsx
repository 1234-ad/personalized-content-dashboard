'use client';

import { motion } from 'framer-motion';
import { useAppSelector } from '@/lib/hooks/redux';
import ContentCard from './ContentCard';
import LoadingSpinner from './LoadingSpinner';

const TrendingSection = () => {
  const { trendingItems, loading } = useAppSelector((state) => state.content);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <svg className="w-8 h-8 text-orange-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          Trending Now
        </h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {trendingItems.length} trending items
        </div>
      </div>

      {trendingItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400 text-lg mb-2">No trending content available</div>
          <div className="text-gray-400 dark:text-gray-500">Check back later for trending updates</div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {trendingItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <ContentCard item={item} index={index} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Trending Categories */}
      <div className="mt-12">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Trending Categories
        </h3>
        <div className="flex flex-wrap gap-3">
          {['Technology', 'Sports', 'Finance', 'Entertainment', 'Health'].map((category, index) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-sm font-medium hover:from-blue-600 hover:to-purple-700 transition-all cursor-pointer"
            >
              #{category}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrendingSection;