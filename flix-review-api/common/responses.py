from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response


def _ensure_data(data):
	"""Return a safe default for response data."""
	if data is None:
		return {}
	return data


def build_success_payload(data=None, message='Request successful'):
	return {
		'success': True,
		'message': message,
		'data': _ensure_data(data),
		'timestamp': timezone.now().isoformat(),
	}


def build_error_payload(message='Request failed', errors=None):
	payload = {
		'success': False,
		'message': message,
		'timestamp': timezone.now().isoformat(),
	}
	if errors:
		payload['errors'] = errors
	return payload


def success_response(data=None, message='Request successful', status_code=status.HTTP_200_OK):
	return Response(build_success_payload(data, message), status=status_code)


def error_response(message='Request failed', errors=None, status_code=status.HTTP_400_BAD_REQUEST):
	return Response(build_error_payload(message, errors), status=status_code)
