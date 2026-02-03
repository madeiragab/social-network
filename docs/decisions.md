# Architectural Decisions

This document describes the main technical and architectural decisions taken during the design of the system.

## Backend Framework

Django and Django REST Framework were chosen to provide a mature ecosystem, strong ORM support, and clear separation between domain logic and HTTP concerns.

## Media Modeling

Media files were modeled as a separate entity (`PostMedia`) instead of being embedded directly into the `Post` entity.

This decision allows:
- Multiple images and videos per post
- Clear separation between content and media
- Easier future extensibility

## Reaction Modeling

Reactions were modeled as a separate entity linked to both `User` and `Post`.

This approach makes the relationship explicit and avoids hidden many-to-many abstractions that could obscure business rules.

## Business Rules Location

All business rules, including validation and permission checks, are enforced on the backend.

The frontend is treated as an untrusted client.

## Out of Scope Decisions

The following features were intentionally left out of the initial scope:

- Real-time updates
- Content recommendation algorithms
- Advanced media processing

These features were excluded to keep the initial implementation focused and maintainable.
