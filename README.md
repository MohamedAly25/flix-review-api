# 🎬 FlixReview# FlixReview



> **Production-ready Netflix-inspired movie review platform**  Production-ready Netflix-inspired movie review platform built with Next.js 15 (App Router) and Django REST Framework.

> Next.js 15 (App Router) • Django REST Framework • JWT Auth • TMDB Integration

## Quick Start

[![Version](https://img.shields.io/badge/version-1.2.0-blue.svg)](https://github.com/MohamedAly25/flix-review)- `./START_SERVERS.ps1` from the repository root launches both servers and opens http://localhost:3000.

[![Status](https://img.shields.io/badge/status-stable-success.svg)](https://github.com/MohamedAly25/flix-review)- Manual alternative:

[![License](https://img.shields.io/badge/license-MIT-yellow.svg)](LICENSE)  - Backend: `cd flixreview-backend && python manage.py runserver`

  - Frontend: `cd flixreview-frontend && npm run dev`

---

## Project Highlights

## 🚀 Quick Start- Authentication with JWT (login, refresh, logout, rate limits) and enriched profile management (avatar upload, bio edit, preferred genres).

- Movie catalogue with TMDB imagery, search, genre filters, trending/recent feeds, and personalised recommendations.

### Automated Launch (Recommended)- Review lifecycle (create/delete, single review per user/movie, rating badges) surfaced through account dashboards and recommendation cards.

```powershell- Netflix-grade UI: cinematic hero, staggered carousels, keyboard-accessible search overlay, bilingual-ready layout.

./START_SERVERS.ps1- Stable release **v1.2.0** dated 2025-10-15; backend 1.1.0, frontend 1.2.0.

```

Opens http://localhost:3000 with both servers running.## Documentation Map

- [`docs/PROJECT_OVERVIEW.md`](docs/PROJECT_OVERVIEW.md) – Architecture, feature set, operations, release snapshot.

### Manual Launch- [`docs/IMPLEMENTATION_GUIDE.md`](docs/IMPLEMENTATION_GUIDE.md) – Frontend and backend component breakdowns, workflows, and deployment notes.

```bash- [`docs/DELIVERY_AND_TESTING.md`](docs/DELIVERY_AND_TESTING.md) – Timeline of fixes, QA coverage, and outstanding risks.

# Terminal 1 - Backend

cd flixreview-backend && python manage.py runserverLegacy markdown reports from earlier milestones were merged into the files above to keep the documentation concise and discoverable.


# Terminal 2 - Frontend
cd flixreview-frontend && npm run dev
```

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
| **Overall** | 1.2.0 | ✅ Stable |
| **Frontend** | 1.2.0 | ✅ Production Ready |
| **Backend** | 1.1.0 | ✅ Production Ready |
| **Release Date** | 2025-10-15 | "Netflix Edition" |

---

## 🔗 Access Points

| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | - |
| Backend API | http://127.0.0.1:8000/api | - |
| API Docs | http://127.0.0.1:8000/api/docs | Interactive Swagger |
| Admin Panel | http://127.0.0.1:8000/admin | `admin` / `admin123` |

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
