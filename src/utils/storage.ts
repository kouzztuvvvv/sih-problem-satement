import { NERState, ScreeningResult } from '../types';

const STORAGE_KEY = 'arthroscan_ner_screenings_v1';
const OFFLINE_OVERRIDE_KEY = 'arthroscan_offline_mode_active';

const INITIAL_MOCK_RECORDS: ScreeningResult[] = [
  {
    id: 'scr_mock_01',
    referralId: 'NER-OA-ME-2026-1049',
    timestamp: '2026-09-26T14:32:00Z',
    patient: {
      fullName: 'Bamonlang Kharbangar',
      age: 58,
      gender: 'Female',
      state: 'Meghalaya',
      district: 'East Khasi Hills (Shillong)',
      village: 'Mawkdok',
      vocation: 'Hillside Farming & Terrace Cultivation',
      abhaId: '91-4829-1049-5821',
      primaryLanguage: 'kha'
    },
    kinetics: {
      chairStand: {
        completedReps: 8,
        avgFlexionAngle: 86,
        testDurationSeconds: 30,
        fatigueIndex: 42,
        completed: true
      },
      gait: {
        asymmetryIndex: 14.2,
        leftStanceDurationSec: 0.82,
        rightStanceDurationSec: 0.61,
        strideVariabilityPercent: 7.8,
        cadenceStepsPerMin: 88,
        completed: true
      },
      rom: {
        maxFlexionAngle: 104,
        extensionDeficitAngle: 11,
        jointCrepitusPresent: true,
        affectedKnee: 'Both',
        completed: true
      }
    },
    symptoms: {
      painSeverity: 8,
      morningStiffnessMin: 45,
      terrainDifficulty: 4,
      flatWalkDifficulty: 3,
      jointTraumaHistory: true,
      carryingHeavyLoadDaily: true,
      jointSwelling: true,
      weatherSensitivity: true
    },
    womacScore: 78,
    kineticDeficitScore: 74,
    compositeRiskScore: 79,
    riskLevel: 'HIGH',
    primaryFactors: [
      'Advanced Age (≥50 years)',
      'High-risk Female demographic cohort',
      'Occupational Terrain & Chronic Knee Loading',
      'Documented Prior Joint Trauma / Fall',
      'Daily Headloading / Heavy Basket Transport',
      'Elevated Gait Asymmetry (14.2%)'
    ],
    clinicalRecommendations: [
      'Urgent Orthopaedic Evaluation at District Hospital / Medical College',
      'Weight-bearing AP/Lateral Knee Radiography',
      'Supervised Physical Therapy & Offloader Knee Brace consideration',
      'Immediate reduction in downhill load-carrying & Namlo headloading'
    ],
    referralCenter: 'NEIGRIHMS Shillong / Civil Hospital Shillong',
    ashaWorkerName: 'ASHA Ibanri Marbaniang',
    syncStatus: 'synced'
  },
  {
    id: 'scr_mock_02',
    referralId: 'NER-OA-AS-2026-2914',
    timestamp: '2026-09-25T11:15:00Z',
    patient: {
      fullName: 'Hiren Borgohain',
      age: 49,
      gender: 'Male',
      state: 'Assam',
      district: 'Dibrugarh',
      village: 'Barbaruah Tea Estate',
      vocation: 'Tea Garden Labor & Leaf Plucking',
      abhaId: '91-3091-8842-1940',
      primaryLanguage: 'as'
    },
    kinetics: {
      chairStand: {
        completedReps: 11,
        avgFlexionAngle: 94,
        testDurationSeconds: 30,
        fatigueIndex: 25,
        completed: true
      },
      gait: {
        asymmetryIndex: 7.8,
        leftStanceDurationSec: 0.71,
        rightStanceDurationSec: 0.64,
        strideVariabilityPercent: 4.6,
        cadenceStepsPerMin: 102,
        completed: true
      },
      rom: {
        maxFlexionAngle: 118,
        extensionDeficitAngle: 5,
        jointCrepitusPresent: true,
        affectedKnee: 'Right',
        completed: true
      }
    },
    symptoms: {
      painSeverity: 5,
      morningStiffnessMin: 20,
      terrainDifficulty: 2,
      flatWalkDifficulty: 2,
      jointTraumaHistory: false,
      carryingHeavyLoadDaily: true,
      jointSwelling: false,
      weatherSensitivity: true
    },
    womacScore: 48,
    kineticDeficitScore: 46,
    compositeRiskScore: 51,
    riskLevel: 'MODERATE',
    primaryFactors: [
      'Occupational Terrain & Chronic Knee Loading',
      'Daily Headloading / Heavy Basket Transport',
      'Moderate Gait Asymmetry (7.8%)'
    ],
    clinicalRecommendations: [
      'Initiate daily Quadriceps and Hamstring isometric strengthening routine',
      'Adopt switchback zig-zag descent techniques when navigating hilly slopes',
      'Use padded bilateral trekking poles / bamboo walking stick for weight redistribution',
      'Follow-up screening by ASHA worker in 3 months'
    ],
    referralCenter: 'Gauhati Medical College & Hospital (GMCH) / Assam Medical College Dibrugarh',
    ashaWorkerName: 'ANM Rita Saikia',
    syncStatus: 'synced'
  },
  {
    id: 'scr_mock_03',
    referralId: 'NER-OA-MZ-2026-6731',
    timestamp: '2026-09-24T09:45:00Z',
    patient: {
      fullName: 'Lalrinmawii Sailo',
      age: 62,
      gender: 'Female',
      state: 'Mizoram',
      district: 'Aizawl',
      village: 'Durtlang',
      vocation: 'Traditional Weaving & Household Work',
      abhaId: '91-7712-4019-9943',
      primaryLanguage: 'miz'
    },
    kinetics: {
      chairStand: {
        completedReps: 7,
        avgFlexionAngle: 82,
        testDurationSeconds: 30,
        fatigueIndex: 55,
        completed: true
      },
      gait: {
        asymmetryIndex: 12.8,
        leftStanceDurationSec: 0.85,
        rightStanceDurationSec: 0.65,
        strideVariabilityPercent: 8.2,
        cadenceStepsPerMin: 84,
        completed: true
      },
      rom: {
        maxFlexionAngle: 98,
        extensionDeficitAngle: 12,
        jointCrepitusPresent: true,
        affectedKnee: 'Both',
        completed: true
      }
    },
    symptoms: {
      painSeverity: 7,
      morningStiffnessMin: 50,
      terrainDifficulty: 4,
      flatWalkDifficulty: 3,
      jointTraumaHistory: false,
      carryingHeavyLoadDaily: false,
      jointSwelling: true,
      weatherSensitivity: true
    },
    womacScore: 72,
    kineticDeficitScore: 76,
    compositeRiskScore: 76,
    riskLevel: 'HIGH',
    primaryFactors: [
      'Advanced Age (≥60 years)',
      'High-risk Female demographic cohort',
      'Severe Flexion Deficit (98° vs 135°)',
      'Prolonged Morning Stiffness (50 min)'
    ],
    clinicalRecommendations: [
      'Urgent Orthopaedic Evaluation at District Hospital / Medical College',
      'Weight-bearing AP/Lateral Knee Radiography',
      'Supervised Physical Therapy & Offloader Knee Brace consideration',
      'Tele-consultation queued with Regional Orthopaedic Specialist'
    ],
    referralCenter: 'Zoram Medical College (ZMC) Falkawn / Civil Hospital Aizawl',
    ashaWorkerName: 'ASHA Vanlalruati',
    syncStatus: 'synced'
  },
  {
    id: 'scr_mock_04',
    referralId: 'NER-OA-NG-2026-8812',
    timestamp: '2026-09-23T16:20:00Z',
    patient: {
      fullName: 'Keviletuo Angami',
      age: 38,
      gender: 'Male',
      state: 'Nagaland',
      district: 'Kohima',
      village: 'Khonoma',
      vocation: 'Hillside Farming & Terrace Cultivation',
      abhaId: '91-5520-9183-4412',
      primaryLanguage: 'nag'
    },
    kinetics: {
      chairStand: {
        completedReps: 16,
        avgFlexionAngle: 108,
        testDurationSeconds: 30,
        fatigueIndex: 12,
        completed: true
      },
      gait: {
        asymmetryIndex: 3.2,
        leftStanceDurationSec: 0.65,
        rightStanceDurationSec: 0.63,
        strideVariabilityPercent: 2.8,
        cadenceStepsPerMin: 114,
        completed: true
      },
      rom: {
        maxFlexionAngle: 132,
        extensionDeficitAngle: 1,
        jointCrepitusPresent: false,
        affectedKnee: 'Both',
        completed: true
      }
    },
    symptoms: {
      painSeverity: 2,
      morningStiffnessMin: 5,
      terrainDifficulty: 1,
      flatWalkDifficulty: 0,
      jointTraumaHistory: false,
      carryingHeavyLoadDaily: true,
      jointSwelling: false,
      weatherSensitivity: false
    },
    womacScore: 16,
    kineticDeficitScore: 12,
    compositeRiskScore: 22,
    riskLevel: 'LOW',
    primaryFactors: ['Baseline occupational monitoring (Heavy Carrying)'],
    clinicalRecommendations: [
      'Maintain joint-preserving daily activities and active hill walking habits',
      'Preventive ergonomic training on load distribution (distribute basket weight evenly)',
      'Routine annual community knee health checkup'
    ],
    referralCenter: 'Naga Hospital Authority Kohima / CIHSR Dimapur',
    ashaWorkerName: 'ANM Neiphrezo',
    syncStatus: 'synced'
  },
  {
    id: 'scr_mock_05',
    referralId: 'NER-OA-MN-2026-5120',
    timestamp: '2026-09-22T10:05:00Z',
    patient: {
      fullName: 'Thoibi Devi Leishangthem',
      age: 54,
      gender: 'Female',
      state: 'Manipur',
      district: 'Imphal East',
      village: 'Porompat',
      vocation: 'Traditional Weaving & Household Work',
      abhaId: '91-6644-3209-1244',
      primaryLanguage: 'en'
    },
    kinetics: {
      chairStand: {
        completedReps: 10,
        avgFlexionAngle: 90,
        testDurationSeconds: 30,
        fatigueIndex: 32,
        completed: true
      },
      gait: {
        asymmetryIndex: 9.1,
        leftStanceDurationSec: 0.78,
        rightStanceDurationSec: 0.68,
        strideVariabilityPercent: 5.5,
        cadenceStepsPerMin: 96,
        completed: true
      },
      rom: {
        maxFlexionAngle: 114,
        extensionDeficitAngle: 6,
        jointCrepitusPresent: true,
        affectedKnee: 'Left',
        completed: true
      }
    },
    symptoms: {
      painSeverity: 6,
      morningStiffnessMin: 25,
      terrainDifficulty: 3,
      flatWalkDifficulty: 2,
      jointTraumaHistory: false,
      carryingHeavyLoadDaily: false,
      jointSwelling: true,
      weatherSensitivity: true
    },
    womacScore: 56,
    kineticDeficitScore: 48,
    compositeRiskScore: 54,
    riskLevel: 'MODERATE',
    primaryFactors: [
      'Age Factor (50-59 years)',
      'High-risk Female demographic cohort',
      'Elevated Gait Asymmetry (9.1%)'
    ],
    clinicalRecommendations: [
      'Initiate daily Quadriceps and Hamstring isometric strengthening routine',
      'Adopt switchback zig-zag descent techniques when navigating hilly slopes',
      'Use padded bilateral trekking poles / bamboo walking stick',
      'Follow-up screening by ASHA worker in 3 months'
    ],
    referralCenter: 'Regional Institute of Medical Sciences (RIMS) Imphal / JNIMS Porompat',
    ashaWorkerName: 'ASHA Sanatombi',
    syncStatus: 'synced'
  },
  {
    id: 'scr_mock_06',
    referralId: 'NER-OA-AR-2026-3390',
    timestamp: '2026-09-21T13:40:00Z',
    patient: {
      fullName: 'Tashi Norbu',
      age: 66,
      gender: 'Male',
      state: 'Arunachal Pradesh',
      district: 'Tawang',
      village: 'Lhou',
      vocation: 'Hillside Farming & Terrace Cultivation',
      abhaId: '91-8891-2310-7711',
      primaryLanguage: 'en'
    },
    kinetics: {
      chairStand: {
        completedReps: 6,
        avgFlexionAngle: 80,
        testDurationSeconds: 30,
        fatigueIndex: 60,
        completed: true
      },
      gait: {
        asymmetryIndex: 16.4,
        leftStanceDurationSec: 0.92,
        rightStanceDurationSec: 0.60,
        strideVariabilityPercent: 9.4,
        cadenceStepsPerMin: 78,
        completed: true
      },
      rom: {
        maxFlexionAngle: 94,
        extensionDeficitAngle: 14,
        jointCrepitusPresent: true,
        affectedKnee: 'Both',
        completed: true
      }
    },
    symptoms: {
      painSeverity: 9,
      morningStiffnessMin: 60,
      terrainDifficulty: 4,
      flatWalkDifficulty: 4,
      jointTraumaHistory: true,
      carryingHeavyLoadDaily: true,
      jointSwelling: true,
      weatherSensitivity: true
    },
    womacScore: 88,
    kineticDeficitScore: 82,
    compositeRiskScore: 89,
    riskLevel: 'HIGH',
    primaryFactors: [
      'Advanced Age (≥60 years)',
      'Occupational Terrain & Chronic Knee Loading',
      'Severe Antalgic Gait Asymmetry (16.4%)',
      'Documented Prior Joint Trauma / Fall',
      'Prolonged Morning Stiffness (60 min)'
    ],
    clinicalRecommendations: [
      'Urgent Orthopaedic Evaluation at District Hospital / Medical College',
      'Weight-bearing AP/Lateral Knee Radiography',
      'Supervised Physical Therapy & Offloader Knee Brace consideration',
      'Immediate reduction in downhill load-carrying & Namlo headloading'
    ],
    referralCenter: 'Tomo Riba Institute of Health & Medical Sciences (TRIHMS) Naharlagun',
    ashaWorkerName: 'ANM Dawa',
    syncStatus: 'synced'
  },
  {
    id: 'scr_mock_07',
    referralId: 'NER-OA-SK-2026-7740',
    timestamp: '2026-09-20T15:10:00Z',
    patient: {
      fullName: 'Pema Bhutia',
      age: 44,
      gender: 'Female',
      state: 'Sikkim',
      district: 'East Sikkim (Gangtok)',
      village: 'Rumtek',
      vocation: 'Hillside Farming & Terrace Cultivation',
      abhaId: '91-4412-8812-9011',
      primaryLanguage: 'en'
    },
    kinetics: {
      chairStand: {
        completedReps: 13,
        avgFlexionAngle: 102,
        testDurationSeconds: 30,
        fatigueIndex: 18,
        completed: true
      },
      gait: {
        asymmetryIndex: 4.8,
        leftStanceDurationSec: 0.68,
        rightStanceDurationSec: 0.65,
        strideVariabilityPercent: 3.5,
        cadenceStepsPerMin: 108,
        completed: true
      },
      rom: {
        maxFlexionAngle: 126,
        extensionDeficitAngle: 2,
        jointCrepitusPresent: false,
        affectedKnee: 'Right',
        completed: true
      }
    },
    symptoms: {
      painSeverity: 3,
      morningStiffnessMin: 10,
      terrainDifficulty: 2,
      flatWalkDifficulty: 1,
      jointTraumaHistory: false,
      carryingHeavyLoadDaily: true,
      jointSwelling: false,
      weatherSensitivity: true
    },
    womacScore: 28,
    kineticDeficitScore: 24,
    compositeRiskScore: 32,
    riskLevel: 'LOW',
    primaryFactors: ['Mild terrain discomfort with daily farming activity'],
    clinicalRecommendations: [
      'Maintain joint-preserving daily activities and active hill walking habits',
      'Preventive ergonomic training on load distribution',
      'Routine annual community knee health checkup'
    ],
    referralCenter: 'Sir Thutob Namgyal Memorial (STNM) Hospital Gangtok',
    ashaWorkerName: 'ASHA Sonam',
    syncStatus: 'synced'
  },
  {
    id: 'scr_mock_08',
    referralId: 'NER-OA-TR-2026-9210',
    timestamp: '2026-09-19T11:50:00Z',
    patient: {
      fullName: 'Subrata Debbarma',
      age: 52,
      gender: 'Male',
      state: 'Tripura',
      district: 'West Tripura (Agartala)',
      village: 'Mandwi',
      vocation: 'Construction & Manual Porterage',
      abhaId: '91-1120-7734-5510',
      primaryLanguage: 'bn'
    },
    kinetics: {
      chairStand: {
        completedReps: 9,
        avgFlexionAngle: 88,
        testDurationSeconds: 30,
        fatigueIndex: 38,
        completed: true
      },
      gait: {
        asymmetryIndex: 8.5,
        leftStanceDurationSec: 0.76,
        rightStanceDurationSec: 0.68,
        strideVariabilityPercent: 5.2,
        cadenceStepsPerMin: 94,
        completed: true
      },
      rom: {
        maxFlexionAngle: 112,
        extensionDeficitAngle: 7,
        jointCrepitusPresent: true,
        affectedKnee: 'Both',
        completed: true
      }
    },
    symptoms: {
      painSeverity: 6,
      morningStiffnessMin: 30,
      terrainDifficulty: 3,
      flatWalkDifficulty: 2,
      jointTraumaHistory: true,
      carryingHeavyLoadDaily: true,
      jointSwelling: false,
      weatherSensitivity: false
    },
    womacScore: 58,
    kineticDeficitScore: 52,
    compositeRiskScore: 58,
    riskLevel: 'MODERATE',
    primaryFactors: [
      'Age Factor (50-59 years)',
      'Occupational Heavy Load Carrying',
      'Documented Prior Joint Trauma / Fall'
    ],
    clinicalRecommendations: [
      'Initiate daily Quadriceps and Hamstring isometric strengthening routine',
      'Adopt switchback zig-zag descent techniques when navigating hilly slopes',
      'Use padded bilateral trekking poles / bamboo walking stick',
      'Follow-up screening by ASHA worker in 3 months'
    ],
    referralCenter: 'Agartala Government Medical College (AGMC) & GBP Hospital',
    ashaWorkerName: 'ASHA Ananya',
    syncStatus: 'synced'
  }
];

export function getStoredScreenings(): ScreeningResult[] {
  if (typeof window === 'undefined') return INITIAL_MOCK_RECORDS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_RECORDS));
      return INITIAL_MOCK_RECORDS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_MOCK_RECORDS;
  } catch {
    return INITIAL_MOCK_RECORDS;
  }
}

export function saveScreening(record: ScreeningResult, forceOffline = false): ScreeningResult {
  const isOffline = forceOffline || getOfflineSimulatedStatus();
  const recordToSave: ScreeningResult = {
    ...record,
    syncStatus: isOffline ? 'pending' : 'synced'
  };

  const list = getStoredScreenings();
  const updated = [recordToSave, ...list];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Storage error', err);
  }
  return recordToSave;
}

export function syncPendingScreenings(): { count: number; updated: ScreeningResult[] } {
  const list = getStoredScreenings();
  let count = 0;
  const updated = list.map(item => {
    if (item.syncStatus === 'pending') {
      count++;
      return { ...item, syncStatus: 'synced' as const };
    }
    return item;
  });

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Storage error', err);
  }

  return { count, updated };
}

export function resetDemoScreenings(): ScreeningResult[] {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_RECORDS));
  } catch (err) {
    console.error('Storage error', err);
  }
  return INITIAL_MOCK_RECORDS;
}

export function getOfflineSimulatedStatus(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(OFFLINE_OVERRIDE_KEY) === 'true';
}

export function setOfflineSimulatedStatus(isOffline: boolean) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(OFFLINE_OVERRIDE_KEY, isOffline ? 'true' : 'false');
}

export function exportScreeningsAsJSON(): string {
  const list = getStoredScreenings();
  return JSON.stringify(list, null, 2);
}

export function exportScreeningsAsCSV(): string {
  const list = getStoredScreenings();
  const headers = [
    'Referral ID',
    'Date',
    'Patient Name',
    'Age',
    'Gender',
    'State',
    'District',
    'Vocation',
    'ABHA ID',
    'Risk Level',
    'Risk Score',
    'WOMAC Score',
    'Kinetic Deficit',
    'Sync Status'
  ];

  const rows = list.map(item => [
    `"${item.referralId}"`,
    `"${new Date(item.timestamp).toLocaleDateString()}"`,
    `"${item.patient.fullName}"`,
    item.patient.age,
    `"${item.patient.gender}"`,
    `"${item.patient.state}"`,
    `"${item.patient.district}"`,
    `"${item.patient.vocation}"`,
    `"${item.patient.abhaId || 'N/A'}"`,
    `"${item.riskLevel}"`,
    item.compositeRiskScore,
    item.womacScore,
    item.kineticDeficitScore,
    `"${item.syncStatus}"`
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}
