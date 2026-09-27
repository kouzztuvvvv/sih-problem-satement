import {
  KineticAssessmentData,
  NERState,
  PatientDemographics,
  RiskLevel,
  ScreeningResult,
  SymptomAssessmentData
} from '../types';

export const NER_TERTIARY_CENTERS: Record<NERState, string> = {
  Assam: 'Gauhati Medical College & Hospital (GMCH) / Assam Medical College Dibrugarh',
  Meghalaya: 'NEIGRIHMS Shillong / Civil Hospital Shillong',
  Manipur: 'Regional Institute of Medical Sciences (RIMS) Imphal / JNIMS Porompat',
  Mizoram: 'Zoram Medical College (ZMC) Falkawn / Civil Hospital Aizawl',
  Nagaland: 'Naga Hospital Authority Kohima / Christian Institute of Health Sciences Dimapur',
  Tripura: 'Agartala Government Medical College (AGMC) & GBP Hospital',
  'Arunachal Pradesh': 'Tomo Riba Institute of Health & Medical Sciences (TRIHMS) Naharlagun',
  Sikkim: 'Sir Thutob Namgyal Memorial (STNM) Multi-Specialty Hospital Gangtok'
};

export function calculateWOMACScore(symptoms: SymptomAssessmentData): number {
  // WOMAC subscales normalized:
  // Pain (0-10 -> 0-40)
  const painComponent = (symptoms.painSeverity / 10) * 40;

  // Stiffness (<10m: 2, 10-30m: 8, 30-60m: 15, >60m: 20)
  let stiffnessComponent = 0;
  if (symptoms.morningStiffnessMin > 60) stiffnessComponent = 20;
  else if (symptoms.morningStiffnessMin > 30) stiffnessComponent = 15;
  else if (symptoms.morningStiffnessMin > 10) stiffnessComponent = 8;
  else stiffnessComponent = 2;

  // Physical Function: Terrain difficulty (0-4 -> 0-25) + flat walk (0-4 -> 0-15)
  const functionComponent = (symptoms.terrainDifficulty / 4) * 25 + (symptoms.flatWalkDifficulty / 4) * 15;

  const rawWomac = painComponent + stiffnessComponent + functionComponent;
  return Math.min(100, Math.round(rawWomac));
}

export function calculateKineticDeficitScore(kinetics: KineticAssessmentData): number {
  // 1. Chair Stand Deficit:
  // Normal is >=14 reps (0 deficit). <6 reps is max deficit (35 pts).
  let chairDeficit = 0;
  const reps = kinetics.chairStand.completedReps;
  if (reps >= 14) chairDeficit = 0;
  else if (reps >= 10) chairDeficit = 12;
  else if (reps >= 6) chairDeficit = 24;
  else chairDeficit = 35;

  // 2. Gait Asymmetry Deficit:
  // <5%: normal (0 pts), 5-10%: mild (10 pts), 10-18%: mod (25 pts), >18%: severe (35 pts)
  let gaitDeficit = 0;
  const asym = kinetics.gait.asymmetryIndex;
  if (asym <= 4) gaitDeficit = 2;
  else if (asym <= 8) gaitDeficit = 12;
  else if (asym <= 15) gaitDeficit = 24;
  else gaitDeficit = 35;

  // 3. ROM Deficit:
  // Normal flexion 135°. If flexion <100° or extension deficit >8° -> up to 30 pts
  let romDeficit = 0;
  const flex = kinetics.rom.maxFlexionAngle;
  const extDef = kinetics.rom.extensionDeficitAngle;
  if (flex < 95) romDeficit += 18;
  else if (flex < 115) romDeficit += 10;
  else if (flex < 125) romDeficit += 4;

  if (extDef > 8) romDeficit += 12;
  else if (extDef > 4) romDeficit += 6;

  if (kinetics.rom.jointCrepitusPresent) romDeficit += 5;

  const total = chairDeficit + gaitDeficit + romDeficit;
  return Math.min(100, Math.round(total));
}

export function computeCompositeScreening(
  patient: PatientDemographics,
  kinetics: KineticAssessmentData,
  symptoms: SymptomAssessmentData,
  ashaWorkerName: string = 'ANM Anjali Barman (Health Sub-Centre)'
): ScreeningResult {
  const womacScore = calculateWOMACScore(symptoms);
  const kineticDeficitScore = calculateKineticDeficitScore(kinetics);

  // Environmental and Demographic Risk Multiplier
  let riskFactorPoints = 0;
  const primaryFactors: string[] = [];

  // Age factor
  if (patient.age >= 60) {
    riskFactorPoints += 25;
    primaryFactors.push('Advanced Age (≥60 years)');
  } else if (patient.age >= 50) {
    riskFactorPoints += 15;
    primaryFactors.push('Age Factor (50-59 years)');
  }

  // Gender factor (postmenopausal women have higher OA prevalence)
  if (patient.gender === 'Female' && patient.age >= 45) {
    riskFactorPoints += 15;
    primaryFactors.push('High-risk Female demographic cohort');
  }

  // Vocation & Terrain factor
  if (
    patient.vocation.includes('Hillside Farming') ||
    patient.vocation.includes('Heavy Carrying') ||
    patient.vocation.includes('Tea Garden')
  ) {
    riskFactorPoints += 25;
    primaryFactors.push('Occupational Terrain & Chronic Knee Loading');
  }

  // Prior trauma / daily load
  if (symptoms.jointTraumaHistory) {
    riskFactorPoints += 20;
    primaryFactors.push('Documented Prior Joint Trauma / Fall');
  }
  if (symptoms.carryingHeavyLoadDaily) {
    riskFactorPoints += 15;
    primaryFactors.push('Daily Headloading / Heavy Basket Transport');
  }
  if (symptoms.morningStiffnessMin >= 30) {
    primaryFactors.push(`Prolonged Morning Stiffness (${symptoms.morningStiffnessMin} min)`);
  }
  if (kinetics.gait.asymmetryIndex > 8) {
    primaryFactors.push(`Elevated Gait Asymmetry (${kinetics.gait.asymmetryIndex.toFixed(1)}%)`);
  }

  // Weighted composite score (0-100)
  // WOMAC: 40%, Kinetic Deficit: 40%, Risk Multiplier: 20%
  const compositeRiskScore = Math.min(
    100,
    Math.max(
      5,
      Math.round(womacScore * 0.42 + kineticDeficitScore * 0.38 + (riskFactorPoints / 100) * 20)
    )
  );

  let riskLevel: RiskLevel = 'LOW';
  if (compositeRiskScore >= 66) {
    riskLevel = 'HIGH';
  } else if (compositeRiskScore >= 36) {
    riskLevel = 'MODERATE';
  } else {
    riskLevel = 'LOW';
  }

  // Clinical Recommendations
  const clinicalRecommendations: string[] = [];
  if (riskLevel === 'HIGH') {
    clinicalRecommendations.push('Urgent Orthopaedic Evaluation at District Hospital / Medical College');
    clinicalRecommendations.push('Weight-bearing AP/Lateral Knee Radiography (X-Ray Kellgren-Lawrence staging)');
    clinicalRecommendations.push('Supervised Physical Therapy & Offloader Knee Brace consideration');
    clinicalRecommendations.push('Immediate reduction in downhill load-carrying & Namlo headloading');
    clinicalRecommendations.push('Tele-consultation queued with Regional Orthopaedic Specialist');
  } else if (riskLevel === 'MODERATE') {
    clinicalRecommendations.push('Initiate daily Quadriceps and Hamstring isometric strengthening routine');
    clinicalRecommendations.push('Adopt switchback zig-zag descent techniques when navigating hilly slopes');
    clinicalRecommendations.push('Use padded bilateral trekking poles / bamboo walking stick for weight redistribution');
    clinicalRecommendations.push('Incorporate local calcium & fermented fish / sesame dietary sources');
    clinicalRecommendations.push('Follow-up screening by ASHA worker in 3 months');
  } else {
    clinicalRecommendations.push('Maintain joint-preserving daily activities and active hill walking habits');
    clinicalRecommendations.push('Preventive ergonomic training on load distribution (distribute basket weight evenly)');
    clinicalRecommendations.push('Routine annual community knee health checkup');
  }

  // Generate unique referral identifier
  const stateCode = patient.state.slice(0, 2).toUpperCase();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const referralId = `NER-OA-${stateCode}-${new Date().getFullYear()}-${randomNum}`;

  return {
    id: 'scr_' + Math.random().toString(36).substring(2, 9),
    referralId,
    timestamp: new Date().toISOString(),
    patient,
    kinetics,
    symptoms,
    womacScore,
    kineticDeficitScore,
    compositeRiskScore,
    riskLevel,
    primaryFactors: primaryFactors.length ? primaryFactors : ['Baseline age-related joint health check'],
    clinicalRecommendations,
    referralCenter: NER_TERTIARY_CENTERS[patient.state],
    ashaWorkerName,
    syncStatus: 'pending'
  };
}
