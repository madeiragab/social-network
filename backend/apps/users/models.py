"""
User domain models.

Rules:
- Custom user model
- Profile separated from user
- Explicit relationships only
- No signals
- No business logic yet
"""

from django.db import models
from django.contrib.auth.models import AbstractUser
