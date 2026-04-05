# publicpanel/views.py
from rest_framework import viewsets, mixins, parsers, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.utils import timezone

from .models import PublicUser, Report, ReportMedia, HotlineCategory, Hotline
from .serializers import (
    PublicUserSerializer, ReportSerializer,
    HotlineCategorySerializer, HotlineSerializer,
)
from adminpanel.models import Announcement, Event
from adminpanel.serializers import AnnouncementSerializer, EventSerializer
from shared.permissions import (
    IsAdminUser, IsSuperAdminUser, IsPublicUser,
    get_verified_admin, get_verified_superadmin, get_verified_publicuser,
)


# ── Public User Registration & Profile ────────────────────────────────────────

class PublicUserViewSet(viewsets.ModelViewSet):
    queryset         = PublicUser.objects.all()
    serializer_class = PublicUserSerializer
    parser_classes   = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_permissions(self):
        if self.action == "create":
            return [AllowAny()]
        # Any other action (retrieve/update/delete) requires the user to be the owner.
        return [IsPublicUser()]

    def retrieve(self, request, *args, **kwargs):
        user = get_verified_publicuser(request)
        target = self.get_object()
        if user is None or user.publicUserID != target.publicUserID:
            return Response({"error": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)
        return super().retrieve(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        user   = get_verified_publicuser(request)
        target = self.get_object()
        if user is None or user.publicUserID != target.publicUserID:
            return Response({"error": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        return Response({"error": "Account deletion not allowed."}, status=status.HTTP_403_FORBIDDEN)

    def list(self, request, *args, **kwargs):
        # No listing of all public users.
        return Response({"error": "Not allowed."}, status=status.HTTP_403_FORBIDDEN)


# ── Login ─────────────────────────────────────────────────────────────────────

@api_view(["POST"])
@permission_classes([AllowAny])
def public_login(request):
    username = request.data.get("username", "").strip()
    password = request.data.get("password", "")
    if not username or not password:
        return Response({"success": False, "message": "Username and password are required."},
                        status=status.HTTP_400_BAD_REQUEST)
    try:
        user = PublicUser.objects.get(username=username)
    except PublicUser.DoesNotExist:
        return Response({"success": False, "message": "Invalid username or password."},
                        status=status.HTTP_401_UNAUTHORIZED)

    if not user.check_password(password):
        return Response({"success": False, "message": "Invalid username or password."},
                        status=status.HTTP_401_UNAUTHORIZED)

    return Response({
        "success":     True,
        "publicUserID": user.publicUserID,
        "name":        user.name,
        "lastName":    user.lastName,
        "username":    user.username,
        "profilePic":  request.build_absolute_uri(user.profilePic.url) if user.profilePic else None,
        # Frontend must send X-Role: publicuser and X-User-ID: <publicUserID>
    })


# ── Public read-only views ────────────────────────────────────────────────────

class PublicAnnouncementViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin,
                                viewsets.GenericViewSet):
    serializer_class = AnnouncementSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = Announcement.objects.filter(isActive=True)
        if self.request.query_params.get("pinned"):
            qs = qs.filter(isPinned=True)
        return qs.order_by("-createdDate")


class PublicEventViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin,
                         viewsets.GenericViewSet):
    serializer_class   = EventSerializer
    permission_classes = [AllowAny]
    queryset           = Event.objects.filter(isApproved=True).order_by("-createdDate")


# ── Reports ───────────────────────────────────────────────────────────────────

class ReportViewSet(viewsets.ModelViewSet):
    serializer_class = ReportSerializer
    parser_classes   = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_permissions(self):
        if self.action == "create":
            return [IsPublicUser()]
        if self.action in ("list", "retrieve"):
            # Admins, superadmins, and public users can read — but queryset restricts scope.
            return [AllowAny()]
        return [IsPublicUser()]

    def get_queryset(self):
        # SuperAdmins and Admins see all reports for their purposes.
        if get_verified_superadmin(self.request):
            return Report.objects.all().order_by("-submittedDate")

        admin = get_verified_admin(self.request)
        if admin:
            # Admins only see reports assigned to their office.
            return Report.objects.filter(assignedTo=admin).order_by("-submittedDate")

        # Public users see only their own reports — server enforces this,
        # not the client-supplied ?publicUserID= query param.
        user = get_verified_publicuser(self.request)
        if user:
            return Report.objects.filter(publicUser=user).order_by("-submittedDate")

        # Unauthenticated — no reports.
        return Report.objects.none()

    def perform_create(self, serializer):
        user = get_verified_publicuser(self.request)
        if user is None:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You must be logged in to submit a report.")
        report = serializer.save(publicUser=user, status="pending")
        self._save_media(report)

    def _save_media(self, report):
        from adminpanel.serializers import _validate_media_file, ALLOWED_MEDIA_TYPES
        files = self.request.FILES.getlist("mediaFiles")
        for f in files:
            _validate_media_file(f)
            media_type = "video" if f.content_type.startswith("video") else "image"
            ReportMedia.objects.create(report=report, file=f, mediaType=media_type)


# ── Report action endpoints ────────────────────────────────────────────────────

@api_view(["PATCH"])
@permission_classes([IsSuperAdminUser])
def approve_report(request, report_id):
    """Only SuperAdmins can approve reports."""
    try:
        report      = Report.objects.get(reportID=report_id)
        assigned_id = request.data.get("assignedTo_id")
        if not assigned_id:
            return Response({"error": "Please select an office."}, status=status.HTTP_400_BAD_REQUEST)
        from adminpanel.models import Admin
        try:
            office = Admin.objects.get(adminID=assigned_id, isActive=True)
        except Admin.DoesNotExist:
            return Response({"error": "Office not found."}, status=status.HTTP_404_NOT_FOUND)
        superadmin = get_verified_superadmin(request)
        report.status          = "approved"
        report.assignedTo      = office
        report.validatedBy     = superadmin.superAdminID
        report.validatedDate   = timezone.now()
        report.rejectionReason = None
        report.save()
        return Response(ReportSerializer(report, context={"request": request}).data)
    except Report.DoesNotExist:
        return Response({"error": "Report not found."}, status=status.HTTP_404_NOT_FOUND)


@api_view(["PATCH"])
@permission_classes([IsSuperAdminUser])
def decline_report(request, report_id):
    """Only SuperAdmins can decline reports."""
    try:
        report = Report.objects.get(reportID=report_id)
        reason = request.data.get("rejectionReason", "").strip()
        if not reason:
            return Response({"error": "A rejection reason is required."}, status=status.HTTP_400_BAD_REQUEST)
        superadmin             = get_verified_superadmin(request)
        report.status          = "declined"
        report.rejectionReason = reason
        report.validatedBy     = superadmin.superAdminID
        report.validatedDate   = timezone.now()
        report.save()
        return Response(ReportSerializer(report, context={"request": request}).data)
    except Report.DoesNotExist:
        return Response({"error": "Report not found."}, status=status.HTTP_404_NOT_FOUND)


@api_view(["PATCH"])
@permission_classes([IsAdminUser])
def respond_report(request, report_id):
    """Only the assigned Admin can add responses to a report."""
    try:
        report = Report.objects.get(reportID=report_id)
        admin  = get_verified_admin(request)
        # Enforce: only the assigned office may respond.
        if report.assignedTo_id != admin.adminID:
            return Response({"error": "You are not assigned to this report."},
                            status=status.HTTP_403_FORBIDDEN)
        text = request.data.get("adminResponse", "").strip()
        if not text:
            return Response({"error": "Response cannot be empty."}, status=status.HTTP_400_BAD_REQUEST)
        responses = report.adminResponses or []
        responses.append({
            "text":   text,
            "date":   timezone.now().isoformat(),
            "office": admin.officeName,
        })
        report.adminResponses = responses
        report.status         = "responded"
        report.respondedDate  = timezone.now()
        report.save()
        return Response(ReportSerializer(report, context={"request": request}).data)
    except Report.DoesNotExist:
        return Response({"error": "Report not found."}, status=status.HTTP_404_NOT_FOUND)


@api_view(["PATCH"])
@permission_classes([IsAdminUser])
def resolve_report(request, report_id):
    """Only the assigned Admin can mark a report as resolved."""
    try:
        report = Report.objects.get(reportID=report_id)
        admin  = get_verified_admin(request)
        if report.assignedTo_id != admin.adminID:
            return Response({"error": "You are not assigned to this report."},
                            status=status.HTTP_403_FORBIDDEN)
        report.isResolved   = True
        report.resolvedDate = timezone.now()
        report.status       = "resolved"
        report.save()
        return Response(ReportSerializer(report, context={"request": request}).data)
    except Report.DoesNotExist:
        return Response({"error": "Report not found."}, status=status.HTTP_404_NOT_FOUND)


# ── Hotlines ──────────────────────────────────────────────────────────────────

class HotlineCategoryViewSet(viewsets.ModelViewSet):
    queryset         = HotlineCategory.objects.all()
    serializer_class = HotlineCategorySerializer

    def get_permissions(self):
        from rest_framework.permissions import SAFE_METHODS
        if self.request.method in SAFE_METHODS:
            return [AllowAny()]
        return [IsSuperAdminUser()]


class HotlineViewSet(viewsets.ModelViewSet):
    queryset         = Hotline.objects.all()
    serializer_class = HotlineSerializer

    def get_permissions(self):
        from rest_framework.permissions import SAFE_METHODS
        if self.request.method in SAFE_METHODS:
            return [AllowAny()]
        return [IsSuperAdminUser()]