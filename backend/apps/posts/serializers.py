from rest_framework import serializers
from .models import Post, PostMedia


class PostMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostMedia
        fields = ['id', 'media_type', 'file', 'created_at']


class PostSerializer(serializers.ModelSerializer):
    media = PostMediaSerializer(many=True, read_only=True)
    author_username = serializers.CharField(source='author.username', read_only=True)
    author_avatar = serializers.SerializerMethodField()
    reaction_count = serializers.SerializerMethodField()
    has_reacted = serializers.SerializerMethodField()
    user_reaction_id = serializers.SerializerMethodField()
    is_owner = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ['id', 'author', 'author_username', 'author_avatar', 'content', 'media', 'created_at', 'updated_at', 'reaction_count', 'has_reacted', 'user_reaction_id', 'is_owner']
        read_only_fields = ['author', 'created_at', 'updated_at']

    def get_author_avatar(self, obj):
        if hasattr(obj.author, 'profile') and obj.author.profile.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.author.profile.avatar.url)
        return None

    def get_reaction_count(self, obj):
        return obj.reactions.count()

    def get_has_reacted(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.reactions.filter(user=request.user).exists()
        return False

    def get_user_reaction_id(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            reaction = obj.reactions.filter(user=request.user).first()
            return reaction.id if reaction else None
        return None

    def get_is_owner(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.author == request.user
        return False
