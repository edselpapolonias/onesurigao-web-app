# publicpanel/serializers.py
from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import PublicUser, Report, ReportMedia, HotlineCategory, Hotline
from adminpanel.serializers import SafeAdminSerializer


class PublicUserSerializer(serializers.ModelSerializer):
    password   = serializers.CharField(write_only=True, required=False)
    profilePic = serializers.ImageField(use_url=True, required=False, allow_null=True)

    class Meta:
        model  = PublicUser
        fields = ["publicUserID", "name", "lastName", "username", "password",
                  "email", "registrationDate", "isRegistered", "profilePic"]
        read_only_fields = ["publicUserID", "registrationDate"]

    def validate_password(self, value):
        if value:
            return make_password(value)
        return value

    def update(self, instance, validated_data):
        raw_pw = validated_data.pop("password", None)
        instance = super().update(instance, validated_data)
        if raw_pw:
            instance.password = raw_pw  # already hashed by validate_password
            instance.save(update_fields=["password"])
        return instance


class ReportMediaSerializer(serializers.ModelSerializer):
    file = serializers.FileField(use_url=True)

    class Meta:
        model        = ReportMedia
        fields       = ["id", "file", "mediaType", "uploadedAt"]
        read_only_fields = ["id", "uploadedAt"]


class SafePublicUserSerializer(serializers.ModelSerializer):
    """Embedded in Report responses — never includes password."""
    class Meta:
        model  = PublicUser
        fields = ["publicUserID", "name", "lastName", "username", "email"]
        read_only_fields = fields


class ReportSerializer(serializers.ModelSerializer):
    media         = ReportMediaSerializer(many=True, read_only=True)
    publicUser    = SafePublicUserSerializer(read_only=True)
    assignedTo    = SafeAdminSerializer(read_only=True)
    publicUser_id = serializers.PrimaryKeyRelatedField(
        queryset=PublicUser.objects.all(), source="publicUser",
        write_only=True, required=False, allow_null=True,
    )

    class Meta:
        model  = Report
        fields = [
            "reportID", "publicUser", "publicUser_id",
            "location", "barangay", "latitude", "longitude", "report", "description",
            "submittedDate", "validatedBy", "validatedDate",
            "status", "rejectionReason",
            "assignedTo",
            "adminResponses", "respondedDate",
            "isResolved", "resolvedDate",
            "media",
        ]
        read_only_fields = [
            "reportID", "submittedDate",
            # All of these must only be set by the explicit action endpoints
            "status", "rejectionReason", "validatedBy", "validatedDate",
            "assignedTo", "adminResponses", "respondedDate",
            "isResolved", "resolvedDate",
        ]


class HotlineSerializer(serializers.ModelSerializer):
    class Meta:
        model        = Hotline
        fields       = ["id", "category", "name", "contactNumber", "order"]
        read_only_fields = ["id"]


class HotlineCategorySerializer(serializers.ModelSerializer):
    hotlines = HotlineSerializer(many=True, read_only=True)

    class Meta:
        model        = HotlineCategory
        fields       = ["id", "name", "icon", "order", "hotlines"]
        read_only_fields = ["id"]