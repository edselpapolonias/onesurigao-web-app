# superpanel/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.utils import timezone

from .models import SuperAdmin
from .serializers import SuperAdminSerializer
from adminpanel.models import Announcement, Event
from adminpanel.serializers import AnnouncementSerializer, EventSerializer
from shared.permissions import (
    IsSuperAdminUser, get_verified_superadmin,
)


# ── SuperAdmin Account Management ─────────────────────────────────────────────

class SuperAdminViewSet(viewsets.ModelViewSet):
    queryset         = SuperAdmin.objects.all()
    serializer_class = SuperAdminSerializer

    def get_permissions(self):
        if self.action == "create":
            return [AllowAny()]  # Registration is open (or restrict to first-run)
        return [IsSuperAdminUser()]

    def update(self, request, *args, **kwargs):
        target     = self.get_object()
        superadmin = get_verified_superadmin(request)
        if superadmin is None or superadmin.superAdminID != target.superAdminID:
            return Response({"error": "You can only update your own account."},
                            status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        return Response({"error": "Account deletion not allowed via API."},
                        status=status.HTTP_403_FORBIDDEN)


# ── Login ─────────────────────────────────────────────────────────────────────

@api_view(["POST"])
@permission_classes([AllowAny])
def superadmin_login(request):
    username = request.data.get("username", "").strip()
    password = request.data.get("password", "")
    if not username or not password:
        return Response({"success": False, "message": "Username and password are required."},
                        status=status.HTTP_400_BAD_REQUEST)
    try:
        superadmin = SuperAdmin.objects.get(username=username, isActive=True)
    except SuperAdmin.DoesNotExist:
        return Response({"success": False, "message": "Invalid username or password."},
                        status=status.HTTP_401_UNAUTHORIZED)

    if not superadmin.check_password(password):
        return Response({"success": False, "message": "Invalid username or password."},
                        status=status.HTTP_401_UNAUTHORIZED)

    return Response({
        "success":       True,
        "superAdminID":  superadmin.superAdminID,
        "superAdminName": superadmin.superAdminName,
        "username":      superadmin.username,
        # Frontend must send X-Role: superadmin and X-User-ID: <superAdminID>
    })


# ── Announcements (read-only for superadmin dashboard) ───────────────────────

class SuperAdminAnnouncementViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class   = AnnouncementSerializer
    permission_classes = [IsSuperAdminUser]

    def get_queryset(self):
        if self.request.query_params.get("pinned"):
            return Announcement.objects.filter(isActive=True, isPinned=True).order_by("-createdDate")
        return Announcement.objects.filter(isActive=True).order_by("-createdDate")


# ── Events ────────────────────────────────────────────────────────────────────

class SuperAdminEventViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class   = EventSerializer
    permission_classes = [IsSuperAdminUser]

    def get_queryset(self):
        s = self.request.query_params.get("status")
        if s == "pending":
            return Event.objects.filter(isApproved=False, declineReason__isnull=True).order_by("-createdDate")
        if s == "declined":
            return Event.objects.filter(isApproved=False, declineReason__isnull=False).order_by("-createdDate")
        return Event.objects.filter(isApproved=True).order_by("-createdDate")


@api_view(["PATCH"])
@permission_classes([IsSuperAdminUser])
def approve_event(request, event_id):
    try:
        event      = Event.objects.get(eventID=event_id)
        superadmin = get_verified_superadmin(request)
        event.isApproved    = True
        event.approvedBy    = superadmin.superAdminID
        event.approvedDate  = timezone.now()
        event.declineReason = None
        event.save()
        return Response(EventSerializer(event, context={"request": request}).data)
    except Event.DoesNotExist:
        return Response({"error": "Event not found."}, status=status.HTTP_404_NOT_FOUND)


@api_view(["PATCH"])
@permission_classes([IsSuperAdminUser])
def decline_event(request, event_id):
    try:
        event  = Event.objects.get(eventID=event_id)
        reason = request.data.get("declineReason", "").strip()
        if not reason:
            return Response({"error": "A decline reason is required."}, status=status.HTTP_400_BAD_REQUEST)
        event.isApproved    = False
        event.declineReason = reason
        event.save()
        return Response(EventSerializer(event, context={"request": request}).data)
    except Event.DoesNotExist:
        return Response({"error": "Event not found."}, status=status.HTTP_404_NOT_FOUND)