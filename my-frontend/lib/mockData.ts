// lib/mockData.ts
export interface PatientCase {
  id: string;
  name: string;
  risk: string;
  features: { radius: number; texture: number; concavity: number, meanPerimeter: number, meanConcavePoints: number, worstRadius: number, worstPerimeter: number, worstArea: number, worstConcavePoints: number, worstConcavity: number };
}

export const mockPatientCases: PatientCase[] = [
  { id: "001", name: "High Risk", risk: "87.3% malignant", features: { radius: 28, texture: 35, concavity: 0.43, meanPerimeter: 180, meanConcavePoints: 0.25, worstRadius: 29, worstPerimeter: 200, worstArea: 1500, worstConcavePoints: 0.48, worstConcavity: 0.48 } },
  { id: "002", name: "Borderline", risk: "62.1% malignant", features: { radius: 21, texture: 28, concavity: 0.25, meanPerimeter: 150, meanConcavePoints: 0.15, worstRadius: 22, worstPerimeter: 160, worstArea: 1200, worstConcavePoints: 0.35, worstConcavity: 0.35 } },
  { id: "003", name: "Low Risk", risk: "94.8% benign", features: { radius: 12, texture: 15, concavity: 0.05, meanPerimeter: 120, meanConcavePoints: 0.1, worstRadius: 13, worstPerimeter: 140, worstArea: 1000, worstConcavePoints: 0.2, worstConcavity: 0.2 } },
  { id: "004", name: "Very High Risk", risk: "96.2% malignant", features: { radius: 29, texture: 38, concavity: 0.48, meanPerimeter: 190, meanConcavePoints: 0.35, worstRadius: 30, worstPerimeter: 210, worstArea: 1600, worstConcavePoints: 0.55, worstConcavity: 0.55 } },
  { id: "005", name: "Likely Benign", risk: "78.4% benign", features: { radius: 14, texture: 20, concavity: 0.1, meanPerimeter: 130, meanConcavePoints: 0.15, worstRadius: 15, worstPerimeter: 150, worstArea: 1100, worstConcavePoints: 0.25, worstConcavity: 0.25 } },
];