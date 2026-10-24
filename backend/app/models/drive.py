import enum
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, Enum, func
from sqlalchemy.orm import relationship
from app.database import Base


class DriveStatus(str, enum.Enum):
    UPCOMING = "UPCOMING"
    ONGOING = "ONGOING"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class PlacementDrive(Base):
    __tablename__ = "placement_drives"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    job_title = Column(String(255), nullable=False)
    job_description = Column(Text, nullable=False)
    job_location = Column(String(255), nullable=False)
    package_lpa = Column(Float, nullable=False)       # CTC in LPA, e.g. 12.5
    min_cgpa = Column(Float, default=0.0, nullable=False)
    eligible_departments = Column(String(500), nullable=False)  # Comma-separated: "Computer Science, Information Technology"
    eligible_batch_year = Column(Integer, nullable=False)       # e.g., 2026
    application_deadline = Column(DateTime(timezone=True), nullable=False)
    drive_date = Column(DateTime(timezone=True), nullable=True)
    status = Column(Enum(DriveStatus), default=DriveStatus.UPCOMING, nullable=False)
    max_positions = Column(Integer, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    company = relationship("Company", back_populates="drives")
    applications = relationship("Application", back_populates="drive", cascade="all, delete-orphan")
