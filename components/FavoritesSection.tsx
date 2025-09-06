'use client';

import { motion } from 'framer-motion';
import { useAppSelector } from '@/lib/hooks/redux';
import ContentCard from './ContentCard';

const FavoritesSection = () => {
  const { favoriteItems } = useAppSelector((state) => state.content);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <svg className="w-8 h-8 text-red-500 mr-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          Your Favorites
        </h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {favoriteItems.length} saved items
        </div>
      </div>

      {favoriteItems.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No favorites yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Start adding content to your favorites by clicking the heart icon on any content card.
          </p>
          <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
            Explore Content
          </button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {favoriteItems.map((item, index) => (
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

      {/* Favorites Stats */}
      {favoriteItems.length > 0 && (
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-4">
          {['news', 'movie', 'music', 'social'].map((type) => {
            const count = favoriteItems.filter(item => item.type === type).length;
            const colors = {
              news: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
              movie: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
              music: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
              social: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
            };
            
            return (
              <motion.div
                key={type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className={`p-4 rounded-lg ${colors[type as keyof typeof colors]}`}
              >
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-sm capitalize">{type} favorites</div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FavoritesSection;