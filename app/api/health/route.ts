import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check API connectivity
    const newsApiStatus = await checkNewsAPI();
    const tmdbApiStatus = await checkTMDBAPI();
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      apis: {
        newsapi: newsApiStatus,
        tmdb: tmdbApiStatus,
      },
      environment: process.env.NODE_ENV,
      uptime: process.uptime(),
    };

    return NextResponse.json(health, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

async function checkNewsAPI(): Promise<{ status: string; responseTime?: number }> {
  if (!process.env.NEXT_PUBLIC_NEWS_API_KEY) {
    return { status: 'not_configured' };
  }

  try {
    const start = Date.now();
    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?country=us&pageSize=1&apiKey=${process.env.NEXT_PUBLIC_NEWS_API_KEY}`,
      { 
        method: 'HEAD',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      }
    );
    const responseTime = Date.now() - start;
    
    return {
      status: response.ok ? 'healthy' : 'error',
      responseTime,
    };
  } catch (error) {
    return { status: 'error' };
  }
}

async function checkTMDBAPI(): Promise<{ status: string; responseTime?: number }> {
  if (!process.env.NEXT_PUBLIC_TMDB_API_KEY) {
    return { status: 'not_configured' };
  }

  try {
    const start = Date.now();
    const response = await fetch(
      `https://api.themoviedb.org/3/configuration?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`,
      { 
        method: 'HEAD',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      }
    );
    const responseTime = Date.now() - start;
    
    return {
      status: response.ok ? 'healthy' : 'error',
      responseTime,
    };
  } catch (error) {
    return { status: 'error' };
  }
}