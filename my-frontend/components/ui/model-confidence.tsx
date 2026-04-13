// components/ModelConfidenceTab.tsx
import type { PredictionResponse, ModelMetrics } from "@/app/page";

export default function ModelConfidenceTab({
  result,
  metrics,
  treeConsensusPct,
}: {
  result: PredictionResponse;
  metrics: ModelMetrics;
  treeConsensusPct: number; // e.g., 93
}) {
  const malignantPct = result.malignant_probability * 100;
  const benignPct = result.benign_probability * 100;
  const confidence = Math.max(malignantPct, benignPct);

  const certaintyLevel =
    confidence < 60
      ? "Low"
      : confidence < 75
      ? "Borderline"
      : "High";

  const borderlineAlert =
    confidence >= 50 && confidence <= 70
      ? "⚠️ Borderline prediction — treat with caution and correlate clinically."
      : null;

  return (
    <div className="space-y-4">
      {/* Split probability + donut */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-800">
            Prediction probabilities
          </h3>
          <div className="text-sm">
            <div className="flex justify-between">
              <span className="text-red-600 font-medium">Malignant</span>
              <span>{malignantPct.toFixed(1)}%</span>
            </div>
            <div className="h-1.5 bg-red-100 rounded-full overflow-hidden mt-1 mb-2">
              <div
                className="h-full bg-red-500"
                style={{ width: `${malignantPct}%` }}
              />
            </div>

            <div className="flex justify-between">
              <span className="text-emerald-600 font-medium">Benign</span>
              <span>{benignPct.toFixed(1)}%</span>
            </div>
            <div className="h-1.5 bg-emerald-100 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-emerald-500"
                style={{ width: `${benignPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Simple donut using CSS (no chart lib) */}
        <div className="flex justify-center">
          <div className="relative h-32 w-32">
            <svg viewBox="0 0 36 36" className="-rotate-90">
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="4"
              />
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                stroke={malignantPct >= benignPct ? "#ef4444" : "#22c55e"}
                strokeWidth="4"
                strokeDasharray={`${confidence} ${100 - confidence}`}
                strokeDashoffset="0"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-xs">
              <span className="text-slate-500">Confidence</span>
              <span className="text-sm font-semibold">
                {confidence.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Tree consensus */}
        <div className="space-y-1 text-sm">
          <div className="text-xs text-slate-500 uppercase tracking-wide">
            Ensemble agreement
          </div>
          <div className="text-lg font-semibold text-slate-800">
            {treeConsensusPct.toFixed(0)}%
          </div>
          <p className="text-xs text-slate-600">
            of trees in the ensemble predicted the same class.
          </p>
        </div>
      </section>

      {/* Performance metrics */}
      <section className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
        <MetricCard label="Accuracy" value={`${metrics.accuracy.toFixed(1)}%`} />
        <MetricCard
          label="Sensitivity"
          value={`${metrics.sensitivity.toFixed(1)}%`}
        />
        <MetricCard
          label="Specificity"
          value={`${metrics.specificity.toFixed(1)}%`}
        />
        <MetricCard label="AUC‑ROC" value={metrics.auc_roc.toFixed(3)} />
        <MetricCard
          label="Brier score"
          value={metrics.brier_score.toFixed(3)}
        />
        <MetricCard
          label="False negative rate"
          value={`${metrics.false_negative_rate.toFixed(1)}%`}
        />
      </section>

      {/* Certainty scale */}
      <section className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-600">Prediction certainty</span>
          <span className="font-medium">
            {certaintyLevel} ({confidence.toFixed(1)}%)
          </span>
        </div>

        <div className="relative h-3 rounded-full bg-slate-200 overflow-hidden">
          {/* Ranges background */}
          <div className="absolute inset-0 flex">
            <div className="w-[60%] bg-red-100" />
            <div className="w-[15%] bg-amber-100" />
            <div className="w-[25%] bg-emerald-100" />
          </div>
          {/* Marker */}
          <div
            className="absolute top-0 bottom-0"
            style={{ left: `calc(${confidence}% - 4px)` }}
          >
            <div className="h-full w-0.5 bg-slate-900" />
          </div>
        </div>

        {borderlineAlert && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-md px-2 py-1">
            {borderlineAlert}
          </p>
        )}
      </section>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-slate-200 rounded-lg px-3 py-2">
      <div className="text-[11px] text-slate-500 uppercase tracking-wide">
        {label}
      </div>
      <div className="text-sm font-semibold text-slate-800">{value}</div>
    </div>
  );
}