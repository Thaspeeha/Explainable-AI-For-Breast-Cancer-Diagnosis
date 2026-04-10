from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import joblib
import tensorflow as tf
import shap
from lime.lime_tabular import LimeTabularExplainer

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

# =========================
# Load artifacts at startup
# =========================
model = tf.keras.models.load_model("bc_nn_model.keras")
scaler = joblib.load("scaler.pkl")
feature_names = np.load("feature_names.npy", allow_pickle=True)

# Indices for the 3 features you expose (sklearn breast cancer order)
IDX_RADIUS = list(feature_names).index("mean radius")
IDX_TEXTURE = list(feature_names).index("mean texture")
IDX_CONCAVITY = list(feature_names).index("mean concavity")

# Use some background data for SHAP (here: Gaussian around zero, scaled later)
# In production you'd save a real background set from training.
background = np.random.normal(size=(100, len(feature_names)))
background_scaled = scaler.transform(background)

def model_predict(x):
    return model.predict(x).ravel()

explainer_shap = shap.KernelExplainer(model_predict, background_scaled)

explainer_lime = LimeTabularExplainer(
    training_data=background_scaled,
    feature_names=feature_names,
    class_names=["malignant", "benign"],
    discretize_continuous=True,
    mode="classification",
)

# =========================
# Helper functions
# =========================
def predict_proba_single(x_raw: np.ndarray) -> float:
    x_scaled = scaler.transform([x_raw])
    proba = model.predict(x_scaled)[0][0]
    return float(proba)

def shap_top_k_for_single(x_raw: np.ndarray, k: int = 5):
    x_scaled = scaler.transform([x_raw])
    shap_vals = explainer_shap.shap_values(x_scaled)[0]
    abs_vals = np.abs(shap_vals)
    idx = np.argsort(-abs_vals)[:k]
    return [
        {"feature": feature_names[i], "shap_value": float(shap_vals[i])}
        for i in idx
    ]

def lime_top_k_for_single(x_raw: np.ndarray, k: int = 5):
    x_scaled = scaler.transform([x_raw])
    def lime_predict_proba(x):
        p1 = model.predict(x).ravel()
        p0 = 1.0 - p1
        return np.vstack([p0, p1]).T
    exp = explainer_lime.explain_instance(
        x_scaled[0],
        lime_predict_proba,
        num_features=k,
    )
    pairs = exp.as_list()
    return [{"feature": p[0], "weight": float(p[1])} for p in pairs]

def build_modes_for_single(x_raw: np.ndarray, k: int = 5) -> dict:
    benign_prob = predict_proba_single(x_raw)
    malignant_prob = 1.0 - benign_prob
    prediction_label = "BENIGN" if benign_prob >= 0.5 else "MALIGNANT"

    shap_items = shap_top_k_for_single(x_raw, k=k)
    total_abs = sum(abs(it["shap_value"]) for it in shap_items) or 1.0

    mode1_bars = []
    for it in shap_items:
        val = it["shap_value"]
        direction = "toward_malignant" if val > 0 else "toward_benign"
        pct = abs(val) / total_abs * 100.0
        mode1_bars.append(
            {
                "feature": str(it["feature"]),
                "value": float(val),
                "direction": direction,
                "percent": round(pct, 1),
            }
        )

    mode2_bullets = []
    for bar in mode1_bars:
        f = bar["feature"]
        pct = bar["percent"]
        if bar["direction"] == "toward_malignant":
            phrase = "higher than typical benign tumors; high‑risk indicator"
        else:
            phrase = "closer to benign patterns; lowers estimated risk"
        sentence = f"{f}: {phrase} (≈{pct:.1f}% impact)."
        mode2_bullets.append(sentence)

    top_feat_names = [b["feature"] for b in mode1_bars[:3]]

    if prediction_label == "MALIGNANT":
        summary = (
            "This tumor is predicted as MALIGNANT. "
            f"The most influential features are {', '.join(top_feat_names)}. "
            "Their values push the model's estimate toward malignancy."
        )
    else:
        summary = (
            "This tumor is predicted as BENIGN. "
            f"The most influential features are {', '.join(top_feat_names)}, "
            "which resemble benign cases in the training data."
        )

    return {
        "prediction_label": prediction_label,
        "malignant_probability": float(malignant_prob),
        "benign_probability": float(benign_prob),
        "mode1": {"bars": mode1_bars},
        "mode2": {"bullets": mode2_bullets},
        "mode3": {"bars": mode1_bars, "summary": summary},
    }

# =========================
# Request / response models
# =========================
class PredictRequest(BaseModel):
    radius: float
    texture: float
    concavity: float
    patientId: int
    explanationMode: str

class PredictResponse(BaseModel):
    prediction_label: str
    malignant_probability: float
    benign_probability: float
    mode1: dict
    mode2: dict
    mode3: dict

# =========================
# Endpoint
# =========================
@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    # Start from mean benign profile
    base_vector = np.zeros(len(feature_names))
    # For now we just use zeros; later you can load real means from training
    x_raw = base_vector.copy()

    x_raw[IDX_RADIUS] = req.radius
    x_raw[IDX_TEXTURE] = req.texture
    x_raw[IDX_CONCAVITY] = req.concavity

    payload = build_modes_for_single(x_raw, k=5)
    return payload
        
    