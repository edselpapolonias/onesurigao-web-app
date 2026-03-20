# superpanel/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SuperAdminViewSet, SuperAdminAnnouncementViewSet, superadmin_login

router = DefaultRouter()
router.register(r"superadmins", SuperAdminViewSet, basename="superadmin")
router.register(r"announcements", SuperAdminAnnouncementViewSet, basename="superadmin-announcement")

urlpatterns = [
    path("", include(router.urls)),
    path("login/", superadmin_login),
]