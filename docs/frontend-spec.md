# Frontend Specification

## Project Overview

This is the frontend for a backend-first social network.
The frontend is intentionally simple and focused on clarity.

## Design Rules

- **Primary colors**: Green and white
- **Layout**: Minimalist
- **Animations**: None (no heavy animations)
- **Typography**: Clean
- **Responsiveness**: Full responsive layout

## Core Features

### Authentication
- Account creation (sign up)
- Login
- Session management

### Feed
- Display posts in chronological order
- Infinite scroll or pagination

### Post Creation
Content types:
- Text content
- Hyperlinks inside text
- Images
- Videos
- Multiple media items per post

## Architecture Principles

- **Backend-first**: All business rules are enforced by the backend
- **Untrusted client**: Frontend acts as an untrusted client
- **API-driven**: Frontend only consumes REST APIs
- **No business logic**: Frontend contains no business rules or validation logic
- **Simplicity**: Keep UI and interactions simple and clear

## Technology Stack

(To be defined)

## API Integration

The frontend consumes these backend endpoints:
- `/api/users/` - User management and profiles
- `/api/posts/` - Posts and media
- `/api/reactions/` - Post reactions

All API interactions are authenticated using token-based authentication.
