from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.schemas.user import UserOut
from app.schemas.company import CompanyOut


class StudentProfileBase(BaseModel):
    roll_number: str
    department: str
    batch_year: int
    cgpa: float
    phone: Optional[str] = None
    skills: Optional[str] = None


class StudentProfileCreate(StudentProfileBase):
    user_id: int


class StudentProfileUpdate(BaseModel):
    phone: Optional[str] = None
    skills: Optional[str] = None
    cgpa: Optional[float] = None
    department: Optional[str] = None
    batch_year: Optional[int] = None
    roll_number: Optional[str] = None


class StudentProfileAdminUpdate(StudentProfileUpdate):
    placed_status: Optional[bool] = None
    placed_company_id: Optional[int] = None
    placed_package_lpa: Optional[float] = None


class StudentProfileOut(StudentProfileBase):
    id: int
    user_id: int
    resume_filename: Optional[str] = None
    resume_original_name: Optional[str] = None
    resume_uploaded_at: Optional[datetime] = None
    placed_status: bool
    placed_company_id: Optional[int] = None
    placed_package_lpa: Optional[float] = None
    created_at: datetime
    updated_at: datetime
    placed_company: Optional[CompanyOut] = None

    model_config = ConfigDict(from_attributes=True)


class StudentWithUserOut(StudentProfileOut):
    user: UserOut

    model_config = ConfigDict(from_attributes=True)
