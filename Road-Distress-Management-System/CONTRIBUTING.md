# Contributing Guide

This guide explains how the team should collaborate on GitHub.

## Branch Strategy

Use these branches for independent work:

- `main` - stable integrated project
- `frontend-dev` - React dashboard
- `backend-dev` - FastAPI backend
- `ai-dev` - YOLO, OpenCV, and ML work
- `database-dev` - PostgreSQL schema and migrations
- `docs-dev` - reports, proposal, diagrams, and presentation

## Workflow

1. Pull the latest changes before starting work.
2. Work only in your assigned module as much as possible.
3. Commit small, clear changes.
4. Push your branch to GitHub.
5. Open a pull request into `main` when your work is ready.
6. Ask at least one team member to review the pull request.
7. Resolve conflicts carefully and avoid deleting another member's work.

## Commit Message Examples

```text
feat(frontend): add detection map page
feat(backend): add detections API route
feat(ai): add inference script structure
docs: update architecture diagram notes
db: add initial detection table schema
```

## Pull Request Checklist

- Code or documentation is placed in the correct folder.
- README files are updated when module behavior changes.
- Large files such as videos, datasets, and model weights are not committed.
- API changes are documented in `shared/api-contracts/`.
- The project still runs or the documentation clearly explains pending work.

## File Ownership

Each member should mainly work inside their assigned folder. Shared files such as the root `README.md`, `docker-compose.yml`, and `shared/api-contracts/` should be changed with team discussion.

