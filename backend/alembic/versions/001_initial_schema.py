"""initial_schema

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-10-24 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=False),
        sa.Column('role', sa.Enum('ADMIN', 'STUDENT', 'COMPANY', name='userrole'), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)

    # Companies table
    op.create_table(
        'companies',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('industry', sa.String(length=100), nullable=False),
        sa.Column('website', sa.String(length=255), nullable=True),
        sa.Column('contact_email', sa.String(length=255), nullable=True),
        sa.Column('contact_phone', sa.String(length=50), nullable=True),
        sa.Column('location', sa.String(length=255), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('logo_url', sa.String(length=255), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_companies_id'), 'companies', ['id'], unique=False)
    op.create_index(op.f('ix_companies_name'), 'companies', ['name'], unique=True)

    # Student profiles table
    op.create_table(
        'student_profiles',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('roll_number', sa.String(length=50), nullable=False),
        sa.Column('department', sa.String(length=100), nullable=False),
        sa.Column('batch_year', sa.Integer(), nullable=False),
        sa.Column('cgpa', sa.Float(), nullable=False),
        sa.Column('phone', sa.String(length=20), nullable=True),
        sa.Column('skills', sa.String(length=500), nullable=True),
        sa.Column('resume_filename', sa.String(length=255), nullable=True),
        sa.Column('resume_original_name', sa.String(length=255), nullable=True),
        sa.Column('resume_uploaded_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('placed_status', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('placed_company_id', sa.Integer(), nullable=True),
        sa.Column('placed_package_lpa', sa.Float(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['placed_company_id'], ['companies.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )
    op.create_index(op.f('ix_student_profiles_id'), 'student_profiles', ['id'], unique=False)
    op.create_index(op.f('ix_student_profiles_roll_number'), 'student_profiles', ['roll_number'], unique=True)

    # Placement drives table
    op.create_table(
        'placement_drives',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('job_title', sa.String(length=255), nullable=False),
        sa.Column('job_description', sa.Text(), nullable=False),
        sa.Column('job_location', sa.String(length=255), nullable=False),
        sa.Column('package_lpa', sa.Float(), nullable=False),
        sa.Column('min_cgpa', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('eligible_departments', sa.String(length=500), nullable=False),
        sa.Column('eligible_batch_year', sa.Integer(), nullable=False),
        sa.Column('application_deadline', sa.DateTime(timezone=True), nullable=False),
        sa.Column('drive_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('status', sa.Enum('UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED', name='drivestatus'), nullable=False),
        sa.Column('max_positions', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_placement_drives_id'), 'placement_drives', ['id'], unique=False)

    # Applications table
    op.create_table(
        'applications',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('drive_id', sa.Integer(), nullable=False),
        sa.Column('student_id', sa.Integer(), nullable=False),
        sa.Column('status', sa.Enum('APPLIED', 'SHORTLISTED', 'TECHNICAL_ROUND', 'HR_ROUND', 'SELECTED', 'REJECTED', name='applicationstatus'), nullable=False),
        sa.Column('applied_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['drive_id'], ['placement_drives.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['student_id'], ['student_profiles.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('drive_id', 'student_id', name='uq_drive_student_application')
    )
    op.create_index(op.f('ix_applications_id'), 'applications', ['id'], unique=False)


def downgrade() -> None:
    op.drop_table('applications')
    op.drop_table('placement_drives')
    op.drop_table('student_profiles')
    op.drop_table('companies')
    op.drop_table('users')
    op.execute('DROP TYPE IF EXISTS applicationstatus;')
    op.execute('DROP TYPE IF EXISTS drivestatus;')
    op.execute('DROP TYPE IF EXISTS userrole;')
