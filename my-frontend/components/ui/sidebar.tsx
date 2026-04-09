"use client";

import { PatientCase } from "@/lib/mockData";
import { useState } from "react";
import { Slider } from "./slider";

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
  const [openSections, setOpenSections] = useState<{
    patient: boolean;
    sliders: boolean;
    mode: boolean;
    ranges: boolean;
    model: boolean;
  }>({
    patient: true,
    sliders: true,
    mode: true,
    ranges: true,
    model: true,
  });

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const explanationOptions: { id: string; label: string; desc: string }[] = [
    {
      id: "Text Summary",
      label: "Text Summary",
      desc: "Plain‑language reasoning for this case",
    },
    {
      id: "Bars + Text",
      label: "Bars + Text",
      desc: "Top‑k feature bars plus explanation",
    },
    {
      id: "Feature Impact",
      label: "Feature Impact",
      desc: "Ranked list of influential features",
    },
  ];

  return (
    <aside className="w-80 bg-white border-r border-slate-200 flex flex-col shadow-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1A5F7A] to-[#193A5C] text-white px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/15 flex items-center justify-center text-xl">
            📊
          </div>
          <div>
            <div className="text-lg font-serif leading-tight">Breast Cancer Diagnosis</div>
            <div className="text-[11px] tracking-wide uppercase text-white/80">
              Clinical Decision Support v2.1
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 text-slate-800 text-sm">
        {/* Patient selection */}
        <section className="border-b border-slate-200 pb-3 rounded-lg px-2 py-2 transition-all duration-200 hover:bg-[#F4F9FB] hover:shadow-sm hover:scale-[1.01]">
          <button
            className="w-full flex items-center justify-between text-[13px] font-semibold tracking-wide text-slate-600 mb-3 text-left"
            onClick={() => toggleSection("patient")}
          >
            <span className="text-[#1A5F7A] text-base">👤</span>
            <span className="flex-1 uppercase">Patient selection</span>
            <span className="text-xs text-slate-400">
              {openSections.patient ? "▾" : "▸"}
            </span>
          </button>

          {openSections.patient && (
            <div className="space-y-1">
              <div className="text-[12px] font-semibold text-slate-500">
                SAMPLE CASE
              </div>
              <select
                className="w-full h-9 rounded-md border border-slate-200 bg-white px-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1A5F7A]/30"
                value={selectedPatient.id}
                onChange={(e) => {
                  const found = patientCases.find((p) => p.id === e.target.value);
                  if (found) {
                    setSelectedPatient(found);
                    setRadius(found.features.radius);
                    setTexture(found.features.texture);
                    setConcavity(found.features.concavity);
                  }
                }}
              >
                {patientCases.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.risk}
                  </option>
                ))}
              </select>
              {/* 🔥 Sliders moved HERE */}
      <div className="space-y-5">
        {/* Radius */}
        <div>
          <div className="text-[12px] font-semibold text-slate-500 mb-1">
            MEAN RADIUS (mm)
          </div>

          <Slider
            value={[radius]}
            min={6}
            max={30}
            step={0.1}
            onValueChange={(val) => setRadius(val[0])}
          />

          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>6mm</span>
            <span>30mm</span>
          </div>

          <div className="flex justify-center mt-2">
            <span className="px-3 py-1 rounded-lg bg-[#EAF4F8] text-[#1A5F7A] text-xs font-semibold">
              {radius.toFixed(1)} mm
            </span>
          </div>
        </div>

        {/* Texture */}
        <div>
          <div className="text-[12px] font-semibold text-slate-500 mb-1">
            TEXTURE SCORE
          </div>

          <Slider
            value={[texture]}
            min={9}
            max={40}
            step={0.1}
            onValueChange={(val) => setTexture(val[0])}
          />

          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>9</span>
            <span>40</span>
          </div>

          <div className="flex justify-center mt-2">
            <span className="px-3 py-1 rounded-lg bg-[#EAF4F8] text-[#1A5F7A] text-xs font-semibold">
              {texture.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Concavity */}
        <div>
          <div className="text-[12px] font-semibold text-slate-500 mb-1">
            CONCAVITY SCORE
          </div>

          <Slider
            value={[concavity]}
            min={0}
            max={0.5}
            step={0.01}
            onValueChange={(val) => setConcavity(val[0])}
          />

          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>0.00</span>
            <span>0.50</span>
          </div>

          <div className="flex justify-center mt-2">
            <span className="px-3 py-1 rounded-lg bg-[#EAF4F8] text-[#1A5F7A] text-xs font-semibold">
              {concavity.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
   
            </div>
            
          )}
        </section>

        

        {/* Explanation mode */}
        <section className="border-b border-slate-200 pb-3 rounded-lg px-2 py-2 transition-all duration-200 hover:bg-[#F4F9FB] hover:shadow-sm hover:scale-[1.01]">
          <button
            className="w-full flex items-center justify-between text-[13px] font-semibold tracking-wide text-slate-600 mb-2 text-left"
            onClick={() => toggleSection("mode")}
          >
            <span className="text-[#1A5F7A] text-base">🔍</span>
            <span className="flex-1 uppercase">Explanation mode</span>
            <span className="text-xs text-slate-400">
              {openSections.mode ? "▾" : "▸"}
            </span>
          </button>

          {openSections.mode && (
            <div className="flex flex-col gap-2">
              {explanationOptions.map((opt) => {
                const active = explanationMode === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setExplanationMode(opt.id)}
                    className={`text-left rounded-md border px-3 py-2 transition ${
                      active
                        ? "border-[#1A5F7A] bg-[#EAF4F8]"
                        : "border-slate-200 bg-white hover:border-[#1A5F7A]/60 hover:bg-[#EAF4F8]/60"
                    }`}
                  >
                    <div className="text-xs font-semibold text-slate-800">
                      {opt.label}
                    </div>
                    <div className="text-[13px] text-slate-500">{opt.desc}</div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Clinical ranges */}
        <section className="border-b border-slate-200 pb-3 rounded-lg px-2 py-2 transition-all duration-200 hover:bg-[#F4F9FB] hover:shadow-sm hover:scale-[1.01]">
          <button
            className="w-full flex items-center justify-between text-[13px] font-semibold tracking-wide text-slate-600 mb-2 text-left"
            onClick={() => toggleSection("ranges")}
          >
            <span className="text-[#1A5F7A] text-base">📎</span>
            <span className="flex-1 uppercase">Clinical ranges</span>
            <span className="text-xs text-slate-400">
              {openSections.ranges ? "▾" : "▸"}
            </span>
          </button>

          {openSections.ranges && (
            <div className="space-y-2 text-[12px]">
              <div className="rounded-md bg-slate-50 border border-slate-200 px-3 py-2">
                <div className="font-semibold text-[#1A5F7A]">RADIUS MEAN</div>
                <div className="text-slate-700">
                  6–14mm (benign) · 11–28mm (malignant)
                </div>
              </div>
              <div className="rounded-md bg-slate-50 border border-slate-200 px-3 py-2">
                <div className="font-semibold text-[#1A5F7A]">TEXTURE SCORE</div>
                <div className="text-slate-700">
                  9–21 (benign) · 14–40 (malignant)
                </div>
              </div>
              <div className="rounded-md bg-slate-50 border border-slate-200 px-3 py-2">
                <div className="font-semibold text-[#1A5F7A]">CONCATIVITY</div>
                <div className="text-slate-700">
                  0–0.13 (benign) · 0.07–0.43 (malignant)
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Model info */}
        <section className="border-b border-slate-200 pb-3 rounded-lg px-2 py-2 transition-all duration-200 hover:bg-[#F4F9FB] hover:shadow-sm hover:scale-[1.01]">
          <button
            className="w-full flex items-center justify-between text-[13px] font-semibold tracking-wide text-slate-600 mb-2 text-left"
            onClick={() => toggleSection("model")}
          >
            <span className="text-[#1A5F7A] text-base">📄</span>
            <span className="flex-1 uppercase">Model information</span>
            <span className="text-xs text-slate-400">
              {openSections.model ? "▾" : "▸"}
            </span>
          </button>

          {openSections.model && (
            <div className="rounded-md bg-slate-50 border border-slate-200 px-3 py-2 text-[11px] space-y-1 text-slate-700">
              <div>Dataset: Wisconsin Breast Cancer (569 samples, 30 features)</div>
              <div>Accuracy: 97.4% · Sensitivity: 97.1% · Specificity: 97.6%</div>
              <div>AUC‑ROC: 0.996 · Brier score: 0.024 · FNR: 2.9%</div>
              <div className="text-[10px] text-slate-500 pt-1">
                Last calibration: Mar 2026 · Decision support only; final diagnosis
                by clinician.
              </div>
            </div>
          )}
        </section>
      </div>
    </aside>
  );
}