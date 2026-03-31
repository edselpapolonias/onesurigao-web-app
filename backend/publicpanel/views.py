# publicpanel/views.py
from rest_framework import viewsets, mixins, parsers
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.utils import timezone
from .models import PublicUser, Report, ReportMedia, HotlineCategory, Hotline
from .serializers import PublicUserSerializer, ReportSerializer, HotlineCategorySerializer, HotlineSerializer
from adminpanel.models import Announcement, Event
from adminpanel.serializers import AnnouncementSerializer, EventSerializer


class PublicUserViewSet(viewsets.ModelViewSet):
    queryset         = PublicUser.objects.all()
    serializer_class = PublicUserSerializer


@api_view(["POST"])
def public_login(request):
    username = request.data.get("username")
    password = request.data.get("password")
    try:
        user = PublicUser.objects.get(username=username, password=password)
        return Response({
            "success": True,
            "publicUserID": user.publicUserID,
            "name": user.name,
            "lastName": user.lastName,
            "username": user.username,
        })
    except PublicUser.DoesNotExist:
        return Response({"success": False, "message": "Invalid username or password"})


class PublicAnnouncementViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    serializer_class = AnnouncementSerializer

    def get_queryset(self):
        pinned_only = self.request.query_params.get("pinned")
        if pinned_only:
            return Announcement.objects.filter(isActive=True, isPinned=True).order_by("-createdDate")
        return Announcement.objects.filter(isActive=True).order_by("-createdDate")


class PublicEventViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    serializer_class = EventSerializer
    queryset         = Event.objects.filter(isApproved=True).order_by("-createdDate")


class ReportViewSet(viewsets.ModelViewSet):
    serializer_class = ReportSerializer
    parser_classes   = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_queryset(self):
        user_id = self.request.query_params.get("publicUserID")
        if user_id:
            return Report.objects.filter(publicUser__publicUserID=user_id)
        return Report.objects.all()

    def perform_create(self, serializer):
        report = serializer.save()
        files  = self.request.FILES.getlist("mediaFiles")
        for f in files:
            media_type = "video" if f.content_type.startswith("video") else "image"
            ReportMedia.objects.create(report=report, file=f, mediaType=media_type)


@api_view(["PATCH"])
def approve_report(request, report_id):
    try:
        report = Report.objects.get(reportID=report_id)
        assigned_id    = request.data.get("assignedTo_id")
        super_admin_id = request.data.get("superAdminID")
        if not assigned_id:
            return Response({"error": "Please select an office to assign this report."}, status=400)
        from adminpanel.models import Admin
        try:
            office = Admin.objects.get(adminID=assigned_id)
        except Admin.DoesNotExist:
            return Response({"error": "Selected office not found."}, status=404)
        report.status        = "approved"
        report.assignedTo    = office
        report.validatedBy   = super_admin_id
        report.validatedDate = timezone.now()
        report.rejectionReason = None
        report.save()
        return Response(ReportSerializer(report, context={"request": request}).data)
    except Report.DoesNotExist:
        return Response({"error": "Report not found"}, status=404)


@api_view(["PATCH"])
def decline_report(request, report_id):
    try:
        report = Report.objects.get(reportID=report_id)
        reason         = request.data.get("rejectionReason", "").strip()
        super_admin_id = request.data.get("superAdminID")
        if not reason:
            return Response({"error": "A rejection reason is required."}, status=400)
        report.status          = "declined"
        report.rejectionReason = reason
        report.validatedBy     = super_admin_id
        report.validatedDate   = timezone.now()
        report.save()
        return Response(ReportSerializer(report, context={"request": request}).data)
    except Report.DoesNotExist:
        return Response({"error": "Report not found"}, status=404)


@api_view(["PATCH"])
def respond_report(request, report_id):
    """Admin adds a response. Multiple allowed — appended to adminResponses list."""
    try:
        report   = Report.objects.get(reportID=report_id)
        text     = request.data.get("adminResponse", "").strip()
        if not text:
            return Response({"error": "Response cannot be empty."}, status=400)

        # Append to the list
        responses = report.adminResponses or []
        responses.append({
            "text": text,
            "date": timezone.now().isoformat(),
            "office": report.assignedTo.officeName if report.assignedTo else "Office",
        })
        report.adminResponses = responses
        report.status         = "responded"
        report.respondedDate  = timezone.now()
        report.save()
        return Response(ReportSerializer(report, context={"request": request}).data)
    except Report.DoesNotExist:
        return Response({"error": "Report not found"}, status=404)


@api_view(["PATCH"])
def resolve_report(request, report_id):
    """Admin marks report as resolved."""
    try:
        report = Report.objects.get(reportID=report_id)
        report.isResolved   = True
        report.resolvedDate = timezone.now()
        report.status       = "resolved"
        report.save()
        return Response(ReportSerializer(report, context={"request": request}).data)
    except Report.DoesNotExist:
        return Response({"error": "Report not found"}, status=404)


# ── Hotlines ──────────────────────────────────────────────────────────────────

class HotlineCategoryViewSet(viewsets.ModelViewSet):
    """Super Admin manages; Public/Admin reads."""
    queryset         = HotlineCategory.objects.all()
    serializer_class = HotlineCategorySerializer


class HotlineViewSet(viewsets.ModelViewSet):
    queryset         = Hotline.objects.all()
    serializer_class = HotlineSerializer