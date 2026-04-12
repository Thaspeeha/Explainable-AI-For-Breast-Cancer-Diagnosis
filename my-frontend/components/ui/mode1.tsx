// components/Mode1.tsx
import { Card, CardContent } from "@/components/ui/card";
import type { PredictionResponse } from "@/app/page";

export default function Mode1({ result }: { result: PredictionResponse }) {
  const cards = result.mode1.cards.slice(0, 5);

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        {cards.map((card) => {
          const width = card.impact_percent; // 0–100
          const colorClass =
            card.risk_color === "red"
              ? "bg-red-500"
              : card.risk_color === "green"
              ? "bg-green-500"
              : "bg-yellow-500";

          const range = card.ranges;
          const rangeText =
            range.benign_min != null && range.benign_max != null
              ? `Benign: ${range.benign_min.toFixed(2)}–${range.benign_max.toFixed(
                  2
                )}`
              : "";

          const malText =
            range.malignant_min != null && range.malignant_max != null
              ? `Malignant: ${range.malignant_min.toFixed(
                  2
                )}–${range.malignant_max.toFixed(2)}`
              : "";

          return (
            <div key={card.feature} className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span>{card.feature}</span>
                <span className="text-gray-500">{card.direction_label}</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-5 bg-gray-100 rounded overflow-hidden">
                  <div
                    className={`h-full flex items-center pl-2 text-[11px] text-white ${colorClass}`}
                    style={{ width: `${width}%` }}
                  >
                    +{width.toFixed(1)}% risk impact
                  </div>
                </div>
                <span className="text-[11px] text-gray-500">
                  {card.risk_color === "red"
                    ? "high‑risk contribution"
                    : card.risk_color === "green"
                    ? "risk‑reducing contribution"
                    : "borderline region"}
                </span>
              </div>

              <div className="text-[11px] text-gray-600">
                {card.plain_text}
              </div>

              <div className="text-[10px] text-gray-500">
                Observed: {card.observed.toFixed(3)}{" "}
                {rangeText && <>· {rangeText}</>}
                {malText && <> · {malText}</>}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}