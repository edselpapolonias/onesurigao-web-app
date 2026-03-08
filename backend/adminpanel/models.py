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
        return self.username


class Announcement(models.Model):
    admin = models.ForeignKey(          # ✅ links announcement to the office that posted it
        Admin,
        on_delete=models.CASCADE,
        related_name="announcements",
        null=True,
        blank=True,
    )
    title = models.CharField(max_length=200)
    content = models.TextField()
    createdDate = models.DateTimeField(auto_now_add=True)
    isActive = models.BooleanField(default=True)

    def __str__(self):
        return self.title