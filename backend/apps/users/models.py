"""
Domain specification:

Entities:
- User (extends AbstractUser)
- Profile (OneToOne with User)
- Follow (explicit table)

Rules:
- No signals
- Profile created explicitly
- Follow has UNIQUE (follower, following)
- Users cannot follow themselves
"""

from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    """Custom user model."""
    email = models.EmailField(unique=True)

    class Meta:
        ordering = ['-date_joined']

    def __str__(self):
        return self.username


class Profile(models.Model):
    """User profile separated from auth."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s profile"


class Follow(models.Model):
    """Explicit follow relationship."""
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name='following')
    following = models.ForeignKey(User, on_delete=models.CASCADE, related_name='followers')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['follower', 'following'], name='unique_follow'),
            models.CheckConstraint(check=~models.Q(follower=models.F('following')), name='no_self_follow'),
        ]
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.follower.username} → {self.following.username}"
