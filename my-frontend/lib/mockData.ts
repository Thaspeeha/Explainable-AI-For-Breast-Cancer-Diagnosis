// lib/mockData.ts
export interface PatientCase {
  id: string;
  name: string;
  risk: string;
  features: { radius: number; texture: number; concavity: number };
}

export const mockPatientCases: PatientCase[] = [
  { id: "001", name: "High Risk", risk: "87.3% malignant", features: { radius: 28, texture: 35, concavity: 0.43 } },
  { id: "002", name: "Borderline", risk: "62.1% malignant", features: { radius: 21, texture: 28, concavity: 0.25 } },
  { id: "003", name: "Low Risk", risk: "94.8% benign", features: { radius: 12, texture: 15, concavity: 0.05 } },
  { id: "004", name: "Very High Risk", risk: "96.2% malignant", features: { radius: 29, texture: 38, concavity: 0.48 } },
  { id: "005", name: "Likely Benign", risk: "78.4% benign", features: { radius: 14, texture: 20, concavity: 0.1 } },
];