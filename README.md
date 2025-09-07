# Personalized Content Dashboard

A modern, interactive dashboard for personalized content feeds built with React, Next.js, TypeScript, and Redux Toolkit. This application provides users with a customizable interface to track and interact with news, movie recommendations, and social media content from multiple sources.

![Dashboard Preview](https://via.placeholder.com/800x400/1f2937/ffffff?text=Personalized+Content+Dashboard)

## 🚀 Features

### Core Features
- **Personalized Content Feed**: Customizable content based on user preferences
- **Multi-Source Integration**: News API, TMDB API, and Social Media APIs
- **Interactive Content Cards**: Rich cards with images, descriptions, and actions
- **Drag & Drop Reordering**: Organize content cards with smooth animations
- **Advanced Search**: Debounced search across all content types
- **Favorites System**: Save and organize favorite content
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Optimized for desktop, tablet, and mobile

### Advanced Features
- **Redux Toolkit State Management**: Centralized state with persistence
- **Infinite Scrolling**: Efficient content loading
- **Real-time Updates**: Live content refresh
- **Accessibility**: WCAG compliant interface
- **Performance Optimized**: Debounced search, lazy loading
- **Testing Suite**: Unit, integration, and E2E tests

## 🛠️ Tech Stack

- **Frontend**: React 18, Next.js 13, TypeScript
- **State Management**: Redux Toolkit, Redux Persist
- **Styling**: Tailwind CSS, CSS Custom Properties
- **Animations**: Framer Motion, React Beautiful DnD
- **Testing**: Jest, React Testing Library, Cypress
- **APIs**: NewsAPI, TMDB API, Mock Social Media API
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- API Keys (see Environment Setup)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/1234-ad/personalized-content-dashboard.git
cd personalized-content-dashboard
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:

```env
# News API (https://newsapi.org/)
NEXT_PUBLIC_NEWS_API_KEY=your_news_api_key_here

# TMDB API (https://www.themoviedb.org/settings/api)
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key_here

# Optional: Social Media API keys
NEXT_PUBLIC_TWITTER_BEARER_TOKEN=your_twitter_bearer_token
NEXT_PUBLIC_INSTAGRAM_ACCESS_TOKEN=your_instagram_access_token
```

### 4. Run Development Server
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Testing
npm run test         # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
npm run cypress:open # Open Cypress E2E tests
npm run cypress:run  # Run Cypress tests headlessly
```

## 🏗️ Project Structure

```
personalized-content-dashboard/
├── app/                    # Next.js 13 app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main dashboard page
│   └── providers.tsx      # Redux and theme providers
├── components/            # React components
│   ├── Layout/           # Layout components
│   ├── ContentCard.tsx   # Content display cards
│   ├── ContentFeed.tsx   # Main content feed
│   ├── Dashboard.tsx     # Dashboard layout
│   ├── Header.tsx        # Top navigation
│   ├── Sidebar.tsx       # Side navigation
│   └── ...              # Other components
├── lib/                  # Utilities and configuration
│   ├── features/        # Redux slices
│   ├── services/        # API services
│   ├── hooks/           # Custom hooks
│   └── store/           # Redux store configuration
├── __tests__/           # Test files
├── cypress/             # E2E tests
└── public/              # Static assets
```

## 🎯 Key Features Walkthrough

### 1. User Preferences
- Configure content categories (Technology, Sports, Finance, etc.)
- Settings persist across sessions using Redux Persist
- Real-time content updates based on preferences

### 2. Content Sources
- **News**: Latest articles from NewsAPI based on categories
- **Movies**: Personalized recommendations from TMDB
- **Social**: Posts from Twitter/Instagram (mock implementation)

### 3. Interactive Dashboard
- **Drag & Drop**: Reorder content cards with React Beautiful DnD
- **Search**: Debounced search across all content types
- **Favorites**: Mark and organize favorite content
- **Trending**: Display popular content by category

### 4. Responsive Design
- Mobile-first approach with Tailwind CSS
- Adaptive layouts for different screen sizes
- Touch-friendly interactions

## 🧪 Testing

### Unit Tests
```bash
npm run test
```
Tests cover:
- Component rendering and interactions
- Redux state management
- API service functions
- Custom hooks

### Integration Tests
```bash
npm run test:coverage
```
Tests ensure:
- Component integration
- API data flow
- State persistence
- Error handling

### E2E Tests
```bash
npm run cypress:open
```
Tests include:
- User preference configuration
- Search functionality
- Drag and drop interactions
- Content favoriting
- Theme switching

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Manual Deployment
```bash
npm run build
npm run start
```

## 🔑 API Keys Setup

### NewsAPI
1. Visit [NewsAPI.org](https://newsapi.org/)
2. Sign up for free account
3. Get API key from dashboard
4. Add to `.env.local` as `NEXT_PUBLIC_NEWS_API_KEY`

### TMDB API
1. Visit [TMDB](https://www.themoviedb.org/settings/api)
2. Create account and request API key
3. Add to `.env.local` as `NEXT_PUBLIC_TMDB_API_KEY`

## 🎨 Customization

### Themes
- Modify `app/globals.css` for custom color schemes
- Update Tailwind config for design system changes
- Use CSS custom properties for dynamic theming

### Content Sources
- Add new API integrations in `lib/services/api.ts`
- Create corresponding Redux slices in `lib/features/`
- Update components to handle new content types

## 🐛 Troubleshooting

### Common Issues

**API Rate Limits**
- NewsAPI: 1000 requests/day on free tier
- TMDB: 40 requests/10 seconds
- Implement caching for production use

**CORS Issues**
- Use Next.js API routes for server-side API calls
- Configure proper headers in `next.config.js`

**Build Errors**
- Ensure all environment variables are set
- Check TypeScript types for API responses
- Verify all dependencies are installed

## 📈 Performance Optimizations

- **Code Splitting**: Automatic with Next.js
- **Image Optimization**: Next.js Image component
- **Debounced Search**: Reduces API calls
- **Lazy Loading**: Content loads on demand
- **Caching**: Redux state persistence

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [NewsAPI](https://newsapi.org/) for news data
- [TMDB](https://www.themoviedb.org/) for movie data
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Framer Motion](https://www.framer.com/motion/) for animations

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check existing documentation
- Review troubleshooting section

---

**Live Demo**: [https://personalized-content-dashboard.vercel.app](https://personalized-content-dashboard.vercel.app)

**Repository**: [https://github.com/1234-ad/personalized-content-dashboard](https://github.com/1234-ad/personalized-content-dashboard)