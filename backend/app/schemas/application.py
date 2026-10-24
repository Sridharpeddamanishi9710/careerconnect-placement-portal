from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.application import ApplicationStatus
from app.schemas.drive import DriveOut
from app.schemas.student import StudentWithUserOut


class ApplicationBase(BaseModel):
    drive_id: int


class ApplicationCreate(ApplicationBase):
    pass


class ApplicationStatusUpdate(BaseModel):
    status: ApplicationStatus
    notes: Optional[str] = None
    mark_placed: Optional[bool] = False  # If True and status is SELECTED, automatically update student profile


class ApplicationBatchUpdate(BaseModel):
    application_ids: List[int]
    status: ApplicationStatus
    notes: Optional[str] = None


class ApplicationOut(BaseModel):
    id: int
    drive_id: int
    student_id: int
    status: ApplicationStatus
    notes: Optional[str] = None
    applied_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ApplicationDetailOut(ApplicationOut):
    drive: Optional[DriveOut] = None
    student: Optional[StudentWithUserOut] = None

    model_config = ConfigDict(from_attributes=True)
