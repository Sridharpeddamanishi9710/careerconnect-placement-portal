import enum
from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey, Enum, UniqueConstraint, func
from sqlalchemy.orm import relationship
from app.database import Base


class ApplicationStatus(str, enum.Enum):
    APPLIED = "APPLIED"
    SHORTLISTED = "SHORTLISTED"
    TECHNICAL_ROUND = "TECHNICAL_ROUND"
    HR_ROUND = "HR_ROUND"
    SELECTED = "SELECTED"
    REJECTED = "REJECTED"


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    drive_id = Column(Integer, ForeignKey("placement_drives.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(Integer, ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    status = Column(Enum(ApplicationStatus), default=ApplicationStatus.APPLIED, nullable=False)
    applied_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    notes = Column(Text, nullable=True)

    __table_args__ = (
        UniqueConstraint("drive_id", "student_id", name="uq_drive_student_application"),
    )

    # Relationships
    drive = relationship("PlacementDrive", back_populates="applications")
    student = relationship("StudentProfile", back_populates="applications")
