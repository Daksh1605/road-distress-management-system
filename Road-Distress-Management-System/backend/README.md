# Road Distress Management System - Backend Module

This repository module contains the production-ready FastAPI foundation for the Road Distress Management System.

## Architecture Directory Guide

```text
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── routes/          # API endpoint routers
│   │       │   ├── auth.py
│   │       │   ├── distress.py
│   │       │   ├── gis.py
│   │       │   ├── reports.py
│   │       │   ├── maintenance.py
│   │       │   └── upload.py
│   │       └── __init__.py
│   ├── core/                    # App settings and security configurations
│   │   ├── config.py
│   │   └── security.py
│   ├── db/                      # Database engine and session handlers
│   │   ├── database.py
│   │   └── session.py
│   ├── models/                  # Database models (SQLAlchemy)
│   ├── schemas/                 # Request & response validation schemas (Pydantic)
│   ├── services/                # Business logic services
│   ├── utils/                   # Shared helpers and utilities
│   └── main.py                  # Primary application entrypoint
├── requirements.txt             # Project dependencies
├── .env.example                 # Environment settings template
└── .gitignore                   # Ignored files list
```

## Setup & Local Installation

Follow these steps to run the backend application locally:

### 1. Create a Python Virtual Environment
Navigate to the `backend/` directory and run:
```bash
# Windows
python -m venv .venv
.venv\Scripts\activate

# macOS / Linux
python3 -m venv .venv
source .venv/bin/activate
```

### 2. Install Project Dependencies
With the virtual environment active, run:
```bash
pip install -r requirements.txt
```

### 3. Setup Configuration Variables
Copy the template `.env.example` file to `.env`:
```bash
# Windows (PowerShell)
Copy-Item .env.example .env

# macOS / Linux / Windows (Command Prompt)
cp .env.example .env
```

### 4. Execute the Application Server
Run the FastAPI application server using Uvicorn:
```bash
uvicorn app.main:app --reload
```

## API Documentation & Verification

Once the server starts up, verify the running instance at:

- **Health Check Endpoint**: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)
- **Interactive Swagger Documentation**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Alternative Redoc Documentation**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
