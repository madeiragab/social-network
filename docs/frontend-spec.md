# Frontend Specification

## Project Overview

This is the frontend for a backend-first social network.
The frontend is intentionally simple and focused on clarity.

## Design Rules

- **Primary colors**: Green (#10b981) and white
- **Layout**: Minimalist
- **Animations**: None
- **Typography**: Clean sans-serif
- **Responsiveness**: Mobile-first

## Architecture Principles

- **Backend-first**: All business rules are enforced by the backend
- **Untrusted client**: Frontend acts as an untrusted client
- **API-driven**: Frontend only consumes REST APIs
- **No business logic**: Frontend contains no business rules or validation logic
- **Simplicity**: Keep UI and interactions simple and clear

## Core Features

- Authentication (signup/login)
- Feed (chronological posts)
- Post creation (text, images, videos)
- Reactions

## Technology Stack

- React 18
- Vite
- Axios
- JWT authentication

## API Integration

Backend endpoints:
- `/api/auth/` - JWT token management
- `/api/users/` - User management
- `/api/posts/` - Posts and media
- `/api/reactions/` - Post reactions

