"""
Domain specification:

Entity:
- Reaction

Rules:
- Reaction links User and Post
- One reaction per user per post
- Database-level uniqueness constraint
"""

from django.db import models
from django.contrib.auth import get_user_model
from apps.posts.models import Post

User = get_user_model()


class Reaction(models.Model):
    """User reaction to a post."""
    REACTION_TYPES = [
        ('like', 'Like'),
        ('love', 'Love'),
        ('haha', 'Haha'),
        ('wow', 'Wow'),
        ('sad', 'Sad'),
        ('angry', 'Angry'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reactions')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='reactions')
    reaction_type = models.CharField(max_length=10, choices=REACTION_TYPES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'post'], name='unique_reaction_per_user_post'),
        ]
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} {self.reaction_type} on post {self.post.id}"
