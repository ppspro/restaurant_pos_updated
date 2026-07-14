# Development Guidelines

## 1. Branch Strategy
- Main branch: `main` (production-ready).
- Development branch: `dev` (staging/testing integrations).
- Feature branches: `feat/<name>`, Bugfix branches: `fix/<name>`.

## 2. Code Quality Checklists
- Avoid `any` types in TypeScript.
- Group all API calls into the `src/api/` layer.
- Commit messages must follow semantic conventions: `feat:`, `fix:`, `refactor:`, `docs:`.
