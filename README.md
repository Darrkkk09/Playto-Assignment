# Playto Payout Engine

A  payout processing system for Indian agencies and freelancers. Handles international payments with a ledger-based balance system, concurrent payout requests, and idempotency guarantees.

## Tech Stack
- **Backend**: Django 6.0, Django REST Framework
- **Frontend**: React (Vite), Tailwind CSS, Lucide Icons
- **Database**: PostgreSQL
- **Background Worker**: Huey (with Sqlite storage for tasks)

## Features
- **Merchant Ledger**: Integer-based balance (paise) derived from signed ledger entries.
- **Idempotency**: `Idempotency-Key` header support to prevent duplicate payouts.
- **Concurrency Control**: DB-level `SELECT FOR UPDATE` to prevent overdrawing balance in race conditions.
- **State Machine**: Safe transitions from `PENDING` -> `PROCESSING` -> `COMPLETED` / `FAILED`.
- **Automatic Retries**: Background job retries stuck processing payouts with exponential-ish backoff.

## Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js & npm
- PostgreSQL running locally

### Backend Setup
1. Navigate to `backend/`
2. Create a virtual environment: `python -m venv venv`
3. Activate it: `.\venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Mac/Linux)
4. Install dependencies: `pip install -r requirements.txt` (Note: I'll generate this file now)
5. Create the database: `python create_db.py` (Creates `playto_pay` db)
6. Run migrations: `python manage.py migrate`
7. Seed initial data: `python seed_data.py` (Creates 3 merchants and admin superuser)
8. Start server: `python manage.py runserver`
9. Start background worker: `python manage.py run_huey`

### Frontend Setup
1. Navigate to `frontend/`
2. Install dependencies: `npm install`
3. Start dev server: `npm run dev`
4. Open `http://localhost:5173` in your browser.

## Running Tests
In the `backend/` directory:
```bash
pytest
```

## Admin Access
- **URL**: `http://127.0.0.1:8000/admin/`
- **User**: `admin`
- **Pass**: `admin123`
