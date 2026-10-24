import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

logger = logging.getLogger(__name__)

connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

try:
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args=connect_args,
        pool_pre_ping=True
    )
    # Test connection attempt or dialect check
    engine.dialect.initialize(engine.connect() if settings.DATABASE_URL.startswith("sqlite") else None)
except Exception as e:
    # Graceful fallback to SQLite if PostgreSQL driver is not installed locally
    fallback_url = "sqlite:///./placement.db"
    logger.warning(f"Could not initialize {settings.DATABASE_URL} ({e}). Falling back to local SQLite ({fallback_url})")
    engine = create_engine(
        fallback_url,
        connect_args={"check_same_thread": False},
        pool_pre_ping=True
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
