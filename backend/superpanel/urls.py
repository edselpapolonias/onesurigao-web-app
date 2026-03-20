# superpanel/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SuperAdminViewSet, SuperAdminAnnouncementViewSet,
    SuperAdminEventViewSet, superadmin_login,
    approve_event, decline_event,
)

router = DefaultRouter()
router.register(r"superadmins", SuperAdminViewSet, basename="superadmin")
router.register(r"announcements", SuperAdminAnnouncementViewSet, basename="superadmin-announcement")
router.register(r"events", SuperAdminEventViewSet, basename="superadmin-event")

urlpatterns = [
    path("", include(router.urls)),
    path("login/", superadmin_login),
    path("events/<int:event_id>/approve/", approve_event),
    path("events/<int:event_id>/decline/", decline_event),
]