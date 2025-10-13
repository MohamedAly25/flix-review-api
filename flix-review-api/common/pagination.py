from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class DefaultPagination(PageNumberPagination):
	page_size = 10
	page_size_query_param = 'page_size'
	max_page_size = 100

	def get_paginated_response(self, data):
		page_size = self.get_page_size(self.request)
		return Response({
			'count': self.page.paginator.count,
			'page': self.page.number,
			'page_size': page_size or self.page_size,
			'next': self.get_next_link(),
			'previous': self.get_previous_link(),
			'results': data,
		})
