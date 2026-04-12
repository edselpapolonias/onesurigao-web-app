# adminpanel/serializers.py
from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import Admin, Announcement, AnnouncementMedia, Event

# Allowed upload types and max size
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
ALLOWED_VIDEO_TYPES = {"video/mp4", "video/webm", "video/ogg"}
ALLOWED_MEDIA_TYPES = ALLOWED_IMAGE_TYPES | ALLOWED_VIDEO_TYPES
MAX_UPLOAD_MB       = 20


def _validate_media_file(file):
    """Shared upload validator: MIME type + size."""
    if file.content_type not in ALLOWED_MEDIA_TYPES:
        raise serializers.ValidationError(
            f"Unsupported file type '{file.content_type}'. "
            f"Allowed: {', '.join(sorted(ALLOWED_MEDIA_TYPES))}"
        )
    if file.size > MAX_UPLOAD_MB * 1024 * 1024:
        raise serializers.ValidationError(
            f"File too large. Maximum size is {MAX_UPLOAD_MB} MB."
        )
    return file


# ── Safe, public-facing Admin representation (no password) ───────────────────
class SafeAdminSerializer(serializers.ModelSerializer):
    """Used wherever admin info is embedded in read responses (announcements, events, etc.)."""
    profilePic = serializers.ImageField(use_url=True, read_only=True)

    class Meta:
        model  = Admin
        fields = ["adminID", "officeName", "email", "contactNumber",
                  "createdDate", "isActive", "profilePic", "latitude", "longitude"]
        read_only_fields = fields


# ── Full Admin serializer (used only by admin-facing management endpoints) ────
class AdminSerializer(serializers.ModelSerializer):
    profilePic   = serializers.ImageField(use_url=True, required=False, allow_null=True)
    # password is accepted on write, never returned on read
    password     = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model  = Admin
        fields = ["adminID", "officeName", "username", "password",
                  "email", "contactNumber", "createdDate", "isActive", "profilePic", "latitude", "longitude"]
        read_only_fields = ["adminID", "createdDate", "isActive"]

    def validate_password(self, value):
        if value:
            return make_password(value)
        # No change — return current hash untouched (handled in update)
        return value

    def update(self, instance, validated_data):
        raw_pw = validated_data.pop("password", None)
        instance = super().update(instance, validated_data)
        if raw_pw:
            # raw_pw was already hashed by validate_password only if non-empty
            instance.password = raw_pw
            instance.save(update_fields=["password"])
        return instance

    def create(self, validated_data):
        # make_password was already applied by validate_password
        return super().create(validated_data)


# ── Announcement / Event serializers ─────────────────────────────────────────
class AnnouncementMediaSerializer(serializers.ModelSerializer):
    file = serializers.FileField(use_url=True)

    class Meta:
        model        = AnnouncementMedia
        fields       = ["id", "file", "mediaType", "uploadedAt"]
        read_only_fields = ["id", "uploadedAt"]


class AnnouncementSerializer(serializers.ModelSerializer):
    admin    = SafeAdminSerializer(read_only=True)
    admin_id = serializers.PrimaryKeyRelatedField(
        queryset=Admin.objects.all(), source="admin",
        write_only=True, required=False, allow_null=True,
    )
    media    = AnnouncementMediaSerializer(many=True, read_only=True)

    class Meta:
        model  = Announcement
        fields = ["id", "admin", "admin_id", "title", "content",
                  "createdDate", "isActive", "isPinned", "media"]
        read_only_fields = ["id", "createdDate"]
        # Prevent clients from directly setting privileged fields
        extra_kwargs = {
            "isActive": {"required": False},
            "isPinned": {"required": False},
        }


class EventSerializer(serializers.ModelSerializer):
    admin      = SafeAdminSerializer(read_only=True)
    admin_id   = serializers.PrimaryKeyRelatedField(
        queryset=Admin.objects.all(), source="admin",
        write_only=True, required=False, allow_null=True,
    )
    posterPath = serializers.ImageField(use_url=True, required=False, allow_null=True)

    class Meta:
        model  = Event
        fields = [
            "eventID", "admin", "admin_id",
            "title", "description", "eventDate",
            "location", "posterPath",
            "createdDate", "approvedBy", "approvedDate",
            "isApproved", "declineReason",
        ]
        read_only_fields = [
            "eventID", "createdDate",
            # These must only be set by superadmin approve/decline endpoints
            "isApproved", "approvedBy", "approvedDate", "declineReason",
        ]