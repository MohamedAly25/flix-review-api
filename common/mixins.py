from rest_framework.response import Response
from rest_framework.views import APIView

from .responses import build_success_payload


class ApiResponseMixin(APIView):
	success_messages = {}
	wrap_success = True

	_default_messages = {
		'GET': 'Request successful',
		'POST': 'Resource created successfully',
		'PUT': 'Resource updated successfully',
		'PATCH': 'Resource updated successfully',
		'DELETE': 'Resource deleted successfully',
	}

	def finalize_response(self, request, response, *args, **kwargs):  # type: ignore[override]
		response = super().finalize_response(request, response, *args, **kwargs)

		if (
			self.wrap_success
			and isinstance(response, Response)
			and not response.exception
			and getattr(response, 'data', None) is not None
			and not getattr(response, '_skip_api_wrapper', False)
		):
			current_data = response.data
			if not (isinstance(current_data, dict) and current_data.get('success') is not None):
				message = self.get_success_message(request.method)
				response.data = build_success_payload(current_data, message)
		return response

	def get_success_message(self, method: str) -> str:
		return self.success_messages.get(method, self._default_messages.get(method, 'Request successful'))
