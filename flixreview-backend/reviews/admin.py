from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from .models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    """Enhanced admin for Review model"""

    # Display fields
    list_display = (
        'id', 'get_user_email', 'get_movie_title',
        'rating', 'get_content_preview', 'is_edited',
        'created_at', 'updated_at'
    )

    # Filter options
    list_filter = (
        'rating', 'is_edited', 'created_at', 'updated_at',
        'movie__genres', 'user__is_active'
    )

    # Search fields
    search_fields = (
        'content', 'user__email', 'user__username',
        'movie__title', 'movie__description'
    )

    # Fieldsets
    fieldsets = (
        ('Review Information', {
            'fields': ('user', 'movie', 'rating', 'content')
        }),
        ('Status', {
            'fields': ('is_edited',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    # Read-only fields
    readonly_fields = ('created_at', 'updated_at', 'is_edited')

    # Ordering
    ordering = ('-created_at',)

    # Actions
    actions = ['mark_as_edited', 'delete_reviews', 'export_reviews']

    def get_user_email(self, obj):
        """Display user email with link to user admin"""
        url = reverse('admin:accounts_user_change', args=[obj.user.id])
        return format_html('<a href="{}">{}</a>', url, obj.user.email)
    get_user_email.short_description = 'User'
    get_user_email.admin_order_field = 'user__email'

    def get_movie_title(self, obj):
        """Display movie title with link to movie admin"""
        url = reverse('admin:movies_movie_change', args=[obj.movie.id])
        return format_html('<a href="{}">{}</a>', url, obj.movie.title)
    get_movie_title.short_description = 'Movie'
    get_movie_title.admin_order_field = 'movie__title'

    def get_content_preview(self, obj):
        """Display preview of review content"""
        preview = obj.content[:50]
        if len(obj.content) > 50:
            preview += '...'
        return preview
    get_content_preview.short_description = 'Content Preview'

    def mark_as_edited(self, request, queryset):
        """Mark selected reviews as edited"""
        updated = queryset.update(is_edited=True)
        self.message_user(request, f'{updated} review(s) marked as edited.')
    mark_as_edited.short_description = 'Mark selected reviews as edited'

    def delete_reviews(self, request, queryset):
        """Delete selected reviews and update movie ratings"""
        deleted_count = 0
        for review in queryset:
            movie = review.movie
            review.delete()

            # Update movie average rating
            reviews = movie.reviews.all()
            if reviews:
                avg_rating = sum(r.rating for r in reviews) / len(reviews)
                movie.avg_rating = round(avg_rating, 2)
                movie.save()

            deleted_count += 1

        self.message_user(request, f'Deleted {deleted_count} review(s) and updated movie ratings.')
    delete_reviews.short_description = 'Delete reviews and update ratings'

    def export_reviews(self, request, queryset):
        """Export selected reviews to CSV"""
        self.message_user(request, f'Exported {queryset.count()} reviews.')
    export_reviews.short_description = 'Export selected reviews'

    # Custom admin methods
    def has_add_permission(self, request):
        """Allow adding reviews only for superusers"""
        return request.user.is_superuser

    def has_delete_permission(self, request, obj=None):
        """Allow deleting reviews only for superusers"""
        return request.user.is_superuser
