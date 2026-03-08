from rest_framework import serializers
from .models import Admin
from .models import Announcement


class AdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Admin
        fields = ["adminID", "officeName", "username", "email", "contactNumber"]

class AnnouncementSerializer(serializers.ModelSerializer):
    # ✅ Returns nested admin object so the card can show officeName
    admin = AdminSerializer(read_only=True)

    # ✅ Accepts admin ID when creating a new announcement
    admin_id = serializers.PrimaryKeyRelatedField(
        queryset=Admin.objects.all(),
        source="admin",
        write_only=True,
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Announcement
        fields = [
            "id",
            "admin",       # read: returns { adminID, officeName, ... }
            "admin_id",    # write: accepts admin's primary key
            "title",
            "content",
            "createdDate",
            "isActive",
        ]
        read_only_fields = ["id", "createdDate"]