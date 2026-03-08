from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AdminViewSet, AnnouncementViewSet
from .views import admin_login


router = DefaultRouter()
router.register(r'admins', AdminViewSet)
router.register(r'announcements', AnnouncementViewSet)


urlpatterns = [
    path('', include(router.urls)),
    path('login/', admin_login),
]