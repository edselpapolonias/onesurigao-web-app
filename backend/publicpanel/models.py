# publicpanel/models.py
from django.db import models


class PublicUser(models.Model):
    publicUserID     = models.AutoField(primary_key=True)
    name             = models.CharField(max_length=100)
    lastName         = models.CharField(max_length=100)
    username         = models.CharField(max_length=100, unique=True)
    password         = models.CharField(max_length=255)
    email            = models.EmailField(unique=True)
    registrationDate = models.DateTimeField(auto_now_add=True)
    isRegistered     = models.BooleanField(default=True)
    profilePic       = models.ImageField(upload_to='profile_pics/', null=True, blank=True)

    def __str__(self):
        return self.username


class Report(models.Model):
    STATUS_CHOICES = [
        ("pending",   "Pending"),
        ("approved",  "Approved"),
        ("declined",  "Declined"),
        ("responded", "Responded"),
        ("resolved",  "Resolved"),   # ✅ new
    ]

    reportID        = models.AutoField(primary_key=True)
    publicUser      = models.ForeignKey(PublicUser, on_delete=models.CASCADE,
                                         related_name="reports", null=True, blank=True)
    location        = models.CharField(max_length=300)
    barangay        = models.CharField(max_length=100)
    report          = models.CharField(max_length=200)
    description     = models.TextField()
    submittedDate   = models.DateTimeField(auto_now_add=True)
    validatedBy     = models.IntegerField(null=True, blank=True)
    validatedDate   = models.DateTimeField(null=True, blank=True)
    status          = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    rejectionReason = models.TextField(null=True, blank=True)
    assignedTo      = models.ForeignKey(
        "adminpanel.Admin", on_delete=models.SET_NULL,
        null=True, blank=True, related_name="assigned_reports"
    )
    # ✅ Replaced single adminResponse with a JSON list of responses
    adminResponses  = models.JSONField(default=list, blank=True)
    respondedDate   = models.DateTimeField(null=True, blank=True)
    # ✅ Resolution fields
    isResolved      = models.BooleanField(default=False)
    resolvedDate    = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-submittedDate"]

    def __str__(self):
        return f"Report #{self.reportID} - {self.report}"


class ReportMedia(models.Model):
    MEDIA_TYPES = [("image", "Image"), ("video", "Video")]
    report     = models.ForeignKey(Report, on_delete=models.CASCADE, related_name="media")
    file       = models.FileField(upload_to="report_media/")
    mediaType  = models.CharField(max_length=10, choices=MEDIA_TYPES, default="image")
    uploadedAt = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.mediaType} for Report #{self.report.reportID}"


class HotlineCategory(models.Model):
    name  = models.CharField(max_length=150)
    icon  = models.CharField(max_length=10, default="📞")
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.name


class Hotline(models.Model):
    category      = models.ForeignKey(HotlineCategory, on_delete=models.CASCADE,
                                       related_name="hotlines")
    name          = models.CharField(max_length=200)
    contactNumber = models.CharField(max_length=50)
    order         = models.IntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.name} - {self.contactNumber}"