# Backend

Django REST API for the social network.

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env

# Run migrations
python manage.py migrate

# Start server
python manage.py runserver
```

## API Structure

- `/api/users/` - User management
- `/api/posts/` - Posts and media
- `/api/reactions/` - Post reactions

See main [README](../README.md) for architecture details.
