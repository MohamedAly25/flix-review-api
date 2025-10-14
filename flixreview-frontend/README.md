# 🎬 FlixReview Frontend

**Next.js 15 Movie Review Application with Netflix-Inspired UI**

A modern, responsive movie review platform built with Next.js 15, TypeScript, and a premium Netflix-inspired design system. Features user authentication, movie browsing with TMDB posters, profile management with avatars, and a comprehensive review system.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Backend API running (see [Backend Setup](../flix-review-api/README.md))

### Installation

1. **Install dependencies**
   ```bash
   cd flixreview-frontend
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API URL
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open browser**
   ```
   http://localhost:3000
   ```

---

## 📋 Features

### 🎨 **NEW: Netflix-Inspired Design**
- **Dark Theme** - Immersive #141414 background with #181818 cards
- **Red Accent** - #E50914 CTAs and highlights
- **Inter Font** - Professional typography with proper hierarchy
- **Smooth Animations** - Hover effects and transitions
- **Responsive Layout** - 1280px max-width centered container

### 🖼️ **NEW: Image Handling**
- **Movie Posters** - TMDB integration with lazy loading
- **User Avatars** - Upload and display profile pictures
- **Image Optimization** - Next.js Image component
- **File Validation** - 5MB limit, image types only

### 🎬 Movie Features
- **Movie Browsing** - Grid view with poster images
- **Search** - Find movies by title
- **Genre Filtering** - Filter by movie genres
- **Movie Details** - Cinematic two-column layout
- **Pagination** - Navigate through movie listings
- **Ratings Display** - Star ratings with review counts

### 👤 User Features
- **User Registration** - Create new accounts
- **User Login** - Secure JWT authentication
- **Profile Page** - Complete user profile management
- **Avatar Upload** - Upload and manage profile pictures
- **Review System** - Create, edit, and delete reviews
- **Personal Reviews** - Manage your own reviews

### 🔧 Technical Features
- **API Integration** - RESTful API with Django backend
- **State Management** - React Query for server state
- **Error Handling** - Comprehensive error boundaries
- **Loading States** - Smooth loading indicators
- **Form Validation** - Client-side validation
- **Type Safety** - Full TypeScript coverage

---

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with Inter font
│   ├── page.tsx           # Netflix-inspired landing page
│   ├── globals.css        # Complete design system CSS
│   ├── login/             # Authentication pages
│   ├── register/          # User registration
│   ├── profile/           # ✅ NEW: User profile page
│   └── movies/            # Movie browsing pages
│       ├── page.tsx       # Movies grid with posters
│       └── [id]/          # Movie detail with cinematic layout
│
├── components/            # Reusable React components
│   ├── auth/              # Authentication components
│   │   ├── ProtectedRoute.tsx
│   │   └── AvatarUpload.tsx  # ✅ NEW: Avatar upload
│   ├── layout/            # Layout components
│   │   ├── Header.tsx     # Dark header with avatar display
│   │   └── Footer.tsx     # Dark footer
│   ├── movies/            # Movie components
│   │   └── MovieCard.tsx  # Card with poster & hover effects
│   ├── reviews/           # Review components
│   │   ├── ReviewForm.tsx
│   │   └── ReviewCard.tsx
│   └── ui/                # UI primitives
│       ├── Button.tsx
│       ├── Card.tsx
│       └── Spinner.tsx
│
├── services/              # API integration services
│   ├── auth.ts            # Authentication service (+ image upload)
│   ├── movies.ts          # Movies API service
│   └── reviews.ts         # Reviews API service
│
├── types/                 # TypeScript type definitions
│   ├── auth.ts            # User + profile_picture_url
│   ├── movie.ts           # Movie + poster_url
│   ├── review.ts          # Review types
│   └── api.ts             # API response types
│
├── hooks/                 # Custom React hooks
│   ├── useMovies.ts       # Movies data hook
│   └── useReviews.ts      # Reviews data hook
│
├── contexts/              # React contexts
│   └── AuthContext.tsx    # Auth + updateProfile
│
├── lib/                   # Utility libraries
│   ├── api/
│   │   └── client.ts      # Axios configuration
│   └── react-query/
│       └── config.ts      # React Query setup
│
└── utils/                 # Additional utilities
    └── helpers.ts         # Helper functions
```

---

## 🎨 Design System

### Color Palette (Netflix-Inspired)
```css
--flix-bg-primary: #141414;    /* Dark BG */
--flix-bg-secondary: #181818;  /* Cards, Sections */
--flix-text-primary: #FFFFFF;  /* Primary Text */
--flix-text-secondary: #808080; /* Muted Text */
--flix-accent: #E50914;        /* Red Accent for CTAs */
--flix-border: #333333;        /* Subtle Borders */
```

### Typography
```css
--font-primary: 'Inter', sans-serif;

.flix-h1 { font-size: 2rem; font-weight: 700; }    /* 32px */
.flix-h2 { font-size: 1.5rem; font-weight: 600; }  /* 24px */
.flix-body { font-size: 1rem; font-weight: 400; }   /* 16px */
.flix-muted { font-size: 0.875rem; color: #808080; } /* 14px */
```

### Components
```css
.flix-card         /* Dark card with hover lift effect */
.flix-btn-primary  /* Red CTA button */
.flix-btn-secondary /* Outline button */
.flix-search       /* Rounded search input */
.flix-container    /* Max 1280px centered container */
```

---

## 🔧 Configuration

### Environment Variables

Create `.env.local` in the frontend root:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api

# Application settings
NEXT_PUBLIC_APP_NAME=FlixReview
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Next.js Configuration

**Image Optimization** (`next.config.ts`):
```typescript
export default {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        port: '',
        pathname: '/t/p/**',
      },
    ],
  },
};
```

### TypeScript Configuration

Strict TypeScript settings in `tsconfig.json`:
- Strict type checking enabled
- Path mapping for clean imports (`@/`)
- Next.js specific configurations

---

## 🚀 Development

### Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Type checking
npm run type-check
```

### Development Workflow

1. **Start backend API** (port 8000)
2. **Start frontend dev server** (port 3000)
3. **Make changes** - Hot reload enabled
4. **Test features** - Browser dev tools
5. **Check types** - `npm run type-check`

---

## 🔌 API Integration

### Service Architecture

Services automatically handle Django response wrapping:

```typescript
// Backend response format
{
  "success": true,
  "message": "Operation successful",
  "data": { /* actual data */ }
}

// Service unwraps automatically
export const getMovies = async (params?: MovieFilters) => {
  const response = await api.get('/movies/', { params });
  return response.data.data || response.data;
};
```

### Authentication

JWT-based authentication:
- **Access tokens** for API requests
- **Refresh tokens** for renewal
- **Automatic logout** on expiry
- **Profile updates** with FormData for images

### Image Upload

```typescript
// Avatar upload example
const formData = new FormData();
formData.append('profile_picture', file);
await updateProfile(formData);
```

---

## 🎬 Key Features Implementation

### Movie Posters
- **TMDB Integration**: Poster URLs from The Movie Database
- **Next.js Optimization**: Automatic image optimization
- **Lazy Loading**: Images load as they enter viewport
- **Fallbacks**: Graceful handling of missing posters

### User Avatars
- **Upload Component**: File selection with validation
- **Size Limit**: 5MB maximum
- **Type Validation**: Image types only (jpg, png, gif)
- **Display**: Header, profile page, review cards

### Netflix UI/UX
- **Dark Theme**: Consistent across all pages
- **Hover Effects**: Scale animations on cards
- **Typography**: Inter font with clear hierarchy
- **Spacing**: 4px increment scale (16, 32, 48, 64px)

---

## 🧪 Testing

### Test Strategy

```bash
# Run tests
npm test

# Coverage report
npm run test:coverage

# Watch mode
npm run test:watch
```

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Movie browsing with posters
- [ ] Search and genre filtering
- [ ] Movie details display
- [ ] Review creation/editing/deletion
- [ ] Avatar upload and display
- [ ] Profile page management
- [ ] Responsive design on mobile

---

## 🚀 Deployment

### Production Build

```bash
npm run build
npm start
```

### Vercel Deployment (Recommended)

```bash
vercel deploy
```

### Environment Variables (Production)

```env
NEXT_PUBLIC_API_URL=https://api.flixreview.com/api
NEXT_PUBLIC_APP_URL=https://flixreview.com
```

---

## 🔧 Troubleshooting

### Common Issues

**Image Not Loading**
- Check TMDB domain in `next.config.ts`
- Verify image URL is valid
- Check Next.js Image component props

**Avatar Upload Fails**
- Check file size (max 5MB)
- Verify file type is image
- Check backend media settings

**Dark Theme Not Applied**
- Clear browser cache
- Check `globals.css` loaded
- Verify CSS variable definitions

**API Connection Failed**
- Check backend running on port 8000
- Verify `NEXT_PUBLIC_API_URL`
- Check CORS configuration

---

## 📚 Resources

### Documentation
- [Next.js 15 Docs](https://nextjs.org/docs)
- [React Query](https://tanstack.com/query)
- [TypeScript Handbook](https://typescriptlang.org/docs)
- [Inter Font](https://fonts.google.com/specimen/Inter)

### Design Reference
- [Netflix UI Patterns](https://www.netflix.com)
- [Color Psychology](https://www.netflix.com/brand)

---

## 🤝 Contributing

1. Follow Netflix-inspired design patterns
2. Maintain TypeScript type safety
3. Add tests for new features
4. Update documentation
5. Submit pull request

---

## 📄 License

This project is part of the FlixReview full-stack application.

---

**Built with ❤️ using Next.js 15, TypeScript, and Netflix-Inspired Design**

🎬 **Features**: Authentication • Movies • Reviews • Avatars • Premium UI

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Backend API running (see [Backend Setup](../flix-review-api/README.md))

### Installation

1. **Install dependencies**
   ```bash
   cd flixreview-frontend
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API URL
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open browser**
   ```
   http://localhost:3000
   ```

---

## 📋 Features

### 🎭 User Experience
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Modern UI** - Clean, intuitive interface with Tailwind CSS
- **Fast Loading** - Optimized with Next.js 15 App Router
- **Type Safety** - Full TypeScript coverage

### 🎬 Movie Features
- **Movie Browsing** - Grid view of all movies
- **Search** - Find movies by title
- **Genre Filtering** - Filter by movie genres
- **Movie Details** - Detailed movie information
- **Pagination** - Navigate through movie listings

### 👤 User Features
- **User Registration** - Create new accounts
- **User Login** - Secure authentication
- **Profile Management** - View user information
- **Review System** - Create, edit, and delete reviews
- **Personal Reviews** - Manage your own reviews

### 🔧 Technical Features
- **API Integration** - RESTful API with Django backend
- **State Management** - React Query for server state
- **Error Handling** - Comprehensive error boundaries
- **Loading States** - Smooth loading indicators
- **Form Validation** - Client-side validation

---

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Home page
│   ├── login/             # Authentication pages
│   ├── register/          # User registration
│   ├── movies/            # Movie browsing pages
│   │   ├── page.tsx       # Movies list
│   │   └── [id]/          # Movie detail pages
│   └── globals.css        # Global styles
│
├── components/            # Reusable React components
│   ├── MovieCard.tsx      # Movie display card
│   ├── MovieGrid.tsx      # Movie grid layout
│   ├── SearchBar.tsx      # Search input component
│   ├── ReviewForm.tsx     # Review creation form
│   ├── LoadingSpinner.tsx # Loading indicator
│   └── ErrorMessage.tsx   # Error display
│
├── services/              # API integration services
│   ├── api.ts             # Base API configuration
│   ├── auth.ts            # Authentication service
│   ├── movies.ts          # Movies API service
│   └── reviews.ts         # Reviews API service
│
├── types/                 # TypeScript type definitions
│   ├── index.ts           # Main type exports
│   ├── movie.ts           # Movie-related types
│   ├── review.ts          # Review-related types
│   └── user.ts            # User-related types
│
├── hooks/                 # Custom React hooks
│   ├── useAuth.ts         # Authentication hook
│   ├── useMovies.ts       # Movies data hook
│   └── useReviews.ts      # Reviews data hook
│
├── contexts/              # React contexts
│   └── AuthContext.tsx    # Authentication context
│
├── lib/                   # Utility libraries
│   └── utils.ts           # Helper functions
│
└── utils/                 # Additional utilities
    └── constants.ts       # Application constants
```

---

## 🔧 Configuration

### Environment Variables

Create `.env.local` in the frontend root:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api

# Application settings
NEXT_PUBLIC_APP_NAME=FlixReview
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### TypeScript Configuration

The project uses strict TypeScript settings in `tsconfig.json`:
- Strict type checking enabled
- Path mapping for clean imports
- Next.js specific configurations

### Tailwind CSS

Custom Tailwind configuration in `tailwind.config.js`:
- Custom color palette
- Responsive breakpoints
- Component utilities

---

## 🚀 Development

### Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Type checking
npm run type-check
```

### Development Workflow

1. **Start backend API** (see backend README)
2. **Start frontend development server**
3. **Make changes** - Hot reload enabled
4. **Test features** - Use browser dev tools
5. **Run linting** - `npm run lint`
6. **Type check** - `npm run type-check`

### Code Quality

- **ESLint** - Code linting and formatting
- **TypeScript** - Type checking
- **Prettier** - Code formatting (via ESLint)

---

## 🔌 API Integration

### Service Architecture

The frontend communicates with the Django REST API through dedicated service modules:

```typescript
// Example: Movies service
import { api } from './api';

export const getMovies = async (params?: MovieFilters) => {
  const response = await api.get('/movies/', { params });
  return response.data.data || response.data; // Handle Django response wrapping
};
```

### Response Handling

The backend wraps all responses in a standard format:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* actual data */ }
}
```

Frontend services automatically unwrap this format:
```typescript
// Services handle response unwrapping
return response.data.data || response.data;
```

### Authentication

JWT-based authentication with automatic token handling:
- Access tokens for API requests
- Refresh token for token renewal
- Automatic logout on token expiry

---

## 🎨 UI Components

### Design System

- **Colors**: Custom palette with dark/light mode support
- **Typography**: Consistent font hierarchy
- **Spacing**: Standardized spacing scale
- **Components**: Reusable component library

### Responsive Design

- **Mobile-first** approach
- **Breakpoint system**: sm, md, lg, xl
- **Flexible layouts** with CSS Grid and Flexbox

### Accessibility

- **Semantic HTML** structure
- **ARIA labels** where needed
- **Keyboard navigation** support
- **Screen reader** compatibility

---

## 🧪 Testing

### Test Setup

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Testing Strategy

- **Unit Tests** - Component and utility testing
- **Integration Tests** - API service testing
- **E2E Tests** - User flow testing (planned)

---

## 🚀 Deployment

### Build Process

```bash
# Create production build
npm run build

# The build artifacts will be stored in the `dist/` directory
```

### Deployment Options

- **Vercel** - Recommended for Next.js apps
- **Netlify** - Alternative hosting platform
- **Docker** - Containerized deployment
- **Static Export** - For static hosting

### Environment Configuration

Set production environment variables:
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
NEXT_PUBLIC_APP_URL=https://your-frontend-domain.com
```

---

## 🔧 Troubleshooting

### Common Issues

**API Connection Failed**
- Check backend is running on correct port
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- Check CORS configuration in backend

**Authentication Issues**
- Clear browser localStorage
- Check JWT token expiry
- Verify backend authentication endpoints

**Build Errors**
- Run `npm install` to update dependencies
- Check TypeScript errors with `npm run type-check`
- Clear `.next` cache: `rm -rf .next`

### Debug Mode

Enable debug logging:
```env
NEXT_PUBLIC_DEBUG=true
```

---

## 📚 Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [React Query Documentation](https://tanstack.com/query)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://typescriptlang.org/docs)

### Backend Integration
- [Backend API Documentation](../flix-review-api/docs/API.md)
- [Authentication Guide](../flix-review-api/docs/API.md#authentication)

---

## 🤝 Contributing

1. Follow the existing code style
2. Add TypeScript types for new features
3. Update documentation for API changes
4. Test your changes thoroughly
5. Submit a pull request

---

## 📄 License

This project is part of the FlixReview full-stack application.

---

**Built with ❤️ using Next.js 15, TypeScript, and Tailwind CSS**
