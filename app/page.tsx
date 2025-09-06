'use client'

import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { RootState } from '@/lib/store'
import { fetchNews, fetchMovies, fetchSocialPosts, reorderContent } from '@/lib/features/contentSlice'
import { Header } from '@/components/Layout/Header'
import { Sidebar } from '@/components/Layout/Sidebar'
import { ContentCard } from '@/components/ContentCard'
import { LoadingSpinner } from '@/components/LoadingSpinner'

export default function Dashboard() {
  const dispatch = useDispatch()
  const { 
    news, 
    movies, 
    socialPosts, 
    favorites, 
    loading, 
    error,
    searchResults,
    searchLoading 
  } = useSelector((state: RootState) => state.content)
  const { preferences } = useSelector((state: RootState) => state.user)
  const { activeSection, searchQuery } = useSelector((state: RootState) => state.ui)

  useEffect(() => {
    // Fetch initial content based on user preferences
    dispatch(fetchNews(preferences.categories))
    dispatch(fetchMovies())
    dispatch(fetchSocialPosts())
  }, [dispatch, preferences.categories])

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const { source, destination } = result
    
    // Determine content type based on droppableId
    let contentType: 'news' | 'movies' | 'socialPosts'
    if (source.droppableId.includes('news')) contentType = 'news'
    else if (source.droppableId.includes('movies')) contentType = 'movies'
    else contentType = 'socialPosts'

    dispatch(reorderContent({
      sourceIndex: source.index,
      destinationIndex: destination.index,
      contentType,
    }))
  }

  const renderContent = () => {
    if (activeSection === 'search') {
      if (searchLoading) {
        return <LoadingSpinner message="Searching content..." />
      }
      
      if (searchQuery && searchResults.length === 0) {
        return (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No results found for "{searchQuery}"
            </p>
          </div>
        )
      }

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {searchResults.map((item, index) => (
            <ContentCard
              key={`search-${item.id}`}
              item={item}
              type={item.type}
              index={index}
            />
          ))}
        </div>
      )
    }

    if (activeSection === 'favorites') {
      if (favorites.length === 0) {
        return (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No favorites yet. Start adding content to your favorites!
            </p>
          </div>
        )
      }

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((item, index) => {
            const type = 'title' in item ? 'movie' : 'url' in item ? 'news' : 'social'
            return (
              <ContentCard
                key={`favorite-${item.id}`}
                item={item}
                type={type as any}
                index={index}
              />
            )
          })}
        </div>
      )
    }

    if (activeSection === 'trending') {
      // Show trending content (simplified - just show top items from each category)
      const trendingNews = news.slice(0, 4)
      const trendingMovies = movies.slice(0, 4)
      const trendingSocial = socialPosts.slice(0, 4)

      return (
        <div className="space-y-8">
          {trendingNews.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Trending News
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {trendingNews.map((item, index) => (
                  <ContentCard
                    key={`trending-news-${item.id}`}
                    item={item}
                    type="news"
                    index={index}
                  />
                ))}
              </div>
            </section>
          )}

          {trendingMovies.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Trending Movies
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {trendingMovies.map((item, index) => (
                  <ContentCard
                    key={`trending-movie-${item.id}`}
                    item={item}
                    type="movie"
                    index={index}
                  />
                ))}
              </div>
            </section>
          )}

          {trendingSocial.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Trending Social
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {trendingSocial.map((item, index) => (
                  <ContentCard
                    key={`trending-social-${item.id}`}
                    item={item}
                    type="social"
                    index={index}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )
    }

    // Default: Personalized Feed
    return (
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="space-y-8">
          {/* News Section */}
          {news.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Latest News
                {loading.news && <LoadingSpinner className="inline-block ml-2" size="sm" />}
              </h2>
              <Droppable droppableId="news-feed" direction="horizontal">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  >
                    {news.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <ContentCard item={item} type="news" index={index} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </section>
          )}

          {/* Movies Section */}
          {movies.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Recommended Movies
                {loading.movies && <LoadingSpinner className="inline-block ml-2" size="sm" />}
              </h2>
              <Droppable droppableId="movies-feed" direction="horizontal">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  >
                    {movies.slice(0, 8).map((item, index) => (
                      <Draggable key={item.id.toString()} draggableId={item.id.toString()} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <ContentCard item={item} type="movie" index={index} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </section>
          )}

          {/* Social Posts Section */}
          {socialPosts.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Social Feed
                {loading.social && <LoadingSpinner className="inline-block ml-2" size="sm" />}
              </h2>
              <Droppable droppableId="social-feed" direction="horizontal">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  >
                    {socialPosts.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <ContentCard item={item} type="social" index={index} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </section>
          )}
        </div>
      </DragDropContext>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                {activeSection === 'feed' ? 'Personalized Feed' : activeSection}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {activeSection === 'feed' && 'Your personalized content based on your preferences'}
                {activeSection === 'trending' && 'Discover what\'s trending across all categories'}
                {activeSection === 'favorites' && 'Your saved content for later viewing'}
                {activeSection === 'search' && searchQuery && `Search results for "${searchQuery}"`}
              </p>
            </div>

            {/* Content */}
            {renderContent()}

            {/* Error States */}
            {error.news && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                <p className="text-red-800 dark:text-red-200">Error loading news: {error.news}</p>
              </div>
            )}
            {error.movies && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                <p className="text-red-800 dark:text-red-200">Error loading movies: {error.movies}</p>
              </div>
            )}
            {error.social && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                <p className="text-red-800 dark:text-red-200">Error loading social posts: {error.social}</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}