# schemas.py
from pydantic import BaseModel, ConfigDict
from datetime import date, datetime
from decimal import Decimal

# Base model for Sequia
class SequiaBase(BaseModel):
    fecha: date
    sequia: bool

# Response model for Sequia (allows reading from ORM object)
class Sequia(SequiaBase):
    model_config = ConfigDict(from_attributes=True)

# Base model for Generacion
class GeneracionBase(BaseModel):
    fecha: date
    tipo: str
    empresa: str
    generacion: Decimal # Use Decimal for NUMERIC precision

# Response model for Generacion
class Generacion(GeneracionBase):
    model_config = ConfigDict(from_attributes=True)

# Base model for Demanda
class DemandaBase(BaseModel):
    fecha_hora: datetime
    demanda: Decimal # Use Decimal for NUMERIC precision

# Response model for Demanda
class Demanda(DemandaBase):
    model_config = ConfigDict(from_attributes=True)