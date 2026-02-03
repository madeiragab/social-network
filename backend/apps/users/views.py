from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import Profile, Follow
from .serializers import UserSerializer, ProfileSerializer, FollowSerializer


class UserViewSet(viewsets.ModelViewSet):
    """API viewset for User model."""
    queryset = User.objects.all()
    serializer_class = UserSerializer

    @action(detail=True, methods=['post'])
    def follow(self, request, pk=None):
        """Follow a user."""
        user_to_follow = self.get_object()
        follow, created = Follow.objects.get_or_create(
            follower=request.user,
            following=user_to_follow
        )
        if not created:
            return Response({'detail': 'Already following this user.'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(FollowSerializer(follow).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def unfollow(self, request, pk=None):
        """Unfollow a user."""
        user_to_unfollow = self.get_object()
        follow = Follow.objects.filter(
            follower=request.user,
            following=user_to_unfollow
        )
        if not follow.exists():
            return Response({'detail': 'Not following this user.'}, status=status.HTTP_400_BAD_REQUEST)
        follow.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ProfileViewSet(viewsets.ModelViewSet):
    """API viewset for Profile model."""
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
