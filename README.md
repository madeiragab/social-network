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

- Architecture overview: `/docs/architecture.md`
- Architectural decisions: `/docs/decisions.md`
- UML diagrams: `/docs/diagrams`

## Technology Stack

- Backend: Django, Django REST Framework
- Database: PostgreSQL
- Diagrams: UML (Class and Sequence Diagrams)

## Project Status

Integration testing in progress.
Core backend architecture, database models, and frontend features are implemented.

