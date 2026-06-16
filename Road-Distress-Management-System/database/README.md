# Database Module

This folder contains PostgreSQL database planning files.

## Purpose

The database stores GPS-tagged road distress detections, severity information, timestamps, media references, maintenance status, and report-related data.

## Folder Guide

```text
schema/         SQL schema design and table definitions
migrations/     Versioned database migration files
```

## Suggested Responsibilities

The database member should focus on:

- Detection table design
- GPS latitude and longitude storage
- Maintenance status fields
- Migration planning
- Coordination with backend models and schemas

