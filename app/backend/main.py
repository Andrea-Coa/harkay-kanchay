# main.py
from fastapi import FastAPI
from routers import sequia, generacion, demanda
import models
from database import engine

# The 'lifespan' function has been removed.

app = FastAPI(
    title="Energy Data API",
    description="API for Demanda, Generacion, and Sequia data from GCP SQL.",
    version="1.0.0"
    # 'lifespan' attribute removed
)

# Optional: Create tables if they don't exist.
# You can run this once locally and then comment it out.
models.Base.metadata.create_all(bind=engine)

# Include the routers
app.include_router(sequia.router)
app.include_router(generacion.router)
app.include_router(demanda.router)

@app.get("/", tags=["Root"])
async def read_root():
    return {"message": "Welcome to the Energy Data API!"}