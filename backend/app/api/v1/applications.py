from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models.user import User, UserRole
from app.models.student import StudentProfile
from app.models.drive import PlacementDrive, DriveStatus
from app.models.application import Application, ApplicationStatus
from app.schemas.application import (
    ApplicationCreate, ApplicationOut, ApplicationDetailOut,
    ApplicationStatusUpdate, ApplicationBatchUpdate
)
from app.api.deps import (
    get_current_user, get_current_active_admin, get_current_active_student, get_current_student_profile
)
from app.api.v1.drives import check_student_eligibility

router = APIRouter(prefix="/applications", tags=["Applications"])


@router.post("/apply/{drive_id}", response_model=ApplicationDetailOut, status_code=status.HTTP_201_CREATED)
def apply_to_drive(
    drive_id: int,
    db: Session = Depends(get_db),
    student_profile: StudentProfile = Depends(get_current_student_profile)
):
    drive = db.query(PlacementDrive).filter(PlacementDrive.id == drive_id).first()
    if not drive:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Placement drive not found")

    if drive.status in [DriveStatus.COMPLETED, DriveStatus.CANCELLED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"This placement drive is {drive.status.value.lower()} and no longer accepting applications."
        )

    # Check deadline
    now = datetime.now(timezone.utc)
    # Ensure tz-awareness compatibility
    drive_deadline = drive.application_deadline
    if drive_deadline.tzinfo is None:
        drive_deadline = drive_deadline.replace(tzinfo=timezone.utc)

    if now > drive_deadline:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The application deadline for this placement drive has passed."
        )

    # Check resume upload
    if not student_profile.resume_filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You must upload your resume before applying to placement drives."
        )

    # Check eligibility
    if not check_student_eligibility(student_profile, drive):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You do not meet the eligibility criteria for this placement drive (CGPA, Department, or Batch Year)."
        )

    # Check duplicate application
    existing_app = db.query(Application).filter(
        Application.drive_id == drive_id,
        Application.student_id == student_profile.id
    ).first()

    if existing_app:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already submitted an application for this placement drive."
        )

    new_app = Application(
        drive_id=drive_id,
        student_id=student_profile.id,
        status=ApplicationStatus.APPLIED
    )
    db.add(new_app)
    db.commit()
    db.refresh(new_app)

    return new_app


@router.get("/my-applications", response_model=List[ApplicationDetailOut])
def get_my_applications(
    db: Session = Depends(get_db),
    student_profile: StudentProfile = Depends(get_current_student_profile)
):
    applications = db.query(Application).filter(
        Application.student_id == student_profile.id
    ).order_by(Application.applied_at.desc()).all()
    return applications


@router.get("/drive/{drive_id}", response_model=List[ApplicationDetailOut])
def get_applications_by_drive(
    drive_id: int,
    status_filter: Optional[ApplicationStatus] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    query = db.query(Application).filter(Application.drive_id == drive_id)
    if status_filter:
        query = query.filter(Application.status == status_filter)
    applications = query.order_by(Application.applied_at.desc()).all()
    return applications


@router.get("", response_model=List[ApplicationDetailOut])
def get_all_applications(
    drive_id: Optional[int] = Query(None),
    status_filter: Optional[ApplicationStatus] = Query(None, alias="status"),
    search: Optional[str] = Query(None, description="Search by student name or roll number"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    query = db.query(Application).join(StudentProfile).join(User)

    if drive_id:
        query = query.filter(Application.drive_id == drive_id)

    if status_filter:
        query = query.filter(Application.status == status_filter)

    if search:
        search_filter = f"%{search.strip()}%"
        query = query.filter(
            or_(
                User.full_name.ilike(search_filter),
                StudentProfile.roll_number.ilike(search_filter)
            )
        )

    applications = query.order_by(Application.applied_at.desc()).offset(skip).limit(limit).all()
    return applications


@router.patch("/{id}/status", response_model=ApplicationDetailOut)
def update_application_status(
    id: int,
    status_in: ApplicationStatusUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    application = db.query(Application).filter(Application.id == id).first()
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    application.status = status_in.status
    if status_in.notes is not None:
        application.notes = status_in.notes

    # If status is SELECTED and mark_placed is True, automatically mark student as placed!
    if status_in.status == ApplicationStatus.SELECTED and status_in.mark_placed:
        student = db.query(StudentProfile).filter(StudentProfile.id == application.student_id).first()
        drive = db.query(PlacementDrive).filter(PlacementDrive.id == application.drive_id).first()
        if student and drive:
            student.placed_status = True
            student.placed_company_id = drive.company_id
            student.placed_package_lpa = drive.package_lpa

    db.commit()
    db.refresh(application)
    return application


@router.post("/batch-status-update")
def batch_update_status(
    batch_in: ApplicationBatchUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    if not batch_in.application_ids:
        return {"updated_count": 0}

    apps = db.query(Application).filter(Application.id.in_(batch_in.application_ids)).all()
    for app in apps:
        app.status = batch_in.status
        if batch_in.notes:
            app.notes = batch_in.notes

    db.commit()
    return {"message": f"Successfully updated {len(apps)} applications", "updated_count": len(apps)}
