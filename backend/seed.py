import os
import sys
from datetime import datetime, timedelta, timezone

# Ensure backend directory is in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, Base, engine
from app.models.user import User, UserRole
from app.models.company import Company
from app.models.student import StudentProfile
from app.models.drive import PlacementDrive, DriveStatus
from app.models.application import Application, ApplicationStatus
from app.core.security import get_password_hash
from app.utils.file_storage import ensure_upload_dir


def seed_database():
    print("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    upload_dir = ensure_upload_dir()
    sample_resume_file = os.path.join(upload_dir, "sample_resume_rahul.pdf")
    if not os.path.exists(sample_resume_file):
        with open(sample_resume_file, "wb") as f:
            f.write(b"%PDF-1.4\n% Sample resume content for testing purposes\n%%EOF")

    try:
        # Check if already seeded
        existing_admin = db.query(User).filter(User.email == "admin@placement.edu").first()
        if existing_admin:
            print("Database already contains seed data. Skipping seeding.")
            return

        print("Seeding Administrator...")
        admin = User(
            email="admin@placement.edu",
            hashed_password=get_password_hash("Admin@123"),
            full_name="Placement Director",
            role=UserRole.ADMIN,
            is_active=True
        )
        db.add(admin)
        db.commit()

        print("Seeding Companies...")
        companies_data = [
            Company(
                name="Google",
                industry="Software & Cloud",
                website="https://careers.google.com",
                contact_email="campus-recruiting@google.com",
                contact_phone="+1-650-253-0000",
                location="Bengaluru, India / Mountain View, CA",
                description="Global technology leader focusing on search, cloud computing, software, and AI hardware.",
                logo_url="https://www.google.com/favicon.ico",
                is_active=True
            ),
            Company(
                name="Microsoft",
                industry="Cloud & Enterprise Software",
                website="https://careers.microsoft.com",
                contact_email="university-india@microsoft.com",
                contact_phone="+1-425-882-8080",
                location="Hyderabad, India / Redmond, WA",
                description="Empowering every person and organization on the planet to achieve more with Azure and productivity tools.",
                logo_url="https://www.microsoft.com/favicon.ico",
                is_active=True
            ),
            Company(
                name="Amazon",
                industry="E-Commerce & Cloud Computing",
                website="https://amazon.jobs",
                contact_email="aws-campus@amazon.com",
                contact_phone="+1-206-266-1000",
                location="Bengaluru, Hyderabad, Chennai",
                description="World's largest e-commerce and cloud computing company with leadership in distributed systems and AWS.",
                logo_url="https://www.amazon.com/favicon.ico",
                is_active=True
            ),
            Company(
                name="Tata Consultancy Services",
                industry="IT Services & Consulting",
                website="https://www.tcs.com/careers",
                contact_email="careers.digital@tcs.com",
                contact_phone="+91-22-6778-9999",
                location="Mumbai, Bengaluru, Pune, Delhi",
                description="Global leader in IT services, consulting, and business solutions partner.",
                logo_url="https://www.tcs.com/favicon.ico",
                is_active=True
            ),
        ]
        db.add_all(companies_data)
        db.commit()
        for c in companies_data:
            db.refresh(c)

        print("Seeding Students...")
        students_data = [
            {
                "email": "student@placement.edu",
                "name": "Rahul Sharma",
                "roll": "2022CS101",
                "dept": "Computer Science",
                "batch": 2026,
                "cgpa": 8.85,
                "phone": "+91-9876543210",
                "skills": "Python, FastAPI, React, PostgreSQL, Docker, Git",
                "resume_filename": "sample_resume_rahul.pdf",
                "resume_original_name": "Rahul_Sharma_Resume.pdf",
                "placed": False,
                "placed_company_id": None,
                "package": None
            },
            {
                "email": "priya.patel@placement.edu",
                "name": "Priya Patel",
                "roll": "2022IT102",
                "dept": "Information Technology",
                "batch": 2026,
                "cgpa": 9.35,
                "phone": "+91-9876543211",
                "skills": "Java, Spring Boot, Microservices, Kubernetes, AWS",
                "resume_filename": "sample_resume_rahul.pdf",
                "resume_original_name": "Priya_Patel_Resume.pdf",
                "placed": True,
                "placed_company_id": companies_data[0].id,  # Google
                "package": 32.0
            },
            {
                "email": "amit.verma@placement.edu",
                "name": "Amit Verma",
                "roll": "2022EC103",
                "dept": "Electronics",
                "batch": 2026,
                "cgpa": 7.9,
                "phone": "+91-9876543212",
                "skills": "C++, Embedded Systems, IoT, Python",
                "resume_filename": "sample_resume_rahul.pdf",
                "resume_original_name": "Amit_Verma_Resume.pdf",
                "placed": False,
                "placed_company_id": None,
                "package": None
            },
            {
                "email": "ananya.sen@placement.edu",
                "name": "Ananya Sen",
                "roll": "2022CS104",
                "dept": "Computer Science",
                "batch": 2026,
                "cgpa": 8.6,
                "phone": "+91-9876543213",
                "skills": "TypeScript, React, Node.js, GraphQL, MongoDB",
                "resume_filename": "sample_resume_rahul.pdf",
                "resume_original_name": "Ananya_Sen_Resume.pdf",
                "placed": True,
                "placed_company_id": companies_data[1].id,  # Microsoft
                "package": 28.0
            },
            {
                "email": "rohit.singh@placement.edu",
                "name": "Rohit Singh",
                "roll": "2022ME105",
                "dept": "Mechanical",
                "batch": 2026,
                "cgpa": 7.2,
                "phone": "+91-9876543214",
                "skills": "AutoCAD, SolidWorks, Python, MATLAB",
                "resume_filename": None,
                "resume_original_name": None,
                "placed": False,
                "placed_company_id": None,
                "package": None
            },
            {
                "email": "sneha.reddy@placement.edu",
                "name": "Sneha Reddy",
                "roll": "2022EE106",
                "dept": "Electrical",
                "batch": 2026,
                "cgpa": 8.1,
                "phone": "+91-9876543215",
                "skills": "Power Systems, Python, Machine Learning, MATLAB",
                "resume_filename": "sample_resume_rahul.pdf",
                "resume_original_name": "Sneha_Reddy_Resume.pdf",
                "placed": False,
                "placed_company_id": None,
                "package": None
            }
        ]

        created_students = []
        for s in students_data:
            user = User(
                email=s["email"],
                hashed_password=get_password_hash("Student@123"),
                full_name=s["name"],
                role=UserRole.STUDENT,
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)

            profile = StudentProfile(
                user_id=user.id,
                roll_number=s["roll"],
                department=s["dept"],
                batch_year=s["batch"],
                cgpa=s["cgpa"],
                phone=s["phone"],
                skills=s["skills"],
                resume_filename=s["resume_filename"],
                resume_original_name=s["resume_original_name"],
                resume_uploaded_at=datetime.now(timezone.utc) if s["resume_filename"] else None,
                placed_status=s["placed"],
                placed_company_id=s["placed_company_id"],
                placed_package_lpa=s["package"]
            )
            db.add(profile)
            db.commit()
            db.refresh(profile)
            created_students.append(profile)

        print("Seeding Placement Drives...")
        now = datetime.now(timezone.utc)
        drives_data = [
            PlacementDrive(
                company_id=companies_data[0].id,  # Google
                job_title="Software Engineer - Backend (Campus)",
                job_description="Join Google engineering team to design resilient, distributed backend services powering billions of users worldwide. Requirements: strong problem solving, data structures, algorithms, and system design fundamentals.",
                job_location="Bengaluru / Hyderabad",
                package_lpa=32.0,
                min_cgpa=8.0,
                eligible_departments="Computer Science, Information Technology",
                eligible_batch_year=2026,
                application_deadline=now + timedelta(days=14),
                drive_date=now + timedelta(days=21),
                status=DriveStatus.ONGOING,
                max_positions=15
            ),
            PlacementDrive(
                company_id=companies_data[1].id,  # Microsoft
                job_title="Cloud & AI Solutions Engineer",
                job_description="Work with cutting-edge Azure distributed computing and enterprise AI solutions. Candidates will develop microservices, build scalable APIs, and implement intelligent cloud systems.",
                job_location="Hyderabad / Bengaluru / Noida",
                package_lpa=28.0,
                min_cgpa=7.5,
                eligible_departments="Computer Science, Information Technology, Electronics",
                eligible_batch_year=2026,
                application_deadline=now + timedelta(days=18),
                drive_date=now + timedelta(days=28),
                status=DriveStatus.ONGOING,
                max_positions=25
            ),
            PlacementDrive(
                company_id=companies_data[2].id,  # Amazon
                job_title="Software Development Engineer I (SDE-1)",
                job_description="Build web services and distributed systems with massive throughput and low latency. You'll work closely with product teams to architect high-performance solutions.",
                job_location="Bengaluru / Hyderabad / Chennai",
                package_lpa=24.0,
                min_cgpa=7.0,
                eligible_departments="Computer Science, Information Technology, Electronics, Electrical",
                eligible_batch_year=2026,
                application_deadline=now + timedelta(days=30),
                drive_date=now + timedelta(days=40),
                status=DriveStatus.UPCOMING,
                max_positions=30
            ),
            PlacementDrive(
                company_id=companies_data[3].id,  # TCS
                job_title="Digital Systems & Automation Engineer",
                job_description="Join TCS Digital cadence for enterprise application development, cloud migration, data engineering, and automated testing.",
                job_location="Pan India",
                package_lpa=7.5,
                min_cgpa=6.5,
                eligible_departments="All",
                eligible_batch_year=2026,
                application_deadline=now + timedelta(days=7),
                drive_date=now + timedelta(days=12),
                status=DriveStatus.ONGOING,
                max_positions=50
            ),
        ]
        db.add_all(drives_data)
        db.commit()
        for d in drives_data:
            db.refresh(d)

        print("Seeding Applications...")
        # Rahul Sharma (index 0) applications
        apps = [
            Application(
                drive_id=drives_data[0].id,  # Google
                student_id=created_students[0].id,
                status=ApplicationStatus.TECHNICAL_ROUND,
                notes="Cleared initial coding round with 100/100. Technical Interview Round scheduled."
            ),
            Application(
                drive_id=drives_data[1].id,  # Microsoft
                student_id=created_students[0].id,
                status=ApplicationStatus.SHORTLISTED,
                notes="Profile shortlisted based on CGPA and skills portfolio."
            ),
            Application(
                drive_id=drives_data[3].id,  # TCS
                student_id=created_students[0].id,
                status=ApplicationStatus.APPLIED,
                notes="Application submitted."
            ),
            # Priya Patel (Google placed)
            Application(
                drive_id=drives_data[0].id,
                student_id=created_students[1].id,
                status=ApplicationStatus.SELECTED,
                notes="Offer letter issued with 32 LPA package. Excellent performance across all 4 rounds."
            ),
            # Ananya Sen (Microsoft placed)
            Application(
                drive_id=drives_data[1].id,
                student_id=created_students[3].id,
                status=ApplicationStatus.SELECTED,
                notes="Selected for Azure Cloud Core team."
            ),
            # Amit Verma
            Application(
                drive_id=drives_data[1].id,
                student_id=created_students[2].id,
                status=ApplicationStatus.HR_ROUND,
                notes="Cleared technical round 1 & 2."
            ),
            # Sneha Reddy
            Application(
                drive_id=drives_data[3].id,
                student_id=created_students[5].id,
                status=ApplicationStatus.SHORTLISTED,
                notes="Aptitude test passed."
            ),
        ]
        db.add_all(apps)
        db.commit()

        print("Seeding completed successfully!")
        print("-" * 50)
        print("Credentials for testing:")
        print("Admin:   email: admin@placement.edu   password: Admin@123")
        print("Student: email: student@placement.edu password: Student@123")
        print("-" * 50)

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
