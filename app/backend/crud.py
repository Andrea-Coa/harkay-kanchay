# crud.py
from sqlalchemy.orm import Session
from sqlalchemy import select, func # <--- MODIFIED: Added func
from datetime import date, timedelta, datetime as dt
import models, schemas
import pandas as pd

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

# +++ MODIFIED FUNCTION FOR PREDICTION MODEL +++
def get_historical_data_for_prediction(db: Session, start_datetime: dt) -> pd.DataFrame:
    """
    Fetches and merges Demanda and Sequia data for the prediction model.
    It gets 14 days of data prior to the start_datetime to ensure all
    rolling windows (max 7 days) are filled.
    """
    hist_days = 14
    dt_end = start_datetime
    dt_start = dt_end - timedelta(days=hist_days)
    
    start_date_for_sequia = start_datetime.date()
    hist_start_date_for_sequia = start_date_for_sequia - timedelta(days=hist_days)

    # 1. Fetch Demanda data
    demanda_query = (
        select(models.Demanda)
        .where(
            models.Demanda.fecha_hora >= dt_start,
            models.Demanda.fecha_hora < dt_end
        )
        .order_by(models.Demanda.fecha_hora.asc())
    )
    demanda_data = db.execute(demanda_query).scalars().all()
    
    if not demanda_data:
        return pd.DataFrame()

    demanda_df = pd.DataFrame(
        [{'fecha_hora': d.fecha_hora, 'demanda': d.demanda} for d in demanda_data]
    )
    # +++ FIX: Explicitly convert Decimal to float for compatibility +++
    demanda_df['demanda'] = demanda_df['demanda'].astype(float)
    demanda_df['fecha'] = demanda_df['fecha_hora'].dt.date

    # 2. Fetch Sequia data
    sequia_query = (
        select(
            models.Sequia.fecha, 
            models.Sequia.sequia, 
            models.Sequia.drought_streak
        )
        .where(
            models.Sequia.fecha >= hist_start_date_for_sequia,
            models.Sequia.fecha < start_date_for_sequia
        )
    )
    sequia_data = db.execute(sequia_query).all()
    sequia_df = pd.DataFrame(
        sequia_data, 
        columns=['fecha', 'sequia', 'drought_day']
    )
    # +++ FIX: Explicitly set correct dtypes +++
    sequia_df['sequia'] = sequia_df['sequia'].astype(bool)
    sequia_df['drought_day'] = sequia_df['drought_day'].astype(int)


    # 3. Merge data
    merged_df = pd.merge(demanda_df, sequia_df, on='fecha', how='left')

    merged_df['sequia'].fillna(False, inplace=True)
    merged_df['drought_day'].fillna(0, inplace=True)

    merged_df.set_index('fecha_hora', inplace=True)
    print(merged_df.info())
    
    return merged_df[['demanda', 'sequia', 'drought_day']]
