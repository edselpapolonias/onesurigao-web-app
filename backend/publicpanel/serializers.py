# publicpanel/serializers.py
from rest_framework import serializers
from .models import PublicUser, Report, ReportMedia, HotlineCategory, Hotline
from adminpanel.serializers import AdminSerializer


class PublicUserSerializer(serializers.ModelSerializer):
    class Meta:
        model  = PublicUser
        fields = ["publicUserID", "name", "lastName", "username", "password",
                  "email", "registrationDate", "isRegistered"]
        extra_kwargs = {
            "password":         {"write_only": False},
            "registrationDate": {"read_only": True},
            "publicUserID":     {"read_only": True},
        }


class ReportMediaSerializer(serializers.ModelSerializer):
    file = serializers.FileField(use_url=True)
    class Meta:
        model  = ReportMedia
        fields = ["id", "file", "mediaType", "uploadedAt"]
        read_only_fields = ["id", "uploadedAt"]


class ReportSerializer(serializers.ModelSerializer):
    media        = ReportMediaSerializer(many=True, read_only=True)
    publicUser   = PublicUserSerializer(read_only=True)
    assignedTo   = AdminSerializer(read_only=True)
    publicUser_id = serializers.PrimaryKeyRelatedField(
        queryset=PublicUser.objects.all(), source="publicUser",
        write_only=True, required=False, allow_null=True,
    )
    assignedTo_id = serializers.PrimaryKeyRelatedField(
        queryset=__import__("adminpanel.models", fromlist=["Admin"]).Admin.objects.all(),
        source="assignedTo", write_only=True, required=False, allow_null=True,
    )

    class Meta:
        model  = Report
        fields = [
            "reportID", "publicUser", "publicUser_id",
            "location", "barangay", "report", "description",
            "submittedDate", "validatedBy", "validatedDate",
            "status", "rejectionReason",
            "assignedTo", "assignedTo_id",
            "adminResponses", "respondedDate",
            "isResolved", "resolvedDate",
            "media",
        ]
        read_only_fields = ["reportID", "submittedDate"]


class HotlineSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Hotline
        fields = ["id", "category", "name", "contactNumber", "order"]
        read_only_fields = ["id"]


class HotlineCategorySerializer(serializers.ModelSerializer):
    hotlines = HotlineSerializer(many=True, read_only=True)

    class Meta:
        model  = HotlineCategory
        fields = ["id", "name", "icon", "order", "hotlines"]
        read_only_fields = ["id"]