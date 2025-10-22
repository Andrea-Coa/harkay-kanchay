from fastapi import APIRouter, Query, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date, datetime, timedelta
import random
import schemas
import crud 
from database import get_db

# --- IMPORTS FOR ML MODEL ---
import pandas as pd
import numpy as np
import xgboost as xgb
import os

router = APIRouter(
    prefix="/predict",
    tags=["Predictions"]
)

# --- LOAD MODEL ON STARTUP ---
MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'models', 'XGBOOST_demanda.json')

if not os.path.exists(MODEL_PATH):
    print(f"WARNING: Model file not found at {MODEL_PATH}. /predict/demanda will fail.")
    model = None
else:
    model = xgb.Booster()
    model.load_model(MODEL_PATH)

FEATURE_COLUMNS = [
    'drought', 'year', 'month', 'day', 'hour', 'sin_time', 'cos_time',
    'weekday', 'drought_day', 'lag_1', 'lag_24', 'lag_168',
    'pct_change_1h', 'pct_change_24h', 'rolling_mean_24', 'rolling_std_24',
    'rolling_min_24', 'rolling_max_24', 'rolling_median_24',
    'rolling_mean_168', 'rolling_std_168', 'rolling_min_168',
    'rolling_max_168', 'rolling_median_168'
]

def create_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Engineers all features required by the model from a DataFrame.
    """
    df_feat = df.copy()

    df_feat['year'] = df_feat.index.year
    df_feat['month'] = df_feat.index.month
    df_feat['day'] = df_feat.index.day
    df_feat['hour'] = df_feat.index.hour
    df_feat['weekday'] = df_feat.index.weekday
    
    total_minutes = df_feat.index.minute + df_feat.index.hour * 60
    minutes_in_day = 24 * 60
    df_feat['sin_time'] = np.sin(2 * np.pi * total_minutes / minutes_in_day)
    df_feat['cos_time'] = np.cos(2 * np.pi * total_minutes / minutes_in_day)

    df_feat["lag_1"] = df_feat["demanda"].shift(2)
    df_feat["lag_24"] = df_feat["demanda"].shift(48)
    df_feat["lag_168"] = df_feat["demanda"].shift(168 * 2)

    # --- FIX 1: Added fill_method=None to pct_change ---
    # This addresses the FutureWarning by explicitly stating
    # we do not want to fill NA values, which is the new default.
    df_feat["pct_change_1h"] = df_feat["demanda"].pct_change(periods=2, fill_method=None)
    df_feat["pct_change_24h"] = df_feat["demanda"].pct_change(periods=48, fill_method=None)

    window_24 = 24 * 2
    rolling_base_24 = df_feat["demanda"].shift(1).rolling(window_24)
    df_feat["rolling_mean_24"] = rolling_base_24.mean()
    df_feat["rolling_std_24"] = rolling_base_24.std()
    df_feat["rolling_min_24"] = rolling_base_24.min()
    df_feat["rolling_max_24"] = rolling_base_24.max()
    df_feat["rolling_median_24"] = rolling_base_24.median()

    window_168 = 168 * 2
    rolling_base_168 = df_feat["demanda"].shift(1).rolling(window_168)
    df_feat["rolling_mean_168"] = rolling_base_168.mean()
    df_feat["rolling_std_168"] = rolling_base_168.std()
    df_feat["rolling_min_168"] = rolling_base_168.min()
    df_feat["rolling_max_168"] = rolling_base_168.max()
    df_feat["rolling_median_168"] = df_feat["demanda"].shift(1).rolling(window_168).median()

    return df_feat

@router.get("/demanda", response_model=list[schemas.DemandaPrediction])
async def predict_demanda(
    start_datetime: datetime = Query(..., description="Mandatory start datetime for the prediction (YYYY-MM-DDTHH:MM:SS)."),
    db: Session = Depends(get_db)
):
    """
    Generates a **real** 30-day forecast for energy demand starting from a specific time.
    """
    if model is None:
        raise HTTPException(
            status_code=500, 
            detail=f"Model not loaded. Check server logs. Missing: {MODEL_PATH}"
        )

    hist_df = crud.get_historical_data_for_prediction(db, start_datetime)
    
    if hist_df.empty:
        raise HTTPException(
            status_code=404,
            detail="Not enough historical data found to make a prediction."
        )
    
    # Rename 'sequia' from DB to 'drought' to match model's expected feature name
    hist_df.rename(columns={'sequia': 'drought'}, inplace=True)

    predictions = []
    current_data_df = hist_df.copy()
    
    future_timestamps = pd.date_range(
        start=start_datetime, 
        periods=30 * 48, 
        freq='30min'
    )
    window_168 = 168 * 2
    window_24 = 24 * 2

    for ts in future_timestamps:
        # --- Create new base row ---
        new_row = pd.DataFrame({
            'demanda': [np.nan],
            'drought': [False],
            'drought_day': [0]
        }, index=[ts])

        # --- Compute temporal features directly ---
        new_row['year'] = ts.year
        new_row['month'] = ts.month
        new_row['day'] = ts.day
        new_row['hour'] = ts.hour
        new_row['weekday'] = ts.weekday()

        total_minutes = ts.minute + ts.hour * 60
        minutes_in_day = 24 * 60
        new_row['sin_time'] = np.sin(2 * np.pi * total_minutes / minutes_in_day)
        new_row['cos_time'] = np.cos(2 * np.pi * total_minutes / minutes_in_day)

        # --- Lags and rolling stats (based only on history) ---
        last_df = current_data_df[-(window_168 + 5):]  # just enough history
        new_row['lag_1'] = last_df['demanda'].iloc[-2] if len(last_df) >= 2 else np.nan
        new_row['lag_24'] = last_df['demanda'].iloc[-48] if len(last_df) >= 48 else np.nan
        new_row['lag_168'] = last_df['demanda'].iloc[-(168 * 2)] if len(last_df) >= 336 else np.nan

        new_row['pct_change_1h'] = (last_df['demanda'].iloc[-1] - last_df['demanda'].iloc[-2]) / last_df['demanda'].iloc[-2] if len(last_df) >= 2 else np.nan
        new_row['pct_change_24h'] = (last_df['demanda'].iloc[-1] - last_df['demanda'].iloc[-48]) / last_df['demanda'].iloc[-48] if len(last_df) >= 48 else np.nan

        roll24 = last_df['demanda'].iloc[-window_24:]
        roll168 = last_df['demanda'].iloc[-window_168:]

        new_row['rolling_mean_24'] = roll24.mean()
        new_row['rolling_std_24'] = roll24.std()
        new_row['rolling_min_24'] = roll24.min()
        new_row['rolling_max_24'] = roll24.max()
        new_row['rolling_median_24'] = roll24.median()

        new_row['rolling_mean_168'] = roll168.mean()
        new_row['rolling_std_168'] = roll168.std()
        new_row['rolling_min_168'] = roll168.min()
        new_row['rolling_max_168'] = roll168.max()
        new_row['rolling_median_168'] = roll168.median()

        # --- Prepare and predict ---
        features_for_pred = new_row.reindex(columns=FEATURE_COLUMNS).fillna(0)
        dmatrix = xgb.DMatrix(features_for_pred.astype(float))
        prediction_value = model.predict(dmatrix)[0]

        predictions.append(
            schemas.DemandaPrediction(
                fecha_hora=ts,
                prediccion=float(prediction_value)
            )
        )

        # --- Update the history with the new predicted demand ---
        new_row['demanda'] = prediction_value
        current_data_df = pd.concat([current_data_df, new_row])

        
    return predictions


# --- MOCK GENERACION ENDPOINT (UNCHANGED) ---
ENERGY_TYPES = ["eolica", "termoelectrica", "hidroelectrica", "solar"]

@router.get("/generacion", response_model=list[schemas.GeneracionPrediction])
async def predict_generacion(
    start_date: date = Query(..., description="Mandatory start date for the prediction (YYYY-MM-DD).")
):
    """
    Generates a mock 30-day forecast for energy generation *by type*.
    """
    predictions = []
    base_values = {
        "eolica": 150 * 90, "termoelectrica": 200 * 90,
        "hidroelectrica": 100 * 20, "solar": 50 * 50
    }
    
    for i in range(30):
        prediction_date = start_date + timedelta(days=i)
        for tipo in ENERGY_TYPES:
            base_val = base_values[tipo]
            noise_range = base_val * 0.2
            mock_value = max(0, base_val + random.uniform(-noise_range, noise_range))
            predictions.append(
                schemas.GeneracionPrediction(
                    fecha=prediction_date,
                    tipo=tipo,
                    prediccion=round(mock_value, 2)
                )
            )
    return predictions