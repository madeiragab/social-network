from rest_framework import serializers
from .models import Post, PostMedia


class PostMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostMedia
        fields = ['id', 'media_type', 'file', 'created_at']


class PostSerializer(serializers.ModelSerializer):
    media = PostMediaSerializer(many=True, read_only=True)
    author_username = serializers.CharField(source='author.username', read_only=True)
    reaction_count = serializers.SerializerMethodField()
    has_reacted = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ['id', 'author', 'author_username', 'content', 'media', 'created_at', 'updated_at', 'reaction_count', 'has_reacted']
        read_only_fields = ['author', 'created_at', 'updated_at']

    def get_reaction_count(self, obj):
        return obj.reactions.count()

    def get_has_reacted(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.reactions.filter(user=request.user).exists()
        return False
