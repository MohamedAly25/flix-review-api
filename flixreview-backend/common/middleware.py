"""
Custom middleware for the FlixReview API.
"""
from django.http import JsonResponse
from django_ratelimit.exceptions import Ratelimited

from .responses import build_error_payload


class RateLimitMiddleware:
	"""
	Middleware to catch Ratelimited exceptions and return proper JSON responses.
	Must be placed after AuthenticationMiddleware in MIDDLEWARE settings.
	"""
	def __init__(self, get_response):
		self.get_response = get_response

	def __call__(self, request):
		return self.get_response(request)

	def process_exception(self, request, exception):
		"""
		Convert Ratelimited exceptions to HTTP 429 JSON responses.
		"""
		if isinstance(exception, Ratelimited):
			payload = build_error_payload(
				message='Too many requests. Please try again later.',
				errors={'rate_limit': 'You have exceeded the allowed request rate.'}
			)
			return JsonResponse(payload, status=429)
		return None


class RequestLoggingMiddleware:
	"""
	Middleware to log important security events like authentication attempts.
	"""
	def __init__(self, get_response):
		self.get_response = get_response

	def __call__(self, request):
		# Log authentication-related requests
		if request.path in ['/api/users/register/', '/api/users/login/']:
			import logging
			logger = logging.getLogger('movie_review_api')
			logger.info(
				f"Auth attempt: {request.method} {request.path} from {self.get_client_ip(request)}"
			)

		response = self.get_response(request)

		# Log failed authentication attempts
		if request.path in ['/api/users/register/', '/api/users/login/']:
			if response.status_code in [401, 403, 429]:
				import logging
				logger = logging.getLogger('movie_review_api')
				logger.warning(
					f"Failed auth: {request.method} {request.path} "
					f"from {self.get_client_ip(request)} - Status: {response.status_code}"
				)

		return response

	@staticmethod
	def get_client_ip(request):
		"""Extract client IP from request, considering proxies."""
		x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
		if x_forwarded_for:
			ip = x_forwarded_for.split(',')[0]
		else:
			ip = request.META.get('REMOTE_ADDR')
		return ip
