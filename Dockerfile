# Multi-stage Dockerfile for FlixReview API

# Stage 1: Builder
FROM python:3.11-slim as builder

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements/ requirements/

# Install Python dependencies
RUN pip install --user --no-cache-dir -r requirements/production.txt


# Stage 2: Runtime
FROM python:3.11-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PATH=/root/.local/bin:$PATH

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Copy Python dependencies from builder
COPY --from=builder /root/.local /root/.local

# Copy project files
COPY . .

# Create staticfiles directory
RUN mkdir -p staticfiles

# Collect static files
RUN python manage.py collectstatic --noinput || echo "Static files collection skipped"

# Create non-root user for security
RUN useradd -m -u 1000 django && \
    chown -R django:django /app

USER django

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health/', timeout=5)" || exit 1

# Default command
CMD ["gunicorn", "movie_review_api.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3", "--timeout", "60"]
