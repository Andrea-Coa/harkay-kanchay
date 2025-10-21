# crud.py
from sqlalchemy.orm import Session
from sqlalchemy import select, func # <--- MODIFIED: Added func
from datetime import date, timedelta, datetime as dt
import models, schemas

# --- Sequia ---
def get_sequia_data(db: Session, start_date: date, num_days: int):
    # (Existing function... no changes)
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
    # (Existing function... no changes)
    end_date = start_date - timedelta(days=num_days - 1)
    
    query = (
        select(models.Generacion)
        .where(models.Generacion.fecha >= end_date, models.Generacion.fecha <= start_date)
    )
    
    if empresa:
        query = query.where(models.Generacion.empresa == empresa)
        
    query = query.order_by(models.Generacion.fecha.asc(), models.Generacion.empresa)
    
    print(f"Executing SQL: {query}") 
    
    result = db.execute(query)
    return result.scalars().all()

# +++ ADD NEW FUNCTION FOR TOTAL GENERACION +++
def get_total_generacion_for_date(db: Session, target_date: date):
    """
    Calculates the sum of 'generacion' for a specific date.
    """
    query = (
        select(func.sum(models.Generacion.generacion))
        .where(models.Generacion.fecha == target_date)
    )
    
    print(f"Executing SQL: {query}")
    
    total = db.execute(query).scalar_one_or_none()
    
    # Return the total, or 0 if no data was found (total is None)
    return total if total is not None else 0

# --- Demanda ---
def get_demanda_data(db: Session, start_date: date, num_days: int):
    # (Existing function... no changes)
    date_start = start_date - timedelta(days=num_days - 1)
    dt_start = dt.combine(date_start, dt.min.time())
    
    date_end = start_date + timedelta(days=1)
    dt_end = dt.combine(date_end, dt.min.time())
    
    query = (
        select(models.Demanda)
        .where(
            models.Demanda.fecha_hora >= dt_start,
            models.Demanda.fecha_hora < dt_end 
        )
        .order_by(models.Demanda.fecha_hora.asc())
    )
    print(f"Executing SQL: {query}") 

    
    result = db.execute(query)
    return result.scalars().all()

# +++ ADD NEW FUNCTION FOR TOTAL DEMANDA +++
def get_total_demanda_for_date(db: Session, target_date: date):
    """
    Calculates the sum of 'demanda' for a specific date (all timestamps).
    """
    # Start of the target day (inclusive)
    dt_start = dt.combine(target_date, dt.min.time())
    
    # Start of the next day (exclusive)
    dt_end = dt_start + timedelta(days=1)
    
    query = (
        select(func.sum(models.Demanda.demanda))
        .where(
            models.Demanda.fecha_hora >= dt_start,
            models.Demanda.fecha_hora < dt_end # Use < for the exclusive end
        )
    )
    
    print(f"Executing SQL: {query}")
    
    total = db.execute(query).scalar_one_or_none()
    
    # Return the total, or 0 if no data was found (total is None)
    return total if total is not None else 0