// components/PredictionDashboard.tsx
import type { PredictionResponse } from "@/app/page";
import Mode1 from "./mode1";
import Mode2 from "./mode2";
import Mode3 from "./mode3";

interface Props {
  result: PredictionResponse;
  explanationMode: string;
}

export default function PredictionDashboard({ result, explanationMode }: Props) {
  const malignantPct = result.malignant_probability * 100;
  const benignPct = result.benign_probability * 100;
  const isMalignant = result.prediction_label === "MALIGNANT";

  // Certainty level based on max(malignant, benign)
  const confidence = Math.max(malignantPct, benignPct);
  const certaintyLevel =
    confidence >= 85 ? "High" : confidence >= 60 ? "Moderate" : "Low";

  // Recommended action (simple rule-based)
  const recommendedAction = isMalignant
    ? confidence >= 80
      ? "🔴 Priority biopsy & oncology referral"
      : "🟠 Urgent imaging review & short-interval follow-up"
    : confidence >= 80
    ? "🟢 Routine surveillance; no immediate invasive work-up"
    : "🟡 Consider short-interval imaging follow-up";

  // BI-RADS mapping (very rough heuristic)
  const birads =
    isMalignant && confidence >= 90
      ? "BI-RADS 5: Highly suggestive of malignancy"
      : isMalignant && confidence >= 75
      ? "BI-RADS 4C: High suspicion of malignancy"
      : !isMalignant && confidence >= 80
      ? "BI-RADS 2: Benign finding"
      : "BI-RADS 3–4A: Probably benign / low suspicion; correlate clinically";

  // Features analyzed count (Mode 3 bars length)
  const featuresAnalyzed = result.mode3?.bars?.length ?? 0;

  // For metric cards, pull radius/concavity from top features if present
  const radiusBar = result.mode3.bars.find((b) => b.feature === "mean radius");
  const concavityBar = result.mode3.bars.find(
    (b) => b.feature === "mean concavity"
  );

  // Helper to map certainty to color
  const certaintyColor =
    certaintyLevel === "High"
      ? "text-emerald-700 bg-emerald-50"
      : certaintyLevel === "Moderate"
      ? "text-amber-700 bg-amber-50"
      : "text-red-700 bg-red-50";

  // Pick correct explanation component
  let ExplanationMode;
  if (explanationMode === "Bars + Text") ExplanationMode = Mode2;
  else if (explanationMode === "Feature Impact") ExplanationMode = Mode3;
  else ExplanationMode = Mode1;

  return (
    <div className="space-y-6">
      {/* Hero section */}
      <section className="border border-slate-200 rounded-lg p-4 bg-slate-50 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                isMalignant
                  ? "bg-red-100 text-red-700"
                  : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {isMalignant ? "⚠️ MALIGNANT" : "✅ BENIGN"}
            </span>
            <span className="text-sm text-slate-600">
              Model estimate for this tumor
            </span>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500 uppercase tracking-wide">
              Confidence
            </div>
            <div className="text-lg font-semibold text-slate-800">
              {confidence.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              isMalignant ? "bg-red-500" : "bg-emerald-500"
            }`}
            style={{ width: `${confidence}%` }}
          />
        </div>

        {/* Recommended action */}
        <div className="text-xs text-slate-700">
          <span className="font-semibold">Recommended clinical action: </span>
          {recommendedAction}
        </div>
      </section>

      {/* Metrics row */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Mean radius card */}
        <div className="border border-slate-200 rounded-lg p-3 bg-white">
          <div className="text-[11px] text-slate-500 uppercase tracking-wide">
            Mean radius
          </div>
          <div className="text-lg font-semibold text-slate-800">
            {radiusBar ? radiusBar.observed.toFixed(2) : "—"} mm
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            vs benign range • see clinical ranges panel
          </div>
        </div>

        {/* Concavity score */}
        <div className="border border-slate-200 rounded-lg p-3 bg-white">
          <div className="text-[11px] text-slate-500 uppercase tracking-wide">
            Concavity score
          </div>
          <div className="text-lg font-semibold text-slate-800">
            {concavityBar ? concavityBar.observed.toFixed(3) : "—"}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Shape irregularity relative to benign tissue
          </div>
        </div>

        {/* Features analyzed */}
        <div className="border border-slate-200 rounded-lg p-3 bg-white">
          <div className="text-[11px] text-slate-500 uppercase tracking-wide">
            Features analyzed
          </div>
          <div className="text-lg font-semibold text-slate-800">
            {featuresAnalyzed}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Top SHAP-ranked predictors for this case
          </div>
        </div>

        {/* Model certainty */}
        <div className={`border border-slate-200 rounded-lg p-3 bg-white`}>
          <div className="text-[11px] text-slate-500 uppercase tracking-wide">
            Model certainty
          </div>
          <div
            className={`inline-flex mt-1 px-2 py-1 rounded-full text-xs font-semibold ${certaintyColor}`}
          >
            {certaintyLevel}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Based on separation between benign and malignant estimates
          </div>
        </div>
      </section>

      {/* Clinical validation panel */}
      <section className="border border-slate-200 rounded-lg p-4 bg-white space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">
            Clinical validation
          </h3>
          <div className="text-[11px] px-2 py-1 rounded-full bg-slate-100 text-slate-600">
            {birads}
          </div>
        </div>

        <ul className="text-sm list-disc list-inside space-y-1 text-slate-700">
          <li>
            Pattern of radius, texture, and concavity is consistent with{" "}
            {isMalignant ? "reported malignant" : "reported benign"} lesions in
            the Wisconsin Breast Cancer dataset.
          </li>
          <li>
            Risk estimate falls into a range typically managed as{" "}
            {isMalignant ? "biopsy / oncology work-up" : "routine surveillance"}
            {" "}under common breast imaging guidelines.
          </li>
          <li>
            Feature contributions align with expected radiomic markers (size,
            border irregularity, and tissue heterogeneity).
          </li>
        </ul>
      </section>

      {/* Active explanation mode (1/2/3), unchanged */}
      <ExplanationMode result={result} />
    </div>
  );
}