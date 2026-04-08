from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:3000",      # Next.js dev
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictRequest(BaseModel):
    radius: float
    texture: float
    concavity: float
    patientId: int
    explanationMode: str

class PredictResponse(BaseModel):
    prediction: str
    explanation: str

@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    # Stub – replace with real model later
    return PredictResponse(
        prediction="Benign (stub)",
        explanation=(
            f"Placeholder explanation using "
            f"radius={req.radius}, texture={req.texture}, "
            f"concavity={req.concavity}."
        ),
    )