from django.contrib import admin
from .models import Movie, Genre


@admin.register(Genre)
class GenreAdmin(admin.ModelAdmin):
	list_display = ('name', 'slug', 'get_movie_count', 'created_at')
	search_fields = ('name', 'description')
	prepopulated_fields = {'slug': ('name',)}
	readonly_fields = ('created_at', 'updated_at')
	
	def get_movie_count(self, obj):
		return obj.movies.count()
	get_movie_count.short_description = 'Movies'


@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
	list_display = ('title', 'release_date', 'avg_rating', 'get_genres', 'created_at')
	list_filter = ('genres', 'release_date')
	search_fields = ('title', 'description')
	filter_horizontal = ('genres',)
	readonly_fields = ('avg_rating', 'created_at', 'updated_at')
	
	def get_genres(self, obj):
		return ', '.join([genre.name for genre in obj.genres.all()])
	get_genres.short_description = 'Genres'

