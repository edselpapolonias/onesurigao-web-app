from django.shortcuts import render

from rest_framework import viewsets
from .models import Admin, Announcement
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import AdminSerializer, AnnouncementSerializer

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