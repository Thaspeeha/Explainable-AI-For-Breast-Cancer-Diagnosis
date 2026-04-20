// components/Mode2.tsx
import type { PredictionResponse } from "@/app/PredictionPage";

export default function Mode2({ result }: { result: PredictionResponse }) {
  const bars = result.mode2.bars.slice(0, 6);
  const bullets = result.mode2.bullets;

  return (
      <section className="space-y-6">
      {/* Header */}
      <div>
        <div
          className="text-[20px] font-normal text-slate-900"
          style={{ fontFamily: "'DM Serif Display', serif" }}
        >
          Feature Influence
        </div>
        <div className="text-[14px] text-slate-500 mt-[2px]">
          Relative diagnostic contribution of top features
        </div>
      </div>

   {/* Bar Chart */}
      <div className="space-y-3">
        {bars.map((bar, index) => {
          const width = Math.min(bar.percent * 3.5, 100); // Scale for visual impact
          const isPositive = bar.direction === "toward_malignant";

          const colorClass =
            bar.risk_color === "red"
              ? "bg-red-500"
              : bar.risk_color === "green"
              ? "bg-emerald-500"
              : "bg-amber-500";

          return (
            <div
              key={bar.feature}
              className="flex items-center gap-3.5"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              {/* Feature Name (Right-aligned) */}
              <div className="w-[170px] text-right text-sm font-medium text-slate-900">
                {bar.feature}
              </div>

              {/* Bar Track */}
              <div className="flex-1 h-6 bg-slate-100 rounded-md overflow-hidden">
                <div
                  className={`h-full flex items-center px-3 rounded-md transition-all duration-700 ${colorClass}`}
                  style={{ width: `${width}%` }}
                >
                  {width > 20 && (
                    <span className="text-white text-xs font-semibold whitespace-nowrap">
                      {isPositive ? "↑ Elevated" : "↓ Reduced"}
                    </span>
                  )}
                </div>
              </div>

              {/* Percentage */}
              <div className="w-12 text-sm font-semibold text-slate-600 font-mono">
                {isPositive ? "+" : "−"}{Math.round(bar.percent)}%
              </div>
            </div>
          );
        })}
      </div>
    </section>
    
  );
}