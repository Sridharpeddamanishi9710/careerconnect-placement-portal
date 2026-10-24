from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database import Base


class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    roll_number = Column(String(50), unique=True, index=True, nullable=False)
    department = Column(String(100), nullable=False)  # e.g., "Computer Science", "Information Technology", "Electronics"
    batch_year = Column(Integer, nullable=False)      # e.g., 2026
    cgpa = Column(Float, nullable=False)              # e.g., 8.5
    phone = Column(String(20), nullable=True)
    skills = Column(String(500), nullable=True)       # e.g., "Python, React, SQL, Docker"
    
    # Resume storage info
    resume_filename = Column(String(255), nullable=True)
    resume_original_name = Column(String(255), nullable=True)
    resume_uploaded_at = Column(DateTime(timezone=True), nullable=True)

    # Placement Status
    placed_status = Column(Boolean, default=False, nullable=False)
    placed_company_id = Column(Integer, ForeignKey("companies.id", ondelete="SET NULL"), nullable=True)
    placed_package_lpa = Column(Float, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="student_profile")
    placed_company = relationship("Company", back_populates="placed_students")
    applications = relationship("Application", back_populates="student", cascade="all, delete-orphan")
