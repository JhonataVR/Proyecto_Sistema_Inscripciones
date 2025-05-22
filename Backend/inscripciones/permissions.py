from rest_framework import permissions

class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_staff

class IsAdminOrSelf(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        return obj.usuario == request.user

class IsAdminOrDocenteOrSelf(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        if hasattr(request.user, 'docente'):
            return True
        if hasattr(obj, 'estudiante'):
            return obj.estudiante.usuario == request.user
        if hasattr(obj, 'usuario'):
            return obj.usuario == request.user
        return False