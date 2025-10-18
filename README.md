# 🎬 FlixReview

> **Production-ready Netflix-inspired movie review platform** built with Next.js 15 (App Router) and Django REST Framework.

> Next.js 15 (App Router) • Django REST Framework • JWT Auth • TMDB Integration • Professional Admin Dashboard

## Quick Start

[![Version](https://img.shields.io/badge/version-0.3.0-blue.svg)](https://github.com/MohamedAly25/flix-review)
[![Status](https://img.shields.io/badge/status-stable-success.svg)](https://github.com/MohamedAly25/flix-review)
[![License](https://img.shields.io/badge/license-MIT-yellow.svg)](LICENSE)

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

## 🌟 What's New in v0.3.0

### Professional Admin Interface
- ✨ **Enhanced Admin Dashboard** - Modern statistics dashboard with real-time metrics
- 📊 **Interactive Charts** - Chart.js visualizations for ratings and activity trends
- 🎨 **Beautiful UI** - Tailwind CSS styling with purple-cyan gradient theme
- 📱 **Responsive Design** - Mobile-friendly layouts throughout
- 🔍 **Quick Stats** - At-a-glance view of users, movies, reviews, and genres

### Comprehensive API Documentation
- � **Professional API Docs** - Custom landing page at `/api/docs/`
- 🔄 **Interactive Testing** - Swagger UI at `/api/swagger/`
- 🔐 **Authentication Guide** - Complete JWT token workflow
- 💡 **Code Examples** - Ready-to-use cURL commands
- 📖 **Endpoint Reference** - Organized by resource type

### Improvements
- ✅ Fixed all template syntax errors
- ✅ Corrected URL routing issues
- ✅ Enhanced admin navigation
- ✅ Added quick action buttons
- ✅ Improved user experience

---

## 📋 Project Highlights

- **Authentication**: JWT (login, refresh, logout, rate limits) with profile management (avatar, bio, preferred genres)
- **Movies**: TMDB integration, search, genre filters, trending/recent feeds, personalized recommendations
- **Reviews**: Full CRUD lifecycle, single review per user/movie, rating badges
- **UI/UX**: Netflix-grade interface with cinematic hero, staggered carousels, keyboard-accessible search
- **Admin**: Professional dashboard with statistics, charts, and content management
- **API**: Comprehensive documentation with interactive testing tools

---

## 📚 Documentation

### Main Documentation
- [`docs/PROJECT_OVERVIEW.md`](docs/PROJECT_OVERVIEW.md) – Architecture, feature set, operations, release snapshot
- [`docs/IMPLEMENTATION_GUIDE.md`](docs/IMPLEMENTATION_GUIDE.md) – Component breakdowns, workflows, deployment notes
- [`docs/DELIVERY_AND_TESTING.md`](docs/DELIVERY_AND_TESTING.md) – Timeline, QA coverage, deployment readiness

### New in v0.3.0
- [`VISUAL_GUIDE.md`](VISUAL_GUIDE.md) – Visual overview of new admin and API features
- [`ADMIN_API_DOCS_UPDATE.md`](ADMIN_API_DOCS_UPDATE.md) – Technical details of admin enhancements

---

## ✨ Features at a Glance

| Category | Features |
|----------|----------|
| **🔐 Authentication** | JWT tokens • Refresh flow • Protected routes • Rate limiting |
| **👤 User Profiles** | Avatar uploads • Bio editing • Preferred genres (cooldown logic) |
| **🎬 Movies** | TMDB posters • Search • Genre filters • Trending/Recent feeds |
| **⭐ Reviews** | 5-star ratings • CRUD operations • Single review per user/movie |
| **🎨 UI/UX** | Netflix dark theme • Cinematic hero • Staggered carousels • Bilingual-ready |
| **🤖 Recommendations** | Personalized feeds • TanStack Query caching • Real-time updates |

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [**Project Overview**](docs/PROJECT_OVERVIEW.md) | Architecture, tech stack, operations, release details |
| [**Implementation Guide**](docs/IMPLEMENTATION_GUIDE.md) | Component architecture, workflows, deployment setup |
| [**Delivery & Testing**](docs/DELIVERY_AND_TESTING.md) | Timeline, fixes, QA coverage, deployment readiness |

---

## 🛠️ Tech Stack

**Frontend**
- Next.js 15.5.5 (App Router + Turbopack)
- React 19.1.0
- TypeScript 5.6.3
- TanStack Query 5.90.3
- Tailwind CSS 4.x

**Backend**
- Django 5.2.7
- Django REST Framework 3.16.1
- SimpleJWT 5.5.1
- TMDB API Integration
- SQLite (dev) / PostgreSQL (prod)

---

## 📦 Project Structure

```
FlixReview/
├── flixreview-frontend/     # Next.js 15 App Router
│   ├── src/
│   │   ├── app/             # Pages & routes
│   │   ├── components/      # React components
│   │   ├── contexts/        # AuthContext, etc.
│   │   ├── services/        # API client layer
│   │   └── types/           # TypeScript definitions
│   └── public/              # Static assets
│
├── flixreview-backend/      # Django REST API
│   ├── accounts/            # User auth & profiles
│   ├── movies/              # Movie models & TMDB sync
│   ├── reviews/             # Review system
│   ├── recommendations/     # Personalized feeds
│   └── requirements/        # Python dependencies
│
├── docs/                    # Consolidated documentation
│   ├── PROJECT_OVERVIEW.md
│   ├── IMPLEMENTATION_GUIDE.md
│   └── DELIVERY_AND_TESTING.md
│
└── START_SERVERS.ps1        # Automated startup script
```

---

## 🎯 Version Info

| Component | Version | Status |
|-----------|---------|--------|
| **Overall** | 0.3.0 | ✅ Stable |
| **Frontend** | 1.2.0 | ✅ Production Ready |
| **Backend** | 1.1.0 | ✅ Production Ready |
| **Admin Dashboard** | 0.3.0 | ✨ NEW |
| **API Documentation** | 0.3.0 | ✨ NEW |
| **Release Date** | 2025-10-18 | "Professional Edition" |

---

## 🔗 Access Points

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Main application interface |
| **Backend API** | http://127.0.0.1:8000/api/ | REST API endpoints |
| **API Documentation** | http://127.0.0.1:8000/api/docs/ | 📚 Professional API docs (NEW) |
| **Swagger UI** | http://127.0.0.1:8000/api/swagger/ | 🔄 Interactive API testing (NEW) |
| **API Schema** | http://127.0.0.1:8000/api/schema/ | OpenAPI schema |
| **Admin Panel** | http://127.0.0.1:8000/admin/ | 🎨 Enhanced dashboard (NEW) |
| **Admin Dashboard** | http://127.0.0.1:8000/admin/dashboard/ | 📊 Statistics & analytics (NEW) |

### Credentials

**Admin Access:**
- Username: `admin`
- Password: `admin123`

**Test Users:**
- `john_doe` / `password123`
- `jane_smith` / `password123`

---

## 🧪 Testing

```bash
# Backend tests
cd flixreview-backend
python manage.py test

# Frontend linting & type check
cd flixreview-frontend
npm run lint
npx tsc --noEmit
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

---

## 📝 License

MIT License - see [LICENSE](LICENSE) for details

---

## 👨‍💻 Author

**Mohamed Aly**
- GitHub: [@MohamedAly25](https://github.com/MohamedAly25)
- Repository: [flix-review](https://github.com/MohamedAly25/flix-review)

---

<div align="center">

**Built with ❤️ using Next.js, React, Django, and TypeScript**

⭐ Star this repo if you find it helpful!

</div>
