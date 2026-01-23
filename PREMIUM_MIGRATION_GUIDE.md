# Premium Features - Migration & Usage Guide

## 1. Database Migration (Required)
You must apply the new schema changes to enable Trust Scores, Voting, and Budgeting.

1.  Open your PostgreSQL client (pgAdmin / DBeaver / Terminal).
2.  Connect to your `civic_monitor` database.
3.  Run the commands in: `backend/database/update_schema_premium.sql`
    *   This adds `trust_score` to users.
    *   This creates `issue_votes` table.
    *   This creates the `democracy` triggers.

## 2. API Endpoints (New)
The following endpoints are now active under `/api/premium`:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/issues/:id/vote` | Upvote an issue (Civic Voice). 50+ votes = CRITICAL. |
| **POST** | `/budget/estimate` | Get AI repair cost estimation for an issue type. |
| **GET** | `/clusters?radius=200` | Get work batches (nearby issues) for efficient routing. |
| **GET** | `/users/:id/trust` | Get a user's Trust Score and Triage status. |

## 3. Frontend Features (Integrated)
-   **Civic Voice Widget**: Located in `IssueDetailPanel` (for Engineers/Admins). Allows prioritizing issues.
-   **Trust Badge**: Located in `IssueDetailPanel` next to the Reporter's name. Shows "Elite Surveyor" / "Trusted".
-   **Leaderboard**: Added to the **Admin Dashboard** (bottom section) to show top contributors.

## 4. Notifications
-   The system now listens for `PRIORITY_ESCALATED`.
-   If an issue hits 50 upvotes, an Admin Alert is logged.

## 5. AI Service Note
-   The AI Service is currently running in **Lightweight Mode** (Rule-Based) to save 2GB of space.
-   To switch to the YOLO Neural Network:
    1.  Update `ai-service/requirements.txt` to include `ultralytics`, `torch`, `opencv-python`.
    2.  Update `ai-service/Dockerfile` to copy `models/`.
    3.  Change `ai-service/app.py` to import from `app_ml.py`.
