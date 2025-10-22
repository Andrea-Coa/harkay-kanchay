from fastapi import APIRouter, Query
from datetime import date, datetime, timedelta
import random
import schemas

router = APIRouter(
    prefix="/predict",
    tags=["Predictions"]
)

# --- List of energy types for the new logic ---
ENERGY_TYPES = ["eolica", "termoelectrica", "hidroelectrica", "solar"]

@router.get("/demanda", response_model=list[schemas.DemandaPrediction])
async def predict_demanda(
    start_date: date = Query(..., description="Mandatory start date for the prediction (YYYY-MM-DD).")
):
    """
    Generates a mock 30-day forecast for energy demand.
    
    The forecast provides a value every 30 minutes.
    """
    predictions = []
    total_intervals = 30 * 48  # 30 days, 48 half-hour intervals per day

    current_datetime = datetime.combine(start_date, datetime.min.time())

    for i in range(total_intervals):
        mock_value = 6000 + random.uniform(-250, 250)
        prediction_timestamp = current_datetime + timedelta(minutes=i * 30)
        
        predictions.append(
            schemas.DemandaPrediction(
                fecha_hora=prediction_timestamp,
                prediccion=round(mock_value, 2)
            )
        )
        
    return predictions

# --- MODIFIED FUNCTION ---

@router.get("/generacion", response_model=list[schemas.GeneracionPrediction])
async def predict_generacion(
    start_date: date = Query(..., description="Mandatory start date for the prediction (YYYY-MM-DD).")
):
    """
    Generates a mock 30-day forecast for energy generation *by type*.
    
    The forecast provides one value per day for each energy type.
    """
    predictions = []
    
    # Give each type a different base value for more realistic mock data
    base_values = {
        "eolica": 150 * 90,
        "termoelectrica": 200 * 90,
        "hidroelectrica": 100 * 20,
        "solar": 50 * 50
    }
    
    for i in range(30): # 30 days of predictions
        # Calculate the date for the current prediction
        prediction_date = start_date + timedelta(days=i)
        
        # --- NEW: Loop through each energy type for the current day ---
        for tipo in ENERGY_TYPES:
            # Get base value and add some random noise
            base_val = base_values[tipo]
            noise_range = base_val * 0.2 # Add +/- 20% noise
            mock_value = base_val + random.uniform(-noise_range, noise_range)
            
            # Ensure generation isn't negative
            mock_value = max(0, mock_value) 

            predictions.append(
                schemas.GeneracionPrediction(
                    fecha=prediction_date,
                    tipo=tipo,  # <-- Add the type
                    prediccion=round(mock_value, 2)
                )
            )
            
    return predictions