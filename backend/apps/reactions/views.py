from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Reaction
from .serializers import ReactionSerializer


class ReactionViewSet(viewsets.ModelViewSet):
    """API viewset for Reaction model."""
    queryset = Reaction.objects.all()
    serializer_class = ReactionSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        # Validate post exists
        post_id = request.data.get('post')
        if not post_id:
            return Response({'post': ['This field is required.']}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user already reacted
        existing = Reaction.objects.filter(user=request.user, post_id=post_id).first()
        if existing:
            return Response({'detail': 'You already reacted to this post'}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.user != request.user:
            return Response({'detail': 'You do not have permission to delete this reaction'}, status=status.HTTP_403_FORBIDDEN)
        self.perform_destroy(instance)
        return Response({'message': 'Reaction removed successfully'}, status=status.HTTP_200_OK)

    def perform_create(self, serializer):
        """Automatically set the user to the current user."""
        serializer.save(user=self.request.user)
