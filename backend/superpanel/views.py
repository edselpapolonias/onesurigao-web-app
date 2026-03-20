# superpanel/views.py
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.utils import timezone
from .models import SuperAdmin
from .serializers import SuperAdminSerializer
from adminpanel.models import Announcement, Event
from adminpanel.serializers import AnnouncementSerializer, EventSerializer


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
        return Response({"success": False, "message": "Invalid username or password"})


# ── Announcements (read-only) ─────────────────────────────────────────────────

class SuperAdminAnnouncementViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AnnouncementSerializer

    def get_queryset(self):
        pinned_only = self.request.query_params.get("pinned")
        if pinned_only:
            return Announcement.objects.filter(isActive=True, isPinned=True).order_by("-createdDate")
        return Announcement.objects.filter(isActive=True).order_by("-createdDate")


# ── Events ────────────────────────────────────────────────────────────────────

class SuperAdminEventViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = EventSerializer

    def get_queryset(self):
        status = self.request.query_params.get("status")
        if status == "pending":
            return Event.objects.filter(isApproved=False, declineReason__isnull=True).order_by("-createdDate")
        if status == "declined":
            return Event.objects.filter(isApproved=False, declineReason__isnull=False).order_by("-createdDate")
        return Event.objects.filter(isApproved=True).order_by("-createdDate")


@api_view(["PATCH"])
def approve_event(request, event_id):
    try:
        event = Event.objects.get(eventID=event_id)
        superadmin_id = request.data.get("superAdminID")
        event.isApproved = True
        event.approvedBy = superadmin_id
        event.approvedDate = timezone.now()
        event.declineReason = None
        event.save()
        return Response(EventSerializer(event, context={"request": request}).data)
    except Event.DoesNotExist:
        return Response({"error": "Event not found"}, status=404)


@api_view(["PATCH"])
def decline_event(request, event_id):
    try:
        event = Event.objects.get(eventID=event_id)
        reason = request.data.get("declineReason", "").strip()
        if not reason:
            return Response({"error": "A decline reason is required."}, status=400)
        event.isApproved = False
        event.declineReason = reason
        event.save()
        return Response(EventSerializer(event, context={"request": request}).data)
    except Event.DoesNotExist:
        return Response({"error": "Event not found"}, status=404)