from fastapi import FastAPI
from routers import sequia, generacion, demanda, prediction # <-- Import the new router
import models
from database import engine

app = FastAPI(
    title="Energy Data API",
    description="API for Demanda, Generacion, and Sequia data from GCP SQL, with mock predictions.",
    version="1.1.0"
)

# Optional: Create tables if they don't exist.
models.Base.metadata.create_all(bind=engine)

# Include all the routers
app.include_router(sequia.router)
app.include_router(generacion.router)
app.include_router(demanda.router)
app.include_router(prediction.router) # <-- Add the new prediction router

@app.get("/", tags=["Root"])
async def read_root():
    return {"message": "Welcome to the Energy Data API!"}
