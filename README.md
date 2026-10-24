# 🎓 CareerConnect — Production-Ready Placement Management Portal

CareerConnect is an enterprise-grade Placement Management Portal engineered to streamline campus recruitment, drive announcements, student eligibility checks, resume tracking, interview stage pipelines, and comprehensive placement analytics.

---

## 🚀 Tech Stack

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.11+)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (with SQLite fallback for zero-friction local testing)
- **ORM**: [SQLAlchemy 2.0](https://www.sqlalchemy.org/)
- **Data Validation & Serialization**: [Pydantic v2](https://docs.pydantic.dev/)
- **Authentication**: JWT (JSON Web Tokens) with HS256 & bcrypt password hashing
- **Database Migrations**: [Alembic](https://alembic.sqlalchemy.org/)
- **File Management**: Multipart PDF validation (size check, safe storage, secure serving)

### Frontend
- **Framework**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Routing**: [React Router v6](https://reactrouter.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **HTTP Client**: [Axios](https://axios-http.com/) (with JWT request interceptor & 401 handling)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🌟 Key Features

| Category | Highlights |
| :--- | :--- |
| **Authentication & Roles** | Role-based access control (`ADMIN` and `STUDENT`), JWT Bearer tokens, token expiration, password encryption. |
| **Admin Dashboard** | Real-time recruitment analytics, total students, placed percentage, CTC package distributions (Max, Avg, Min LPA), branch-wise placement breakdown, and recent applications. |
| **Student Dashboard** | Personalized analytics, placement celebration banner if placed, missing resume alerts, eligible drives counter, and active application pipeline. |
| **Placement Drives** | Drive creation with customizable minimum CGPA, eligible branches, batch year, CTC, application deadlines, and drive statuses (`UPCOMING`, `ONGOING`, `COMPLETED`, `CANCELLED`). |
| **Application Tracking** | Interactive 5-stage recruitment workflow (`APPLIED` ➔ `SHORTLISTED` ➔ `TECHNICAL_ROUND` ➔ `HR_ROUND` ➔ `SELECTED` / `REJECTED`), interviewer notes, batch stage updates, and automatic student placement status updates. |
| **Resume Upload & Validation** | Multipart PDF upload with strict validation (PDF format check, 5 MB file size limit, path sanitization, and secure access permissions). |
| **Student Management** | Comprehensive student directory with search by name/roll/email, filters by branch, CGPA, and placement status, student detail modals, and resume viewer. |
| **Company Management** | Partner company catalog with industry tags, locations, recruiter contacts, website links, and full CRUD operations. |

---

## 📂 Project Structure

```
placement-management-portal/
├── docker-compose.yml              # Multi-container orchestration (DB, Backend, Frontend)
├── .env.example                    # Template environment variables
├── .gitignore                      # Git ignore rules
├── README.md                       # Documentation
│
├── backend/
│   ├── Dockerfile                  # Python containerization
│   ├── requirements.txt            # Python dependencies
│   ├── alembic.ini                 # Alembic configuration
│   ├── seed.py                     # Demo data seeder script
│   ├── alembic/
│   │   ├── env.py                  # Alembic environment runner
│   │   ├── script.py.mako          # Migration template
│   │   └── versions/
│   │       └── 001_initial_schema.py # Initial database migration
│   ├── app/
│   │   ├── main.py                 # FastAPI application entrypoint & CORS
│   │   ├── config.py               # Pydantic BaseSettings & env configs
│   │   ├── database.py             # SQLAlchemy engine & session maker
│   │   ├── models/                 # SQLAlchemy ORM Models
│   │   │   ├── user.py             # User and UserRole enum
│   │   │   ├── student.py          # StudentProfile model
│   │   │   ├── company.py          # Company model
│   │   │   ├── drive.py            # PlacementDrive model & DriveStatus enum
│   │   │   └── application.py      # Application model & ApplicationStatus enum
│   │   ├── schemas/                # Pydantic v2 schemas
│   │   │   ├── user.py
│   │   │   ├── student.py
│   │   │   ├── company.py
│   │   │   ├── drive.py
│   │   │   ├── application.py
│   │   │   └── stats.py            # Dashboard metric schemas
│   │   ├── api/
│   │   │   ├── deps.py             # Dependency injection (Auth, Roles, DB session)
│   │   │   └── v1/
│   │   │       ├── auth.py         # Login, Register, Me, Change Password
│   │   │       ├── students.py     # Student profiles, Resume upload & download
│   │   │       ├── companies.py    # Company management CRUD
│   │   │       ├── drives.py       # Placement drive CRUD & student eligibility
│   │   │       ├── applications.py # Application lifecycle & batch status updates
│   │   │       └── analytics.py    # Admin & student dashboard statistics
│   │   ├── core/
│   │   │   ├── security.py         # Password hashing & JWT token encoding/decoding
│   │   │   └── exceptions.py       # Custom HTTP exceptions
│   │   └── utils/
│   │       └── file_storage.py     # Resume storage, size & extension validation
│   ├── tests/
│   │   └── test_api.py             # API test suite
│   └── uploads/
│       └── resumes/                # Directory for student uploaded PDF resumes
│
└── frontend/
    ├── Dockerfile                  # Multi-stage production Nginx container
    ├── nginx.conf                  # Nginx web server & reverse proxy config
    ├── package.json                # Frontend dependencies & scripts
    ├── vite.config.js              # Vite bundler & API dev proxy
    ├── tailwind.config.js          # Tailwind styling configuration
    ├── postcss.config.js           # PostCSS plugins
    ├── index.html                  # HTML template
    └── src/
        ├── main.jsx                # React root mount
        ├── App.jsx                 # Routing & ProtectedRoute setup
        ├── index.css               # Tailwind & custom scrollbar styles
        ├── api/
        │   └── client.js           # Axios instance, interceptors & API methods
        ├── store/
        │   └── authStore.js        # Zustand authentication store
        ├── components/
        │   ├── Navbar.jsx          # Top bar with role badge & user dropdown
        │   ├── Sidebar.jsx         # Responsive sidebar tailored to role
        │   ├── ProtectedRoute.jsx  # Role-based route guard
        │   ├── StatCard.jsx        # Dashboard metric cards
        │   ├── StatusBadge.jsx     # Color-coded status badges
        │   ├── Modal.jsx           # Accessible modal dialog
        │   └── LoadingSpinner.jsx  # Loading indicator
        ├── layouts/
        │   └── DashboardLayout.jsx # Common layout shell
        └── pages/
            ├── Login.jsx           # Sign in with quick-fill demo buttons
            ├── Register.jsx        # Student registration form
            ├── admin/
            │   ├── AdminDashboard.jsx   # Metrics, charts, recent activities
            │   ├── DrivesList.jsx       # Drive creation, filters & actions
            │   ├── DriveDetail.jsx      # Drive view, applicants list & batch stage updates
            │   ├── ApplicationsList.jsx # Global application tracking
            │   ├── StudentsList.jsx     # Student directory with filters & edit modal
            │   └── CompaniesList.jsx    # Corporate partners catalog
            └── student/
                ├── StudentDashboard.jsx # Personalized stats, banners & eligible drives
                ├── AvailableDrives.jsx  # Explore drives, check eligibility & apply
                ├── MyApplications.jsx   # Visual stepper timeline for applications
                └── Profile.jsx          # Edit academic info & PDF resume upload
```

---

## ⚡ Quick Start with Docker (Recommended)

Running the entire stack with Docker Compose takes only one command:

```bash
# Clone the repository
git clone <repo-url>
cd placement-management-portal

# Copy environment variables
cp .env.example .env

# Build and start all services (PostgreSQL, FastAPI Backend, React Frontend)
docker-compose up --build
```

Once running:
- **Frontend Web Portal**: [http://localhost](http://localhost) (Port 80)
- **Backend API & Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **PostgreSQL Database**: Port `5432`

---

## 🛠️ Local Development (Without Docker)

### 1. Backend Setup

```bash
cd backend

# Create and activate Python virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# (Optional) If running without PostgreSQL, SQLite works automatically:
# Set DATABASE_URL=sqlite:///./placement.db in .env or run with default settings

# Apply database migrations
alembic upgrade head

# Seed demo data (creates admin, companies, students, drives, and applications)
python seed.py

# Start backend server
uvicorn app.main:app --reload --port 8000
```
Backend will be available at [http://localhost:8000](http://localhost:8000) with interactive documentation at [http://localhost:8000/docs](http://localhost:8000/docs).

---

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
Frontend development server will be available at [http://localhost:5173](http://localhost:5173).

---

## 🔑 Default Demo Accounts

The database comes pre-seeded with realistic records:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@placement.edu` | `Admin@123` | Placement Director (Full administrative rights) |
| **Student** | `student@placement.edu` | `Student@123` | Rahul Sharma (CSE, 8.85 CGPA, Batch 2026, Resume uploaded) |
| **Student (Placed)** | `priya.patel@placement.edu` | `Student@123` | Priya Patel (IT, 9.35 CGPA, Placed at Google for 32 LPA) |
| **Student** | `amit.verma@placement.edu` | `Student@123` | Amit Verma (ECE, 7.9 CGPA, Interview in progress) |

> 💡 **Tip**: On the Login page ([/login](http://localhost:5173/login)), click **"Admin Demo"** or **"Student Demo"** to auto-fill the login form with one click!

---

## 🔄 Database Migrations (Alembic)

To manage database schema evolution:

```bash
cd backend

# Create a new migration revision after modifying models
alembic revision --autogenerate -m "Add new column to drives"

# Upgrade database to latest revision
alembic upgrade head

# Rollback one migration
alembic downgrade -1
```

---

## 🧪 Running Tests

To run the automated backend test suite:

```bash
cd backend
pytest -v
```

---

## 🛡️ Production Security Checklist

- [x] Passwords hashed using bcrypt.
- [x] JWT access tokens signed with secret key and expiration limits.
- [x] Strict Role-Based Access Control (`get_current_active_admin` and `get_current_active_student` guards).
- [x] Resume files validated strictly for `.pdf` extension and 5 MB size limit.
- [x] Sanitized file paths preventing directory traversal attacks.
- [x] Rate limiting & CORS protection configured via FastAPI middleware.
- [x] Multi-stage Nginx container with Gzip compression and client-side route fallback.
