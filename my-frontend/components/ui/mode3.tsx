// components/Mode3.tsx
import { Card, CardContent } from "@/components/ui/card";
import type { PredictionResponse } from "@/app/PredictionPage";

export default function Mode3({ result }: { result: PredictionResponse }) {
  // All 10+ features ranked by importance (backend gives rank)
  const features = [...result.mode3.bars].sort(
    (a, b) => (a.rank ?? 0) - (b.rank ?? 0)
  );

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="text-xl font-normal text-slate-900"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
          >
            Feature Impact Analysis
          </h2>
          <p className="text-sm text-slate-600 mt-0.5">
            All features ranked by their contribution to this prediction
          </p>
        </div>
      </div>

      {/* Full Ranked Bar Chart */}
      <div className="space-y-2.5">
        {features.map((feature, index) => {
          const barWidth = Math.max((feature.percent / Math.max(...features.map(f => f.percent))) * 80, 4);
          const isMalignant = feature.direction === "toward_malignant";
          const isTop3 = (feature.rank ?? 99) <= 3;

          const colorClass =
            feature.risk_color === "red"
              ? "bg-red-500"
              : feature.risk_color === "green"
              ? "bg-emerald-500"
              : "bg-amber-500";

              return (
                <div
              key={feature.feature}
              className="flex items-center gap-3.5 animate-fadeIn"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              {/* Rank Badge */}
              <div
                className={`flex-shrink-0 w-[22px] h-[22px] rounded-full flex items-center justify-center text-[11px] font-bold ${
                  isTop3
                    ? "bg-blue-600 text-white"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {feature.rank}
              </div>

              {/* Feature Name */}
              <div className="w-[170px] text-sm font-medium text-slate-900 flex-shrink-0">
                {feature.feature}
              </div>

              {/* Bar Track */}
              <div className="flex-1 h-5 bg-slate-100 rounded-sm overflow-hidden">
                <div
                  className={`h-full flex items-center rounded-sm transition-all duration-1000 ${colorClass}`}
                  style={{ width: `${barWidth}%` }}
                >
                  {barWidth > 20 && (
                    <span className="text-white text-[11px] font-semibold px-2 whitespace-nowrap">
                      {isMalignant ? "↑ Risk" : "↓ Risk"}
                    </span>
                  )}
                </div>
              </div>

              {/* Percentage */}
              <div className="w-[44px] text-right text-xs font-semibold text-slate-600 font-mono flex-shrink-0">
                {isMalignant ? "+" : "−"}{Math.round(feature.percent)}%
              </div>
            </div>
          );
        })}
      </div>

        
     </section>
  );
}