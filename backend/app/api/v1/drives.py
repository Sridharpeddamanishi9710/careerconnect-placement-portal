from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from app.database import get_db
from app.models.user import User, UserRole
from app.models.company import Company
from app.models.student import StudentProfile
from app.models.drive import PlacementDrive, DriveStatus
from app.models.application import Application
from app.schemas.drive import DriveCreate, DriveUpdate, DriveOut
from app.api.deps import (
    get_current_user, get_current_active_admin, get_current_active_student, get_current_student_profile
)

router = APIRouter(prefix="/drives", tags=["Placement Drives"])


def check_student_eligibility(student: StudentProfile, drive: PlacementDrive) -> bool:
    if student.cgpa < drive.min_cgpa:
        return False
    if drive.eligible_batch_year and student.batch_year != drive.eligible_batch_year:
        return False
    # Check department match
    allowed_depts = [d.strip().lower() for d in drive.eligible_departments.split(",")]
    if "all" not in allowed_depts and student.department.strip().lower() not in allowed_depts:
        return False
    return True


@router.get("", response_model=List[DriveOut])
def get_drives(
    search: Optional[str] = Query(None, description="Search by job title or company"),
    status: Optional[DriveStatus] = Query(None, description="Filter by drive status"),
    batch_year: Optional[int] = Query(None, description="Filter by batch year"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(PlacementDrive).join(Company)

    if search:
        search_filter = f"%{search.strip()}%"
        query = query.filter(
            or_(
                PlacementDrive.job_title.ilike(search_filter),
                Company.name.ilike(search_filter),
                PlacementDrive.job_location.ilike(search_filter)
            )
        )

    if status:
        query = query.filter(PlacementDrive.status == status)

    if batch_year:
        query = query.filter(PlacementDrive.eligible_batch_year == batch_year)

    drives = query.order_by(PlacementDrive.application_deadline.asc()).offset(skip).limit(limit).all()

    # Preload application counts and student specific flags
    student_profile = None
    student_applied_drive_ids = set()
    if current_user.role == UserRole.STUDENT:
        student_profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
        if student_profile:
            apps = db.query(Application.drive_id).filter(Application.student_id == student_profile.id).all()
            student_applied_drive_ids = {a.drive_id for a in apps}

    result = []
    for drive in drives:
        drive_out = DriveOut.model_validate(drive)
        drive_out.applicants_count = db.query(func.count(Application.id)).filter(Application.drive_id == drive.id).scalar() or 0

        if student_profile:
            drive_out.is_eligible = check_student_eligibility(student_profile, drive)
            drive_out.has_applied = drive.id in student_applied_drive_ids

        result.append(drive_out)

    return result


@router.get("/eligible", response_model=List[DriveOut])
def get_eligible_drives(
    db: Session = Depends(get_db),
    student_profile: StudentProfile = Depends(get_current_student_profile)
):
    now = datetime.now(timezone.utc)
    # Find drives that are upcoming or ongoing and deadline hasn't passed
    drives = db.query(PlacementDrive).filter(
        PlacementDrive.status.in_([DriveStatus.UPCOMING, DriveStatus.ONGOING]),
        PlacementDrive.application_deadline >= now
    ).order_by(PlacementDrive.application_deadline.asc()).all()

    # Get student applications
    apps = db.query(Application.drive_id).filter(Application.student_id == student_profile.id).all()
    student_applied_drive_ids = {a.drive_id for a in apps}

    eligible_drives = []
    for drive in drives:
        if check_student_eligibility(student_profile, drive):
            drive_out = DriveOut.model_validate(drive)
            drive_out.applicants_count = db.query(func.count(Application.id)).filter(Application.drive_id == drive.id).scalar() or 0
            drive_out.is_eligible = True
            drive_out.has_applied = drive.id in student_applied_drive_ids
            eligible_drives.append(drive_out)

    return eligible_drives


@router.post("", response_model=DriveOut, status_code=status.HTTP_201_CREATED)
def create_drive(
    drive_in: DriveCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    # Verify company exists
    company = db.query(Company).filter(Company.id == drive_in.company_id).first()
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")

    drive = PlacementDrive(**drive_in.model_dump())
    db.add(drive)
    db.commit()
    db.refresh(drive)

    drive_out = DriveOut.model_validate(drive)
    drive_out.applicants_count = 0
    return drive_out


@router.get("/{id}", response_model=DriveOut)
def get_drive_by_id(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    drive = db.query(PlacementDrive).filter(PlacementDrive.id == id).first()
    if not drive:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Placement drive not found")

    drive_out = DriveOut.model_validate(drive)
    drive_out.applicants_count = db.query(func.count(Application.id)).filter(Application.drive_id == drive.id).scalar() or 0

    if current_user.role == UserRole.STUDENT:
        student_profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
        if student_profile:
            drive_out.is_eligible = check_student_eligibility(student_profile, drive)
            has_applied = db.query(Application).filter(
                Application.drive_id == drive.id,
                Application.student_id == student_profile.id
            ).first() is not None
            drive_out.has_applied = has_applied

    return drive_out


@router.put("/{id}", response_model=DriveOut)
def update_drive(
    id: int,
    drive_update: DriveUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    drive = db.query(PlacementDrive).filter(PlacementDrive.id == id).first()
    if not drive:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Placement drive not found")

    update_data = drive_update.model_dump(exclude_unset=True)

    if "company_id" in update_data and update_data["company_id"] != drive.company_id:
        company = db.query(Company).filter(Company.id == update_data["company_id"]).first()
        if not company:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target company not found")

    for field, val in update_data.items():
        setattr(drive, field, val)

    db.commit()
    db.refresh(drive)

    drive_out = DriveOut.model_validate(drive)
    drive_out.applicants_count = db.query(func.count(Application.id)).filter(Application.drive_id == drive.id).scalar() or 0
    return drive_out


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_drive(
    id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    drive = db.query(PlacementDrive).filter(PlacementDrive.id == id).first()
    if not drive:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Placement drive not found")

    db.delete(drive)
    db.commit()
    return None
