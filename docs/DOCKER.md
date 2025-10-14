# 🐳 Docker Deployment Guide

## Quick Start

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+

### Local Development with Docker

1. **Clone the repository**
```bash
git clone https://github.com/MohamedAly25/flix-review-api.git
cd flix-review-api
```

2. **Create environment file**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Build and run with Docker Compose**
```bash
docker-compose up --build
```

4. **Run migrations**
```bash
docker-compose exec web python manage.py migrate
docker-compose exec web python manage.py createsuperuser
```

5. **Access the application**
- API: http://localhost:8000
- API Docs: http://localhost:8000/api/docs/
- Admin: http://localhost:8000/admin/
- Health Check: http://localhost:8000/health/

---

## Docker Compose Services

### Services Overview
| Service | Port | Description |
|---------|------|-------------|
| web | 8000 | Django API application |
| db | 5432 | PostgreSQL 15 database |
| redis | 6379 | Redis cache |
| nginx | 80 | Nginx reverse proxy (production profile) |

### Service Commands

**Start all services**
```bash
docker-compose up -d
```

**Stop all services**
```bash
docker-compose down
```

**View logs**
```bash
docker-compose logs -f web
```

**Rebuild services**
```bash
docker-compose up --build
```

**Run Django commands**
```bash
docker-compose exec web python manage.py <command>
```

---

## Production Deployment

### 1. Build Production Image

```bash
docker build -t flixreview-api:latest .
```

### 2. Run with Production Settings

```bash
docker-compose --profile production up -d
```

### 3. Environment Variables

Create `.env` file with production values:

```env
DEBUG=False
SECRET_KEY=your-very-secure-secret-key-here
DJANGO_ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
DATABASE_URL=postgresql://user:password@db:5432/flixreview
REDIS_URL=redis://redis:6379/0
SENTRY_DSN=your-sentry-dsn (optional)
```

### 4. SSL/TLS Configuration

For production, use nginx with SSL:

```yaml
# docker-compose.yml (production profile)
nginx:
  image: nginx:alpine
  profiles:
    - production
  volumes:
    - ./nginx.conf:/etc/nginx/nginx.conf:ro
    - ./ssl:/etc/nginx/ssl:ro  # Your SSL certificates
  ports:
    - "443:443"
    - "80:80"
```

---

## Dockerfile Structure

### Multi-Stage Build

**Stage 1: Builder**
- Installs build dependencies
- Compiles Python packages
- Creates wheel files

**Stage 2: Runtime**
- Minimal runtime image
- Copies compiled packages from builder
- Runs as non-root user
- Includes health check

### Image Size Optimization
- Multi-stage build: ~250MB final image
- Alpine-based Python: Smaller footprint
- Excludes development dependencies

---

## Health Checks

### Docker Health Check
```bash
# Check container health
docker-compose ps

# Manual health check
curl http://localhost:8000/health/
```

### Health Check Response
```json
{
  "status": "healthy",
  "timestamp": "2025-10-14T15:30:00Z",
  "version": "1.0.0",
  "python_version": "3.11.0",
  "checks": {
    "database": {
      "status": "up",
      "message": "Database connection successful"
    },
    "cache": {
      "status": "up",
      "message": "Cache connection successful"
    }
  }
}
```

---

## Database Management

### Backup Database
```bash
docker-compose exec db pg_dump -U flixuser flixreview > backup.sql
```

### Restore Database
```bash
docker-compose exec -T db psql -U flixuser flixreview < backup.sql
```

### Access PostgreSQL Shell
```bash
docker-compose exec db psql -U flixuser -d flixreview
```

---

## Redis Cache

### Access Redis CLI
```bash
docker-compose exec redis redis-cli
```

### Flush Cache
```bash
docker-compose exec redis redis-cli FLUSHALL
```

---

## Scaling

### Horizontal Scaling
```bash
# Scale web service to 3 instances
docker-compose up -d --scale web=3
```

### Load Balancing
Add nginx configuration for load balancing:

```nginx
upstream api_backend {
    server web_1:8000;
    server web_2:8000;
    server web_3:8000;
}
```

---

## Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs web

# Inspect container
docker-compose exec web sh
```

### Database connection errors
```bash
# Ensure database is running
docker-compose ps db

# Check database logs
docker-compose logs db
```

### Port conflicts
```bash
# Find process using port 8000
lsof -i :8000  # macOS/Linux
netstat -ano | findstr :8000  # Windows

# Change port in docker-compose.yml
ports:
  - "8001:8000"
```

---

## CI/CD Integration

### GitHub Actions
The project includes a CI/CD pipeline (`.github/workflows/ci.yml`) that:
- Runs tests automatically on push
- Checks code coverage (>90%)
- Builds Docker image
- Deploys to production (configurable)

### Manual Docker Hub Push
```bash
docker login
docker tag flixreview-api:latest yourusername/flixreview-api:latest
docker push yourusername/flixreview-api:latest
```

---

## Cloud Deployment

### Deploy to Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway up
```

### Deploy to Render
1. Connect GitHub repository
2. Select "Docker" as environment
3. Configure environment variables
4. Deploy

### Deploy to AWS ECS
```bash
# Push to ECR
aws ecr get-login-password | docker login --username AWS --password-stdin <aws_account_id>.dkr.ecr.<region>.amazonaws.com
docker tag flixreview-api:latest <aws_account_id>.dkr.ecr.<region>.amazonaws.com/flixreview-api:latest
docker push <aws_account_id>.dkr.ecr.<region>.amazonaws.com/flixreview-api:latest

# Deploy to ECS using AWS Console or CLI
```

---

## Security Best Practices

1. **Never commit `.env` file**
   - Add to `.gitignore`
   - Use environment-specific files

2. **Use secrets management**
   - Docker secrets
   - AWS Secrets Manager
   - HashiCorp Vault

3. **Run as non-root user**
   - Already configured in Dockerfile
   - User: `django` (UID: 1000)

4. **Keep images updated**
   ```bash
   docker-compose pull
   docker-compose up -d
   ```

5. **Use read-only volumes**
   ```yaml
   volumes:
     - ./config:/app/config:ro
   ```

---

## Monitoring

### Container Stats
```bash
docker stats
```

### Resource Limits
```yaml
web:
  deploy:
    resources:
      limits:
        cpus: '0.5'
        memory: 512M
      reservations:
        memory: 256M
```

---

## Useful Commands Reference

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Rebuild
docker-compose up --build

# View logs
docker-compose logs -f [service]

# Execute command
docker-compose exec web python manage.py [command]

# Shell access
docker-compose exec web sh

# Remove volumes
docker-compose down -v

# Prune unused images
docker system prune -a
```

---

## Support

For issues or questions:
- GitHub Issues: https://github.com/MohamedAly25/flix-review-api/issues
- Documentation: `/docs` folder
- Health check: http://localhost:8000/health/
