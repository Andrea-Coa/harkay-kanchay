# database.py
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase, Session
from dotenv import load_dotenv

load_dotenv()

# Load credentials from .env
DB_USER = os.environ["DB_USER"]
DB_PASS = os.environ["DB_PASS"]
DB_NAME = os.environ["DB_NAME"]
HOST_IP = os.environ["HOST_IP"]
DB_PORT = os.environ["DB_PORT"]

# Create the standard PostgreSQL connection string
# We use 'postgresql+psycopg2' as the dialect
DATABASE_URL = (
    f"postgresql+psycopg2://{DB_USER}:{DB_PASS}@{HOST_IP}:{DB_PORT}/{DB_NAME}"
    f"?sslmode=require" # Use sslmode=require for GCP
)

# Create the synchronous engine
engine = create_engine(DATABASE_URL)

# Create a sessionmaker
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base class for our SQLAlchemy models
class Base(DeclarativeBase):
    pass

# Dependency to get a DB session in our API endpoints
# This is now a regular 'def', not 'async def'
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()