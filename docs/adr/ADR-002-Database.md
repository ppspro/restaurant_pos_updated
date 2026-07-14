# ADR-002: Relational Database with PostgreSQL

## Status
Accepted

## Context
POS transactions require strict ACID guarantees for order tokens, payments, and financial reporting.

## Decision
Use PostgreSQL as the primary database with Prisma ORM.

## Alternatives Considered
- MongoDB (ruled out due to lack of standard multi-document transactional locking safety for resetting token counters).

## Consequences
- Full transaction support during payment checkouts.
- Strict schema enforcement using Prisma migrator.
