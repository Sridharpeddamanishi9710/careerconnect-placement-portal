from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.students import router as students_router
from app.api.v1.companies import router as companies_router
from app.api.v1.drives import router as drives_router
from app.api.v1.applications import router as applications_router
from app.api.v1.analytics import router as analytics_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(students_router)
api_router.include_router(companies_router)
api_router.include_router(drives_router)
api_router.include_router(applications_router)
api_router.include_router(analytics_router)
