"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import type { PredictionResponse } from "@/app/PredictionPage";

export type TabType = "prediction" | "features" | "confidence";

interface Props {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  result: PredictionResponse | null;
}

export default function TopNav({ activeTab, onTabChange, result }: Props) {
  const { data: session, status } = useSession();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const tabs = [
    { key: "prediction", label: "Prediction Dashboard", icon: "🎯" },
    { key: "features", label: "Feature Importance", icon: "📊" },
    { key: "confidence", label: "Model Confidence", icon: "🎲" },
  ];

  async function handleExport() {
    if (!result) {
      setSaveError("No prediction to export yet.");
      return;
    }
    try {
      setSaving(true);
      setSaveError(null);
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result),
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveError(data.error || "Failed to save report.");
        return;
      }
      alert("Report saved successfully.");
    } catch (err) {
      console.error(err);
      setSaveError("Network error while saving report.");
    } finally {
      setSaving(false);
    }
  }

  const clinicianLabel =
    status === "loading"
      ? "Checking session..."
      : session?.user?.email
      ? `Clinician: ${session.user.email}`
      : "Not signed in";

  return (
    <div className="w-full bg-white border-b shadow-sm">
      {/* 🔝 HEADER */}
      <div className="flex items-center justify-between px-6 py-3 bg-gray-100">
        <h1 className="text-lg font-semibold text-gray-800">
          Breast Cancer Diagnostic Assistant
        </h1>

        <div className="flex items-center gap-4">
          {/* clinician info */}
          <div className="bg-gray-200 px-3 py-1 rounded-full text-xs text-gray-700">
            {clinicianLabel}
          </div>

          {/* AI ACTIVE */}
          <div className="flex items-center gap-2 bg-gray-200 px-3 py-1 rounded-full text-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            AI Active
          </div>

          {/* CASE */}
          <div className="bg-gray-200 px-3 py-1 rounded-full text-sm">
            Case #001
          </div>

          {/* EXPORT */}
          <button
            onClick={handleExport}
            disabled={saving}
            className="bg-teal-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-teal-800 transition disabled:opacity-60"
          >
            {saving ? "Saving..." : "📄 Export Report"}
          </button>
        </div>
      </div>

      {saveError && (
        <div className="px-6 py-1 text-xs text-red-600 bg-red-50 border-b border-red-100">
          {saveError}
        </div>
      )}

      {/* 📊 TAB NAV */}
      <div className="flex gap-8 px-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key as TabType)}
            className={`flex items-center gap-2 py-3 text-sm font-medium relative transition ${
              activeTab === tab.key
                ? "text-blue-700"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-700"></span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}