import os
import uuid
from datetime import datetime
from fastapi import UploadFile, HTTPException, status
from app.config import settings


def ensure_upload_dir() -> str:
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    return settings.UPLOAD_DIR


async def save_resume_file(file: UploadFile, user_id: int) -> tuple[str, str]:
    """
    Validates and saves the uploaded resume.
    Returns: (stored_filename, original_filename)
    """
    filename = file.filename or "resume.pdf"
    ext = os.path.splitext(filename)[1].lower()

    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type '{ext}'. Only PDF files are allowed."
        )

    # Read and check size
    contents = await file.read()
    file_size = len(contents)

    if file_size > settings.MAX_RESUME_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size exceeds maximum limit of {settings.MAX_RESUME_SIZE_BYTES // (1024 * 1024)} MB."
        )

    upload_dir = ensure_upload_dir()
    unique_suffix = f"{int(datetime.now().timestamp())}_{uuid.uuid4().hex[:8]}"
    saved_filename = f"resume_user_{user_id}_{unique_suffix}{ext}"
    file_path = os.path.join(upload_dir, saved_filename)

    with open(file_path, "wb") as f:
        f.write(contents)

    return saved_filename, filename


def delete_resume_file(filename: str) -> bool:
    if not filename:
        return False
    # Prevent directory traversal
    safe_filename = os.path.basename(filename)
    file_path = os.path.join(settings.UPLOAD_DIR, safe_filename)
    if os.path.exists(file_path):
        try:
            os.remove(file_path)
            return True
        except OSError:
            return False
    return False


def get_resume_path(filename: str) -> str:
    safe_filename = os.path.basename(filename)
    file_path = os.path.join(settings.UPLOAD_DIR, safe_filename)
    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume file not found on server."
        )
    return file_path
