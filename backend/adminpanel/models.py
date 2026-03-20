# adminpanel/models.py
from django.db import models


class Admin(models.Model):
    adminID = models.AutoField(primary_key=True)
    officeName = models.CharField(max_length=150)
    username = models.CharField(max_length=100, unique=True)
    password = models.CharField(max_length=255)
    email = models.EmailField()
    contactNumber = models.CharField(max_length=20)
    createdDate = models.DateTimeField(auto_now_add=True)
    isActive = models.BooleanField(default=True)

    def __str__(self):
        return self.officeName


class Announcement(models.Model):
    admin = models.ForeignKey(
        Admin, on_delete=models.CASCADE,
        related_name="announcements", null=True, blank=True
    )
    title = models.CharField(max_length=200)
    content = models.TextField()
    createdDate = models.DateTimeField(auto_now_add=True)
    isActive = models.BooleanField(default=True)
    isPinned = models.BooleanField(default=False)

    def __str__(self):
        return self.title


class AnnouncementMedia(models.Model):
    """Stores one image or video per row, linked to an Announcement."""
    MEDIA_TYPES = [
        ("image", "Image"),
        ("video", "Video"),
    ]
    announcement = models.ForeignKey(
        Announcement, on_delete=models.CASCADE,
        related_name="media"
    )
    file = models.FileField(upload_to="announcement_media/")
    mediaType = models.CharField(max_length=10, choices=MEDIA_TYPES, default="image")
    uploadedAt = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.mediaType} for {self.announcement.title}"


class Event(models.Model):
    eventID      = models.AutoField(primary_key=True)
    admin        = models.ForeignKey(Admin, on_delete=models.CASCADE,
                                     related_name="events", null=True, blank=True)
    title        = models.CharField(max_length=200)
    description  = models.TextField(blank=True)
    eventDate    = models.DateTimeField()
    location     = models.CharField(max_length=300)
    posterPath   = models.ImageField(upload_to="event_posters/", null=True, blank=True)
    createdDate  = models.DateTimeField(auto_now_add=True)
    approvedBy   = models.IntegerField(null=True, blank=True)
    approvedDate = models.DateTimeField(null=True, blank=True)
    isApproved   = models.BooleanField(default=False)
    declineReason = models.TextField(null=True, blank=True)

    class Meta:
        ordering = ["-createdDate"]

    def __str__(self):
        return self.title