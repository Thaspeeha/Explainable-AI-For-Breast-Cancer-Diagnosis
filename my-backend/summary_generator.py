# summary_generator.py

from typing import Dict, List, Literal
from dataclasses import dataclass

@dataclass
class FeatureContribution:
    name: str
    value: float
    impact: float          # percent impact (0–100)
    direction: Literal["up", "down"]  # "up" = toward malignancy, "down" = toward benign
    is_primary: bool       # True for top ~3 drivers

class ClinicalSummaryGenerator:
    """Generate clinical narrative summaries from prediction results."""

    def __init__(self):
        self.morphology_terms = {
            "high_risk": [
                "constellation of high-risk features",
                "profile strongly indicative of malignancy",
                "morphological characteristics consistent with malignant transformation",
            ],
            "moderate_risk": [
                "mixed morphological signals",
                "borderline cytological features",
                "indeterminate cellular pattern",
            ],
            "low_risk": [
                "reassuring benign morphology",
                "characteristics consistent with benign pathology",
                "features within normal benign range",
            ],
        }

        # These labels are heuristic descriptors, not strict diagnoses
        self.cancer_types = {
            "high_radius_high_concavity": "an invasive ductal carcinoma–like pattern",
            "high_texture_irregular": "a poorly differentiated carcinoma–like pattern",
            "moderate_all": "an atypical hyperplasia–like pattern",
            "low_all": "a benign fibroadenoma or normal tissue–like pattern",
        }

    def generate_summary(
        self,
        prediction: Literal["malignant", "benign"],
        confidence: float,  # 0–100
        top_features: List[FeatureContribution],
        feature_values: Dict[str, float],
    ) -> str:
        """Generate a short clinical-style narrative summary."""

        # Count malignant-leaning primary indicators
        positive_indicators = sum(
            1 for f in top_features if f.direction == "up" and f.is_primary
        )
        total_primary = max(1, sum(1 for f in top_features if f.is_primary))

        # Risk descriptor
        if prediction == "malignant":
            if confidence > 90:
                risk_descriptor = self.morphology_terms["high_risk"][0]
            elif confidence > 75:
                risk_descriptor = self.morphology_terms["high_risk"][1]
            else:
                risk_descriptor = self.morphology_terms["moderate_risk"][0]
        else:
            if confidence > 90:
                risk_descriptor = self.morphology_terms["low_risk"][0]
            else:
                risk_descriptor = self.morphology_terms["moderate_risk"][1]

        # Dominant malignant‑pushing features
        dominant_features = [f.name for f in top_features[:3] if f.direction == "up"]
        feature_list = " and ".join(dominant_features) if dominant_features else "multiple measured parameters"

        # Map feature names (dataset uses "mean radius", "worst concavity", etc.)
        mean_radius = feature_values.get("mean radius", 0.0)
        worst_concavity = feature_values.get("worst concavity", 0.0)
        mean_texture = feature_values.get("mean texture", 0.0)

        # Heuristic cancer‑type style descriptor for malignant cases
        cancer_type = ""
        if prediction == "malignant":
            if mean_radius > 17 and worst_concavity > 0.25:
                cancer_type = self.cancer_types["high_radius_high_concavity"]
            elif mean_texture > 25:
                cancer_type = self.cancer_types["high_texture_irregular"]
            else:
                cancer_type = self.cancer_types["moderate_all"]
        else:
            cancer_type = self.cancer_types["low_all"]

        # Construct summary
        if prediction == "malignant":
            summary = (
                f"This FNA demonstrates a {risk_descriptor} dominated by {feature_list}. "
                f"{positive_indicators} of {total_primary} key indicators strongly support malignancy. "
            )
            summary += (
                f"The combined morphological profile is consistent with {cancer_type}, "
                "and warrants urgent clinical correlation and tissue diagnosis."
            )
        else:
            summary = (
                f"Overall, the features show {risk_descriptor}. "
                f"{feature_list.capitalize()} measurements fall within patterns typically seen in benign cases. "
            )
            if confidence > 90:
                summary += (
                    "The cytological profile shows no convincing evidence of malignant transformation; "
                    "routine surveillance is appropriate if clinically indicated."
                )
            else:
                summary += (
                    "Although predominantly benign, subtle borderline changes suggest short‑interval follow‑up "
                    "or correlation with imaging rather than immediate invasive work‑up."
                )

        return summary

# Singleton instance
summary_generator = ClinicalSummaryGenerator()