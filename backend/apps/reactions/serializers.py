from rest_framework import serializers
from .models import Reaction


class ReactionSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Reaction
        fields = ['id', 'user', 'user_username', 'post', 'reaction_type', 'created_at']
        read_only_fields = ['user', 'created_at']
