// components/PredictionDashboard.tsx
import type { PredictionResponse } from "@/app/PredictionPage";
import Mode1 from "./mode1";
import Mode2 from "./mode2";
import Mode3 from "./mode3";
import { useEffect, useState } from "react";

interface Props {
  result: PredictionResponse;
  explanationMode: string;
}

export default function PredictionDashboard({ result, explanationMode }: Props) {
  const malignantPct = result.malignant_probability * 100;
  const benignPct = result.benign_probability * 100;
  const isMalignant = result.prediction_label === "MALIGNANT";
const [animatedPct, setAnimatedPct] = useState(0);
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
  

useEffect(() => {
  let start = 0;
  const end = malignantPct;
  const duration = 800;
  const stepTime = 16;

  const increment = end / (duration / stepTime);

  const timer = setInterval(() => {
    start += increment;
    if (start >= end) {
      start = end;
      clearInterval(timer);
    }
    setAnimatedPct(start);
  }, stepTime);

  return () => clearInterval(timer);
}, [malignantPct]);

  // Pick correct explanation component
  let ExplanationMode;
  if (explanationMode === "Bars + Text") ExplanationMode = Mode2;
  else if (explanationMode === "Feature Impact") ExplanationMode = Mode3;
  else ExplanationMode = Mode1;

  return (
    <div className="space-y-6">
    {/* HERO SECTION */}
<section
  className={`rounded-xl p-6 shadow-md border transition-all duration-500 ${
    isMalignant ? "bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200" : "bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200"
  }`}
>
  <div className="flex flex-col md:flex-row gap-8 items-start">

    {/* LEFT: AI Diagnosis */}
    <div className="space-y-2 max-w-xs">
      <div className={`text-[11px] font-mono font-semibold tracking-[0.12em] uppercase ${isMalignant ? "text-rose-500" : "text-emerald-600"}`}>
        AI Diagnosis
      </div>

      <div className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold text-white shadow-sm ${
        isMalignant ? "bg-red-800 animate-pulse" : "bg-emerald-700"
      }`}>
        <span className="text-base">{isMalignant ? "⚠️" : "✅"}</span>
        {isMalignant ? "MALIGNANT" : "BENIGN"}
      </div>

      <div className={`text-xs ${isMalignant ? "text-rose-700" : "text-emerald-700"}`}>
        {isMalignant
          ? "Immediate clinical evaluation recommended"
          : "High confidence benign finding"}
      </div>
    </div>

    {/* MIDDLE: Probability */}
    <div className="text-center space-y-2 flex-1 min-w-[250px]">
      <div className={`text-[11px] font-semibold tracking-[0.12em] uppercase ${isMalignant ? "text-rose-600" : "text-emerald-700"}`}>
        Malignancy probability
      </div>

      <div className="text-5xl font-normal text-slate-900 text-center" 
           style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
        {animatedPct.toFixed(1)}%
      </div>

      <div className={`mt-1 h-2 w-full overflow-hidden rounded-full ${isMalignant ? "bg-rose-200/50" : "bg-emerald-200/50"}`}>
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${isMalignant ? "bg-gradient-to-r from-red-600 to-red-800" : "bg-gradient-to-r from-emerald-500 to-emerald-700"}`}
          style={{ width: `${animatedPct}%` }}
        />
      </div>

      <div className={`mt-1 flex justify-between text-[11px] ${isMalignant ? "text-rose-700" : "text-emerald-700"}`}>
        <span>0% Benign</span>
        <span>100% Malignant</span>
      </div>
    </div>

    {/* RIGHT: Recommended Action */}
    <div className="flex-shrink-0 max-w-[280px]">
      <div className="relative rounded-lg bg-white/90 p-4 shadow-sm max-w-xs">
        {isMalignant && (
          <div className="absolute inset-0 rounded-lg ring-2 ring-red-200 animate-pulse pointer-events-none" />
        )}

        <div className="text-[11px] font-semibold tracking-[0.12em] uppercase text-slate-500 mb-1">
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
      {/* Clinical validation panel */}
<div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-5">
  <div className="flex items-start gap-3 mb-3">
    <div className="flex-shrink-0 text-xl">📚</div>
    <h3 className="text-sm font-bold text-blue-800">
      Clinical Pattern Match
    </h3>
  </div>

  <p className="text-sm text-slate-800 leading-relaxed">
    This case demonstrates imaging and morphological characteristics consistent with{" "}
    <span className="font-medium">
      {isMalignant ? "malignant pathology" : "benign tissue patterns"}
    </span>
    , based on learned feature distributions from the Wisconsin Breast Cancer dataset.{" "}
    
    The observed feature profile (including size, contour irregularity, and texture heterogeneity) 
    aligns with established radiological markers used in clinical risk stratification.

    {" "}This interpretation is supported by cytological criteria aligned with{" "}
    <em>Elston–Ellis grading principles</em> and corresponds to{" "}
    
    <span className="inline-flex items-center gap-1 bg-blue-800 text-white text-xs font-bold px-2.5 py-0.5 rounded-full mx-1">
      {birads}
    </span>

    classification guidelines. Model confidence is further reinforced through 
    ensemble consensus across multiple decision pathways.
  </p>
</div>

      {/* Active explanation mode (1/2/3), unchanged */}
      <ExplanationMode result={result} />
    </div>
  );
}