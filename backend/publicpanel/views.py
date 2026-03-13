from django.shortcuts import render
from rest_framework import viewsets, mixins
from adminpanel.models import Announcement, Event
from adminpanel.serializers import AnnouncementSerializer, EventSerializer


class PublicAnnouncementViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    serializer_class = AnnouncementSerializer

    def get_queryset(self):
        pinned_only = self.request.query_params.get("pinned")
        if pinned_only:
            return Announcement.objects.filter(isActive=True, isPinned=True).order_by("-createdDate")
        return Announcement.objects.filter(isActive=True).order_by("-createdDate")


class PublicEventViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    serializer_class = EventSerializer
    queryset = Event.objects.filter(isApproved=True).order_by("-createdDate")