# superpanel/models.py
from django.db import models


class SuperAdmin(models.Model):
    superAdminID    = models.AutoField(primary_key=True)
    superAdminName  = models.CharField(max_length=150)
    username        = models.CharField(max_length=100, unique=True)
    password        = models.CharField(max_length=255)
    email           = models.EmailField(unique=True)
    contactNumber   = models.CharField(max_length=20)
    createdDate     = models.DateTimeField(auto_now_add=True)
    isActive        = models.BooleanField(default=True)

    class Meta:
        ordering = ["-createdDate"]

    def __str__(self):
        return self.username