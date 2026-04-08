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


# ── AI Chatbot (Real-Time RAG) ────────────────────────────────────────────────

@api_view(["POST"])
@permission_classes([AllowAny])
def chatbot_query(request):
    import os
    from google import genai

    query = request.data.get("query", "").strip()
    if not query:
        return Response({"error": "Query cannot be empty."}, status=status.HTTP_400_BAD_REQUEST)

    # 1. REAL-TIME RAG FETCHING (Announcements, Events, Hotlines)
    from adminpanel.models import Announcement, Event
    from .models import Hotline

    # Fetch top 30 active announcements
    announcements = Announcement.objects.select_related('admin').filter(isActive=True).order_by("-createdDate")[:30]
    ann_content = []
    for a in announcements:
        office = a.admin.officeName if a.admin else "City Admin"
        date_str = a.createdDate.strftime("%Y-%m-%d %I:%M %p")
        ann_content.append(f"[{date_str}] Posted by {office}: {a.title}\n{a.content}")
    ann_info = "\n\n".join(ann_content)

    # Fetch top 15 approved events
    events = Event.objects.filter(isApproved=True).order_by("-createdDate")[:15]
    event_content = []
    for e in events:
        date_str = e.eventDate.strftime("%Y-%m-%d %I:%M %p")
        event_content.append(f"Event: {e.title}\nDate: {date_str}\nLocation: {e.location}\nDetails: {e.description}")
    event_info = "\n\n".join(event_content)

    # Fetch all hotlines
    hotlines = Hotline.objects.select_related('category').all()
    hotline_info = "\n".join([f"- {h.category.name if h.category else 'General'} - {h.name}: {h.contactNumber}" for h in hotlines])

    # 2. PROMPT CONSTRUCTION
    system_prompt = f"""You are the OneSurigao Virtual Assistant. You help citizens of Surigao City by providing real-time, accurate information based strictly on the following data pulled directly from the OneSurigao database.

=== RECENT ANNOUNCEMENTS (RAG Context) ===
{ann_info if ann_info else "No recent announcements."}

=== UPCOMING/RECENT EVENTS ===
{event_info if event_info else "No recent events."}

=== EMERGENCY HOTLINES ===
{hotline_info if hotline_info else "No hotlines available."}

=== GUIDELINES ===
1. Respond in a natural, conversational, and explanatory tone. Avoid boring lists; instead, explain the information as a helpful human assistant would.
2. If asked about an announcement or event, summarize the details and offer context.
3. Be precise: Use ONLY the context provided above.
4. If the question is outside the scope of announcements, events, or hotlines, politely explain what you CAN help with.
5. NO CONVERSATION HISTORY: Treat every query as a fresh question.
6. Keep formatting clean using Markdown highlights where necessary.

Always act as a helpful government assistant."""

    gemini_key = os.environ.get("GEMINI_API_KEY")
    if not gemini_key:
        return Response({
            "text": "The AI is currently resting (API Key not configured in `.env`). But you can still explore the dashboard!"
        })

    try:
        from tenacity import retry, stop_after_attempt, wait_fixed, retry_if_exception_type

        @retry(
            stop=stop_after_attempt(3), 
            wait=wait_fixed(2),
            retry=retry_if_exception_type(Exception) # We'll retry on any exception for maximum resilience against 503s
        )
        def call_gemini():
            client = genai.Client(api_key=gemini_key)
            # Using gemini-2.0-flash as it is confirmed available for this key
            return client.models.generate_content(
                model="gemini-flash-latest",
                contents=f"{system_prompt}\n\nUSER QUESTION: {query}"
            )
        
        response = call_gemini()
        return Response({"text": response.text})
    except Exception as e:
        print(f"!!! CHATBOT ERROR: {str(e)}")
        return Response({"error": f"AI Error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)