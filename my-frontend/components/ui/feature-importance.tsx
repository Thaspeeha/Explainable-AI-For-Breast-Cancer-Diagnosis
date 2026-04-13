// components/FeatureImportanceTab.tsx
"use client";

import { useState } from "react";
import type { GlobalFeatureImportance } from "@/app/page";

const FILTERS = [
  { id: "all", label: "All Features" },
  { id: "mean", label: "Mean Values" },
  { id: "worst", label: "Worst Values" },
  { id: "se", label: "Standard Error (SE)" },
] as const;

type FilterId = (typeof FILTERS)[number]["id"];
// app/page.tsx (near top or import from another file)

export default function FeatureImportanceTab({
  importances,
}: {
  importances: GlobalFeatureImportance[];
}) {
  const [filter, setFilter] = useState<FilterId>("all");

  const filtered =
    filter === "all"
      ? importances
      : importances.filter((f) => f.group === filter);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">
            Global feature importance
          </h3>
          <p className="text-xs text-slate-600">
            What the model relies on across all training cases (not patient‑specific).
          </p>
        </div>

        {/* Filters */}
        <div className="inline-flex rounded-full bg-slate-100 p-1 text-xs">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1 rounded-full ${
                filter === f.id
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ranked bar list */}
      <div className="space-y-2">
        {filtered
          .slice()
          .sort((a, b) => a.rank - b.rank)
          .slice(0, 15)
          .map((f) => (
            <div key={f.feature} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[11px] text-white">
                    {f.rank}
                  </span>
                  <span>{f.feature}</span>
                </div>
                <span className="text-slate-500">
                  {(f.importance * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-900"
                  style={{ width: `${f.importance * 100}%` }}
                />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}