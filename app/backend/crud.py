# crud.py
from sqlalchemy.orm import Session
from sqlalchemy import select
from datetime import date, timedelta, datetime as dt
import models, schemas

# --- Sequia ---
def get_sequia_data(db: Session, start_date: date, num_days: int):
    # Calculate the past date
    end_date = start_date - timedelta(days=num_days - 1)
    
    query = (
        select(models.Sequia)
        .where(models.Sequia.fecha >= end_date, models.Sequia.fecha <= start_date)
        .order_by(models.Sequia.fecha.asc())
    )
    print(f"Executing SQL: {query}") 

    result = db.execute(query)
    return result.scalars().all()

# --- Generacion ---
def get_generacion_data(db: Session, start_date: date, num_days: int, empresa: str | None = None):
    # Calculate the past date
    end_date = start_date - timedelta(days=num_days - 1)
    
    query = (
        select(models.Generacion)
        .where(models.Generacion.fecha >= end_date, models.Generacion.fecha <= start_date)
    )
    
    if empresa:
        query = query.where(models.Generacion.empresa == empresa)
        
    query = query.order_by(models.Generacion.fecha.asc(), models.Generacion.empresa)
    
    # +++ ADD THIS LINE FOR DEBUGGING +++
    print(f"Executing SQL: {query}") 
    # +++++++++++++++++++++++++++++++++++
    
    result = db.execute(query)
    return result.scalars().all()

# ... (rest of the file)
# --- Demanda ---
def get_demanda_data(db: Session, start_date: date, num_days: int):
    # Calculate the date range
    # Start of the first day (inclusive)
    date_start = start_date - timedelta(days=num_days - 1)
    dt_start = dt.combine(date_start, dt.min.time())
    
    # Start of the day *after* the last day (exclusive)
    date_end = start_date + timedelta(days=1)
    dt_end = dt.combine(date_end, dt.min.time())
    
    query = (
        select(models.Demanda)
        .where(
            models.Demanda.fecha_hora >= dt_start,
            models.Demanda.fecha_hora < dt_end # Use < for the exclusive end
        )
        .order_by(models.Demanda.fecha_hora.asc())
    )
    print(f"Executing SQL: {query}") 

    
    result = db.execute(query)
    return result.scalars().all()