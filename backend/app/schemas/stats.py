from typing import List, Optional
from pydantic import BaseModel
from app.schemas.drive import DriveOut
from app.schemas.application import ApplicationDetailOut


class DepartmentPlacementStat(BaseModel):
    department: str
    total_students: int
    placed_students: int
    placement_rate: float


class PackageStat(BaseModel):
    min_package: float
    max_package: float
    avg_package: float


class AdminDashboardStats(BaseModel):
    total_students: int
    placed_students: int
    unplaced_students: int
    placement_rate_percentage: float
    total_companies: int
    active_drives: int
    total_drives: int
    total_applications: int
    package_stats: PackageStat
    department_stats: List[DepartmentPlacementStat]
    recent_drives: List[DriveOut]
    recent_applications: List[ApplicationDetailOut]


class StudentDashboardStats(BaseModel):
    eligible_drives_count: int
    applied_drives_count: int
    shortlisted_count: int
    offers_count: int
    is_placed: bool
    placed_company_name: Optional[str] = None
    placed_package_lpa: Optional[float] = None
    recent_applications: List[ApplicationDetailOut]
    upcoming_eligible_drives: List[DriveOut]
