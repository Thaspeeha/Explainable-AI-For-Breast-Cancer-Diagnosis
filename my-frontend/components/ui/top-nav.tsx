// components/ui/top-nav.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import type { PredictionResponse } from "@/app/PredictionPage";
import { jsPDF } from "jspdf";

export type TabType = "prediction" | "features" | "confidence";

interface Props {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  result: PredictionResponse | null;
  patientId: string; 
   selectedModel: "RF" | "XGB" | "LR";
}

export default function TopNav({ activeTab, onTabChange, result, patientId, selectedModel }: Props) {
  const { data: session, status } = useSession();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [exportOpen, setExportOpen] = useState(false);

    const [localPatientId, setLocalPatientId] = useState(patientId);
  const panelRef = useRef<HTMLDivElement | null>(null); // <-- define this
  // Keep localPatientId in sync when patientId changes from sidebar
  useEffect(() => {
    setLocalPatientId(patientId);
  }, [patientId]);

    const malignancyPct = result
    ? (result.malignant_probability * 100).toFixed(1)
    : null;


  const tabs = [
    { key: "prediction", label: "Prediction Dashboard", icon: "🎯" },
    { key: "features", label: "Feature Importance", icon: "📊" },
    { key: "confidence", label: "Model Confidence", icon: "🎲" },
  ];

  const primaryModelLabel =
  selectedModel === "RF"
    ? "Random Forest"
    : selectedModel === "XGB"
    ? "XGBoost"
    : "Logistic Regression";

  async function handleConfirmExport() {
  if (!result) {
    setSaveError("No prediction to export yet.");
    return;
  }
  if (!localPatientId.trim()) {
    setSaveError("Please enter a patient / sample ID.");
    return;
  }

  try {
    setSaving(true);
    setSaveError(null);

    // Build report text directly on the client
    const malignantPct = (result.malignant_probability * 100).toFixed(1);
    const benignPct = (result.benign_probability * 100).toFixed(1);

    const reportLines = [
      "BREAST CANCER AI DIAGNOSTIC REPORT",
      "==================================",
      "",
      `Patient / Sample ID: ${localPatientId}`,
      "",
      "AI Prediction",
      "-------------",
      `- Primary model: ${primaryModelLabel}`,
      `- Prediction label: ${result.prediction_label}`,
      `- Malignancy probability: ${malignantPct}%`,
      `- Benign probability: ${benignPct}%`,
      "",
      "Explanation Summary",
      "-------------------",
      `- Summary: ${result.mode1?.summary || "Not available."}`,
      "",
      "Disclaimer: This AI output is for decision support only and is not a substitute for professional clinical judgment.",
    ];

    const text = reportLines.join("\n");

    // Generate PDF on client
    const doc = new jsPDF();
    const lines = doc.splitTextToSize(text, 180);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(lines, 15, 20);

    doc.save(`${localPatientId || "case"}-report.pdf`);

    alert("PDF report downloaded.");
    setExportOpen(false);
  } catch (err) {
    console.error(err);
    setSaveError("Error while generating PDF.");
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
      <div className="flex items-center justify-between px-4 py-3 bg-gray-100">
        <h1 className="text-lg font-semibold text-gray-800">
          Breast Cancer Diagnostic Assistant
        </h1>

        <div className="flex items-center gap-4">
          {/* clinician info */}
          <div className="bg-gray-200 px-3 py-1 rounded-full text-xs text-gray-700">
            {clinicianLabel}
          </div>

          {/* LOGOUT */}
  {status === "authenticated" && (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="text-xs px-3 py-1 rounded-full border border-slate-300 text-slate-600 hover:bg-slate-100 transition"
    >
      Log out
    </button>
  )}

          {/* AI ACTIVE */}
          <div className="flex items-center gap-2 bg-gray-200 px-3 py-1 rounded-full text-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            AI Active
          </div>

              {/* show patient ID */}
          <div className="bg-gray-200 px-3 py-1 rounded-full text-sm">
            {patientId || "No ID"}
          </div>

     
          {/* EXPORT button: toggles dropdown panel */}
           
    <button
      type="button"
      onClick={() => setExportOpen((prev) => !prev)}
      disabled={saving || !result}
      className="bg-teal-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-teal-800 transition disabled:opacity-60"
    >
      {saving ? "Saving..." : "📄 Export Report"}
    </button>

    {exportOpen && (
      <div
        ref={panelRef}
        className="absolute right-0 mt-2 w-80 rounded-lg border border-slate-200 bg-white shadow-lg p-3 text-xs z-20"
      >
        <div className="font-semibold text-slate-800 mb-2">
          Export clinical report
        </div>

        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
          Patient / Sample ID
        </label>
        <input
          type="text"
          value={localPatientId}
          onChange={(e) => setLocalPatientId(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs mb-2"
          placeholder="e.g. CASE-001 or Patient A"
        />

        {result && (
          <div className="mb-2 text-slate-700">
            <div>
              Prediction:{" "}
              <span className="font-semibold">
                {result.prediction_label}
              </span>
            </div>
            <div>
              Malignancy probability:{" "}
              <span className="font-semibold">
                {(result.malignant_probability * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        )}

        {saveError && (
          <div className="mb-2 text-[11px] text-red-600">
            {saveError}
          </div>
        )}

        <div className="flex justify-end gap-2 mt-2">
          <button
            type="button"
            onClick={() => setExportOpen(false)}
            className="px-3 py-1.5 rounded-md border border-slate-300 text-[11px] text-slate-600"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmExport}
            disabled={saving}
            className="px-3 py-1.5 rounded-md bg-teal-700 text-[11px] font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Saving..." : "Confirm & Save"}
          </button>
        </div>
      </div>
    )}
  </div>
</div>

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