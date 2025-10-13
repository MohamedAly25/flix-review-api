# 🎬 Movie Review Platform — Frontend React Product Requirements Document (PRD)

## Table of Contents

*   [1. Project Overview](#1-project-overview)
*   [2. MVP Features (Frontend Focus)](#2-mvp-features-frontend-focus)
*   [3. Stretch Goals](#3-stretch-goals)
*   [4. System Architecture (Frontend)](#4-system-architecture-frontend)
*   [5. Entity Relationship Diagram (Backend Reference)](#5-entity-relationship-diagram-backend-reference)
*   [6. Technology Stack (Frontend)](#6-technology-stack-frontend)
*   [7. Security Measures (Frontend)](#7-security-measures-frontend)
*   [8. Recommendation System Plan (Backend Reference)](#8-recommendation-system-plan-backend-reference)
*   [9. Testing Strategy (Frontend)](#9-testing-strategy-frontend)
*   [10. Development Roadmap](#10-development-roadmap)
*   [11. Deployment Documentation (Frontend)](#11-deployment-documentation-frontend)
*   [12. Performance & Monitoring (Frontend)](#12-performance--monitoring-frontend)
*   [13. Success Criteria](#13-success-criteria)
*   [14. Timeline & Milestones](#14-timeline--milestones)
*   [15. API Endpoints Table (Backend Reference)](#15-api-endpoints-table-backend-reference)
*   [16. Summary](#16-summary)
*   [17. Strengths Analysis](#17-strengths-analysis)
*   [18. Implementation Guidelines (Frontend)](#18-implementation-guidelines-frontend)

## 1. Project Overview

A Movie Review Platform with a **React-based frontend** consuming a Django REST API backend. The goal is to deliver a clean, secure, and scalable frontend application with a **Netflix-inspired UI**, modular components, robust user experience, and JWT-based access control, providing core platform functionalities (Authentication, Movie Browsing, Reviewing) and a recommendation system.

*   **Project Scope:** Individual Development
*   **Target Audience:** Movie enthusiasts and casual viewers
*   **Primary Goal:** Create an immersive, secure, and scalable React frontend with a **Netflix-like visual style** that provides core platform functionalities (Authentication, Movie Browsing, Reviewing) with a focus on UX, modularity, and visual style, consuming the defined API endpoints.

## 2. MVP Features (Frontend Focus)

### 2.1 Authentication & User Management (Frontend Components)

*   **User Registration (`/register`):**
    *   Component: `RegistrationForm`
    *   Functionality: Collects username, email, password. Calls `POST /api/users/register/`. Handles success (redirect to login) and error states (validation messages).
*   **User Login (`/login`):**
    *   Component: `LoginForm`
    *   Functionality: Collects username/email, password. Calls `POST /api/users/login/`. Stores JWT in `localStorage`/`sessionStorage`. Updates global auth state via Context. Redirects on success.
*   **User Profile (`/profile`):**
    *   Component: `UserProfile`
    *   Functionality: Fetches profile using `GET /api/users/profile/` (requires auth). Displays user details. Provides an `EditProfileForm` using `PUT /api/users/profile/`. Includes a `DeleteAccountButton` triggering `DELETE /api/users/profile/` with confirmation. Accessible only to authenticated users.

### 2.2 Movie Management (Frontend Components - Netflix Style)

*   **Movie Listing (`/movies`, `/`):**
    *   Component: `HomePage` (or `MovieList`)
    *   Functionality: Fetches movies using `GET /api/movies/`. Displays them in **Netflix-style rows or carousels** (e.g., "Top Rated", "Trending Now", "New Releases") using `MovieRow` or `MovieCarousel` components containing `MovieCard` components. Implements filters (e.g., genre, rating, year) by passing query parameters to the API.
*   **Movie Detail (`/movies/:id`):**
    *   Component: `MovieDetail`
    *   Functionality: Fetches movie details using `GET /api/movies/{id}/`. Displays a **Netflix-style hero section** with backdrop image, title, overview, rating, and call-to-action buttons (e.g., "Play", "Add to List"). Displays related reviews fetched using `GET /api/reviews/movie/{title}/`.

### 2.3 Reviews & Ratings (Frontend Components)

*   **Review Display:**
    *   Component: `ReviewList` (used within `MovieDetail` or standalone)
    *   Functionality: Displays a list of reviews fetched from the API, using `ReviewCard` components.
*   **Review Creation (on Movie Detail):**
    *   Component: `ReviewForm`
    *   Functionality: Allows logged-in users to submit a review (content, rating) for the specific movie using `POST /api/reviews/`.
*   **Review Editing & Deletion (Owner Only):**
    *   Components: `EditReviewForm`, `DeleteReviewButton`
    *   Functionality: Allows the review owner to update (`PUT /api/reviews/{id}/`) or delete (`DELETE /api/reviews/{id}/`) their reviews. UI elements are conditional based on ownership check against the user's JWT.

### 2.4 Standardized API Responses (Frontend Handling)

*   Unified response format handling via custom hooks or utility functions.
*   Standardized error and loading state management across components.

### 2.5 Security (Frontend Implementation)

*   Secure JWT storage and retrieval (e.g., `localStorage` with consideration for XSS, `httpOnly` cookies are backend-side).
*   Protected routes in React Router to prevent unauthorized access to pages like `/profile`.
*   Conditional rendering based on authentication state and user roles (e.g., admin controls).

### 2.6 Recommendation System (MVP - Display - Netflix Style)

*   **Component:** `RecommendationRow` or `RecommendationCarousel`
*   **Functionality:** Fetches and displays recommendations using endpoints like `/api/recommendations/`, `/api/recommendations/trending/`, `/api/recommendations/top-rated/` (requires auth for personalized). Displayed in **distinct Netflix-style rows** on the homepage.

## 3. Stretch Goals

### 3.1 TMDB API Integration (Backend Responsibility)

*   Backend fetches movie data from TMDB automatically.
*   Frontend consumes this enriched data seamlessly.

### 3.2 Recommendation System (Advanced - Backend Responsibility)

*   More sophisticated algorithms on the backend.
*   Frontend displays results from enhanced backend endpoints.

### 3.3 Internationalization (i18n) - Frontend Focus

*   Support for multiple languages (e.g., English, Arabic).
*   Translation-ready components and content using libraries like `react-i18next`.
*   Locale-specific content delivery handled via API or context.

## 4. System Architecture (Frontend)

*   **Frontend Monorepo / Separate Repo:**
    *   `frontend/`
        *   `src/`
            *   `components/` (Reusable UI elements like `MovieCard`, `ReviewCard`, `Spinner`, `Modal`, `Toast`, `MovieRow`, `MovieCarousel`, `HeroSection`)
            *   `pages/` (Route-specific components like `Login`, `Register`, `HomePage`, `MovieDetail`, `Profile`)
            *   `hooks/` (Custom hooks like `useApi`, `useAuth`)
            *   `context/` (React Context providers like `AuthContext`, `ThemeContext`)
            *   `utils/` (Helper functions, API client configuration)
            *   `services/` (API interaction logic, e.g., `authService.js`, `movieService.js`)
            *   `styles/` (Tailwind configuration, global CSS)
            *   `App.js` (Main routing component)
            *   `main.jsx` (Entry point)
        *   `public/`
        *   `package.json`
        *   `vite.config.js` or `webpack.config.js`

## 5. Entity Relationship Diagram (Backend Reference)

*   The ERD remains the same as defined in the original PRD, representing the backend data model. The frontend consumes data structured according to these relationships via the API.

## 6. Technology Stack (Frontend)

### 6.1 Core Framework
*   `react`
*   `react-dom`
*   `react-router-dom` (v6 or later)

### 6.2 Styling
*   `tailwindcss` (aligned with user preference)

### 6.3 State Management
*   `react` (Context API, `useState`, `useReducer`)

### 6.4 Utilities & Enhancements
*   `axios` or `fetch` (for API calls)
*   `react-i18next` (for internationalization - Stretch Goal)
*   `heroicons` or `lucide-react` (for icons)
*   `framer-motion` (for Netflix-style animations and transitions)
*   `react-toastify` or `sonner` (for notifications)

### 6.5 Testing
*   `@testing-library/react`
*   `@testing-library/jest-dom`
*   `jest`

### 6.6 Development Tools
*   `vite` (or `create-react-app`)
*   `eslint`
*   `prettier`

## 7. Security Measures (Frontend)

### 7.1 Authentication Security (Frontend Implementation)
*   Store JWT securely in `localStorage` or `sessionStorage` (awareness of XSS risks).
*   Implement token expiration checks and redirect to login.
*   Use custom hooks (`useAuth`) to manage and provide auth state safely.

### 7.2 Application Security (Frontend Implementation)
*   Sanitize user-generated content displayed in reviews before rendering (if necessary, backend should primarily handle this).
*   Implement protected routes using React Router to prevent unauthorized navigation.
*   Validate user input on the client-side for UX, but rely on backend validation for security.

### 7.3 Environment Security (Frontend)
*   Use environment variables for API base URLs (e.g., `VITE_API_BASE_URL` for Vite).

## 8. Recommendation System Plan (Backend Reference)

*   The recommendation logic remains on the backend as defined in the original PRD. The frontend consumes the resulting movie lists from the appropriate API endpoints and displays them in a Netflix-like manner.

## 9. Testing Strategy (Frontend)

### 9.1 Testing Tools
*   `@testing-library/react` for component rendering and user interactions
*   `@testing-library/jest-dom` for assertions
*   `jest` for the testing framework

### 9.2 Testing Strategy
*   **Unit Tests:** Test individual React components (rendering, props, state changes, user interactions).
*   **Integration Tests:** Test API service calls, custom hooks (e.g., `useApi`), and complex component interactions.
*   **Snapshot Tests:** (Optional) Capture component output snapshots.

### 9.3 Code Quality
*   Use `eslint` and `prettier` for code linting and formatting.
*   Implement pre-commit hooks.

## 10. Development Roadmap

### 10.1 Phase 1: Foundation (Weeks 1-2)
*   Set up React project (Vite/Create React App).
*   Integrate Tailwind CSS.
*   Set up routing (React Router).
*   Create base layout (`App`, `MainLayout`, `Navbar`, `Theme Toggle`).
*   Implement `AuthContext` and basic theme context.
*   Create reusable UI components (`MovieCard`, `ReviewCard`, `Spinner`, `Toast`, `MovieRow`, `MovieCarousel`, `HeroSection`).

### 10.2 Phase 2: Authentication (Week 3)
*   Develop `LoginForm`, `RegistrationForm`, `UserProfile` pages/components.
*   Implement API client/service (`useApi` hook or `apiClient`).
*   Integrate JWT handling (storage, retrieval, API calls via hook/service).
*   Implement protected routes and conditional rendering in `Navbar`.

### 10.3 Phase 3: Core Features - Movies & Reviews (Weeks 4-5)
*   Create `HomePage` to display movies in Netflix-style rows/carousels (`MovieRow`, `MovieCarousel`).
*   Fetch and display movies using the API service.
*   Create `MovieDetail` page with a **Netflix-style hero section**.
*   Fetch and display movie details and reviews on the detail page.
*   Implement `ReviewForm` for creating reviews.
*   Implement owner-only edit/delete logic for reviews using `PUT`/`DELETE` API calls.

### 10.4 Phase 4: Enhancement & Polish (Week 6)
*   Add search/filter/pagination for movies/reviews (using API query params).
*   Implement loading states (`Spinner`), error handling (`Toast`), and empty states.
*   **Implement Netflix-style UI/UX refinements:** Smooth scrolling carousels, hover effects on `MovieCard` (e.g., scaling, info overlay), subtle animations (Framer Motion), responsive design for all screen sizes.
*   Implement recommendation display components (`RecommendationRow`).
*   Integrate animations for page transitions and component interactions.

### 10.5 Phase 5: Testing & Deployment (Week 7)
*   Conduct thorough manual testing of all flows, focusing on Netflix-style UI responsiveness and interactions.
*   Write unit/integration tests for critical components and hooks.
*   Prepare build for production (`npm run build`).
*   Document deployment steps for the React app.

## 11. Deployment Documentation (Frontend)

### 11.1 Environment Setup (Frontend)
*   Production environment variables (e.g., `VITE_API_BASE_URL`).
*   Build process configuration.

### 11.2 Deployment Platforms (Frontend)
*   Recommended: Vercel, Netlify, GitHub Pages (for static hosting).
*   Alternative: Serve via Nginx or similar web server.

### 11.3 Deployment Steps (Frontend)
*   Build the React application (`npm run build`).
*   Upload the generated `dist` or `build` folder contents to the hosting platform.
*   Configure the hosting platform to serve the `index.html` file for all routes (for client-side routing).

## 12. Performance & Monitoring (Frontend)

### 12.1 Performance Optimization (Frontend)
*   Optimize component rendering (React.memo, `useCallback`, `useMemo`).
*   Lazy load non-critical components using `React.lazy` and `Suspense`.
*   Optimize image loading (lazy loading, appropriate sizes from API, placeholder images).
*   Minimize bundle size.
*   Optimize Netflix-style carousels for performance (e.g., virtualization if lists are very long).

### 12.2 Monitoring Tools (Frontend)
*   Production: Sentry (Error tracking).
*   Browser DevTools: Performance profiling.

### 12.3 Logging Strategy (Frontend)
*   Use `console.log/warn/error` judiciously for development.
*   Consider integrating a frontend logging service for production error reporting (e.g., Sentry).

## 13. Success Criteria

### 13.1 Functional Requirements
- [ ] Users can register and authenticate via JWT
- [ ] Users can log in and maintain an authenticated session
- [ ] Users can view their profile information
- [ ] Users can update their profile information
- [ ] Users can delete their own account
- [ ] Users can browse a list of movies with pagination
- [ ] Users can view detailed information for a specific movie
- [ ] Users can submit a review (content and 1-5 rating) for a movie
- [ ] Users can view all reviews for a specific movie
- [ ] Users can edit their own reviews
- [ ] Users can delete their own reviews
- [ ] Users can see average ratings calculated for each movie
- [ ] Users can search for movies (if API supports query params)
- [ ] Users can filter movies (e.g., by genre, rating, year - if API supports query params)
- [ ] Users can see personalized recommendations on the homepage (if API endpoint available)
- [ ] Users can see trending/top-rated movies on the homepage (if API endpoints available)
- [ ] Proper access control prevents non-admins from creating/updating/deleting movies
- [ ] Proper access control prevents users from editing/deleting reviews they don't own
- [ ] The UI adapts to light/dark theme preference

### 13.2 Technical Requirements (Frontend)
- [ ] Frontend built with React and follows component-based architecture
- [ ] React Router handles navigation between pages
- [ ] Context API or similar manages global state (auth, theme)
- [ ] Reusable UI components are created (e.g., `MovieCard`, `ReviewCard`, `Spinner`, `Toast`, `Modal`)
- [ ] API calls are handled consistently (e.g., using Axios and custom hooks)
- [ ] JWT tokens are stored securely (e.g., `localStorage`) and attached to requests
- [ ] Protected routes prevent unauthorized access to pages like `/profile`
- [ ] Conditional rendering based on authentication state works correctly
- [ ] Loading states are displayed during API calls
- [ ] Error messages are handled gracefully and presented to the user (e.g., using Toast notifications)
- [ ] Empty states are displayed when lists are empty (e.g., "No reviews yet")
- [ ] The application is responsive and works on desktop, tablet, and mobile
- [ ] The Netflix-inspired UI/UX is implemented (e.g., rows/carousels, hero sections, animations)
- [ ] The application is built for production and deployed

### 13.3 Scalability & Performance Considerations (Frontend)
- [ ] Component rendering is optimized (e.g., `React.memo`, `useCallback`, `useMemo`)
- [ ] Large lists (e.g., movie rows) are potentially optimized for performance (e.g., virtual scrolling - Stretch Goal)
- [ ] Image loading is optimized (e.g., lazy loading)
- [ ] Bundle size is minimized
- [ ] The codebase follows modular and maintainable React practices
- [ ] Frontend is structured to allow for future features and internationalization (i18n)

## 14. Timeline & Milestones

### 14.1 Development Timeline
*   Week 1-2: Setup & Foundation (React, Tailwind, Routing, Context, Components, Netflix-style base components like `MovieCard`, `MovieRow`).
*   Week 3: Authentication Flow (Login, Register, Profile, JWT, Protected Routes).
*   Week 4: Core Features - Movies (Listing with Netflix rows/carousels, Detail View with hero section).
*   Week 5: Core Features - Reviews (Display, CRUD).
*   Week 6: Enhancement & Polish (Search/Filter/Pagination, Netflix UI/UX, Animations, Recommendations).
*   Week 7: Testing & Deployment Preparation.

### 14.2 Individual Developer Notes
*   Focus on MVP first.
*   Use GitHub Issues for task tracking.
*   Take regular breaks to avoid burnout.
*   Maintain consistent documentation.

## 15. API Endpoints Table (Backend Reference)

*   The API endpoints remain the same as defined in the original PRD. The React frontend will consume these endpoints using `fetch` or `axios`.

| Endpoint | Method | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `/api/users/register/` | POST | ❌ | User registration |
| `/api/users/login/` | POST | ❌ | JWT token generation |
| `/api/users/profile/` | GET | ✅ | Get user profile |
| `/api/users/profile/` | PUT | ✅ | Update user profile |
| `/api/users/profile/` | DELETE | ✅ | Delete user account |
| `/api/movies/` | GET | ❌ | List movies with filters |
| `/api/movies/` | POST | ✅ (Admin) | Create new movie |
| `/api/movies/{id}/` | GET | ❌ | Movie details + stats |
| `/api/movies/{id}/` | PUT | ✅ (Admin) | Update movie |
| `/api/movies/{id}/` | DELETE | ✅ (Admin) | Delete movie |
| `/api/reviews/` | GET | ❌ | List reviews with filters |
| `/api/reviews/` | POST | ✅ | Create review |
| `/api/reviews/{id}/` | GET | ❌ | Review details |
| `/api/reviews/{id}/` | PUT | ✅ (Owner) | Update review |
| `/api/reviews/{id}/` | DELETE | ✅ (Owner) | Delete review |
| `/api/reviews/movie/{title}/` | GET | ❌ | Reviews by movie |
| `/api/reviews/search/` | GET | ❌ | Search reviews |

## 16. Summary

This document covers:

*   A clear, step-by-step MVP plan for a React frontend with a **Netflix-inspired UI**.
*   A clean and scalable frontend architecture using React principles.
*   Security best practices for frontend authentication and access control.
*   A roadmap for core features and stretch goals.
*   Documentation and tooling ready for professional development.
*   Testing strategy for frontend quality assurance.
*   Deployment guidelines for the React application.
*   Performance considerations for the frontend application.
*   A timeline suitable for individual developer execution.
*   Internationalization support planned for future expansion.
*   A comprehensive logging and monitoring strategy outline.
*   Detailed alignment with the existing backend API endpoints.

This PRD serves as your frontend project's roadmap. Update it as the project evolves and requirements change.

## 17. Strengths Analysis

### 17.1 Technical Strengths
*   ✅ **Component-Based Architecture:** React promotes reusability and maintainability.
*   ✅ **State Management:** Using Context API and hooks aligns with React best practices.
*   ✅ **Security Awareness:** Planning for JWT handling and protected routes.
*   ✅ **Strong Tech Stack:** Industry-standard tools for React development, styling, and routing.
*   ✅ **Clear Roadmap:** Defined phases from setup to deployment.
*   ✅ **UI/UX Focus:** Explicitly targeting a popular and well-understood UI pattern (Netflix).

### 17.2 Project Management Strengths
*   ✅ **Future Vision:** Clear MVP with defined stretch goals.
*   ✅ **Individual Developer Friendly:** Organized phases and tasks suitable for solo development.

## 18. Implementation Guidelines (Frontend)

### 18.1 Project Setup
*   Initialize the project using `npm create vite@latest my-app -- --template react` (or `--template react-ts` for TypeScript).
*   Install dependencies listed in the Tech Stack section, including `framer-motion` and `react-toastify`/`sonner`.

### 18.2 Individual Developer Best Practices
*   Use Git with GitHub/GitLab for version control and backup.
*   Use GitHub Issues for task management within the frontend repository.
*   Take regular breaks to maintain productivity.
*   Write unit tests for critical components and hooks.

### 18.3 Netflix-Style UI Implementation Guidelines
*   **Layout:** Use Tailwind CSS grid and flexbox for responsive row layouts (`MovieRow`).
*   **Carousels:** Implement horizontal scrolling lists (`MovieCarousel`) using `overflow-x-auto` or libraries like `react-slick` or `embla-carousel-react` for advanced features.
*   **Cards:** Style `MovieCard` with hover effects (e.g., `hover:scale-110`, `hover:z-10`) and ensure images are appropriately sized.
*   **Hero Section:** Use large background images (`bg-cover`, `bg-center`) with text overlay on the `MovieDetail` page.
*   **Animations:** Use `framer-motion` for smooth transitions between pages, component mounts, and interactive elements (e.g., button hover, modal open/close).
*   **Color Palette:** Adhere to the dark gray and accent red color scheme for a cinematic feel.
*   **Typography:** Choose fonts that complement the cinematic theme (e.g., sans-serif for readability).

### 18.4 Internationalization Setup (Stretch Goal)
*   Install `react-i18next` and `i18next`.
*   Configure i18n instance in `src/i18n.js`.
*   Create translation files (e.g., `locales/en/translation.json`, `locales/ar/translation.json`).
*   Wrap translatable text with `t` function from `react-i18next`.

### 18.5 Monitoring Setup (Frontend)
*   **Development:** Browser DevTools for debugging and performance analysis.
*   **Production:** Integrate Sentry for error tracking (requires account setup and SDK installation).