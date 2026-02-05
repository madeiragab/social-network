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
        
        # Process media files
        media_files = request.FILES.getlist('media')
        print(f"DEBUG: Received {len(media_files)} media files")  # Debug log
        
        for i, file in enumerate(media_files):
            print(f"DEBUG: Processing file {i}: {file.name}, type: {file.content_type}")  # Debug log
            if file.content_type.startswith('image'):
                media_type = 'image'
            elif file.content_type.startswith('video'):
                media_type = 'video'
            else:
                print(f"DEBUG: Skipping unsupported type {file.content_type}")  # Debug log
                continue
            
            media_obj = PostMedia.objects.create(
                post=post, 
                file=file, 
                media_type=media_type, 
                order=i
            )
            print(f"DEBUG: Created PostMedia {media_obj.id}")  # Debug log
        
        # Refresh serializer data to include media
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
