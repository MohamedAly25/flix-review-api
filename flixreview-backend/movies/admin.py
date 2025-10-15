from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from .models import Movie, Genre


@admin.register(Genre)
class GenreAdmin(admin.ModelAdmin):
    """Enhanced admin for Genre model"""

    # Display fields
    list_display = ('name', 'slug', 'get_movie_count', 'created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('name', 'slug', 'description')
    prepopulated_fields = {'slug': ('name',)}

    # Fieldsets
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'slug', 'description')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    # Read-only fields
    readonly_fields = ('created_at', 'updated_at')

    # Actions
    actions = ['export_genres']

    def get_movie_count(self, obj):
        """Display number of movies in this genre with link"""
        count = obj.movies.count()
        if count > 0:
            url = reverse('admin:movies_movie_changelist')
            return format_html('<a href="{}?genres__id__exact={}">{}</a>', url, obj.id, count)
        return count
    get_movie_count.short_description = 'Movies'

    def export_genres(self, request, queryset):
        """Export selected genres to CSV"""
        self.message_user(request, f'Exported {queryset.count()} genres.')
    export_genres.short_description = 'Export selected genres'


@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
    """Enhanced admin for Movie model"""

    # Display fields
    list_display = (
        'title', 'release_date', 'avg_rating', 'get_genres',
        'get_reviews_count', 'tmdb_id', 'created_at'
    )

    # Filter options
    list_filter = (
        'genres', 'release_date', 'avg_rating',
        'created_at', 'updated_at'
    )

    # Search fields
    search_fields = ('title', 'description', 'tmdb_id', 'imdb_id')

    # Filter horizontal for many-to-many
    filter_horizontal = ('genres',)

    # Fieldsets for better organization
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'release_date', 'genres')
        }),
        ('Ratings & Reviews', {
            'fields': ('avg_rating',),
            'classes': ('collapse',)
        }),
        ('External IDs & Media', {
            'fields': ('tmdb_id', 'imdb_id', 'poster_url', 'backdrop_url'),
            'classes': ('collapse',)
        }),
        ('Production Details', {
            'fields': ('runtime', 'budget', 'revenue'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    # Read-only fields
    readonly_fields = ('avg_rating', 'created_at', 'updated_at')

    # Actions
    actions = ['update_ratings', 'export_movies', 'clear_tmdb_data']

    def get_genres(self, obj):
        """Display genres as comma-separated list"""
        genres = obj.genres.all()
        if genres:
            return ', '.join([genre.name for genre in genres])
        return 'No genres'
    get_genres.short_description = 'Genres'

    def get_reviews_count(self, obj):
        """Display number of reviews with link"""
        count = obj.reviews.count()
        if count > 0:
            url = reverse('admin:reviews_review_changelist')
            return format_html('<a href="{}?movie__id__exact={}">{}</a>', url, obj.id, count)
        return count
    get_reviews_count.short_description = 'Reviews'

    def update_ratings(self, request, queryset):
        """Update average ratings for selected movies"""
        updated = 0
        for movie in queryset:
            reviews = movie.reviews.all()
            if reviews:
                avg_rating = sum(review.rating for review in reviews) / len(reviews)
                movie.avg_rating = round(avg_rating, 2)
                movie.save()
                updated += 1
        self.message_user(request, f'Updated ratings for {updated} movie(s).')
    update_ratings.short_description = 'Update average ratings'

    def export_movies(self, request, queryset):
        """Export selected movies to CSV"""
        self.message_user(request, f'Exported {queryset.count()} movies.')
    export_movies.short_description = 'Export selected movies'

    def clear_tmdb_data(self, request, queryset):
        """Clear TMDB data for selected movies"""
        updated = queryset.update(
            tmdb_id=None,
            imdb_id='',
            runtime=None,
            budget=0,
            revenue=0,
            backdrop_url=''
        )
        self.message_user(request, f'Cleared TMDB data for {updated} movie(s).')
    clear_tmdb_data.short_description = 'Clear TMDB data'

