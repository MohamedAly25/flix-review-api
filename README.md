# 🎬 FlixReview - Professional Movie Review Platform

> **Production-ready Netflix-inspired movie review platform** built with Next.js 15 and Django REST Framework, featuring comprehensive social features, professional admin dashboard, and complete API documentation.

[![Version](https://img.shields.io/badge/version-0.3.0-blue.svg)](https://github.com/MohamedAly25/flix-review)
[![Status](https://img.shields.io/badge/status-stable-success.svg)](https://github.com/MohamedAly25/flix-review)
[![License](https://img.shields.io/badge/license-MIT-yellow.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15.5.5-black)](https://nextjs.org/)
[![Django](https://img.shields.io/badge/Django-5.2.7-green)](https://djangoproject.com/)

## 🚀 Quick Start

### Automated Launch (Recommended)
```powershell
./START_SERVERS.ps1
```
Launches both servers and opens all access points automatically.

### Manual Alternative
```bash
# Terminal 1 - Backend
cd flixreview-backend && python manage.py runserver

# Terminal 2 - Frontend  
cd flixreview-frontend && npm run dev
```

---

## 🌟 What's New in v0.3.0 - Professional Edition

### 🎨 **Enhanced Admin Dashboard**
- Interactive statistics dashboard with real-time metrics
- Chart.js visualizations for ratings and activity trends
- Beautiful UI with purple-cyan gradient theme
- Mobile-responsive layouts throughout
- Quick stats for users, movies, reviews, and genres

### 📚 **Comprehensive API Documentation**
- Professional landing page at `/api/docs/`
- Interactive Swagger UI at `/api/swagger/`
- Complete JWT authentication workflow
- Ready-to-use cURL commands and examples
- Organized endpoint reference by resource type

### 💬 **Social Features**
- **Review Likes**: Like/unlike reviews with real-time updates
- **Review Comments**: Full comment system with pagination
- **User Discovery**: Browse community members and profiles
- **Most Liked Reviews**: Leaderboard with rankings and medals
- **User Profiles**: Detailed user pages with review history

### 🔧 **Technical Improvements**
- Fixed all template syntax errors
- Corrected URL routing issues
- Enhanced admin navigation
- Added quick action buttons
- Improved user experience

---

## ✨ Core Features

### 🔐 Authentication & User Management
- **JWT Token Authentication** with refresh flow
- **User Registration** with email validation
- **Profile Management** with avatar uploads and bio editing
- **Password Security** with strength validation
- **Rate Limiting** protection against abuse

### 🎬 Movie Management
- **TMDB Integration** for movie data and posters
- **Advanced Search** with genre filters and sorting
- **Trending & Recent Feeds** with personalized recommendations
- **Movie Details** with comprehensive information
- **Genre-based Filtering** for easy discovery

### ⭐ Review System
- **5-Star Rating System** with visual feedback
- **Full CRUD Operations** for reviews
- **Single Review per User/Movie** constraint
- **Review Editing** with edit indicators
- **Review Search** with multiple filters

### 💬 Social Features
- **Review Likes** with heart animations
- **Review Comments** with threaded discussions
- **User Discovery** with search and profiles
- **Most Liked Reviews** leaderboard
- **Community Engagement** tools

### 🎨 User Interface
- **Netflix-inspired Design** with dark theme
- **Cinematic Hero Sections** with movie backdrops
- **Staggered Carousels** for content discovery
- **Responsive Design** for all devices
- **Keyboard Navigation** support
- **Loading States** and error handling

### 🛠️ Admin Dashboard
- **Real-time Statistics** with interactive charts
- **User Management** with detailed analytics
- **Content Moderation** tools
- **Performance Metrics** and insights
- **Quick Action Buttons** for common tasks

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 15.5.5** (App Router + Turbopack)
- **React 19.2.0** with TypeScript 5.6.3
- **TanStack Query 5.90.3** for server state management
- **Tailwind CSS 4.x** for styling
- **React Hook Form 7.65.0** for form handling
- **Axios 1.12.2** for API communication

### Backend
- **Django 5.2.7** web framework
- **Django REST Framework 3.16.1** for API
- **SimpleJWT 5.5.1** for authentication
- **TMDB API Integration** for movie data
- **Scikit-learn 1.6.1** for ML recommendations
- **Pillow 11.3.0** for image processing

### Database & Storage
- **SQLite** (development)
- **PostgreSQL** (production ready)
- **Media Files** with proper handling
- **Database Indexing** for performance

---

## 📦 Project Structure

```
FlixReview/
├── flixreview-frontend/          # Next.js 15 App Router
│   ├── src/
│   │   ├── app/                  # Pages & routes
│   │   │   ├── reviews/          # Review pages
│   │   │   ├── users/           # User pages
│   │   │   └── my-reviews/      # Personal dashboard
│   │   ├── components/          # React components
│   │   │   ├── layout/          # Header, navigation
│   │   │   ├── reviews/         # Review components
│   │   │   └── users/           # User components
│   │   ├── contexts/            # AuthContext, etc.
│   │   ├── services/            # API client layer
│   │   └── types/               # TypeScript definitions
│   └── public/                  # Static assets
│
├── flixreview-backend/           # Django REST API
│   ├── accounts/                # User auth & profiles
│   ├── movies/                  # Movie models & TMDB sync
│   ├── reviews/                 # Review system with likes/comments
│   ├── recommendations/         # Personalized feeds
│   ├── common/                  # Shared utilities
│   ├── templates/               # Admin templates
│   └── requirements/            # Python dependencies
│
├── postman/                     # API testing collection
│   ├── flix-review-api.postman_collection.json
│   ├── run-all.bat             # Test automation
│   └── reports/                # Test reports
│
├── docs/                       # Comprehensive documentation
└── START_SERVERS.ps1           # Automated startup script
```

---

## 🔗 Access Points

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Main application interface |
| **Backend API** | http://127.0.0.1:8000/api/ | REST API endpoints |
| **API Documentation** | http://127.0.0.1:8000/api/docs/ | 📚 Professional API docs |
| **Swagger UI** | http://127.0.0.1:8000/api/swagger/ | 🔄 Interactive API testing |
| **API Schema** | http://127.0.0.1:8000/api/schema/ | OpenAPI schema |
| **Admin Panel** | http://127.0.0.1:8000/admin/ | 🎨 Enhanced dashboard |
| **Admin Dashboard** | http://127.0.0.1:8000/admin/dashboard/ | 📊 Statistics & analytics |

### Default Credentials

**Admin Access:**
- Username: `admin`
- Password: `admin123`

**Test Users:**
- `john_doe` / `password123`
- `jane_smith` / `password123`

---

## 🚀 Installation & Setup

### Prerequisites
- **Node.js 18+** and npm
- **Python 3.11+** and pip
- **Git** for version control

### Backend Setup
```bash
# Clone repository
git clone https://github.com/MohamedAly25/flix-review.git
cd flix-review

# Setup backend
cd flixreview-backend
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements/base.txt

# Setup database
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend Setup
```bash
# Setup frontend (in new terminal)
cd flixreview-frontend
npm install
npm run dev
```

### Automated Setup
```powershell
# Windows PowerShell
./START_SERVERS.ps1
```

---

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/accounts/register/` - User registration
- `POST /api/accounts/login/` - User login
- `POST /api/accounts/token/refresh/` - Refresh JWT token
- `GET /api/accounts/profile/` - Get user profile
- `PUT /api/accounts/profile/` - Update profile
- `DELETE /api/accounts/profile/` - Delete account

### Review Endpoints
- `GET /api/reviews/` - List all reviews (paginated)
- `POST /api/reviews/` - Create new review
- `GET /api/reviews/{id}/` - Get specific review
- `PATCH /api/reviews/{id}/` - Update review
- `DELETE /api/reviews/{id}/` - Delete review
- `GET /api/reviews/most-liked/` - Most liked reviews

### Social Features
- `POST /api/reviews/{id}/like/` - Like a review
- `DELETE /api/reviews/{id}/like/` - Unlike a review
- `GET /api/reviews/{id}/comments/` - List comments
- `POST /api/reviews/{id}/comments/` - Add comment
- `GET /api/users/` - List all users
- `GET /api/users/{username}/` - Get user profile

### Movie Endpoints
- `GET /api/movies/` - List movies with filters
- `GET /api/movies/{id}/` - Get movie details
- `GET /api/movies/search/` - Search movies
- `GET /api/movies/trending/` - Trending movies
- `GET /api/movies/recommendations/` - Personalized recommendations

---

## 🧪 Testing

### Backend Testing
```bash
cd flixreview-backend
python manage.py test
python manage.py test reviews.tests
python manage.py test accounts.tests
```

### Frontend Testing
```bash
cd flixreview-frontend
npm run lint
npx tsc --noEmit
```

### API Testing with Postman
```bash
cd postman
./run-all.bat  # Windows
# or manually import flix-review-api.postman_collection.json
```

---

## 🚢 Deployment

### Frontend (Vercel)
```bash
cd flixreview-frontend
vercel deploy --prod
```
Set environment variable: `NEXT_PUBLIC_API_URL`

### Backend (Heroku/Railway)
```bash
cd flixreview-backend
git push heroku main
heroku run python manage.py migrate
```
Configure: `DEBUG=False`, `ALLOWED_HOSTS`, `DATABASE_URL`

### Docker Deployment
```bash
cd flixreview-backend
docker-compose up -d
```

---

## 📊 Performance Features

### Database Optimization
- **Indexed Queries** on frequently accessed fields
- **select_related()** and **prefetch_related()** for efficient queries
- **Pagination** on all list endpoints (10-100 items)
- **Query Optimization** to minimize database hits

### Frontend Performance
- **React Query Caching** for server state management
- **Optimistic UI Updates** for instant feedback
- **Code Splitting** with Next.js App Router
- **Image Optimization** with Next.js Image component
- **Lazy Loading** for better initial load times

### Caching Strategy
- **Client-side Caching** with TanStack Query
- **Static Asset Caching** with proper headers
- **API Response Caching** for frequently accessed data
- **CDN Integration** ready for production

---

## 🔐 Security Features

### Authentication Security
- **JWT Token-based Authentication** with secure tokens
- **Password Hashing** using Django's PBKDF2 algorithm
- **Rate Limiting** on authentication endpoints
- **Token Rotation** and blacklisting support

### API Security
- **CORS Configuration** for cross-origin requests
- **CSRF Protection** against cross-site attacks
- **Permission Classes** for granular access control
- **Input Validation** and sanitization
- **SQL Injection Protection** via Django ORM

### Data Protection
- **Owner-only Permissions** for user data
- **Secure File Uploads** with validation
- **Environment Variable** configuration
- **Production Security** settings

---

## 🎯 Version Information

| Component | Version | Status |
|-----------|---------|--------|
| **Overall** | 0.3.0 | ✅ Stable |
| **Frontend** | 1.2.0 | ✅ Production Ready |
| **Backend** | 1.1.0 | ✅ Production Ready |
| **Admin Dashboard** | 0.3.0 | ✨ NEW |
| **API Documentation** | 0.3.0 | ✨ NEW |
| **Social Features** | 1.0.0 | ✨ NEW |
| **Release Date** | 2025-01-18 | "Professional Edition" |

---

## 🎨 Design System

### Color Palette
```css
Primary:   #8b5cf6  (Purple)
Secondary: #06b6d4  (Cyan)
Accent:    #f59e0b  (Amber)
Success:   #10b981  (Green)
Warning:   #f59e0b  (Yellow)
Error:     #ef4444  (Red)
```

### Typography
- **Font**: Inter (Google Fonts)
- **Headers**: Bold, large sizes with proper hierarchy
- **Body**: Regular weight, readable sizes
- **Code**: Monospace with syntax highlighting

### Components
- Statistics cards with icons
- Interactive charts and visualizations
- Gradient buttons and navigation
- Activity feeds and notifications
- Responsive grid layouts

---

## 🔮 Future Roadmap

### Planned Features
- [ ] **Real-time Updates** with WebSocket integration
- [ ] **Push Notifications** for user interactions
- [ ] **Advanced Analytics** dashboard
- [ ] **Email Notifications** system
- [ ] **Dark Mode Toggle** for user preference
- [ ] **Export Functionality** (CSV/Excel)
- [ ] **Advanced Search** with full-text search
- [ ] **User Following** system
- [ ] **Moderation Tools** for content management

### Performance Improvements
- [ ] **Redis Caching** for session management
- [ ] **CDN Integration** for static assets
- [ ] **Database Optimization** with connection pooling
- [ ] **Image Optimization** with WebP format
- [ ] **Bundle Optimization** with code splitting

---

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines
- Follow **TypeScript** best practices
- Use **ESLint** and **Prettier** for code formatting
- Write **comprehensive tests** for new features
- Update **documentation** for API changes
- Follow **Django** and **Next.js** conventions

---

## 📞 Support & Community

### Getting Help
- **GitHub Issues**: [Report bugs or request features](https://github.com/MohamedAly25/flix-review/issues)
- **Documentation**: Comprehensive guides in `/docs` folder
- **API Testing**: Use Postman collection in `/postman` folder

### Community
- **Star the repository** if you find it helpful
- **Share your feedback** through GitHub issues
- **Contribute** to make it even better
- **Follow** for updates and new features

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Mohamed Aly**
- GitHub: [@MohamedAly25](https://github.com/MohamedAly25)
- Repository: [flix-review](https://github.com/MohamedAly25/flix-review)
- Email: Contact through GitHub

---

## 🏆 Acknowledgments

### Built With
- **Django 5.2.7** - Robust web framework
- **Next.js 15.5.5** - Modern React framework
- **Tailwind CSS 4.x** - Utility-first CSS framework
- **Chart.js** - Beautiful data visualizations
- **Font Awesome 6.4.0** - Comprehensive icon library
- **DRF Spectacular** - Automatic API documentation

### Special Thanks
- Django community for excellent documentation
- Next.js team for the amazing framework
- Tailwind CSS for the utility-first approach
- All contributors and users who provided feedback

---

<div align="center">

## 🎬 FlixReview - Where Movies Meet Excellence

**Built with ❤️ using Next.js, React, Django, and TypeScript**

⭐ **Star this repo if you find it helpful!**

[![GitHub stars](https://img.shields.io/github/stars/MohamedAly25/flix-review?style=social)](https://github.com/MohamedAly25/flix-review)
[![GitHub forks](https://img.shields.io/github/forks/MohamedAly25/flix-review?style=social)](https://github.com/MohamedAly25/flix-review)

**Ready for Production • Fully Documented • Community Driven**

</div>