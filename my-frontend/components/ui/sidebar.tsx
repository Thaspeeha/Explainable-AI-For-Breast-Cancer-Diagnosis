"use client";

import { useState } from "react";
import { PatientCase } from "@/lib/mockData";
import { Slider } from "@/components/ui/slider";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";

interface SidebarProps {
  patientCases: PatientCase[];
  selectedPatient: PatientCase;
  setSelectedPatient: (p: PatientCase) => void;
  radius: number;
  setRadius: (v: number) => void;
  texture: number;
  setTexture: (v: number) => void;
  concavity: number;
  setConcavity: (v: number) => void;
  explanationMode: string;
  setExplanationMode: (v: string) => void;
}

export function Sidebar({
  patientCases,
  selectedPatient,
  setSelectedPatient,
  radius,
  setRadius,
  texture,
  setTexture,
  concavity,
  setConcavity,
  explanationMode,
  setExplanationMode,
}: SidebarProps) {
  const explanationOptions = ["Text Summary", "Bars + Text", "Feature Impact"];

  return (
    <aside className="w-1/4 bg-white p-4 border-r border-gray-200 flex flex-col gap-6">
      {/* Patient Selection */}
      
       <div>
  <h3 className="font-semibold mb-1">Patient Selection</h3>

  <Select
    value={selectedPatient.id}
    onValueChange={(val: string) => {
      const found = patientCases.find((p) => p.id === val);
      if (found) setSelectedPatient(found);
    }}
  >
    <SelectTrigger className="w-full">
      <SelectValue placeholder="Select patient" />
    </SelectTrigger>

    <SelectContent>
      {patientCases.map((p) => (
        <SelectItem key={p.id} value={p.id}>
          {p.name} ({p.risk})
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>


      {/* Feature Sliders */}
      <div className="space-y-4">
        <h3 className="font-semibold">Feature Sliders</h3>

        {/* Radius */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-600">
            <span>Radius</span>
            <span>{radius.toFixed(2)}</span>
          </div>
          <Slider
            min={6}
            max={30}
            value={[radius]}
            onValueChange={(val: number[]) => setRadius(val[0])}
          />
        </div>

        {/* Texture */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-600">
            <span>Texture</span>
            <span>{texture.toFixed(2)}</span>
          </div>
          <Slider
            min={9}
            max={40}
            value={[texture]}
            onValueChange={(val: number[]) => setTexture(val[0])}
          />
        </div>

        {/* Concavity */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-600">
            <span>Concavity</span>
            <span>{concavity.toFixed(2)}</span>
          </div>
          <Slider
            min={0}
            max={0.5}
            step={0.01}
            value={[concavity]}
            onValueChange={(val: number[]) => setConcavity(val[0])}
          />
        </div>
      </div>

      {/* Explanation Mode */}
      <div>
        <h3 className="font-semibold mb-1">Explanation Mode</h3>
        <RadioGroup
          value={explanationMode}
          onValueChange={(val: string) => setExplanationMode(val)}
        >
          <div className="flex flex-col gap-2">
            {explanationOptions.map((mode) => (
              <label
                key={mode}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <RadioGroupItem value={mode} />
                <span>{mode}</span>
              </label>
            ))}
          </div>
        </RadioGroup>
      </div>

      {/* Quick Reference Cards */}
      <div className="space-y-2">
        <h3 className="font-semibold mb-1">Normal Ranges</h3>
        <Card className="p-2">
          Radius: 6–14mm (benign), 11–28mm (malignant)
        </Card>
        <Card className="p-2">
          Texture: 9–21 (benign), 14–40 (malignant)
        </Card>
        <Card className="p-2">
          Concavity: 0–0.13 (benign), 0.07–0.43 (malignant)
        </Card>
      </div>
    </aside>
  );
}
