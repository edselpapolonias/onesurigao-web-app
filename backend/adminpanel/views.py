from django.shortcuts import render

from rest_framework import viewsets, parsers
from .models import Admin, Announcement, Event
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import AdminSerializer, AnnouncementSerializer, EventSerializer

class AdminViewSet(viewsets.ModelViewSet):
    queryset = Admin.objects.all()
    serializer_class = AdminSerializer

@api_view(['POST'])
def admin_login(request):
    username = request.data.get('username')
    password = request.data.get('password')

    try:
        admin = Admin.objects.get(username=username, password=password)

        return Response({
            "success": True,
            "message": "Login successful",
            "adminID": admin.adminID,
            "username": admin.username,
            "officeName": admin.officeName
        })

    except Admin.DoesNotExist:
        return Response({
            "success": False,
            "message": "Invalid username or password"
        })
    
class AnnouncementViewSet(viewsets.ModelViewSet):
    queryset = Announcement.objects.all()
    serializer_class = AnnouncementSerializer

class EventViewSet(viewsets.ModelViewSet):
    serializer_class = EventSerializer
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_queryset(self):
        # ✅ Return approved events for everyone
        # PLUS the requesting admin's own pending events so they see their submissions
        admin_id = self.request.query_params.get("adminID")

        if admin_id:
            from django.db.models import Q
            return Event.objects.filter(
                Q(isApproved=True) | Q(admin__adminID=admin_id)
            ).order_by("-createdDate")

        # No adminID param → only show approved (public view)
        return Event.objects.filter(isApproved=True).order_by("-createdDate")

    def perform_create(self, serializer):
        serializer.save()