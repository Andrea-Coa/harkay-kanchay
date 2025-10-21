# routers/sequia.py
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session # <-- Changed from AsyncSession
from datetime import date
import crud, schemas
from database import get_db

router = APIRouter(
    prefix="/sequia",
    tags=["Sequia"]
)

@router.get("/", response_model=list[schemas.Sequia])
async def read_sequia( # <-- This stays async
    start_date: date,
    num_days: int = Query(..., gt=0, description="Number of days to go back (must be > 0)"),
    db: Session = Depends(get_db) # <-- Changed from AsyncSession
):
    """
    Get Sequia (drought) data for a date range going into the past.
    """
    # We call the synchronous crud function directly.
    # FastAPI is smart enough to run this in a threadpool.
    sequia_data = crud.get_sequia_data(db=db, start_date=start_date, num_days=num_days) # <-- await removed
    return sequia_data