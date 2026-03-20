# superpanel/serializers.py
from rest_framework import serializers
from .models import SuperAdmin


class SuperAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = SuperAdmin
        fields = [
            "superAdminID", "superAdminName", "username", "password",
            "email", "contactNumber", "createdDate", "isActive",
        ]
        extra_kwargs = {
            "password":     {"write_only": False},
            "createdDate":  {"read_only": True},
            "superAdminID": {"read_only": True},
        }