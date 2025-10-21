# routers/generacion.py
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session # <-- Changed from AsyncSession
from datetime import date
import crud, schemas
from database import get_db

router = APIRouter(
    prefix="/generacion",
    tags=["Generacion"]
)

@router.get("/", response_model=list[schemas.Generacion])
async def read_generacion( # <-- Stays async
    start_date: date,
    num_days: int = Query(..., gt=0, description="Number of days to go back (must be > 0)"),
    empresa: str | None = Query(None, description="Optional: Filter by a specific empresa"),
    db: Session = Depends(get_db) # <-- Changed from AsyncSession
):
    """
    Get Generacion (generation) data for a date range, with an optional filter by empresa.
    """
    generacion_data = crud.get_generacion_data( # <-- await removed
        db=db, start_date=start_date, num_days=num_days, empresa=empresa
    )
    return generacion_data

