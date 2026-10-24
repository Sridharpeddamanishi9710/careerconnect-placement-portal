from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models.user import User
from app.models.company import Company
from app.schemas.company import CompanyCreate, CompanyUpdate, CompanyOut
from app.api.deps import get_current_user, get_current_active_admin

router = APIRouter(prefix="/companies", tags=["Companies"])


@router.get("", response_model=List[CompanyOut])
def get_companies(
    search: Optional[str] = Query(None, description="Search by name, industry, or location"),
    industry: Optional[str] = Query(None, description="Filter by industry"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Company)

    if search:
        search_filter = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Company.name.ilike(search_filter),
                Company.industry.ilike(search_filter),
                Company.location.ilike(search_filter)
            )
        )

    if industry:
        query = query.filter(Company.industry == industry)

    if is_active is not None:
        query = query.filter(Company.is_active == is_active)

    companies = query.order_by(Company.name.asc()).offset(skip).limit(limit).all()
    return companies


@router.post("", response_model=CompanyOut, status_code=status.HTTP_201_CREATED)
def create_company(
    company_in: CompanyCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    existing = db.query(Company).filter(Company.name.ilike(company_in.name)).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Company '{company_in.name}' already exists."
        )

    company = Company(**company_in.model_dump())
    db.add(company)
    db.commit()
    db.refresh(company)
    return company


@router.get("/{id}", response_model=CompanyOut)
def get_company_by_id(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    company = db.query(Company).filter(Company.id == id).first()
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")
    return company


@router.put("/{id}", response_model=CompanyOut)
def update_company(
    id: int,
    company_update: CompanyUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    company = db.query(Company).filter(Company.id == id).first()
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")

    update_data = company_update.model_dump(exclude_unset=True)

    if "name" in update_data and update_data["name"] != company.name:
        existing = db.query(Company).filter(
            Company.name.ilike(update_data["name"]),
            Company.id != company.id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Company '{update_data['name']}' already exists."
            )

    for field, val in update_data.items():
        setattr(company, field, val)

    db.commit()
    db.refresh(company)
    return company


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_company(
    id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    company = db.query(Company).filter(Company.id == id).first()
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")

    db.delete(company)
    db.commit()
    return None
