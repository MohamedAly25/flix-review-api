from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler

from .responses import build_error_payload


def custom_exception_handler(exc, context):
	response = exception_handler(exc, context)

	if response is None:
		payload = build_error_payload(message=str(exc) or 'Internal server error')
		return Response(payload, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

	data = response.data
	message = 'Request failed'
	errors = None

	if isinstance(data, dict):
		detail = data.pop('detail', None)
		if detail:
			if isinstance(detail, (list, tuple)):
				message = detail[0]
			else:
				message = str(detail)
		errors = data or None
	elif isinstance(data, (list, tuple)):
		message = str(data[0]) if data else 'Request failed'
		errors = {'non_field_errors': list(data)} if data else None
	else:
		message = str(data)

	payload = build_error_payload(message=message, errors=errors)
	return Response(payload, status=response.status_code)
