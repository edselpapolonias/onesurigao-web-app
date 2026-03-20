# superpanel/views.py
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import SuperAdmin
from .serializers import SuperAdminSerializer
from adminpanel.models import Announcement
from adminpanel.serializers import AnnouncementSerializer


class SuperAdminViewSet(viewsets.ModelViewSet):
    queryset = SuperAdmin.objects.all()
    serializer_class = SuperAdminSerializer


@api_view(["POST"])
def superadmin_login(request):
    username = request.data.get("username")
    password = request.data.get("password")

    try:
        superadmin = SuperAdmin.objects.get(username=username, password=password, isActive=True)
        return Response({
            "success": True,
            "message": "Login successful",
            "superAdminID": superadmin.superAdminID,
            "superAdminName": superadmin.superAdminName,
            "username": superadmin.username,
        })
    except SuperAdmin.DoesNotExist:
        return Response({
            "success": False,
            "message": "Invalid username or password",
        })


# ── Read-only announcement views for Super Admin (same data as adminpanel) ────

class SuperAdminAnnouncementViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AnnouncementSerializer

    def get_queryset(self):
        pinned_only = self.request.query_params.get("pinned")
        if pinned_only:
            return Announcement.objects.filter(isActive=True, isPinned=True).order_by("-createdDate")
        return Announcement.objects.filter(isActive=True).order_by("-createdDate")