from django.shortcuts import render
from django.http import JsonResponse
from django.db import connection
from django.utils import timezone
import sys


def home_view(request):
	"""
	Home page view with platform overview
	"""
	return render(request, 'home.html')


def about_view(request):
	"""
	About page view with platform information
	"""
	return render(request, 'about.html')


def health_check(request):
	"""
	Health check endpoint for Docker and monitoring systems.
	Returns 200 OK if the service is healthy, 500 otherwise.
	"""
	health_status = {
		'status': 'healthy',
		'timestamp': timezone.now().isoformat(),
		'version': '1.0.0',
		'python_version': f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}",
	}
	
	checks = {}
	overall_healthy = True
	
	# Database health check
	try:
		connection.ensure_connection()
		checks['database'] = {
			'status': 'up',
			'message': 'Database connection successful'
		}
	except Exception as e:
		checks['database'] = {
			'status': 'down',
			'message': f'Database connection failed: {str(e)}'
		}
		overall_healthy = False
	
	# Redis health check (if configured)
	try:
		from django.core.cache import cache
		cache.set('health_check', 'ok', 10)
		if cache.get('health_check') == 'ok':
			checks['cache'] = {
				'status': 'up',
				'message': 'Cache connection successful'
			}
		else:
			checks['cache'] = {
				'status': 'down',
				'message': 'Cache verification failed'
			}
			overall_healthy = False
	except Exception as e:
		checks['cache'] = {
			'status': 'degraded',
			'message': f'Cache not configured or failed: {str(e)}'
		}
		# Cache is optional, don't mark as unhealthy
	
	health_status['checks'] = checks
	health_status['status'] = 'healthy' if overall_healthy else 'unhealthy'
	
	status_code = 200 if overall_healthy else 500
	return JsonResponse(health_status, status=status_code)

