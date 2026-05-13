// app/PredictionPage.tsx
"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/ui/sidebar";
//import { mockPatientCases, PatientCase } from "@/lib/mockData";
import PredictionDashboard from "@/components/ui/prediction-dashboard";
import TopNav, { TabType } from "@/components/ui/top-nav";
import FeatureImportanceTab from "@/components/ui/feature-importance";
import ModelConfidenceTab from "@/components/ui/model-confidence";

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

export interface GlobalFeatureImportance {
  feature: string;
  importance: number; // normalized 0–1
  group: "mean" | "worst" | "se"; // for filters
  rank: number;
}

export interface ModelMetrics {
  accuracy: number;
  sensitivity: number;
  specificity: number;
  auc_roc: number;
  brier_score: number;
  false_negative_rate: number;
}

export interface ModelComparison {
  name: string;          // "Random Forest"
  short_name: string;    // "RF"
  malignant_probability: number;
  benign_probability: number;
}

 export interface PredictionResponse {
  prediction_label: string;
  malignant_probability: number;
  benign_probability: number;
  mode1: { cards: Mode1Card[] };
  mode2: { bars: Bar[]; bullets: string[] };
  mode3: { bars: Bar[]; summary: string };
  model_comparisons: ModelComparison[];  // NEW
}

export type PrimaryModelKey = "RF" | "XGB" | "LR";

export default function Home(): JSX.Element {
  //const [selectedPatient, setSelectedPatient] = useState<PatientCase>(
    //mockPatientCases[0]
  //);
  const [selectedModel, setSelectedModel] = useState<PrimaryModelKey>("RF");
  const [patientId, setPatientId] = useState<string>("CASE-001");

  const [radius, setRadius] = useState(10);
  const [texture, setTexture] = useState(15);
  const [concavity, setConcavity] = useState(0.05);
  const [meanPerimeter, setMeanPerimeter] = useState(80);
 const [meanConcavePoints, setMeanConcavePoints] = useState(0.05);
 const [worstRadius, setWorstRadius] = useState(20);
 const [worstPerimeter, setWorstPerimeter] = useState(130);
 const [worstArea, setWorstArea] = useState(900);
const [worstConcavePoints, setWorstConcavePoints] = useState(0.2);
const [worstConcavity, setWorstConcavity] = useState(0.3);
  const [explanationMode, setExplanationMode] = useState("Text Summary");
   
  // NEW: backend call state
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("prediction");
  const [globalImportances, setGlobalImportances] = useState<GlobalFeatureImportance[]>([]);
  
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
                mean_perimeter: meanPerimeter,
                mean_concave_points: meanConcavePoints,
               worst_radius: worstRadius,
  worst_perimeter: worstPerimeter,
  worst_area: worstArea,
  worst_concave_points: worstConcavePoints,
  worst_concavity: worstConcavity,
              explanationMode,
            }),
          }
        );

        if (!res.ok) {
          throw new Error(`Backend error: ${res.status}`);
        }

        const data: PredictionResponse = await res.json();
        console.log("API response", {
  radius,
  texture,
  concavity,
  meanPerimeter,
  meanConcavePoints,
  worstRadius,
  worstPerimeter,
  worstArea,
  worstConcavePoints,
  worstConcavity,
  prediction_label: data.prediction_label,
  malignant: data.malignant_probability,
  benign: data.benign_probability,
  mode1FirstCard: data.mode1.cards[0],
});
        setResult(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to call backend");
        setResult(null);
      } finally {
        setLoading(false);
      }
    };

    callBackend();
  }, [radius, texture, concavity,meanPerimeter,
  meanConcavePoints,
  worstRadius,
  worstPerimeter,
  worstArea,
  worstConcavePoints,
  worstConcavity, explanationMode]);
  
   const modelMetrics: ModelMetrics = {
  accuracy: 97.4,
  sensitivity: 97.1,
  specificity: 97.6,
  auc_roc: 0.996,
  brier_score: 0.024,
  false_negative_rate: 2.9,
};


useEffect(() => {
  const loadGlobalImportance = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/global_importance`);
      if (!res.ok) throw new Error("Failed to load global importance");
      const data: GlobalFeatureImportance[] = await res.json();
      setGlobalImportances(data);
    } catch (e) {
      console.error(e);
    }
  };
  loadGlobalImportance();
}, []);
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        //patientCases={mockPatientCases}
        //selectedPatient={selectedPatient}
        //setSelectedPatient={(p) => 
          //setSelectedPatient(p);
          //setRadius(p.features.radius);
          //setTexture(p.features.texture);
          //setConcavity(p.features.concavity);
        //}}
        patientId={patientId}
        setPatientId={setPatientId}
        radius={radius}
        setRadius={setRadius}
        texture={texture}
        setTexture={setTexture}
        concavity={concavity}
        setConcavity={setConcavity}
        meanPerimeter={meanPerimeter}
        setMeanPerimeter={setMeanPerimeter}
        meanConcavePoints={meanConcavePoints}
        setMeanConcavePoints={setMeanConcavePoints}
        worstRadius={worstRadius}
        setWorstRadius={setWorstRadius}
        worstPerimeter={worstPerimeter}
        setWorstPerimeter={setWorstPerimeter}
        worstArea={worstArea}
        setWorstArea={setWorstArea}
        worstConcavePoints={worstConcavePoints}
        setWorstConcavePoints={setWorstConcavePoints}
        worstConcavity={worstConcavity}
        setWorstConcavity={setWorstConcavity}
        explanationMode={explanationMode}
        setExplanationMode={setExplanationMode}
      />
      

      <main className="flex-1 bg-gray-50 flex flex-col text-gray-800 p-6 space-y-4 overflow-y-auto">
        


        {/* 🔝 TOP NAV */}
        <div className="-ml-6 -mt-6 ">
  <TopNav activeTab={activeTab} 
  onTabChange={setActiveTab}
  result={result}
  patientId={patientId}  
  />
  </div>

         {/* 📄 CONTENT */}
  
        
        {loading && <p className="text-gray-500">Running model...</p>}
        {error && <p className="text-red-500">{error}</p>}
        
        {/* Model selector pills */}
{result && (
  <div className="flex flex-wrap items-center gap-2 mb-2">
    <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
      Primary model:
    </span>
    {[
      { key: "RF", label: "Random Forest" },
      { key: "XGB", label: "XGBoost" },
      { key: "LR", label: "Logistic Regression" },
    ].map((m) => {
      const active = selectedModel === m.key;
      return (
        <button
          key={m.key}
          type="button"
          onClick={() => setSelectedModel(m.key as PrimaryModelKey)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
            active
              ? "bg-slate-900 text-white border-slate-900"
              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
          }`}
        >
          {m.label}
        </button>
      );
    })}
  </div>
)}
        
        {/* PREDICTION DASHBOARD TAB */}
      {result && activeTab === "prediction" && (
        <div className="w-full bg-white shadow rounded-lg p-4 space-y-4">
          

            <PredictionDashboard result={result} explanationMode = {explanationMode} selectedModel = {selectedModel}/>
          </div>
        )}
      {/* FEATURE IMPORTANCE TAB */}   
     {activeTab === "features" && (
      <div className="bg-white p-6 rounded-lg shadow">
        <FeatureImportanceTab importances={globalImportances} />
      </div>
    )}
     {/* MODEL CONFIDENCE TAB */}
    {activeTab === "confidence" && (
      <div className="bg-white p-6 rounded-lg shadow">
         <ModelConfidenceTab
          result={result as PredictionResponse} // safe to assert since this tab should only be visible when result is available
          metrics={modelMetrics}
          treeConsensusPct={93}
        />
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