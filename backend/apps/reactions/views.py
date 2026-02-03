from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Reaction
from .serializers import ReactionSerializer


class ReactionViewSet(viewsets.ModelViewSet):
    """API viewset for Reaction model."""
    queryset = Reaction.objects.all()
    serializer_class = ReactionSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        """Automatically set the user to the current user."""
        serializer.save(user=self.request.user)
