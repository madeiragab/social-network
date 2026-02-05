from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import User, Profile, Follow
from .serializers import UserSerializer, UserCreateSerializer, UserDetailSerializer, ProfileSerializer, FollowSerializer


class UserViewSet(viewsets.ModelViewSet):
    """API viewset for User model."""
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action in ['create']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        if self.action == 'retrieve':
            return UserDetailSerializer
        return UserSerializer

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        serializer = UserDetailSerializer(request.user)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def follow(self, request, pk=None):
        """Follow a user."""
        user_to_follow = self.get_object()
        if request.user == user_to_follow:
            return Response({'detail': 'Cannot follow yourself.'}, status=status.HTTP_400_BAD_REQUEST)
        
        follow, created = Follow.objects.get_or_create(
            follower=request.user,
            following=user_to_follow
        )
        if not created:
            return Response({'detail': 'Already following this user.'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(FollowSerializer(follow).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
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
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    @action(detail=False, methods=['get', 'patch'], permission_classes=[IsAuthenticated])
    def me(self, request):
        try:
            profile = request.user.profile
        except Profile.DoesNotExist:
            # Create profile if doesn't exist
            profile = Profile.objects.create(user=request.user)
        
        if request.method == 'GET':
            serializer = ProfileSerializer(profile, context={'request': request})
            return Response(serializer.data)
        elif request.method == 'PATCH':
            serializer = ProfileSerializer(profile, data=request.data, partial=True, context={'request': request})
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            serializer.save()
            return Response(serializer.data)

    @action(detail=False, methods=['delete'], permission_classes=[IsAuthenticated], url_path='me/avatar')
    def remove_avatar(self, request):
        try:
            profile = request.user.profile
            if profile.avatar:
                profile.avatar.delete()
                profile.avatar = None
                profile.save()
                return Response({'message': 'Avatar removed successfully'}, status=status.HTTP_200_OK)
            return Response({'detail': 'No avatar to remove'}, status=status.HTTP_400_BAD_REQUEST)
        except Profile.DoesNotExist:
            return Response({'detail': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

