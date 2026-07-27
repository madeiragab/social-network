> 🇧🇷 [Português](README.pt-BR.md) · 🇬🇧 **English**

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

Create an admin account to browse the data at `/admin/`:

```bash
python manage.py createsuperuser
```

## API Structure

- `/api/auth/` - JWT token issuing and refresh
- `/api/users/` - Users and profiles
- `/api/posts/` - Posts, media and comments
- `/api/reactions/` - Post reactions

Full endpoint reference: [docs/api.md](../docs/api.md).

See main [README](../README.md) for architecture details.
