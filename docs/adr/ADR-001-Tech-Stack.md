# ADR-001: Technology Stack Selection

## Status
Accepted

## Context
We need a lightweight, scalable, and modern stack for a prepaid restaurant POS system. High developer productivity and standard TypeScript safety are key.

## Decision
Use React 19 for the frontend (Vite bundler, Tailwind CSS, Shadcn UI) and Node.js with Express and Prisma ORM for the backend.

## Alternatives Considered
- Next.js (ruled out to keep POS cashier interface completely client-side isolated for speed).
- NestJS (ruled out to avoid unnecessary boilerplate and keep development lightweight).

## Consequences
- Single programming language (TypeScript) across the stack.
- Fast local compiles and rapid UI iterations with Vite.
