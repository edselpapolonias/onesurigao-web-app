# superpanel/models.py
from django.db import models
from django.contrib.auth.hashers import make_password, check_password


class SuperAdmin(models.Model):
    superAdminID   = models.AutoField(primary_key=True)
    superAdminName = models.CharField(max_length=150)
    username       = models.CharField(max_length=100, unique=True)
    # Stored as a Django-hashed value
    password       = models.CharField(max_length=255)
    email          = models.EmailField(unique=True)
    contactNumber  = models.CharField(max_length=20)
    createdDate    = models.DateTimeField(auto_now_add=True)
    isActive       = models.BooleanField(default=True)

    class Meta:
        ordering = ["-createdDate"]

    def set_password(self, raw_password):
        self.password = make_password(raw_password)

    def check_password(self, raw_password):
        return check_password(raw_password, self.password)

    def __str__(self):
        return self.username