from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from .models import Post, PostMedia
from .serializers import PostSerializer, PostMediaSerializer


class PostViewSet(viewsets.ModelViewSet):
    """API viewset for Post model."""
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        post = serializer.save(author=request.user)
        
        media_files = request.FILES.getlist('media')
        
        for i, file in enumerate(media_files):
            if file.content_type.startswith('image'):
                media_type = 'image'
            elif file.content_type.startswith('video'):
                media_type = 'video'
            else:
                continue
            
            media_obj = PostMedia.objects.create(
                post=post, 
                file=file, 
                media_type=media_type, 
                order=i
            )
        
        post.refresh_from_db()
        serializer = self.get_serializer(post)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        """Automatically set the author to the current user."""
        serializer.save(author=self.request.user)


class PostMediaViewSet(viewsets.ModelViewSet):
    """API viewset for PostMedia model."""
    queryset = PostMedia.objects.all()
    serializer_class = PostMediaSerializer
    permission_classes = [IsAuthenticated]
