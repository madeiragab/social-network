from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Post, PostMedia
from .serializers import PostSerializer, PostMediaSerializer


class PostViewSet(viewsets.ModelViewSet):
    """API viewset for Post model."""
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        """Automatically set the author to the current user."""
        serializer.save(author=self.request.user)


class PostMediaViewSet(viewsets.ModelViewSet):
    """API viewset for PostMedia model."""
    queryset = PostMedia.objects.all()
    serializer_class = PostMediaSerializer
    permission_classes = [IsAuthenticated]
