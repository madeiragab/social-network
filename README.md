# Social Network

Backend-first social network designed with explicit domain modeling and documented system flows.

This project focuses on architectural clarity, business rules enforcement, and maintainable backend design.

## Project Goals

- Design a social network backend with clear domain boundaries
- Explicitly model relationships and business rules
- Document system behavior before implementation
- Demonstrate backend engineering maturity

## Core Features

- User profiles
- Posts with text, links, images and videos
- Multiple media items per post
- Reactions linked explicitly to users and posts
- Feed generation based on follow relationships

## Architecture Overview

The system follows a client-server architecture where all business rules are enforced on the backend.

The backend is designed before implementation using UML diagrams to reduce ambiguity and improve maintainability.

Detailed documentation can be found in the `/docs` directory.

## Documentation

| Doc | What's inside |
|---|---|
| [docs/architecture.md](docs/architecture.md) | Layers, responsibilities, main flows |
| [docs/api.md](docs/api.md) | Every endpoint, authentication, and the rules each enforces |
| [docs/decisions.md](docs/decisions.md) | Architectural decisions and their rationale |
| [docs/frontend-spec.md](docs/frontend-spec.md) | Frontend specification |
| [docs/diagrams/](docs/diagrams) | UML class and sequence diagrams |

## Running locally

Backend (Django REST API):

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Frontend (React + Vite):

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Technology Stack

- Backend: Django, Django REST Framework
- Authentication: JWT (`djangorestframework-simplejwt`)
- Database: PostgreSQL in production, SQLite for development
- Frontend: React + Vite + Tailwind CSS
- Diagrams: UML (Class and Sequence Diagrams)

## Project Status

Integration testing in progress.
Core backend architecture, database models, and frontend features are implemented.

