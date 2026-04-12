// app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { mockPatientCases, PatientCase } from "@/lib/mockData";
import PredictionDashboard from "@/components/ui/prediction-dashboard";
import TopNav, { TabType } from "@/components/ui/top-nav";

export interface Bar {
  feature: string;
  value: number;
  direction: "toward_malignant" | "toward_benign";
  percent: number;
  rank : number;
  observed: number;
  ranges: {
    benign_min: number | null;
    benign_max: number | null;
    malignant_min: number | null;
    malignant_max: number | null;
  };
  risk_color: "red" | "green" | "yellow";
  plain_text: string;
}

export interface Mode1Card {
  feature: string;
  direction_label: string;
  impact_percent: number;
  plain_text: string;
  observed: number;
  ranges: {
    benign_min: number | null;
    benign_max: number | null;
    malignant_min: number | null;
    malignant_max: number | null;
  };
  risk_color: "red" | "green" | "yellow";
}

 export interface PredictionResponse {
  prediction_label: string;
  malignant_probability: number;
  benign_probability: number;
  mode1: { cards: Mode1Card[] };
  mode2: { bars: Bar[]; bullets: string[] };
  mode3: { bars: Bar[]; summary: string };
}

export default function Home(): JSX.Element {
  const [selectedPatient, setSelectedPatient] = useState<PatientCase>(
    mockPatientCases[0]
  );

  const [radius, setRadius] = useState(selectedPatient.features.radius);
  const [texture, setTexture] = useState(selectedPatient.features.texture);
  const [concavity, setConcavity] = useState(
    selectedPatient.features.concavity
  );
  const [explanationMode, setExplanationMode] = useState("Text Summary");

  // NEW: backend call state
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("prediction");

  // Call backend when patient or feature sliders change
  useEffect(() => {
    const callBackend = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/predict`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              // shape this to what your backend expects
              radius,
              texture,
              concavity,
              patientId: selectedPatient.id,
              explanationMode,
            }),
          }
        );

        if (!res.ok) {
          throw new Error(`Backend error: ${res.status}`);
        }

        const data: PredictionResponse = await res.json();
        setResult(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to call backend");
        setResult(null);
      } finally {
        setLoading(false);
      }
    };

    callBackend();
  }, [radius, texture, concavity, explanationMode, selectedPatient]);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        patientCases={mockPatientCases}
        selectedPatient={selectedPatient}
        setSelectedPatient={(p) => {
          setSelectedPatient(p);
          setRadius(p.features.radius);
          setTexture(p.features.texture);
          setConcavity(p.features.concavity);
        }}
        radius={radius}
        setRadius={setRadius}
        texture={texture}
        setTexture={setTexture}
        concavity={concavity}
        setConcavity={setConcavity}
        explanationMode={explanationMode}
        setExplanationMode={setExplanationMode}
      />

      <main className="flex-1 bg-gray-50 flex flex-col text-gray-800 p-6 space-y-4 overflow-y-auto">
        
        {/* 🔝 TOP NAV */}
  <TopNav activeTab={activeTab} onTabChange={setActiveTab} />

         {/* 📄 CONTENT */}
  
        
        {loading && <p className="text-gray-500">Running model...</p>}
        {error && <p className="text-red-500">{error}</p>}
        
        
        {result && (
          <div className="w-full bg-white shadow rounded-lg p-4 space-y-4">
            <h2 className="text-lg font-semibold">
              Prediction: {result.prediction_label}
            </h2>
            <p>
              Malignant probability:{" "}
              {(result.malignant_probability * 100).toFixed(1)}%
            </p>
            <p>
              Benign probability:{" "}
              {(result.benign_probability * 100).toFixed(1)}%
            </p>

            <PredictionDashboard result={result} explanationMode = {explanationMode} />
          </div>
        )}
          {/* 🚧 Placeholder for other tabs */}
     {activeTab === "features" && (
      <div className="bg-white p-6 rounded-lg shadow">
        Feature Importance UI here
      </div>
    )}

    {activeTab === "confidence" && (
      <div className="bg-white p-6 rounded-lg shadow">
        Model Confidence UI here
      </div>
    )}
        {!loading && !error && !result && (
          <p className="text-gray-400">
            Adjust patient features in the sidebar to get a prediction.
          </p>
        )}
      </main>
    </div>
  );
}