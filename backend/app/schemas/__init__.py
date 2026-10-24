from app.schemas.user import (
    UserBase, UserCreate, UserUpdate, UserLogin, UserOut, Token, TokenPayload, PasswordChange
)
from app.schemas.company import (
    CompanyBase, CompanyCreate, CompanyUpdate, CompanyOut
)
from app.schemas.student import (
    StudentProfileBase, StudentProfileCreate, StudentProfileUpdate,
    StudentProfileAdminUpdate, StudentProfileOut, StudentWithUserOut
)
from app.schemas.drive import (
    DriveBase, DriveCreate, DriveUpdate, DriveOut, DriveDetailOut
)
from app.schemas.application import (
    ApplicationBase, ApplicationCreate, ApplicationStatusUpdate,
    ApplicationBatchUpdate, ApplicationOut, ApplicationDetailOut
)
from app.schemas.stats import (
    AdminDashboardStats, StudentDashboardStats, DepartmentPlacementStat, PackageStat
)

__all__ = [
    "UserBase", "UserCreate", "UserUpdate", "UserLogin", "UserOut", "Token", "TokenPayload", "PasswordChange",
    "CompanyBase", "CompanyCreate", "CompanyUpdate", "CompanyOut",
    "StudentProfileBase", "StudentProfileCreate", "StudentProfileUpdate",
    "StudentProfileAdminUpdate", "StudentProfileOut", "StudentWithUserOut",
    "DriveBase", "DriveCreate", "DriveUpdate", "DriveOut", "DriveDetailOut",
    "ApplicationBase", "ApplicationCreate", "ApplicationStatusUpdate",
    "ApplicationBatchUpdate", "ApplicationOut", "ApplicationDetailOut",
    "AdminDashboardStats", "StudentDashboardStats", "DepartmentPlacementStat", "PackageStat",
]
