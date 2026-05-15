// components/mode1.tsx
import type { PredictionResponse } from "@/app/PredictionPage";

export default function Mode1({ result }: { result: PredictionResponse }) {
  const cards = result.mode1.cards.slice(0, 5);

  return (
    <section className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            Clinical reasoning
          </h3>
          <p className="text-sm text-slate-600">
            Top contributing factors — ranked by diagnostic impact.
          </p>
        </div>

        <button className="text-xs px-3 py-1 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50">
          Text priority mode
        </button>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {cards.map((card) => {
          const width = card.impact_percent; // 0–100
          const styles =
  card.risk_color === "red"
    ? {
        border: "border-l-red-500",
        bar: "bg-red-500",
      }
    : card.risk_color === "green"
    ? {
        border: "border-l-emerald-500",
        bar: "bg-emerald-500",
      }
    : {
        border: "border-l-amber-500",
        bar: "bg-amber-500",
      };

          const range = card.ranges;
          const benignRangeText =
            range.benign_min != null && range.benign_max != null
              ? `Normal benign: ${range.benign_min.toFixed(
                  2
                )}–${range.benign_max.toFixed(2)}`
              : "";

          const malignantRangeText =
            range.malignant_min != null && range.malignant_max != null
              ? `Malignant: ${range.malignant_min.toFixed(
                  2
                )}–${range.malignant_max.toFixed(2)}`
              : "";

          return (
            <div
              key={card.feature}
              className={`group relative flex items-stretch gap-3 rounded-xl border border-slate-200
  border-l-4 ${styles.border} bg-white px-4 py-3 shadow-sm transition-all duration-200 hover:shadow-md hover:translate-x-1`}
>
            
             

        {/* Left dot (emoji) */}
        <div className="flex items-center px-2">
                <span className="text-lg">
                 {card.risk_color === "red"
                 ? "🔴"
                 : card.risk_color === "green"
                 ? "🟢"
                 : "🟡"}
               </span>
              </div>

              {/* Main content */}
              <div className="flex-1 space-y-1">
                {/* Headline */}
                <div className="text-sm font-semibold text-slate-900">
                  {card.feature} {card.direction_label} —{" "}
                  {card.risk_color === "red"
                    ? "increases risk"
                    : card.risk_color === "green"
                    ? "reduces risk"
                    : "borderline finding"}
                </div>

                {/* Explanation */}
                <p className="text-sm text-slate-700">{card.plain_text}</p>

                {/* Ranges line */}
                <p className="text-xs text-slate-500">
                  {benignRangeText && `${benignRangeText} · `}Observed:{" "}
                  {card.observed.toFixed(3)}
                  {malignantRangeText && ` · ${malignantRangeText}`}
                </p>
              </div>

              {/* Right compact bar with % */}
              <div className="flex flex-col items-end justify-center gap-1 min-w-[80px]">
                <div className="text-sm font-semibold text-slate-900">
                  +{width.toFixed(0)}%
                </div>
                <div className="w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${styles.bar}`}
                    style={{ width: `${Math.min(width, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
         </div>
          {/* Fixed blue clinical summary box */}
      <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 text-xl" aria-hidden="true">
            🧾
          </div>

          {/* Content */}
          <div className="flex-1 space-y-1">
            <h4 className="text-xs font-bold tracking-wide uppercase text-blue-700">
              Clinical interpretation summary
            </h4>
            <p className="text-sm text-slate-800 leading-relaxed">
              {result.mode1.summary}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}