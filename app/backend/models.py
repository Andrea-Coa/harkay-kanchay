from sqlalchemy import Column, TIMESTAMP, NUMERIC, TEXT, DATE, BOOLEAN, PrimaryKeyConstraint, INTEGER
from database import Base

class Demanda(Base):
    __tablename__ = "demanda"
    fecha_hora = Column(TIMESTAMP(timezone=False), primary_key=True)
    demanda = Column(NUMERIC, nullable=False)

class Generacion(Base):
    __tablename__ = "generacion"
    fecha = Column(DATE, primary_key=True)
    tipo = Column(TEXT, primary_key=True)
    empresa = Column(TEXT, primary_key=True)
    generacion = Column(NUMERIC, nullable=False)
    
    # Define the composite primary key
    __table_args__ = (
        PrimaryKeyConstraint('fecha', 'tipo', 'empresa'),
    )

class Sequia(Base):
    __tablename__ = "sequia"
    fecha = Column(DATE, primary_key=True)
    sequia = Column(BOOLEAN, nullable=False)
    # +++ ADDED COLUMNS +++
    drought_streak = Column(INTEGER, nullable=False, default=0)
    nondrought_streak = Column(INTEGER, nullable=False, default=0)
