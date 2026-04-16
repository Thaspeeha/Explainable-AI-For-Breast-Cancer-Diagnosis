# main.py
from typing import Dict, Any, List, Optional

import numpy as np
import joblib
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import shap

app = FastAPI()

origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# Load artifacts (TOP 10)
# =========================

# RF model trained on 10 selected features
model = joblib.load("bc_rf_model.pkl")
scaler = joblib.load("scaler.pkl")
feature_names = np.load("feature_names.npy", allow_pickle=True)  # len = 10
global_importance = np.load("global_importance.npy", allow_pickle=True).tolist()

feature_stats: Dict[str, Dict[str, float]] = np.load(
    "feature_stats.npy", allow_pickle=True
).item()

benign_baseline = np.load("benign_baseline.npy")  # shape (10,)

feature_index = {name: i for i, name in enumerate(feature_names)}
IDX_RADIUS = feature_index["mean radius"]
IDX_TEXTURE = feature_index["mean texture"]
IDX_CONCAVITY = feature_index["mean concavity"]
IDX_MEAN_PERIM = feature_index["mean perimeter"]
IDX_MEAN_CP = feature_index["mean concave points"]
IDX_WORST_RADIUS = feature_index["worst radius"]
IDX_WORST_PERIM = feature_index["worst perimeter"]
IDX_WORST_AREA = feature_index["worst area"]
IDX_WORST_CP = feature_index["worst concave points"]
IDX_WORST_CONCAVITY = feature_index["worst concavity"]


required = ["mean radius", "mean texture", "mean concavity"]
missing = [f for f in required if f not in feature_index]
if missing:
    raise ValueError(f"Missing required slider features in feature_names.npy: {missing}")

# SHAP TreeExplainer background: benign-like cloud
background = scaler.transform(
    np.stack(
        [
            benign_baseline,
            benign_baseline * 0.95,
            benign_baseline * 1.05,
            benign_baseline * 0.9,
            benign_baseline * 1.1,
        ],
        axis=0,
    )
)
explainer = shap.TreeExplainer(model, background)

# =========================
# Helper functions
# =========================

def predict_proba_single(x_raw: np.ndarray) -> float:
    x_scaled = scaler.transform([x_raw])
    proba = model.predict_proba(x_scaled)[0][1]  # class 1 = benign
    return float(proba)

def compute_shap_for_x(x_raw: np.ndarray) -> np.ndarray:
    x_scaled = scaler.transform([x_raw])
    shap_out = explainer.shap_values(x_scaled)

    if isinstance(shap_out, list):
        shap_values = shap_out[1][0]  # benign class, first sample
    else:
        shap_values = shap_out[0]

    shap_values = np.array(shap_values, dtype=float)
    if shap_values.ndim > 1:
        shap_values = shap_values.reshape(-1)
    return shap_values

def build_mode_bars(
    x_raw: np.ndarray,
    shap_vec: np.ndarray,
    k: int = 10,
) -> Dict[str, Any]:
    shap_vec = np.array(shap_vec, dtype=float)
    feature_count = len(feature_names)

    if shap_vec.shape[0] > feature_count:
        shap_vec = shap_vec[:feature_count]

    abs_vals = np.abs(shap_vec)
    idx_sorted = np.argsort(-abs_vals)[:k]

    top_items: List[Dict[str, Any]] = []
    total_abs = float(np.sum(abs_vals[idx_sorted]) or 1.0)

    for rank, i in enumerate(idx_sorted, start=1):
        fname = str(feature_names[i])
        shap_val = float(shap_vec[i])
        direction = "toward_malignant" if shap_val < 0 else "toward_benign"

        percent = float(abs_vals[i] / total_abs * 100.0)
        observed = float(x_raw[i])

        stats = feature_stats.get(fname, {})
        benign_min = stats.get("benign_min", None)
        benign_max = stats.get("benign_max", None)
        malignant_min = stats.get("malignant_min", None)
        malignant_max = stats.get("malignant_max", None)

        risk_color = "yellow"
        in_benign = (
            benign_min is not None
            and benign_max is not None
            and benign_min <= observed <= benign_max
        )
        in_malignant = (
            malignant_min is not None
            and malignant_max is not None
            and malignant_min <= observed <= malignant_max
        )
        if in_malignant and not in_benign:
            risk_color = "red"
        elif in_benign and not in_malignant:
            risk_color = "green"

        phrase = (
            "higher than typical benign tumors; high‑risk indicator"
            if direction == "toward_malignant"
            else "closer to benign patterns; lowers estimated risk"
        )

        top_items.append(
            {
                "feature": fname,
                "value": shap_val,
                "direction": direction,
                "percent": round(percent, 1),
                "rank": rank,
                "observed": observed,
                "ranges": {
                    "benign_min": benign_min,
                    "benign_max": benign_max,
                    "malignant_min": malignant_min,
                    "malignant_max": malignant_max,
                },
                "risk_color": risk_color,
                "plain_text": f"{fname}: {phrase} (≈{percent:.1f}% impact).",
            }
        )

    return {"all_bars": top_items, "top5_bars": top_items[:5]}

def build_payload_for_single(x_raw: np.ndarray) -> Dict[str, Any]:
    benign_prob = predict_proba_single(x_raw)
    malignant_prob = 1.0 - benign_prob
    print("backend benign_prob", benign_prob, "malignant_prob", malignant_prob)

    benign_threshold = 0.5
    prediction_label = "BENIGN" if benign_prob >= benign_threshold else "MALIGNANT"

    shap_vec = compute_shap_for_x(x_raw)

    bars_data = build_mode_bars(x_raw, shap_vec, k=10)
    all_bars = bars_data["all_bars"]
    top5_bars = bars_data["top5_bars"]

    mode1_cards = []
    for bar in top5_bars:
        direction_label = (
            "↑ elevated" if bar["direction"] == "toward_malignant" else "↓ reduced"
        )
        mode1_cards.append(
            {
                "feature": bar["feature"],
                "direction_label": direction_label,
                "impact_percent": bar["percent"],
                "plain_text": bar["plain_text"],
                "observed": bar["observed"],
                "ranges": bar["ranges"],
                "risk_color": bar["risk_color"],
            }
        )

    mode2 = {"bars": top5_bars, "bullets": [b["plain_text"] for b in top5_bars]}

    top_feat_names = [b["feature"] for b in all_bars[:3]]
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

    mode3 = {"bars": all_bars, "summary": summary}

    return {
        "prediction_label": prediction_label,
        "malignant_probability": float(malignant_prob),
        "benign_probability": float(benign_prob),
        "mode1": {"cards": mode1_cards},
        "mode2": mode2,
        "mode3": mode3,
    }

# =========================
# Schemas & endpoints
# =========================

class PredictRequest(BaseModel):
    radius: float
    texture: float
    concavity: float
    mean_perimeter: float
    mean_concave_points: float
    worst_radius: float
    worst_perimeter: float
    worst_area: float
    worst_concave_points: float
    worst_concavity: float
    explanationMode: Optional[str] = None

class PredictResponse(BaseModel):
    prediction_label: str
    malignant_probability: float
    benign_probability: float
    mode1: dict
    mode2: dict
    mode3: dict

class GlobalFeature(BaseModel):
    feature: str
    importance: float
    group: str
    rank: int

@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    # Start from benign baseline, override slider features
    x_raw = benign_baseline.copy()
    x_raw[IDX_RADIUS] = req.radius
    x_raw[IDX_TEXTURE] = req.texture
    x_raw[IDX_CONCAVITY] = req.concavity
    x_raw[IDX_MEAN_PERIM] = req.mean_perimeter
    x_raw[IDX_MEAN_CP] = req.mean_concave_points
    x_raw[IDX_WORST_RADIUS] = req.worst_radius
    x_raw[IDX_WORST_PERIM] = req.worst_perimeter
    x_raw[IDX_WORST_AREA] = req.worst_area
    x_raw[IDX_WORST_CP] = req.worst_concave_points
    x_raw[IDX_WORST_CONCAVITY] = req.worst_concavity
    return build_payload_for_single(x_raw)

@app.get("/global_importance", response_model=List[GlobalFeature])
def get_global_importance():
    return global_importance