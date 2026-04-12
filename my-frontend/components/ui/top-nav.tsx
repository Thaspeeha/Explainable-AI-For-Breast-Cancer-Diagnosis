"use client";

import { useState } from "react";

export type TabType = "prediction" | "features" | "confidence";

interface Props {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export default function TopNav({ activeTab, onTabChange }: Props) {
  const tabs = [
    { key: "prediction", label: "Prediction Dashboard", icon: "🎯" },
    { key: "features", label: "Feature Importance", icon: "📊" },
    { key: "confidence", label: "Model Confidence", icon: "🎲" },
  ];

  return (
    <div className="w-full bg-white border-b shadow-sm">
      {/* 🔝 HEADER */}
      <div className="flex items-center justify-between px-6 py-3 bg-gray-100">
        <h1 className="text-lg font-semibold text-gray-800">
          Breast Cancer Diagnostic Assistant
        </h1>

        <div className="flex items-center gap-4">
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
          <button className="bg-teal-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-teal-800 transition">
            📄 Export Report
          </button>
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

            {/* ACTIVE UNDERLINE */}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-700"></span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}