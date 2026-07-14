# ADR-005: Atomic Daily Resetting Token System

## Status
Accepted

## Context
Every order must receive a daily token number starting at `001` and incrementing sequentially.

## Decision
Maintain a database row register for the current day token and increment it inside a PostgreSQL serialized write lock (`SELECT ... FOR UPDATE`).

## Alternatives Considered
- In-memory counters (ruled out as server restarts would reset token numbers prematurely).

## Consequences
- Complete safety against race conditions and concurrent double-tokens.
- Tiny write overhead per order transaction.
