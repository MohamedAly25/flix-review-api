from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """Allow owners to edit, others read-only."""

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return getattr(obj, 'user', None) == request.user


class IsAdminOrReadOnly(permissions.BasePermission):
    """Allow admin users to edit; others read-only."""

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_staff)
