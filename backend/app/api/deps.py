from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import SessionLocal, get_db
from app.config import settings
from app.core.security import decode_access_token
from app.core.exceptions import CredentialsException, PermissionDeniedException
from app.models.user import User, UserRole
from app.models.student import StudentProfile

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)


def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    payload = decode_access_token(token)
    if not payload:
        raise CredentialsException()

    user_id_str: Optional[str] = payload.get("sub")
    if not user_id_str:
        raise CredentialsException()

    try:
        user_id = int(user_id_str)
    except ValueError:
        raise CredentialsException()

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise CredentialsException("User associated with token not found")

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user account"
        )

    return user


def get_current_active_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    if current_user.role != UserRole.ADMIN:
        raise PermissionDeniedException("Administrator access required")
    return current_user


def get_current_active_student(
    current_user: User = Depends(get_current_user)
) -> User:
    if current_user.role != UserRole.STUDENT:
        raise PermissionDeniedException("Student access required")
    return current_user


def get_current_student_profile(
    current_user: User = Depends(get_current_active_student),
    db: Session = Depends(get_db)
) -> StudentProfile:
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found. Please complete your registration."
        )
    return profile
