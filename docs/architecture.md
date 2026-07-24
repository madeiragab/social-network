# Architecture Overview

This project is a web-based social network focused on backend clarity, domain modeling, and explicit business rules.

The system was designed before implementation to reduce ambiguity and improve maintainability.

## High-Level Architecture

The application follows a classic client-server architecture:

- Frontend: Responsible only for user interaction and API consumption
- Backend API: Centralizes business rules and validation
- Database: Persistent storage and relational integrity

All communication between frontend and backend is done via a REST API.

## Backend Responsibilities

The backend, built with Django and Django REST Framework, is responsible for:

- Authentication and authorization
- Content validation
- Media handling rules
- Feed visibility and access control

No business rule is enforced exclusively on the frontend.

## Data Model

The core domain entities are:

- User and Profile
- Post
- PostMedia
- Reaction
- Follow

Plus `Comment`, added after the initial modeling.

The full domain model is described in the UML class diagram:
[`diagrams/Class Diagram.png`](diagrams/Class%20Diagram.png)

Database-level constraints (unique follows, no self-follow, unique media
order, one reaction per user per post) are listed in [api.md](api.md).

## Main Flows

Two main system flows were modeled — post creation and feed loading —
documented in the sequence diagrams:
[`diagrams/Sequences diagram.png`](diagrams/Sequences%20diagram.png)

## API

The REST surface is documented in [api.md](api.md): authentication,
endpoints per resource and the rules each one enforces.
