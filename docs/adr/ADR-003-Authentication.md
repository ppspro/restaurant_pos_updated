# ADR-003: Stateless JWT Authentication

## Status
Accepted

## Context
Sessions need to be stateless to ensure fast, scalable auth checks.

## Decision
Use JSON Web Tokens (JWT) for stateless auth, with passwords encrypted using bcrypt.

## Alternatives Considered
- Redis-backed sessions (ruled out to avoid running extra memory caches in initial phases).

## Consequences
- Scalable, serverless-ready stateless routes.
- Token theft risks mitigated via short expiration windows.
