'use client'

import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { RootState } from '@/lib/store'
import { addToFavorites, removeFromFavorites } from '@/lib/features/contentSlice'
import { StarIcon, ExternalLinkIcon, PlayIcon } from '@/components/Icons'
import type { NewsItem, MovieItem, SocialPost } from '@/lib/features/contentSlice'

interface ContentCardProps {
  item: NewsItem | MovieItem | SocialPost
  type: 'news' | 'movie' | 'social'
  index: number
}

export function ContentCard({ item, type, index }: ContentCardProps) {
  const dispatch = useDispatch()
  const { favorites } = useSelector((state: RootState) => state.content)
  const [imageError, setImageError] = useState(false)
  
  const isFavorite = favorites.some(fav => fav.id === item.id)

  const handleToggleFavorite = () => {
    if (isFavorite) {
      dispatch(removeFromFavorites(item.id.toString()))
    } else {
      dispatch(addToFavorites(item))
    }
  }

  const getImageUrl = () => {
    if (type === 'news') {
      const newsItem = item as NewsItem
      return newsItem.urlToImage || '/placeholder-news.jpg'
    }
    if (type === 'movie') {
      const movieItem = item as MovieItem
      return movieItem.poster_path 
        ? `https://image.tmdb.org/3/w500${movieItem.poster_path}`
        : '/placeholder-movie.jpg'
    }
    return '/placeholder-social.jpg'
  }

  const getTitle = () => {
    if (type === 'news') return (item as NewsItem).title
    if (type === 'movie') return (item as MovieItem).title
    return `@${(item as SocialPost).author}`
  }

  const getDescription = () => {
    if (type === 'news') return (item as NewsItem).description
    if (type === 'movie') return (item as MovieItem).overview
    return (item as SocialPost).content
  }

  const getMetadata = () => {
    if (type === 'news') {
      const newsItem = item as NewsItem
      return {
        source: newsItem.source.name,
        date: new Date(newsItem.publishedAt).toLocaleDateString(),
      }
    }
    if (type === 'movie') {
      const movieItem = item as MovieItem
      return {
        rating: movieItem.vote_average.toFixed(1),
        date: new Date(movieItem.release_date).getFullYear(),
      }
    }
    const socialItem = item as SocialPost
    return {
      likes: socialItem.likes,
      date: new Date(socialItem.timestamp).toLocaleDateString(),
    }
  }

  const handleAction = () => {
    if (type === 'news') {
      window.open((item as NewsItem).url, '_blank')
    }
    // For movies and social posts, we could implement modal views or other actions
  }

  const metadata = getMetadata()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 
                 overflow-hidden card-hover group"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        {!imageError ? (
          <img
            src={getImageUrl()}
            alt={getTitle()}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-gray-400 text-sm">No image available</span>
          </div>
        )}
        
        {/* Favorite button */}
        <button
          onClick={handleToggleFavorite}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 
                     hover:bg-white dark:hover:bg-gray-800 transition-colors"
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <StarIcon 
            className={`w-5 h-5 ${isFavorite ? 'text-yellow-500' : 'text-gray-400'}`}
            filled={isFavorite}
          />
        </button>

        {/* Type badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            type === 'news' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
            type === 'movie' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
            'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          }`}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {getTitle()}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-3">
          {getDescription()}
        </p>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
          <div className="flex items-center space-x-2">
            {type === 'news' && (
              <>
                <span>{metadata.source}</span>
                <span>•</span>
                <span>{metadata.date}</span>
              </>
            )}
            {type === 'movie' && (
              <>
                <span>⭐ {metadata.rating}</span>
                <span>•</span>
                <span>{metadata.date}</span>
              </>
            )}
            {type === 'social' && (
              <>
                <span>❤️ {metadata.likes}</span>
                <span>•</span>
                <span>{metadata.date}</span>
              </>
            )}
          </div>
        </div>

        {/* Action button */}
        <button
          onClick={handleAction}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 
                     bg-primary-600 hover:bg-primary-700 text-white rounded-lg 
                     transition-colors text-sm font-medium"
        >
          {type === 'news' && (
            <>
              <span>Read More</span>
              <ExternalLinkIcon className="w-4 h-4" />
            </>
          )}
          {type === 'movie' && (
            <>
              <span>Watch Trailer</span>
              <PlayIcon className="w-4 h-4" />
            </>
          )}
          {type === 'social' && (
            <>
              <span>View Post</span>
              <ExternalLinkIcon className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </motion.div>
  )
}