# adminpanel/serializers.py
from rest_framework import serializers
from .models import Admin, Announcement, AnnouncementMedia, Event


class AdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Admin
        fields = ["adminID", "officeName", "username", "password",
                  "email", "contactNumber", "createdDate", "isActive"]
        extra_kwargs = {
            "password": {"write_only": False},
            "createdDate": {"read_only": True},
            "adminID": {"read_only": True},
        }


class AnnouncementMediaSerializer(serializers.ModelSerializer):
    file = serializers.FileField(use_url=True)

    class Meta:
        model = AnnouncementMedia
        fields = ["id", "file", "mediaType", "uploadedAt"]
        read_only_fields = ["id", "uploadedAt"]


class AnnouncementSerializer(serializers.ModelSerializer):
    admin = AdminSerializer(read_only=True)
    admin_id = serializers.PrimaryKeyRelatedField(
        queryset=Admin.objects.all(), source="admin",
        write_only=True, required=False, allow_null=True,
    )
    # ✅ Nested read-only media list
    media = AnnouncementMediaSerializer(many=True, read_only=True)

    class Meta:
        model = Announcement
        fields = ["id", "admin", "admin_id", "title", "content",
                  "createdDate", "isActive", "isPinned", "media"]
        read_only_fields = ["id", "createdDate"]


class EventSerializer(serializers.ModelSerializer):
    admin = AdminSerializer(read_only=True)
    admin_id = serializers.PrimaryKeyRelatedField(
        queryset=Admin.objects.all(), source="admin",
        write_only=True, required=False, allow_null=True,
    )
    posterPath = serializers.ImageField(use_url=True, required=False, allow_null=True)

    class Meta:
        model = Event
        fields = [
            "eventID", "admin", "admin_id",
            "title", "description", "eventDate",
            "location", "posterPath",
            "createdDate", "approvedBy", "approvedDate", "isApproved", "declineReason",
        ]
        read_only_fields = ["eventID", "createdDate"]