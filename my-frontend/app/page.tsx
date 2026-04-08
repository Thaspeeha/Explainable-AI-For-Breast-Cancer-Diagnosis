// app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { mockPatientCases, PatientCase } from "@/lib/mockData";

interface PredictionResponse {
  prediction: string;
  explanation: string;
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

      <main className="flex-1 bg-gray-50 flex flex-col items-center justify-center text-gray-800 p-6 space-y-4">
        {loading && <p className="text-gray-500">Running model...</p>}
        {error && (
          <p className="text-red-500">
            {error}
          </p>
        )}
        {result && (
          <div className="max-w-xl w-full bg-white shadow rounded-lg p-4 space-y-2">
            <h2 className="text-lg font-semibold">
              Model prediction
            </h2>
            <p>
              Prediction: <span className="font-medium">{result.prediction}</span>
            </p>
            <p className="text-sm text-gray-600">
              Explanation: {result.explanation}
            </p>
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