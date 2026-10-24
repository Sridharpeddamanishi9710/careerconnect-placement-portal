from typing import List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, case, cast, Integer
from app.database import get_db
from app.models.user import User
from app.models.student import StudentProfile
from app.models.company import Company
from app.models.drive import PlacementDrive, DriveStatus
from app.models.application import Application, ApplicationStatus
from app.schemas.stats import (
    AdminDashboardStats, StudentDashboardStats, DepartmentPlacementStat, PackageStat
)
from app.schemas.drive import DriveOut
from app.schemas.application import ApplicationDetailOut
from app.api.deps import (
    get_current_active_admin, get_current_student_profile
)
from app.api.v1.drives import check_student_eligibility

router = APIRouter(prefix="/analytics", tags=["Analytics & Dashboard"])


@router.get("/admin-summary", response_model=AdminDashboardStats)
def get_admin_dashboard_summary(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    total_students = db.query(func.count(StudentProfile.id)).scalar() or 0
    placed_students = db.query(func.count(StudentProfile.id)).filter(StudentProfile.placed_status.is_(True)).scalar() or 0
    unplaced_students = total_students - placed_students
    placement_rate = round((placed_students / total_students * 100), 1) if total_students > 0 else 0.0

    total_companies = db.query(func.count(Company.id)).filter(Company.is_active.is_(True)).scalar() or 0
    total_drives = db.query(func.count(PlacementDrive.id)).scalar() or 0
    active_drives = db.query(func.count(PlacementDrive.id)).filter(
        PlacementDrive.status.in_([DriveStatus.UPCOMING, DriveStatus.ONGOING])
    ).scalar() or 0
    total_applications = db.query(func.count(Application.id)).scalar() or 0

    # Package stats from placed students
    pkg_query = db.query(
        func.min(StudentProfile.placed_package_lpa),
        func.max(StudentProfile.placed_package_lpa),
        func.avg(StudentProfile.placed_package_lpa)
    ).filter(
        StudentProfile.placed_status.is_(True),
        StudentProfile.placed_package_lpa.is_not(None)
    ).first()

    min_pkg = float(pkg_query[0]) if pkg_query and pkg_query[0] is not None else 0.0
    max_pkg = float(pkg_query[1]) if pkg_query and pkg_query[1] is not None else 0.0
    avg_pkg = round(float(pkg_query[2]), 2) if pkg_query and pkg_query[2] is not None else 0.0

    # Department-wise statistics (Compatible with SQLite, PostgreSQL, and SQLAlchemy 2.x)
    dept_rows = db.query(
        StudentProfile.department,
        func.count(StudentProfile.id).label("total"),
        func.sum(case((StudentProfile.placed_status.is_(True), 1), else_=0)).label("placed")
    ).group_by(StudentProfile.department).all()

    department_stats: List[DepartmentPlacementStat] = []
    for dept, total_cnt, placed_cnt in dept_rows:
        total = int(total_cnt or 0)
        placed = int(placed_cnt or 0)
        rate = round((placed / total * 100), 1) if total > 0 else 0.0
        department_stats.append(
            DepartmentPlacementStat(
                department=dept,
                total_students=total,
                placed_students=placed,
                placement_rate=rate
            )
        )

    # Recent 5 drives
    recent_drives_db = db.query(PlacementDrive).order_by(PlacementDrive.created_at.desc()).limit(5).all()
    recent_drives = []
    for d in recent_drives_db:
        d_out = DriveOut.model_validate(d)
        d_out.applicants_count = db.query(func.count(Application.id)).filter(Application.drive_id == d.id).scalar() or 0
        recent_drives.append(d_out)

    # Recent 5 applications
    recent_apps_db = db.query(Application).order_by(Application.applied_at.desc()).limit(5).all()
    recent_applications = [ApplicationDetailOut.model_validate(a) for a in recent_apps_db]

    return AdminDashboardStats(
        total_students=total_students,
        placed_students=placed_students,
        unplaced_students=unplaced_students,
        placement_rate_percentage=placement_rate,
        total_companies=total_companies,
        active_drives=active_drives,
        total_drives=total_drives,
        total_applications=total_applications,
        package_stats=PackageStat(
            min_package=min_pkg,
            max_package=max_pkg,
            avg_package=avg_pkg
        ),
        department_stats=department_stats,
        recent_drives=recent_drives,
        recent_applications=recent_applications
    )


@router.get("/student-summary", response_model=StudentDashboardStats)
def get_student_dashboard_summary(
    db: Session = Depends(get_db),
    student_profile: StudentProfile = Depends(get_current_student_profile)
):
    now = datetime.now(timezone.utc)
    # Active drives
    drives = db.query(PlacementDrive).filter(
        PlacementDrive.status.in_([DriveStatus.UPCOMING, DriveStatus.ONGOING]),
        PlacementDrive.application_deadline >= now
    ).order_by(PlacementDrive.application_deadline.asc()).all()

    eligible_drives = [d for d in drives if check_student_eligibility(student_profile, d)]

    # Applications by student
    student_apps = db.query(Application).filter(Application.student_id == student_profile.id).all()
    applied_drives_count = len(student_apps)

    shortlisted_statuses = [
        ApplicationStatus.SHORTLISTED,
        ApplicationStatus.TECHNICAL_ROUND,
        ApplicationStatus.HR_ROUND
    ]
    shortlisted_count = sum(1 for a in student_apps if a.status in shortlisted_statuses)
    offers_count = sum(1 for a in student_apps if a.status == ApplicationStatus.SELECTED)

    # Placed company name
    placed_company_name = None
    if student_profile.placed_company:
        placed_company_name = student_profile.placed_company.name

    # Recent applications
    recent_apps_db = db.query(Application).filter(
        Application.student_id == student_profile.id
    ).order_by(Application.applied_at.desc()).limit(5).all()
    recent_applications = [ApplicationDetailOut.model_validate(a) for a in recent_apps_db]

    # Upcoming eligible drives
    student_applied_ids = {a.drive_id for a in student_apps}
    upcoming_eligible = []
    for d in eligible_drives[:5]:
        d_out = DriveOut.model_validate(d)
        d_out.applicants_count = db.query(func.count(Application.id)).filter(Application.drive_id == d.id).scalar() or 0
        d_out.is_eligible = True
        d_out.has_applied = d.id in student_applied_ids
        upcoming_eligible.append(d_out)

    return StudentDashboardStats(
        eligible_drives_count=len(eligible_drives),
        applied_drives_count=applied_drives_count,
        shortlisted_count=shortlisted_count,
        offers_count=offers_count,
        is_placed=student_profile.placed_status,
        placed_company_name=placed_company_name,
        placed_package_lpa=student_profile.placed_package_lpa,
        recent_applications=recent_applications,
        upcoming_eligible_drives=upcoming_eligible
    )
