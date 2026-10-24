import os
import sys
import pytest

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import Base, get_db

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_placement.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
    if os.path.exists("./test_placement.db"):
        try:
            os.remove("./test_placement.db")
        except OSError:
            pass


def test_root_and_health():
    res = client.get("/")
    assert res.status_code == 200
    assert "version" in res.json()

    res = client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}


def test_register_and_login_student():
    # Register student
    reg_payload = {
        "email": "test_student@placement.edu",
        "full_name": "Test Student",
        "password": "Password@123",
        "role": "STUDENT",
        "roll_number": "2026TEST01",
        "department": "Computer Science",
        "batch_year": 2026,
        "cgpa": 8.5,
        "phone": "+91-9999999999"
    }
    res = client.post("/api/v1/auth/register", json=reg_payload)
    assert res.status_code == 201
    data = res.json()
    assert "access_token" in data
    assert data["user"]["email"] == "test_student@placement.edu"

    # Login student
    login_payload = {
        "email": "test_student@placement.edu",
        "password": "Password@123"
    }
    res_login = client.post("/api/v1/auth/login", json=login_payload)
    assert res_login.status_code == 200
    login_data = res_login.json()
    assert "access_token" in login_data
    token = login_data["access_token"]

    # Access /me
    res_me = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res_me.status_code == 200
    me_data = res_me.json()
    assert me_data["user"]["email"] == "test_student@placement.edu"
    assert me_data["student_profile"]["roll_number"] == "2026TEST01"


def test_unauthorized_access():
    res = client.get("/api/v1/companies")
    assert res.status_code == 401


def test_admin_and_student_analytics():
    # Register an admin
    admin_payload = {
        "email": "analytics_admin@placement.edu",
        "full_name": "Analytics Admin",
        "password": "Password@123",
        "role": "ADMIN"
    }
    res_admin = client.post("/api/v1/auth/register", json=admin_payload)
    assert res_admin.status_code == 201
    admin_token = res_admin.json()["access_token"]

    # Test admin-summary endpoint
    res = client.get("/api/v1/analytics/admin-summary", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 200
    data = res.json()
    assert "total_students" in data
    assert "placed_students" in data
    assert "department_stats" in data
    assert isinstance(data["department_stats"], list)

    # Test student-summary endpoint with test student
    student_payload = {
        "email": "test_student@placement.edu",
        "password": "Password@123"
    }
    res_stu = client.post("/api/v1/auth/login", json=student_payload)
    student_token = res_stu.json()["access_token"]

    res_stu_summary = client.get("/api/v1/analytics/student-summary", headers={"Authorization": f"Bearer {student_token}"})
    assert res_stu_summary.status_code == 200
    stu_data = res_stu_summary.json()
    assert "eligible_drives_count" in stu_data

