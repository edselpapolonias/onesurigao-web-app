from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PublicAnnouncementViewSet, PublicEventViewSet

router = DefaultRouter()
router.register(r'announcements', PublicAnnouncementViewSet, basename='public-announcement')
router.register(r'events', PublicEventViewSet, basename='public-event')

urlpatterns = [
    path('', include(router.urls)),
]