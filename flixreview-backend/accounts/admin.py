from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from django.urls import reverse
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    """Custom admin for User model with enhanced features"""

    # Display fields in list view
    list_display = (
        'email', 'username', 'first_name', 'last_name',
        'is_active', 'is_staff', 'is_superuser',
        'date_joined', 'last_login', 'reviews_count'
    )

    # Filter options
    list_filter = (
        'is_active', 'is_staff', 'is_superuser',
        'date_joined', 'last_login', 'groups'
    )

    # Search fields
    search_fields = ('email', 'username', 'first_name', 'last_name')

    # Ordering
    ordering = ('-date_joined',)

    # Fieldsets for add/edit forms
    fieldsets = (
        ('Account Information', {
            'fields': ('email', 'username', 'password')
        }),
        ('Personal Information', {
            'fields': ('first_name', 'last_name', 'bio', 'profile_picture')
        }),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')
        }),
        ('Important Dates', {
            'fields': ('last_login', 'date_joined'),
            'classes': ('collapse',)
        }),
    )

    # Add form fieldsets (simplified)
    add_fieldsets = (
        ('Account Information', {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2'),
        }),
        ('Personal Information', {
            'classes': ('wide',),
            'fields': ('first_name', 'last_name', 'bio', 'profile_picture'),
        }),
    )

    # Read-only fields
    readonly_fields = ('date_joined', 'last_login')

    # Actions
    actions = ['activate_users', 'deactivate_users', 'make_staff', 'remove_staff']

    def reviews_count(self, obj):
        """Display number of reviews by this user"""
        count = obj.reviews.count()
        if count > 0:
            url = reverse('admin:reviews_review_changelist')
            return format_html('<a href="{}?user__id__exact={}">{}</a>', url, obj.id, count)
        return count
    reviews_count.short_description = 'Reviews'

    def activate_users(self, request, queryset):
        """Activate selected users"""
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} user(s) activated.')
    activate_users.short_description = 'Activate selected users'

    def deactivate_users(self, request, queryset):
        """Deactivate selected users"""
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} user(s) deactivated.')
    deactivate_users.short_description = 'Deactivate selected users'

    def make_staff(self, request, queryset):
        """Make selected users staff"""
        updated = queryset.update(is_staff=True)
        self.message_user(request, f'{updated} user(s) made staff.')
    make_staff.short_description = 'Make selected users staff'

    def remove_staff(self, request, queryset):
        """Remove staff status from selected users"""
        updated = queryset.update(is_staff=False)
        self.message_user(request, f'{updated} user(s) removed from staff.')
    remove_staff.short_description = 'Remove staff status from selected users'
