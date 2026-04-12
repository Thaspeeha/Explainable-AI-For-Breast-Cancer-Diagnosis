from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import joblib
import tensorflow as tf
from typing import Dict, Any
from typing import List

# =========================
# FastAPI + CORS
# =========================
app = FastAPI()

origins = [
    "http://localhost:3000",
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

# Core model + preprocessing
model = tf.keras.models.load_model("bc_nn_model.keras")
scaler = joblib.load("scaler.pkl")
feature_names = np.load("feature_names.npy", allow_pickle=True)
global_importance = np.load("global_importance.npy", allow_pickle=True).tolist()

# True SHAP references (precomputed offline)
X_ref = np.load("shap_X_ref.npy")            # (N_ref, 30) raw features
shap_values_ref = np.load("shap_values_ref.npy")  # (N_ref, 30)

# Feature stats for benign/malignant ranges
feature_stats: Dict[str, Dict[str, float]] = np.load(
    "feature_stats.npy", allow_pickle=True
).item()

# Map for quick index lookup
feature_index = {name: i for i, name in enumerate(feature_names)}

IDX_RADIUS = feature_index["mean radius"]
IDX_TEXTURE = feature_index["mean texture"]
IDX_CONCAVITY = feature_index["mean concavity"]


# =========================
# Helper functions
# =========================

def nearest_shap_vector(x_raw: np.ndarray) -> np.ndarray:
    """
    Find nearest precomputed SHAP vector using Euclidean distance in raw space.
    x_raw: shape (30,)
    returns: shap_values for nearest ref point, shape (30,)
    """
    # Compute distances to all reference points
    # (N_ref, 30) - (1, 30) -> (N_ref, 30)
    diffs = X_ref - x_raw
    dists = np.sum(diffs ** 2, axis=1)
    idx = int(np.argmin(dists))
    return shap_values_ref[idx]


def predict_proba_single(x_raw: np.ndarray) -> float:
    """
    x_raw: shape (30,)
    returns: probability of benign (class 1)
    """
    x_scaled = scaler.transform([x_raw])
    proba = model.predict(x_scaled)[0][0]
    return float(proba)


def build_mode_bars(
    x_raw: np.ndarray, shap_vec: np.ndarray, k: int = 10
) -> Dict[str, Any]:
    """
    Build list of bar objects from SHAP values and feature stats.
    Each bar contains feature name, shap value, direction, percent,
    rank, observed value, benign/malignant ranges, and risk_color.
    """
    # Sort by absolute SHAP importance
    abs_vals = np.abs(shap_vec)
    idx_sorted = np.argsort(-abs_vals)[:k]

    top_items = []
    total_abs = float(np.sum(abs_vals[idx_sorted]) or 1.0)

    for rank, i in enumerate(idx_sorted, start=1):
        fname = str(feature_names[i])
        shap_val = float(shap_vec[i])
        direction = "toward_malignant" if shap_val > 0 else "toward_benign"
        percent = float(abs_vals[i] / total_abs * 100.0)

        observed = float(x_raw[i])

        stats = feature_stats.get(fname, {})
        benign_min = stats.get("benign_min", None)
        benign_max = stats.get("benign_max", None)
        malignant_min = stats.get("malignant_min", None)
        malignant_max = stats.get("malignant_max", None)

        # Risk color heuristic
        risk_color = "yellow"  # borderline by default
        if benign_min is not None and benign_max is not None:
            in_benign = benign_min <= observed <= benign_max
        else:
            in_benign = False

        if malignant_min is not None and malignant_max is not None:
            in_malignant = malignant_min <= observed <= malignant_max
        else:
            in_malignant = False

        if in_malignant and not in_benign:
            risk_color = "red"
        elif in_benign and not in_malignant:
            risk_color = "green"

        # Plain‑English explanation
        if direction == "toward_malignant":
            phrase = "higher than typical benign tumors; high‑risk indicator"
        else:
            phrase = "closer to benign patterns; lowers estimated risk"

        bar = {
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
            "risk_color": risk_color,  # "red", "green", "yellow"
            "plain_text": f"{fname}: {phrase} (≈{percent:.1f}% impact).",
        }
        top_items.append(bar)

    return {
        "all_bars": top_items,
        "top5_bars": top_items[:5],
    }


def build_payload_for_single(x_raw: np.ndarray) -> Dict[str, Any]:
    """
    Build full response payload with 3 modes.
    """
    benign_prob = predict_proba_single(x_raw)
    malignant_prob = 1.0 - benign_prob
    prediction_label = "BENIGN" if benign_prob >= 0.5 else "MALIGNANT"

    shap_vec = nearest_shap_vector(x_raw)
    bars_data = build_mode_bars(x_raw, shap_vec, k=10)
    all_bars = bars_data["all_bars"]
    top5_bars = bars_data["top5_bars"]

    # -------- Mode 1: Text Summary (cards) --------
    mode1_cards = []
    for bar in top5_bars:
        direction_label = "↑ elevated" if bar["direction"] == "toward_malignant" else "↓ reduced"
        card = {
            "feature": bar["feature"],
            "direction_label": direction_label,
            "impact_percent": bar["percent"],
            "plain_text": bar["plain_text"],
            "observed": bar["observed"],
            "ranges": bar["ranges"],
            "risk_color": bar["risk_color"],  # "red" / "green" / "yellow"
        }
        mode1_cards.append(card)

    # -------- Mode 2: Bars + Text --------
    mode2 = {
        "bars": top5_bars,
        "bullets": [bar["plain_text"] for bar in top5_bars],
    }

    # -------- Mode 3: Full SHAP-style --------
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

    mode3 = {
        "bars": all_bars,
        "summary": summary,
    }

    return {
        "prediction_label": prediction_label,
        "malignant_probability": float(malignant_prob),
        "benign_probability": float(benign_prob),
        "mode1": {"cards": mode1_cards},
        "mode2": mode2,
        "mode3": mode3,
    }


# =========================
# Request / response models
# =========================

class PredictRequest(BaseModel):
    radius: float
    texture: float
    concavity: float
    patientId: int
    explanationMode: str | None = None


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
    group: str  # "mean", "worst", "se", "other"


# =========================
# Endpoint
# =========================

@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    # Start from a neutral baseline (zeros).
    x_raw = np.zeros(len(feature_names), dtype=float)

    x_raw[IDX_RADIUS] = req.radius
    x_raw[IDX_TEXTURE] = req.texture
    x_raw[IDX_CONCAVITY] = req.concavity

    payload = build_payload_for_single(x_raw)
    return payload

@app.get("/global_importance", response_model=List[GlobalFeature])
def get_global_importance():
    return global_importance