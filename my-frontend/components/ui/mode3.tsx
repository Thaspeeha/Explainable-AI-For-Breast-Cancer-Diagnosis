// components/Mode3.tsx
import { Card, CardContent } from "@/components/ui/card";
import type { PredictionResponse } from "@/app/page";

export default function Mode3({ result }: { result: PredictionResponse }) {
  // All 10+ features ranked by importance (backend gives rank)
  const bars = [...result.mode3.bars].sort(
    (a, b) => (a.rank ?? 0) - (b.rank ?? 0)
  );

  return (
    <Card>
      <CardContent className="space-y-6 pt-6">
        {/* Ranked feature list (waterfall-style surrogate) */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Feature impact ranking</h3>

          <div className="space-y-3">
            {bars.map((bar) => {
              const width = bar.percent;
              const isMalignant = bar.direction === "toward_malignant";
              const isTop3 = (bar.rank ?? 99) <= 3;

              const colorClass =
                bar.risk_color === "red"
                  ? "bg-red-500"
                  : bar.risk_color === "green"
                  ? "bg-green-500"
                  : "bg-yellow-500";

              return (
                <div key={bar.feature} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <div className="flex items-center gap-2">
                      {/* Numbered ranking with top-3 highlighted */}
                      {bar.rank != null && (
                        <span
                          className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${
                            isTop3
                              ? "bg-indigo-600 text-white"
                              : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {bar.rank}
                        </span>
                      )}
                      <span>{bar.feature}</span>
                    </div>
                    <span className="text-gray-500">
                      {isMalignant ? "↑ elevated" : "↓ reduced"} ·{" "}
                      {width.toFixed(1)}%
                    </span>
                  </div>

                  {/* Waterfall-style bar (directional impact) */}
                  <div className="h-3 bg-gray-100 rounded overflow-hidden">
                    <div
                      className={`h-full ${colorClass}`}
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Narrative summary */}
        <div className="space-y-1">
          <h3 className="text-sm font-semibold">Summary</h3>
          <p className="text-sm text-gray-700">{result.mode3.summary}</p>
        </div>
      </CardContent>
    </Card>
  );
}