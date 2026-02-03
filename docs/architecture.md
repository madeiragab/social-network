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

The full domain model is described in the UML class diagram.

See: `/docs/diagrams/class-diagram.png`

## Main Flows

Two main system flows were modeled:

- Post creation flow
- Feed loading flow

These flows are documented using sequence diagrams.

See:
- `/docs/diagrams/sequence-create-post.png`
- `/docs/diagrams/sequence-feed.png`
