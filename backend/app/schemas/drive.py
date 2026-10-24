from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.drive import DriveStatus
from app.schemas.company import CompanyOut


class DriveBase(BaseModel):
    company_id: int
    job_title: str
    job_description: str
    job_location: str
    package_lpa: float
    min_cgpa: float = 0.0
    eligible_departments: str  # Comma-separated or JSON string
    eligible_batch_year: int
    application_deadline: datetime
    drive_date: Optional[datetime] = None
    status: DriveStatus = DriveStatus.UPCOMING
    max_positions: Optional[int] = None


class DriveCreate(DriveBase):
    pass


class DriveUpdate(BaseModel):
    company_id: Optional[int] = None
    job_title: Optional[str] = None
    job_description: Optional[str] = None
    job_location: Optional[str] = None
    package_lpa: Optional[float] = None
    min_cgpa: Optional[float] = None
    eligible_departments: Optional[str] = None
    eligible_batch_year: Optional[int] = None
    application_deadline: Optional[datetime] = None
    drive_date: Optional[datetime] = None
    status: Optional[DriveStatus] = None
    max_positions: Optional[int] = None


class DriveOut(DriveBase):
    id: int
    created_at: datetime
    updated_at: datetime
    company: CompanyOut
    applicants_count: Optional[int] = 0
    is_eligible: Optional[bool] = None  # Populated dynamically for student views
    has_applied: Optional[bool] = None   # Populated dynamically for student views

    model_config = ConfigDict(from_attributes=True)


class DriveDetailOut(DriveOut):
    pass
