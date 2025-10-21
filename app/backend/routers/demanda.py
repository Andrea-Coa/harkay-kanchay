# routers/demanda.py
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session # <-- Changed from AsyncSession
from datetime import date
import crud, schemas
from database import get_db

router = APIRouter(
    prefix="/demanda",
    tags=["Demanda"]
)

@router.get("/", response_model=list[schemas.Demanda])
async def read_demanda( # <-- Stays async
    start_date: date,
    num_days: int = Query(..., gt=0, description="Number of days to go back (must be > 0)"),
    db: Session = Depends(get_db) # <-- Changed from AsyncSession
):
    """
    Get Demanda (demand) data for a date range.
    Handles the TIMESTAMP field based on the input DATE.
    """
    demanda_data = crud.get_demanda_data(db=db, start_date=start_date, num_days=num_days) # <-- await removed
    return demanda_data