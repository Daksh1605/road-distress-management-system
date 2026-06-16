# Backend Module

This folder contains the FastAPI backend for the Road Distress Management System.

## Purpose

The backend exposes APIs for detections, reports, dashboard data, GPS-tagged records, and future integrations with the AI module and PostgreSQL database.

## Folder Guide

```text
app/routes/         API route files
app/services/       Business logic and integration services
app/models/         Database models
app/schemas/        Request and response schemas
app/database/       Database connection and session setup
app/utils/          Backend helper functions
```

## Suggested Responsibilities

The backend member should focus on:

- FastAPI route design
- API validation and response formats
- Connecting frontend, AI module, and database
- Report generation endpoints
- Clean API contracts documented in `shared/api-contracts/`

