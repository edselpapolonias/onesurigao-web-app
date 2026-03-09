from rest_framework import serializers
from .models import Admin
from .models import Announcement, Event


class AdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Admin
        fields = ["adminID", "officeName", "username", "password",
                  "email", "contactNumber", "createdDate", "isActive"]
        extra_kwargs = {
            "password": {"write_only": False},  # ✅ ensure password is saved as-is
            "createdDate": {"read_only": True},
            "adminID": {"read_only": True},
        }


class AnnouncementSerializer(serializers.ModelSerializer):
    admin = AdminSerializer(read_only=True)

    admin_id = serializers.PrimaryKeyRelatedField(
        queryset=Admin.objects.all(),
        source="admin",
        write_only=True,
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Announcement
        fields = ["id", "admin", "admin_id", "title", "content", "createdDate", "isActive", "isPinned"]
        read_only_fields = ["id", "createdDate"]

class EventSerializer(serializers.ModelSerializer):
    admin    = AdminSerializer(read_only=True)
    admin_id = serializers.PrimaryKeyRelatedField(
        queryset=Admin.objects.all(), source="admin",
        write_only=True, required=False, allow_null=True,
    )
    # Return full URL for the poster image
    posterPath = serializers.ImageField(use_url=True, required=False, allow_null=True)

    class Meta:
        model  = Event
        fields = [
            "eventID", "admin", "admin_id",
            "title", "description", "eventDate",
            "location", "posterPath",
            "createdDate", "approvedBy", "approvedDate", "isApproved",
        ]
        read_only_fields = ["eventID", "createdDate", "isApproved", "approvedBy", "approvedDate"]
