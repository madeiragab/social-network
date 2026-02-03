"""
Domain specification:

Entities:
- Post
- PostMedia

Rules:
- Post belongs to one User (author)
- Media is a separate entity
- A Post can have multiple media items
- Media has explicit ordering
- No embedded files in Post
"""

from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Post(models.Model):
    """User-created post."""
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Post by {self.author.username} at {self.created_at}"


class PostMedia(models.Model):
    """Media attached to post."""
    MEDIA_TYPE_CHOICES = [
        ('image', 'Image'),
        ('video', 'Video'),
    ]

    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='media')
    media_type = models.CharField(max_length=10, choices=MEDIA_TYPE_CHOICES)
    file = models.FileField(upload_to='post_media/')
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['post', 'order'], name='unique_media_order'),
        ]
        ordering = ['order', 'created_at']

    def __str__(self):
        return f"{self.media_type} for post {self.post.id}"
