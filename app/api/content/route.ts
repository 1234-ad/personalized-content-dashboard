import { NextRequest, NextResponse } from 'next/server';

interface ContentRequest {
  type: 'news' | 'movies' | 'social';
  category?: string;
  query?: string;
  page?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: ContentRequest = await request.json();
    const { type, category, query, page = 1 } = body;

    let data;
    switch (type) {
      case 'news':
        data = await fetchNews(category, query, page);
        break;
      case 'movies':
        data = await fetchMovies(category, query, page);
        break;
      case 'social':
        data = await fetchSocialContent(category, query, page);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid content type' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Content API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

async function fetchNews(category?: string, query?: string, page: number = 1) {
  const apiKey = process.env.NEXT_PUBLIC_NEWS_API_KEY;
  if (!apiKey) {
    throw new Error('News API key not configured');
  }

  let url = 'https://newsapi.org/v2/';
  const params = new URLSearchParams({
    apiKey,
    page: page.toString(),
    pageSize: '20',
  });

  if (query) {
    url += 'everything';
    params.append('q', query);
  } else {
    url += 'top-headlines';
    params.append('country', 'us');
    if (category && category !== 'general') {
      params.append('category', category);
    }
  }

  const response = await fetch(`${url}?${params}`, {
    headers: {
      'User-Agent': 'PersonalizedContentDashboard/1.0',
    },
  });

  if (!response.ok) {
    throw new Error(`News API error: ${response.status}`);
  }

  const data = await response.json();
  return {
    articles: data.articles?.map((article: any) => ({
      id: article.url,
      title: article.title,
      description: article.description,
      url: article.url,
      image: article.urlToImage,
      source: article.source?.name,
      publishedAt: article.publishedAt,
      type: 'news',
    })) || [],
    totalResults: data.totalResults,
  };
}

async function fetchMovies(category?: string, query?: string, page: number = 1) {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  if (!apiKey) {
    throw new Error('TMDB API key not configured');
  }

  let endpoint = 'popular';
  const params = new URLSearchParams({
    api_key: apiKey,
    page: page.toString(),
  });

  if (query) {
    endpoint = 'search/movie';
    params.append('query', query);
  } else if (category) {
    switch (category) {
      case 'trending':
        endpoint = 'trending/movie/week';
        break;
      case 'top_rated':
        endpoint = 'top_rated';
        break;
      case 'upcoming':
        endpoint = 'upcoming';
        break;
      default:
        endpoint = 'popular';
    }
  }

  const url = `https://api.themoviedb.org/3/movie/${endpoint}?${params}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }

  const data = await response.json();
  return {
    movies: data.results?.map((movie: any) => ({
      id: movie.id,
      title: movie.title,
      description: movie.overview,
      image: movie.poster_path 
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : null,
      rating: movie.vote_average,
      releaseDate: movie.release_date,
      type: 'movie',
      url: `https://www.themoviedb.org/movie/${movie.id}`,
    })) || [],
    totalResults: data.total_results,
  };
}

async function fetchSocialContent(category?: string, query?: string, page: number = 1) {
  // Mock social media content since real APIs require complex authentication
  const mockPosts = [
    {
      id: `social-${page}-1`,
      title: 'Amazing sunset today! 🌅',
      description: 'Caught this beautiful sunset from my balcony. Nature never fails to amaze me.',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500',
      author: '@naturelover',
      platform: 'Instagram',
      likes: 1234,
      timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      type: 'social',
      url: '#',
    },
    {
      id: `social-${page}-2`,
      title: 'Just finished reading an amazing book! 📚',
      description: 'Highly recommend "The Midnight Library" - it really makes you think about life choices.',
      image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500',
      author: '@bookworm',
      platform: 'Twitter',
      likes: 567,
      timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      type: 'social',
      url: '#',
    },
    {
      id: `social-${page}-3`,
      title: 'New coffee shop discovery ☕',
      description: 'Found this hidden gem downtown. Best latte I\'ve had in months!',
      image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=500',
      author: '@coffeehunter',
      platform: 'Instagram',
      likes: 890,
      timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      type: 'social',
      url: '#',
    },
  ];

  // Filter by query if provided
  let filteredPosts = mockPosts;
  if (query) {
    filteredPosts = mockPosts.filter(post => 
      post.title.toLowerCase().includes(query.toLowerCase()) ||
      post.description.toLowerCase().includes(query.toLowerCase())
    );
  }

  return {
    posts: filteredPosts,
    totalResults: filteredPosts.length,
  };
}