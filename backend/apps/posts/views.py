import json
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from .models import Post, PostMedia
from .serializers import PostSerializer, PostMediaSerializer


class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def create(self, request, *args, **kwargs):
        # Validate content
        content = request.data.get('content', '').strip()
        if not content:
            return Response({'content': ['This field may not be blank.']}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = self.get_serializer(data=request.data, context={'request': request})
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        post = serializer.save(author=request.user)
        
        media_files = request.FILES.getlist('media')
        
        # Limit media files
        if len(media_files) > 10:
            post.delete()
            return Response({'media': ['Maximum 10 files allowed']}, status=status.HTTP_400_BAD_REQUEST)
        
        for i, file in enumerate(media_files):
            # Validate file size (10MB max)
            if file.size > 10 * 1024 * 1024:
                post.delete()
                return Response({'media': [f'File {file.name} exceeds 10MB limit']}, status=status.HTTP_400_BAD_REQUEST)
            
            if file.content_type.startswith('image'):
                media_type = 'image'
            elif file.content_type.startswith('video'):
                media_type = 'video'
            else:
                continue
            
            PostMedia.objects.create(
                post=post, 
                file=file, 
                media_type=media_type, 
                order=i
            )
        
        post.refresh_from_db()
        serializer = self.get_serializer(post, context={'request': request})
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        if instance.author != request.user:
            return Response({'detail': 'You do not have permission to edit this post'}, status=status.HTTP_403_FORBIDDEN)
        
        # Validate content if provided
        content = request.data.get('content', '').strip()
        if content == '':
            return Response({'content': ['This field may not be blank.']}, status=status.HTTP_400_BAD_REQUEST)
        
        remove_media = request.data.get('remove_media')
        if remove_media:
            try:
                media_ids = json.loads(remove_media)
                PostMedia.objects.filter(id__in=media_ids, post=instance).delete()
            except (json.JSONDecodeError, TypeError, ValueError) as e:
                return Response({'remove_media': ['Invalid format']}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial, context={'request': request})
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        self.perform_update(serializer)
        
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.author != request.user:
            return Response({'detail': 'You do not have permission to delete this post'}, status=status.HTTP_403_FORBIDDEN)
        self.perform_destroy(instance)
        return Response({'message': 'Post deleted successfully'}, status=status.HTTP_200_OK)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class PostMediaViewSet(viewsets.ModelViewSet):
    """API viewset for PostMedia model."""
    queryset = PostMedia.objects.all()
    serializer_class = PostMediaSerializer
    permission_classes = [IsAuthenticated]
