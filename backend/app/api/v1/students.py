from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models.user import User, UserRole
from app.models.student import StudentProfile
from app.schemas.student import (
    StudentWithUserOut, StudentProfileOut, StudentProfileUpdate, StudentProfileAdminUpdate
)
from app.api.deps import (
    get_current_user, get_current_active_admin, get_current_active_student, get_current_student_profile
)
from app.utils.file_storage import save_resume_file, delete_resume_file, get_resume_path

router = APIRouter(prefix="/students", tags=["Students"])


@router.get("", response_model=List[StudentWithUserOut])
def get_students(
    search: Optional[str] = Query(None, description="Search by name, roll number, or email"),
    department: Optional[str] = Query(None, description="Filter by department"),
    batch_year: Optional[int] = Query(None, description="Filter by batch year"),
    placed_status: Optional[bool] = Query(None, description="Filter by placed status"),
    min_cgpa: Optional[float] = Query(None, description="Filter by minimum CGPA"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    query = db.query(StudentProfile).join(User)

    if search:
        search_filter = f"%{search.strip()}%"
        query = query.filter(
            or_(
                User.full_name.ilike(search_filter),
                User.email.ilike(search_filter),
                StudentProfile.roll_number.ilike(search_filter)
            )
        )

    if department:
        query = query.filter(StudentProfile.department == department)

    if batch_year:
        query = query.filter(StudentProfile.batch_year == batch_year)

    if placed_status is not None:
        query = query.filter(StudentProfile.placed_status == placed_status)

    if min_cgpa is not None:
        query = query.filter(StudentProfile.cgpa >= min_cgpa)

    students = query.order_by(StudentProfile.created_at.desc()).offset(skip).limit(limit).all()
    return students


@router.get("/me", response_model=StudentWithUserOut)
def get_my_profile(
    student_profile: StudentProfile = Depends(get_current_student_profile)
):
    return student_profile


@router.put("/me", response_model=StudentWithUserOut)
def update_my_profile(
    profile_update: StudentProfileUpdate,
    student_profile: StudentProfile = Depends(get_current_student_profile),
    db: Session = Depends(get_db)
):
    update_data = profile_update.model_dump(exclude_unset=True)

    # Check roll number uniqueness if changing
    if "roll_number" in update_data and update_data["roll_number"] != student_profile.roll_number:
        existing = db.query(StudentProfile).filter(
            StudentProfile.roll_number == update_data["roll_number"],
            StudentProfile.id != student_profile.id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Roll number '{update_data['roll_number']}' is already in use."
            )

    for field, val in update_data.items():
        setattr(student_profile, field, val)

    db.commit()
    db.refresh(student_profile)
    return student_profile


@router.post("/me/resume")
async def upload_resume(
    file: UploadFile = File(...),
    student_profile: StudentProfile = Depends(get_current_student_profile),
    db: Session = Depends(get_db)
):
    # Delete old resume if present
    if student_profile.resume_filename:
        delete_resume_file(student_profile.resume_filename)

    saved_filename, original_filename = await save_resume_file(file, student_profile.user_id)

    student_profile.resume_filename = saved_filename
    student_profile.resume_original_name = original_filename
    student_profile.resume_uploaded_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(student_profile)

    return {
        "message": "Resume uploaded successfully",
        "resume_filename": saved_filename,
        "resume_original_name": original_filename,
        "uploaded_at": student_profile.resume_uploaded_at
    }


@router.get("/resume/{filename}")
def download_resume(
    filename: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Security: check if current user is admin or the owner of this resume
    if current_user.role != UserRole.ADMIN:
        student_profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
        if not student_profile or student_profile.resume_filename != filename:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this resume file."
            )

    file_path = get_resume_path(filename)
    return FileResponse(
        path=file_path,
        media_type="application/pdf",
        filename=filename
    )


@router.get("/{id}", response_model=StudentWithUserOut)
def get_student_by_id(
    id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    student = db.query(StudentProfile).filter(StudentProfile.id == id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    return student


@router.put("/{id}", response_model=StudentWithUserOut)
def update_student_admin(
    id: int,
    profile_update: StudentProfileAdminUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    student = db.query(StudentProfile).filter(StudentProfile.id == id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")

    update_data = profile_update.model_dump(exclude_unset=True)

    if "roll_number" in update_data and update_data["roll_number"] != student.roll_number:
        existing = db.query(StudentProfile).filter(
            StudentProfile.roll_number == update_data["roll_number"],
            StudentProfile.id != student.id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Roll number '{update_data['roll_number']}' is already in use."
            )

    for field, val in update_data.items():
        setattr(student, field, val)

    db.commit()
    db.refresh(student)
    return student


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_student(
    id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    student = db.query(StudentProfile).filter(StudentProfile.id == id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")

    # Also delete resume file if stored
    if student.resume_filename:
        delete_resume_file(student.resume_filename)

    # Deleting user will cascade delete the profile
    user = db.query(User).filter(User.id == student.user_id).first()
    if user:
        db.delete(user)
    else:
        db.delete(student)

    db.commit()
    return None
