# publicpanel/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PublicUserViewSet, PublicAnnouncementViewSet, PublicEventViewSet,
    ReportViewSet, HotlineCategoryViewSet, HotlineViewSet,
    public_login, approve_report, decline_report, respond_report, resolve_report,
)

router = DefaultRouter()
router.register(r"users",              PublicUserViewSet,         basename="public-user")
router.register(r"announcements",      PublicAnnouncementViewSet, basename="public-announcement")
router.register(r"events",             PublicEventViewSet,        basename="public-event")
router.register(r"reports",            ReportViewSet,             basename="report")
router.register(r"hotline-categories", HotlineCategoryViewSet,    basename="hotline-category")
router.register(r"hotlines",           HotlineViewSet,            basename="hotline")

urlpatterns = [
    path("", include(router.urls)),
    path("login/",                            public_login),
    path("reports/<int:report_id>/approve/",  approve_report),
    path("reports/<int:report_id>/decline/",  decline_report),
    path("reports/<int:report_id>/respond/",  respond_report),
    path("reports/<int:report_id>/resolve/",  resolve_report),
]