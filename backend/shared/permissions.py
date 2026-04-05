# shared/permissions.py
# Custom DRF permission classes for the three user roles.
# All role checks are done server-side from request headers — never from request.data.
#
# Auth scheme: every protected request must include two headers:
#   X-Role: admin | superadmin | publicuser
#   X-User-ID: <the numeric ID of the authenticated user>
#
# NOTE: This is a lightweight stateless scheme appropriate for a local/intranet app.
# For a public internet deployment, replace with JWT (djangorestframework-simplejwt).

from rest_framework.permissions import BasePermission
from adminpanel.models import Admin
from superpanel.models import SuperAdmin
from publicpanel.models import PublicUser


def _get_role(request):
    return request.headers.get("X-Role", "").lower().strip()


def _get_user_id(request):
    try:
        return int(request.headers.get("X-User-ID", ""))
    except (ValueError, TypeError):
        return None


def get_verified_admin(request):
    """Return the Admin object if X-Role/X-User-ID headers identify a valid, active admin."""
    if _get_role(request) != "admin":
        return None
    uid = _get_user_id(request)
    if not uid:
        return None
    try:
        return Admin.objects.get(adminID=uid, isActive=True)
    except Admin.DoesNotExist:
        return None


def get_verified_superadmin(request):
    """Return the SuperAdmin object if headers identify a valid, active superadmin."""
    if _get_role(request) != "superadmin":
        return None
    uid = _get_user_id(request)
    if not uid:
        return None
    try:
        return SuperAdmin.objects.get(superAdminID=uid, isActive=True)
    except SuperAdmin.DoesNotExist:
        return None


def get_verified_publicuser(request):
    """Return the PublicUser object if headers identify a valid public user."""
    if _get_role(request) != "publicuser":
        return None
    uid = _get_user_id(request)
    if not uid:
        return None
    try:
        return PublicUser.objects.get(publicUserID=uid)
    except PublicUser.DoesNotExist:
        return None


class IsAdminUser(BasePermission):
    """Allows access only to verified Admin users."""
    message = "Admin authentication required."

    def has_permission(self, request, view):
        return get_verified_admin(request) is not None


class IsSuperAdminUser(BasePermission):
    """Allows access only to verified SuperAdmin users."""
    message = "Super Admin authentication required."

    def has_permission(self, request, view):
        return get_verified_superadmin(request) is not None


class IsPublicUser(BasePermission):
    """Allows access only to verified PublicUser users."""
    message = "Public user authentication required."

    def has_permission(self, request, view):
        return get_verified_publicuser(request) is not None


class IsAdminOrSuperAdmin(BasePermission):
    """Allows Admin or SuperAdmin — for read-shared endpoints."""
    message = "Admin or Super Admin authentication required."

    def has_permission(self, request, view):
        return (
            get_verified_admin(request) is not None
            or get_verified_superadmin(request) is not None
        )


class IsAdminOrReadOnly(BasePermission):
    """Safe methods are open; mutations require Admin auth."""
    def has_permission(self, request, view):
        from rest_framework.permissions import SAFE_METHODS
        if request.method in SAFE_METHODS:
            return True
        return get_verified_admin(request) is not None


class IsSuperAdminOrReadOnly(BasePermission):
    """Safe methods are open; mutations require SuperAdmin auth."""
    def has_permission(self, request, view):
        from rest_framework.permissions import SAFE_METHODS
        if request.method in SAFE_METHODS:
            return True
        return get_verified_superadmin(request) is not None