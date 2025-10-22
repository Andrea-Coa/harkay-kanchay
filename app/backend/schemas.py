from pydantic import BaseModel, ConfigDict
from datetime import date, datetime
from decimal import Decimal

# --- ORM Schemas (from database) ---

class SequiaBase(BaseModel):
    fecha: date
    sequia: bool
    # +++ ADDED FIELDS +++
    drought_streak: int
    nondrought_streak: int

class Sequia(SequiaBase):
    model_config = ConfigDict(from_attributes=True)

class GeneracionBase(BaseModel):
    fecha: date
    tipo: str
    empresa: str
    generacion: Decimal

class Generacion(GeneracionBase):
    model_config = ConfigDict(from_attributes=True)

class DemandaBase(BaseModel):
    fecha_hora: datetime
    demanda: Decimal

class Demanda(DemandaBase):
    model_config = ConfigDict(from_attributes=True)

# --- Prediction Schemas (for model output) ---

class DemandaPrediction(BaseModel):
    """
    Defines the response for a single demanda prediction point.
    """
    fecha_hora: datetime
    prediccion: float

class GeneracionPrediction(BaseModel):
    """
    Defines the response for a single generacion prediction point.
    """
    fecha: date
    tipo: str
    prediccion: float

# --- Schemas for Totals ---

class TotalGeneracion(BaseModel):
    fecha: date
    total_generacion: Decimal | float

class TotalDemanda(BaseModel):
    fecha: date
    total_demanda: Decimal | float
