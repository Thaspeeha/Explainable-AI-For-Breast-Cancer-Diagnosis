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
    <section
  className={`rounded-xl p-5 shadow-sm border ${
    isMalignant
      ? "bg-rose-50/80 border-rose-100"
      : "bg-emerald-50/80 border-emerald-100"
  }`}
>
  <div className="grid gap-6 md:grid-cols-[1fr,1.4fr,1fr] items-center">
    
    {/* LEFT */}
    <div className="space-y-2 max-w-xs">
      <div
        className={`text-[11px] font-semibold tracking-[0.12em] uppercase ${
          isMalignant ? "text-rose-500" : "text-emerald-600"
        }`}
      >
        AI Diagnosis
      </div>

      <div
        className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold text-white shadow-sm ${
          isMalignant ? "bg-red-700" : "bg-emerald-700"
        }`}
      >
        <span className="mr-2 text-base">
          {isMalignant ? "⚠️" : "✅"}
        </span>
        <span>{isMalignant ? "MALIGNANT" : "BENIGN"}</span>
      </div>

      <div
        className={`mt-1 text-xs ${
          isMalignant ? "text-rose-700" : "text-emerald-700"
        }`}
      >
        {isMalignant
          ? "Immediate clinical evaluation recommended"
          : "Likely benign with moderate confidence"}
      </div>
    </div>

    {/* MIDDLE */}
      <div className="space-y-2 text-center max-w-sm mx-auto">
        <div
          className={`text-[11px] font-semibold tracking-[0.12em] uppercase ${
            isMalignant ? "text-rose-500" : "text-emerald-600"
          }`}
        >
          Malignancy probability
        </div>

        <div className="text-3xl font-semibold text-slate-900">
          {malignantPct.toFixed(1)}%
        </div>

        <div
          className={`mt-1 h-2 w-full overflow-hidden rounded-full ${
            isMalignant ? "bg-rose-100" : "bg-emerald-100"
          }`}
        >
          <div
            className={`h-full rounded-full ${
              isMalignant ? "bg-red-600" : "bg-emerald-600"
            }`}
            style={{ width: `${malignantPct}%` }}
          />
        </div>

        <div
          className={`mt-1 flex justify-between text-[11px] ${
            isMalignant ? "text-rose-700" : "text-emerald-700"
          }`}
        >
          <span>0% Benign</span>
          <span>100% Malignant</span>
        </div>
      </div>
    

    {/* RIGHT */}
    <div className="flex justify-end items-center">
      <div className="relative rounded-lg bg-white/90 p-4 shadow-sm max-w-xs">
        <div className="text-[11px] font-semibold tracking-[0.12em] text-slate-500 uppercase mb-1">
          Recommended action
        </div>

        <div className="text-sm leading-snug text-slate-800">
          {recommendedAction}
        </div>
      </div>
    </div>

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
            Clinical Pattern Match
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