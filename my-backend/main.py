# main.py
from typing import Dict, Any, List, Optional

import numpy as np
import joblib
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from summary_generator import summary_generator, FeatureContribution
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

# RF model (main explainable model)
rf_model = joblib.load("bc_rf_model.pkl")

# XGBoost + Logistic Regression (additional comparators)
xgb_model = joblib.load("bc_xgb_model.pkl")
lr_model = joblib.load("bc_lr_model.pkl")

scaler = joblib.load("scaler.pkl")
feature_names = np.load("feature_names.npy", allow_pickle=True)  # len = 10
background_scaled = np.load("background_scaled.npy", allow_pickle=True)
rf_global_importance = np.load("global_importance_rf.npy", allow_pickle=True).tolist()
xgb_global_importance = np.load("global_importance_xgb.npy", allow_pickle=True).tolist()
lr_global_importance = np.load("global_importance_lr.npy", allow_pickle=True).tolist()

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

# SHAP explainers per model
rf_explainer = shap.TreeExplainer(rf_model, background_scaled)
xgb_explainer = shap.TreeExplainer(xgb_model, background_scaled)
# For LR, use LinearExplainer
lr_explainer = shap.LinearExplainer(lr_model, background_scaled)

# =========================
# Helper functions
# =========================

def predict_proba_single_rf(x_raw: np.ndarray) -> float:
    x_scaled = scaler.transform([x_raw])
    proba = rf_model.predict_proba(x_scaled)[0][1]  # class 1 = benign
    return float(proba)

def predict_proba_single_xgb(x_raw: np.ndarray) -> float:
    x_scaled = scaler.transform([x_raw])
    proba = xgb_model.predict_proba(x_scaled)[0][1]  # benign
    return float(proba)

def predict_proba_single_lr(x_raw: np.ndarray) -> float:
    x_scaled = scaler.transform([x_raw])
    proba = lr_model.predict_proba(x_scaled)[0][1]  # benign
    return float(proba)

def compute_shap_for_x(x_raw: np.ndarray, model_key: str = "RF") -> np.ndarray:
    """
    Compute SHAP values for a single sample using the chosen model.
    model_key: "RF", "XGB", or "LR"
    """
    x_scaled = scaler.transform([x_raw])

    model_key = model_key.upper()
    if model_key == "RF":
        shap_out = rf_explainer.shap_values(x_scaled)
    elif model_key == "XGB":
        shap_out = xgb_explainer.shap_values(x_scaled)
    elif model_key == "LR":
        shap_out = lr_explainer.shap_values(x_scaled)
    else:
        raise ValueError(f"Unknown model_key for SHAP: {model_key}")

    # For tree models, shap_out may be a list [class0, class1]
    if isinstance(shap_out, list):
        # Take benign class = 1
        shap_values = shap_out[1][0]
    else:
        # LinearExplainer typically returns a 2D array (n_samples, n_features)
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

def build_payload_for_single(x_raw: np.ndarray, model_key: str = "RF") -> Dict[str, Any]:
    model_key = model_key.upper()

    # 1) Primary model prediction
    if model_key == "RF":
        benign_prob_primary = predict_proba_single_rf(x_raw)
    elif model_key == "XGB":
        benign_prob_primary = predict_proba_single_xgb(x_raw)
    elif model_key == "LR":
        benign_prob_primary = predict_proba_single_lr(x_raw)
    else:
        raise ValueError(f"Unknown model_key: {model_key}")

    malignant_prob_primary = 1.0 - benign_prob_primary

    benign_threshold = 0.5
    prediction_label = "BENIGN" if benign_prob_primary >= benign_threshold else "MALIGNANT"

    # 2) Additional models (unchanged)
    benign_prob_rf = predict_proba_single_rf(x_raw)
    benign_prob_xgb = predict_proba_single_xgb(x_raw)
    benign_prob_lr = predict_proba_single_lr(x_raw)

    malignant_prob_rf = 1.0 - benign_prob_rf
    malignant_prob_xgb = 1.0 - benign_prob_xgb
    malignant_prob_lr = 1.0 - benign_prob_lr

    # 3) SHAP explanation from RF (unchanged)
    shap_vec = compute_shap_for_x(x_raw, model_key=model_key)
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

     # 3b) Clinical narrative summary using ClinicalSummaryGenerator
    # Determine prediction string and confidence
    prediction_str = "benign" if prediction_label == "BENIGN" else "malignant"
    confidence = benign_prob_primary * 100.0 if prediction_label == "BENIGN" else malignant_prob_primary * 100.0

    # Build FeatureContribution list from top5_bars
    top_features_for_summary: List[FeatureContribution] = []
    for idx, bar in enumerate(top5_bars):
        # Map direction: SHAP "toward_malignant" -> "up", "toward_benign" -> "down"
        direction = "up" if bar["direction"] == "toward_malignant" else "down"

        fc = FeatureContribution(
            name=str(bar["feature"]),
            value=float(bar["observed"]),
            impact=float(bar["percent"]),
            direction=direction,           # type: ignore[arg-type]
            is_primary=(idx < 3),          # top 3 as primary
        )
        top_features_for_summary.append(fc)

    # Build feature_values dict keyed by raw feature names
    feature_values: Dict[str, float] = {}
    for name in feature_names:
        fname = str(name)
        idx = feature_index[fname]
        feature_values[fname] = float(x_raw[idx])

    clinical_summary = summary_generator.generate_summary(
        prediction=prediction_str,
        confidence=confidence,
        top_features=top_features_for_summary,
        feature_values=feature_values,
    )
        
    mode1 = {
    "cards": mode1_cards,
    "summary": clinical_summary,
}
    mode3 = {"bars": all_bars}

    # 4) Per‑model comparison block
    model_comparisons = [
        {
            "name": "Random Forest",
            "short_name": "RF",
            "malignant_probability": float(malignant_prob_rf),
            "benign_probability": float(benign_prob_rf),
        },
        {
            "name": "XGBoost",
            "short_name": "XGB",
            "malignant_probability": float(malignant_prob_xgb),
            "benign_probability": float(benign_prob_xgb),
        },
        {
            "name": "Logistic Regression",
            "short_name": "LR",
            "malignant_probability": float(malignant_prob_lr),
            "benign_probability": float(benign_prob_lr),
        },
    ]

    return {
        "prediction_label": prediction_label,
        "malignant_probability": float(malignant_prob_primary),
        "benign_probability": float(benign_prob_primary),
        "mode1": mode1,
        "mode2": mode2,
        "mode3": mode3,
        "model_comparisons": model_comparisons,
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
    model: Optional[str] = "RF" 

class PredictResponse(BaseModel):
    prediction_label: str
    malignant_probability: float
    benign_probability: float
    mode1: dict
    mode2: dict
    mode3: dict
    model_comparisons: list

class GlobalFeature(BaseModel):
    feature: str
    importance: float
    group: str
    rank: int

@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
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
    
    model_key = (req.model or "RF").upper()
    return build_payload_for_single(x_raw, model_key=model_key)

@app.get("/global_importance", response_model=List[GlobalFeature])
def get_global_importance(model: str = "RF"):
    model = model.upper()
    if model == "RF":
        return rf_global_importance
    elif model == "XGB":
        return xgb_global_importance
    elif model == "LR":
        return lr_global_importance
    else:
        raise HTTPException(status_code=400, detail="Unknown model")