// components/Mode2.tsx
import { Card, CardContent } from "@/components/ui/card";
import type { PredictionResponse } from "@/app/PredictionPage";

export default function Mode2({ result }: { result: PredictionResponse }) {
  const bars = result.mode2.bars.slice(0, 6);
  const bullets = result.mode2.bullets;

  return (
    <Card>
      <CardContent className="space-y-6 pt-6">
        {/* Horizontal bar chart (top 5) */}
        <div className="space-y-3">
          {bars.map((bar) => {
            const width = bar.percent;
            const isMalignant = bar.direction === "toward_malignant";

            const label = isMalignant ? "↑ elevated" : "↓ reduced";

            const colorClass =
              bar.risk_color === "red"
                ? "bg-red-500"
                : bar.risk_color === "green"
                ? "bg-green-500"
                : "bg-yellow-500";

            return (
              <div key={bar.feature} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span>{bar.feature}</span>
                  <span className="text-gray-500">{label}</span>
                </div>

                {/* Clean medical-style bar: no gridlines, just bar */}
                <div className="h-4 bg-gray-100 rounded overflow-hidden">
                  <div
                    className={`h-full ${colorClass}`}
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Plain-language bullets */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Clinical Interpretation Summary</h3>
          <ul className="text-sm list-disc list-inside space-y-1">
            {bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}