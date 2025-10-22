from pydantic import BaseModel, ConfigDict
from datetime import date, datetime
from decimal import Decimal

# --- ORM Schemas (from database) ---

class SequiaBase(BaseModel):
    fecha: date
    sequia: bool

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

# --- Prediction Schemas (for mock model) ---

class DemandaPrediction(BaseModel):
    """
    Defines the response for a single demanda prediction point.
    """
    fecha_hora: datetime
    prediccion: float # Using float is fine for mock data

class GeneracionPrediction(BaseModel):
    """
    Defines the response for a single generacion prediction point.
    """
    fecha: date
    tipo: str  # <-- MODIFICATION: Added type field
    prediccion: float

# +++ NEW SCHEMAS FOR TOTALS +++

class TotalGeneracion(BaseModel):
    fecha: date
    total_generacion: Decimal | float

class TotalDemanda(BaseModel):
    fecha: date
    total_demanda: Decimal | float