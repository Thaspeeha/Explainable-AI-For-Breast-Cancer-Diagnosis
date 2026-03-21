// app/page.tsx
"use client";

import { useState } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { mockPatientCases, PatientCase } from "@/lib/mockData";

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

      <main className="flex-1 bg-gray-50 flex items-center justify-center text-gray-400">
        Sidebar-only prototype (no dashboards yet)
      </main>
    </div>
  );
}
