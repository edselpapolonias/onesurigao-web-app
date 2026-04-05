# superpanel/serializers.py
from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import SuperAdmin


class SuperAdminSerializer(serializers.ModelSerializer):
    # password is accepted on write, never returned on read
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model  = SuperAdmin
        fields = ["superAdminID", "superAdminName", "username", "password",
                  "email", "contactNumber", "createdDate", "isActive"]
        read_only_fields = ["superAdminID", "createdDate"]

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