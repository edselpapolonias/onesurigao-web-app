# adminpanel/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AdminViewSet,
    AnnouncementViewSet,
    EventViewSet,
    admin_login,
    change_admin_password,   # ← new
)

router = DefaultRouter()
router.register(r"admins",        AdminViewSet,        basename="admin")
router.register(r"announcements", AnnouncementViewSet, basename="announcement")
router.register(r"events",        EventViewSet,        basename="event")

urlpatterns = [
    path("", include(router.urls)),
    path("login/", admin_login),
    # Change-password endpoint — only the owner admin can call this.
    path("admins/<int:pk>/change-password/", change_admin_password),
]