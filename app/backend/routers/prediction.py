from fastapi import APIRouter, Query
from datetime import date, datetime, timedelta
import random
import schemas

router = APIRouter(
    prefix="/predict",
    tags=["Predictions"]
)

@router.get("/demanda", response_model=list[schemas.DemandaPrediction])
async def predict_demanda(
    # The default value has been removed, making this parameter mandatory.
    # Query(...) explicitly marks it as required.
    start_date: date = Query(..., description="Mandatory start date for the prediction (YYYY-MM-DD).") # <-- Change made here
):
    """
    Generates a mock 30-day forecast for energy demand.
    
    The forecast provides a value every 30 minutes.
    """
    predictions = []
    total_intervals = 30 * 48  # 30 days, 48 half-hour intervals per day

    # Combine the mandatory start date with midnight time
    current_datetime = datetime.combine(start_date, datetime.min.time()) # <-- Logic simplified

    for i in range(total_intervals):
        # Add a bit of random noise to the mock value
        mock_value = 6000 + random.uniform(-250, 250)
        
        # Calculate the timestamp for the current interval
        prediction_timestamp = current_datetime + timedelta(minutes=i * 30)
        
        predictions.append(
            schemas.DemandaPrediction(
                fecha_hora=prediction_timestamp,
                prediccion=round(mock_value, 2)
            )
        )
        
    return predictions

@router.get("/generacion", response_model=list[schemas.GeneracionPrediction])
async def predict_generacion(
    # The default value has been removed, making this parameter mandatory.
    start_date: date = Query(..., description="Mandatory start date for the prediction (YYYY-MM-DD).") # <-- Change made here
):
    """
    Generates a mock 30-day forecast for energy generation.
    
    The forecast provides one value per day.
    """
    predictions = []
    
    for i in range(30): # 30 days of predictions
        # Add a bit of random noise to the mock value
        mock_value = 500 + random.uniform(-75, 75)
        
        # Calculate the date for the current prediction
        prediction_date = start_date + timedelta(days=i) # <-- Logic simplified
        
        predictions.append(
            schemas.GeneracionPrediction(
                fecha=prediction_date,
                prediccion=round(mock_value, 2)
            )
        )
        
    return predictions

