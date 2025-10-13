# 🎬 Movie Review API

[![Python](https://img.shields.io/badge/Python-3.13.3-blue.svg)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-5.2.7-green.svg)](https://www.djangoproject.com/)
[![DRF](https://img.shields.io/badge/DRF-3.16.1-red.svg)](https://www.django-rest-framework.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A comprehensive REST API for movie reviews built with Django REST Framework, featuring JWT authentication, advanced filtering, and OpenAPI documentation.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [API Documentation](#-api-documentation)
- [API Endpoints](#-api-endpoints)
- [Response Format](#-response-format)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

- 🔐 **JWT Authentication**: Secure token-based authentication with refresh tokens
- 👤 **Custom User Model**: Email-based registration and login
- 🎭 **Movie Management**: Admin-controlled movie catalog with statistics
- 📝 **Review System**: Full CRUD operations with ownership permissions
- 🔍 **Advanced Filtering**: Search by title, filter by rating ranges, pagination
- 📊 **Statistics**: Real-time review statistics for movies
- 📚 **OpenAPI Docs**: Interactive Swagger UI documentation
- 🛡️ **Security**: CORS, CSRF protection, input validation
- 🎨 **Unified Responses**: Consistent JSON response envelopes
- 🚀 **Production Ready**: Optimized for deployment with WhiteNoise

## 🛠 Tech Stack

### Backend
- **Framework**: Django 5.2.7
- **API**: Django REST Framework 3.16.1
- **Authentication**: djangorestframework-simplejwt 5.5.1
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **Documentation**: drf-spectacular 0.28.0

### Development Tools
- **Testing**: pytest 8.4.2, pytest-django 4.11.1
- **Linting**: flake8 7.3.0
- **Formatting**: black 25.9.0
- **Environment**: django-environ 0.12.0

### Deployment
- **Platform**: Heroku
- **Static Files**: WhiteNoise 6.11.0
- **Runtime**: Python 3.13.3

## 🚀 Quick Start

### Prerequisites
- Python 3.13.3+
- pip
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/MohamedAly25/flix-review-api.git
   cd flix-review-api
   ```

2. **Create virtual environment**
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements/development.txt
   ```

4. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

5. **Database setup**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. **Create superuser (optional)**
   ```bash
   python manage.py createsuperuser
   ```

7. **Run the server**
   ```bash
   python manage.py runserver
   ```

Visit `http://localhost:8000/api/docs/` for API documentation.

## 📖 API Documentation

The API is fully documented with OpenAPI 3.0 specification and includes an interactive Swagger UI.

- **Swagger UI**: `http://localhost:8000/api/docs/`
- **ReDoc**: `http://localhost:8000/api/redoc/` (if configured)

## 🔗 API Endpoints

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `POST /api/users/register/` | POST | ❌ | User registration |
| `POST /api/users/login/` | POST | ❌ | JWT token generation |
| `GET /api/users/profile/` | GET | ✅ | Get user profile |
| `PUT /api/users/profile/` | PUT | ✅ | Update user profile |
| `DELETE /api/users/profile/` | DELETE | ✅ | Delete user account |
| `GET /api/movies/` | GET | ❌ | List movies with filters |
| `POST /api/movies/` | POST | ✅ (Admin) | Create new movie |
| `GET /api/movies/{id}/` | GET | ❌ | Movie details + stats |
| `PUT /api/movies/{id}/` | PUT | ✅ (Admin) | Update movie |
| `DELETE /api/movies/{id}/` | DELETE | ✅ (Admin) | Delete movie |
| `GET /api/reviews/` | GET | ❌ | List reviews with filters |
| `POST /api/reviews/` | POST | ✅ | Create review |
| `GET /api/reviews/{id}/` | GET | ❌ | Review details |
| `PUT /api/reviews/{id}/` | PUT | ✅ (Owner) | Update review |
| `DELETE /api/reviews/{id}/` | DELETE | ✅ (Owner) | Delete review |
| `GET /api/reviews/movie/{title}/` | GET | ❌ | Reviews by movie |
| `GET /api/reviews/search/` | GET | ❌ | Search reviews |

### Query Parameters

**Movies**:
- `search`: Search in title
- `ordering`: Sort by fields (title, created_at)
- `page`: Pagination page
- `page_size`: Items per page (max 100)

**Reviews**:
- `movie`: Filter by movie ID
- `user`: Filter by user ID
- `rating_min/rating_max`: Rating range
- `search`: Search in content
- `ordering`: Sort by fields
- `page`, `page_size`: Pagination

## 📤 Response Format

All API responses follow a consistent structure:

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  },
  "timestamp": "2025-10-13T12:00:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "field_name": ["Error message"]
  },
  "timestamp": "2025-10-13T12:00:00.000Z"
}
```

### Pagination Response
```json
{
  "success": true,
  "message": "Data retrieved",
  "data": {
    "count": 25,
    "next": "http://localhost:8000/api/reviews/?page=2",
    "previous": null,
    "results": [...]
  },
  "timestamp": "2025-10-13T12:00:00.000Z"
}
```

## 🧪 Testing

Run the complete test suite:

```bash
python manage.py test accounts movies reviews -v 2
```

### Test Coverage
- ✅ User model and authentication
- ✅ Movie CRUD operations
- ✅ Review CRUD with permissions
- ✅ API filtering and search
- ✅ Pagination and serialization
- ✅ Error handling

**Current Status**: 14 tests passing

## 🚀 Deployment

### Heroku Deployment

1. **Install Heroku CLI** and login
2. **Create Heroku app**
   ```bash
   heroku create your-movie-review-api
   ```

3. **Configure environment variables**
   ```bash
   heroku config:set SECRET_KEY=your-secret-key
   heroku config:set DEBUG=False
   heroku config:set DATABASE_URL=your-postgres-url
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

5. **Run migrations**
   ```bash
   heroku run python manage.py migrate
   heroku run python manage.py collectstatic --noinput
   ```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SECRET_KEY` | Django secret key | Required |
| `DEBUG` | Debug mode | False |
| `DATABASE_URL` | Database connection | SQLite |
| `ALLOWED_HOSTS` | Allowed hosts | localhost,127.0.0.1 |
| `CORS_ALLOW_ALL_ORIGINS` | Allow all CORS | True |
| `SECURE_SSL_REDIRECT` | SSL redirect | False (dev) / True (prod) |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow PEP 8 style guide
- Write tests for new features
- Update documentation
- Ensure all tests pass

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

**Mohamed Aly**
- GitHub: [@MohamedAly25](https://github.com/MohamedAly25)
- Repository: [flix-review-api](https://github.com/MohamedAly25/flix-review-api)

---

⭐ **Star this repo** if you find it helpful!
