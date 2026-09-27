export type LanguageCode =
  | 'en'
  | 'as' // Assamese
  | 'hi' // Hindi
  | 'kha' // Khasi
  | 'gar' // Garo
  | 'miz' // Mizo
  | 'nag' // Nagamese
  | 'bn' // Bengali
  | 'brx'; // Bodo

export type NERState =
  | 'Assam'
  | 'Meghalaya'
  | 'Manipur'
  | 'Mizoram'
  | 'Nagaland'
  | 'Tripura'
  | 'Arunachal Pradesh'
  | 'Sikkim';

export const NER_STATES_AND_DISTRICTS: Record<NERState, string[]> = {
  Assam: ['Kamrup Metro (Guwahati)', 'Dibrugarh', 'Jorhat', 'Cachar (Silchar)', 'Sonitpur (Tezpur)', 'Nagaon', 'Karbi Anglong'],
  Meghalaya: ['East Khasi Hills (Shillong)', 'West Garo Hills (Tura)', 'Ri-Bhoi (Nongpoh)', 'West Jaintia Hills (Jowai)', 'South West Garo Hills'],
  Manipur: ['Imphal West', 'Imphal East', 'Churachandpur', 'Senapati', 'Ukhrul', 'Thoubal'],
  Mizoram: ['Aizawl', 'Lunglei', 'Champhai', 'Kolasib', 'Serchhip', 'Mamit'],
  Nagaland: ['Kohima', 'Dimapur', 'Mokokchung', 'Wokha', 'Mon', 'Phek'],
  Tripura: ['West Tripura (Agartala)', 'Gomati (Udaipur)', 'North Tripura (Dharmanagar)', 'Dhalai (Ambassa)', 'South Tripura'],
  'Arunachal Pradesh': ['Papum Pare (Itanagar)', 'Tawang', 'West Kameng (Bomdila)', 'East Siang (Pasighat)', 'Changlang'],
  Sikkim: ['East Sikkim (Gangtok)', 'West Sikkim (Geyzing)', 'South Sikkim (Namchi)', 'North Sikkim (Mangan)']
};

export const NER_VOCATIONS = [
  'Hillside Farming & Terrace Cultivation',
  'Heavy Carrying / Headloading (Namlo/Basket)',
  'Tea Garden Labor & Leaf Plucking',
  'Traditional Weaving & Household Work',
  'Forest Foraging & Mountain Trekking',
  'Construction & Manual Porterage',
  'Desk / Sedentary Service',
  'Retired / Homebound'
];

export interface PatientDemographics {
  fullName: string;
  age: number;
  gender: 'Female' | 'Male' | 'Other';
  state: NERState;
  district: string;
  village: string;
  vocation: string;
  abhaId?: string;
  phoneNumber?: string;
  primaryLanguage: LanguageCode;
}

export interface ChairStandMetrics {
  completedReps: number;
  avgFlexionAngle: number; // degrees (typical 80-110°)
  testDurationSeconds: number;
  fatigueIndex: number; // 0-100%
  completed: boolean;
}

export interface GaitMetrics {
  asymmetryIndex: number; // percentage (normal < 5%, moderate 6-12%, severe >12%)
  leftStanceDurationSec: number;
  rightStanceDurationSec: number;
  strideVariabilityPercent: number; // normal < 4%
  cadenceStepsPerMin: number;
  completed: boolean;
}

export interface ROMMetrics {
  maxFlexionAngle: number; // normal ~135°, OA often 90-110°
  extensionDeficitAngle: number; // normal 0°, OA often 5-15°
  jointCrepitusPresent: boolean;
  affectedKnee: 'Both' | 'Left' | 'Right';
  completed: boolean;
}

export interface KineticAssessmentData {
  chairStand: ChairStandMetrics;
  gait: GaitMetrics;
  rom: ROMMetrics;
}

export interface SymptomAssessmentData {
  painSeverity: number; // 0 to 10
  morningStiffnessMin: number; // 0 to 90
  terrainDifficulty: number; // 0 = None, 1 = Mild, 2 = Moderate, 3 = Severe, 4 = Extreme
  flatWalkDifficulty: number; // 0 to 4
  jointTraumaHistory: boolean;
  carryingHeavyLoadDaily: boolean;
  jointSwelling: boolean;
  weatherSensitivity: boolean; // common in NER winter / damp monsoon
}

export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH';

export interface ScreeningResult {
  id: string;
  referralId: string;
  timestamp: string;
  patient: PatientDemographics;
  kinetics: KineticAssessmentData;
  symptoms: SymptomAssessmentData;
  womacScore: number; // 0 to 100
  kineticDeficitScore: number; // 0 to 100
  compositeRiskScore: number; // 0 to 100
  riskLevel: RiskLevel;
  primaryFactors: string[];
  clinicalRecommendations: string[];
  referralCenter?: string;
  ashaWorkerName: string;
  syncStatus: 'synced' | 'pending';
}

export type ActiveRole = 'field_worker' | 'medical_officer';
