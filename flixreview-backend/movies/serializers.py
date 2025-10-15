from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field

from .models import Movie, Genre


class GenreSerializer(serializers.ModelSerializer):
	"""Serializer for Genre model"""
	movie_count = serializers.SerializerMethodField()
	
	class Meta:
		model = Genre
		fields = ('id', 'name', 'slug', 'description', 'movie_count', 'created_at', 'updated_at')
		read_only_fields = ('slug', 'created_at', 'updated_at', 'movie_count')
	
	@extend_schema_field(serializers.IntegerField)
	def get_movie_count(self, obj):
		"""Return the number of movies in this genre"""
		return obj.movies.count()


class MovieSerializer(serializers.ModelSerializer):
	review_count = serializers.IntegerField(read_only=True)
	genres = GenreSerializer(many=True, read_only=True)
	genre_ids = serializers.PrimaryKeyRelatedField(
		queryset=Genre.objects.all(),
		many=True,
		write_only=True,
		source='genres',
		required=False
	)
	
	class Meta:
		model = Movie
		fields = (
			'id', 'title', 'genre', 'genres', 'genre_ids', 'description', 'release_date',
			'avg_rating', 'poster_url', 'created_at', 'updated_at', 'review_count'
		)
		read_only_fields = ('avg_rating', 'created_at', 'updated_at', 'review_count', 'genre')
	
	def to_representation(self, instance):
		"""Ensure avg_rating is always returned as a float"""
		data = super().to_representation(instance)
		# Convert Decimal to float for JSON serialization
		if data.get('avg_rating') is not None:
			data['avg_rating'] = float(data['avg_rating'])
		else:
			data['avg_rating'] = 0.0
		return data

