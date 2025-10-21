# routers/demanda.py
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session 
from datetime import date
import crud, schemas
from database import get_db

router = APIRouter(
    prefix="/demanda",
    tags=["Demanda"]
)

@router.get("/", response_model=list[schemas.Demanda])
async def read_demanda( 
    start_date: date,
    num_days: int = Query(..., gt=0, description="Number of days to go back (must be > 0)"),
    db: Session = Depends(get_db) 
):
    """
    Get Demanda (demand) data for a date range.
    Handles the TIMESTAMP field based on the input DATE.
    """
    demanda_data = crud.get_demanda_data(db=db, start_date=start_date, num_days=num_days) 
    return demanda_data

# +++ ADD NEW ENDPOINT FOR TOTAL DEMANDA +++
@router.get("/total", response_model=schemas.TotalDemanda)
async def read_total_demanda(
    target_date: date = Query(..., description="The specific date to get the total for"),
    db: Session = Depends(get_db)
):
    """
    Get the total 'demanda' for a single specific date by summing all 30-min intervals.
    """
    total = crud.get_total_demanda_for_date(db=db, target_date=target_date)
    return {"fecha": target_date, "total_demanda": total}