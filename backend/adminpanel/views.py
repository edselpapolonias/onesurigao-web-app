# adminpanel/views.py
from rest_framework import viewsets, parsers, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.db.models import Q

from .models import Admin, Announcement, AnnouncementMedia, Event
from .serializers import AdminSerializer, AnnouncementSerializer, EventSerializer
from shared.permissions import IsAdminUser, IsSuperAdminUser, get_verified_admin


# ── Admin Account Management ──────────────────────────────────────────────────

class AdminViewSet(viewsets.ModelViewSet):
    queryset         = Admin.objects.all()
    serializer_class = AdminSerializer
    parser_classes   = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_permissions(self):
        # Registration (create) is open — all other actions require admin auth.
        if self.action == "create":
            return [AllowAny()]
        return [IsAdminUser()]

    def update(self, request, *args, **kwargs):
        # Admins can only update their own record.
        target    = self.get_object()
        requester = get_verified_admin(request)
        if requester is None or requester.adminID != target.adminID:
            return Response(
                {"error": "You can only update your own profile."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        # Deletion is managed through the superadmin panel only.
        return Response({"error": "Not allowed."}, status=status.HTTP_403_FORBIDDEN)


# ── Login ─────────────────────────────────────────────────────────────────────

@api_view(["POST"])
@permission_classes([AllowAny])
def admin_login(request):
    username = request.data.get("username", "").strip()
    password = request.data.get("password", "")

    if not username or not password:
        return Response(
            {"success": False, "message": "Username and password are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        admin = Admin.objects.get(username=username, isActive=True)
    except Admin.DoesNotExist:
        # Generic message — never reveal which field was wrong.
        return Response(
            {"success": False, "message": "Invalid username or password."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    if not admin.check_password(password):
        return Response(
            {"success": False, "message": "Invalid username or password."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    return Response({
        "success":    True,
        "adminID":    admin.adminID,
        "officeName": admin.officeName,
        "username":   admin.username,
        "profilePic": (
            request.build_absolute_uri(admin.profilePic.url)
            if admin.profilePic else None
        ),
        # Frontend stores adminID and sends it back as:
        #   X-Role: admin
        #   X-User-ID: <adminID>
        # on every subsequent protected request.
    })


# ── Change Password ───────────────────────────────────────────────────────────

@api_view(["PATCH"])
@permission_classes([IsAdminUser])
def change_admin_password(request, pk):
    """
    Allows an admin to change their own password.
    - Requires IsAdminUser (X-Role + X-User-ID headers).
    - Verifies the current password server-side before accepting the new one.
    - pk must match the authenticated admin's own ID (no privilege escalation).
    """
    requester = get_verified_admin(request)

    # Double-check: the authenticated admin must be the same as the target pk.
    if requester is None or requester.adminID != pk:
        return Response(
            {"error": "You can only change your own password."},
            status=status.HTTP_403_FORBIDDEN,
        )

    current_password = request.data.get("currentPassword", "")
    new_password     = request.data.get("newPassword", "")

    if not current_password or not new_password:
        return Response(
            {"error": "Both currentPassword and newPassword are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if len(new_password) < 8:
        return Response(
            {"error": "New password must be at least 8 characters long."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Server-side verification of the current password — never trust the client.
    if not requester.check_password(current_password):
        return Response(
            {"error": "Current password is incorrect."},
            status=status.HTTP_403_FORBIDDEN,
        )

    requester.set_password(new_password)
    requester.save(update_fields=["password"])

    return Response({"success": True, "message": "Password changed successfully."})


# ── Announcements ─────────────────────────────────────────────────────────────

class AnnouncementViewSet(viewsets.ModelViewSet):
    serializer_class = AnnouncementSerializer
    parser_classes   = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_permissions(self):
        from rest_framework.permissions import SAFE_METHODS
        if self.request.method in SAFE_METHODS:
            return [AllowAny()]
        return [IsAdminUser()]

    def get_queryset(self):
        admin_id = self.request.query_params.get("adminID")
        if admin_id:
            return Announcement.objects.filter(
                admin__adminID=admin_id
            ).order_by("-createdDate")
        return Announcement.objects.all().order_by("-createdDate")

    def perform_create(self, serializer):
        admin = get_verified_admin(self.request)
        # Always attach the authenticated admin — client cannot spoof this.
        announcement = serializer.save(admin=admin, isActive=True)
        self._save_media(announcement)

    def perform_update(self, serializer):
        # Only the original author may edit their announcement.
        announcement = self.get_object()
        requester    = get_verified_admin(self.request)
        if requester is None or announcement.admin_id != requester.adminID:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only edit your own announcements.")
        updated = serializer.save()
        self._save_media(updated)

    def perform_destroy(self, instance):
        requester = get_verified_admin(self.request)
        if requester is None or instance.admin_id != requester.adminID:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only delete your own announcements.")
        instance.delete()

    def _save_media(self, announcement):
        from .serializers import _validate_media_file
        files = self.request.FILES.getlist("mediaFiles")
        for f in files:
            _validate_media_file(f)   # raises ValidationError on bad type / size
            media_type = "video" if f.content_type.startswith("video") else "image"
            AnnouncementMedia.objects.create(
                announcement=announcement, file=f, mediaType=media_type
            )


# ── Events ────────────────────────────────────────────────────────────────────

class EventViewSet(viewsets.ModelViewSet):
    serializer_class = EventSerializer
    parser_classes   = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_permissions(self):
        from rest_framework.permissions import SAFE_METHODS
        if self.request.method in SAFE_METHODS:
            return [AllowAny()]
        return [IsAdminUser()]

    def get_queryset(self):
        admin_id = self.request.query_params.get("adminID")
        if admin_id:
            # The admin sees their own events regardless of approval status,
            # plus all other approved events.
            return Event.objects.filter(
                Q(isApproved=True) | Q(admin__adminID=admin_id)
            ).order_by("-createdDate")
        return Event.objects.filter(isApproved=True).order_by("-createdDate")

    def perform_create(self, serializer):
        admin  = get_verified_admin(self.request)
        poster = self.request.FILES.get("posterPath")
        if poster:
            from .serializers import _validate_media_file, ALLOWED_IMAGE_TYPES
            _validate_media_file(poster)
            if poster.content_type not in ALLOWED_IMAGE_TYPES:
                from rest_framework.exceptions import ValidationError
                raise ValidationError("Event poster must be an image file.")
        # New events are always pending — superadmin must approve.
        serializer.save(admin=admin, isApproved=False)

    def perform_update(self, serializer):
        event     = self.get_object()
        requester = get_verified_admin(self.request)
        if requester is None or event.admin_id != requester.adminID:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only edit your own events.")
        serializer.save()