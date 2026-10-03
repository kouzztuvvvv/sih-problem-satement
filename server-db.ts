import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'arthroscan_database.json');

export interface StoredPatient {
  id: string;
  fullName: string;
  age: number;
  gender: string;
  state: string;
  district: string;
  village?: string;
  vocation?: string;
  abhaId?: string;
  phoneNumber?: string;
  primaryLanguage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoredDatabase {
  version: number;
  patients: StoredPatient[];
  screenings: any[];
  auditLogs: { id: string; timestamp: string; action: string; details?: string }[];
  lastModified: string;
}

const DEFAULT_SEED_DATA: StoredDatabase = {
  version: 1,
  lastModified: new Date().toISOString(),
  auditLogs: [
    {
      id: 'log_init',
      timestamp: new Date().toISOString(),
      action: 'DATABASE_INITIALIZED',
      details: 'ArthroScan NER persistent database ready with initial records.'
    }
  ],
  patients: [
    {
      id: 'pat_01',
      fullName: 'Bamonlang Kharbangar',
      age: 58,
      gender: 'Female',
      state: 'Meghalaya',
      district: 'East Khasi Hills (Shillong)',
      village: 'Mawkdok Village',
      vocation: 'Hillside Farming & Terrace Cultivation',
      abhaId: '91-4829-1049-5821',
      phoneNumber: '+91 98620 44102',
      primaryLanguage: 'kha',
      createdAt: '2026-09-26T14:32:00Z',
      updatedAt: '2026-09-26T14:32:00Z'
    },
    {
      id: 'pat_02',
      fullName: 'Nalini Saikia',
      age: 52,
      gender: 'Female',
      state: 'Assam',
      district: 'Jorhat',
      village: 'Titabor Tea Estate',
      vocation: 'Tea Garden Leaf Plucking & Carry',
      abhaId: '91-3810-9941-2094',
      phoneNumber: '+91 94350 88219',
      primaryLanguage: 'as',
      createdAt: '2026-09-27T09:15:00Z',
      updatedAt: '2026-09-27T09:15:00Z'
    },
    {
      id: 'pat_03',
      fullName: 'Temsutoshi Longkumer',
      age: 63,
      gender: 'Male',
      state: 'Nagaland',
      district: 'Mokokchung',
      village: 'Ungma Village',
      vocation: 'Terrace Cultivation & Wood Gathering',
      abhaId: '91-7712-4021-9983',
      phoneNumber: '+91 87941 12389',
      primaryLanguage: 'en',
      createdAt: '2026-09-27T11:40:00Z',
      updatedAt: '2026-09-27T11:40:00Z'
    }
  ],
  screenings: [
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
        village: 'Mawkdok Village',
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
        'Occupational Terrain & Chronic Knee Loading',
        'Documented Prior Joint Trauma',
        'Daily Headloading / Heavy Basket Transport',
        'Elevated Gait Asymmetry (14.2%)'
      ],
      clinicalRecommendations: [
        'Urgent Orthopaedic Evaluation at District Hospital / Medical College',
        'Weight-bearing AP/Lateral Knee Radiography',
        'Supervised Physical Therapy & Offloader Knee Brace consideration'
      ],
      referralCenter: 'NEIGRIHMS Shillong / Civil Hospital Shillong',
      ashaWorkerName: 'ASHA Ibanri Marbaniang',
      syncStatus: 'synced'
    },
    {
      id: 'scr_mock_01_prev1',
      referralId: 'NER-OA-ME-2026-0812',
      timestamp: '2026-05-20T10:15:00Z',
      patient: {
        fullName: 'Bamonlang Kharbangar',
        age: 58,
        gender: 'Female',
        state: 'Meghalaya',
        district: 'East Khasi Hills (Shillong)',
        village: 'Mawkdok Village',
        vocation: 'Hillside Farming & Terrace Cultivation',
        abhaId: '91-4829-1049-5821',
        primaryLanguage: 'kha'
      },
      kinetics: {
        chairStand: {
          completedReps: 10,
          avgFlexionAngle: 90,
          testDurationSeconds: 30,
          fatigueIndex: 35,
          completed: true
        },
        gait: {
          asymmetryIndex: 12.0,
          leftStanceDurationSec: 0.78,
          rightStanceDurationSec: 0.65,
          strideVariabilityPercent: 6.5,
          cadenceStepsPerMin: 92,
          completed: true
        },
        rom: {
          maxFlexionAngle: 110,
          extensionDeficitAngle: 8,
          jointCrepitusPresent: true,
          affectedKnee: 'Both',
          completed: true
        }
      },
      symptoms: {
        painSeverity: 7,
        morningStiffnessMin: 35,
        terrainDifficulty: 3,
        flatWalkDifficulty: 2,
        jointTraumaHistory: true,
        carryingHeavyLoadDaily: true,
        jointSwelling: true,
        weatherSensitivity: true
      },
      womacScore: 68,
      kineticDeficitScore: 62,
      compositeRiskScore: 68,
      riskLevel: 'HIGH',
      primaryFactors: ['Advanced Age', 'Gait Asymmetry', 'Steep Slopes'],
      clinicalRecommendations: ['Quadriceps strengthening', 'Load reduction'],
      referralCenter: 'Civil Hospital Shillong',
      ashaWorkerName: 'ASHA Ibanri Marbaniang',
      syncStatus: 'synced'
    }
  ]
};

// Ensure data directory exists
function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Read database from file
export function readDatabase(): StoredDatabase {
  ensureDataDirectory();
  try {
    if (!fs.existsSync(DB_FILE)) {
      writeDatabase(DEFAULT_SEED_DATA);
      return DEFAULT_SEED_DATA;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const data = JSON.parse(raw);
    return data;
  } catch (err) {
    console.error('Error reading database file, resetting to defaults:', err);
    writeDatabase(DEFAULT_SEED_DATA);
    return DEFAULT_SEED_DATA;
  }
}

// Write database atomically
export function writeDatabase(data: StoredDatabase): void {
  ensureDataDirectory();
  data.lastModified = new Date().toISOString();
  const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempFile, DB_FILE);
}

// Insert or update patient
export function savePatientRecord(patient: Partial<StoredPatient>): StoredPatient {
  const db = readDatabase();
  const now = new Date().toISOString();
  
  let existingIndex = -1;
  if (patient.id) {
    existingIndex = db.patients.findIndex(p => p.id === patient.id);
  } else if (patient.abhaId) {
    existingIndex = db.patients.findIndex(p => p.abhaId === patient.abhaId);
  } else if (patient.fullName && patient.state) {
    existingIndex = db.patients.findIndex(
      p => p.fullName.toLowerCase() === patient.fullName?.toLowerCase() && p.state === patient.state
    );
  }

  const patientId = patient.id || (existingIndex >= 0 ? db.patients[existingIndex].id : `pat_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`);

  const record: StoredPatient = {
    id: patientId,
    fullName: patient.fullName || 'Anonymous Patient',
    age: Number(patient.age) || 45,
    gender: patient.gender || 'Female',
    state: patient.state || 'Meghalaya',
    district: patient.district || '',
    village: patient.village || '',
    vocation: patient.vocation || '',
    abhaId: patient.abhaId || '',
    phoneNumber: patient.phoneNumber || '',
    primaryLanguage: patient.primaryLanguage || 'en',
    createdAt: existingIndex >= 0 ? db.patients[existingIndex].createdAt : now,
    updatedAt: now
  };

  if (existingIndex >= 0) {
    db.patients[existingIndex] = record;
  } else {
    db.patients.unshift(record);
  }

  db.auditLogs.unshift({
    id: `log_${Date.now()}`,
    timestamp: now,
    action: existingIndex >= 0 ? 'PATIENT_UPDATED' : 'PATIENT_CREATED',
    details: `Patient: ${record.fullName} (ID: ${record.id}, ${record.district}, ${record.state})`
  });

  writeDatabase(db);
  return record;
}

// Save a complete screening assessment
export function saveScreeningRecord(screening: any): any {
  const db = readDatabase();
  const now = new Date().toISOString();

  const screeningId = screening.id || `scr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const record = {
    ...screening,
    id: screeningId,
    timestamp: screening.timestamp || now,
    savedToDatabaseAt: now,
    syncStatus: 'synced'
  };

  const existingIndex = db.screenings.findIndex(s => s.id === screeningId);
  if (existingIndex >= 0) {
    db.screenings[existingIndex] = record;
  } else {
    db.screenings.unshift(record);
  }

  // Also auto-index/update patient in patients table
  if (screening.patient && screening.patient.fullName) {
    savePatientRecord(screening.patient);
  }

  db.auditLogs.unshift({
    id: `log_${Date.now()}`,
    timestamp: now,
    action: existingIndex >= 0 ? 'SCREENING_UPDATED' : 'SCREENING_CREATED',
    details: `Screening: ${record.id} for ${screening.patient?.fullName || 'Patient'} - Risk: ${record.riskLevel || 'N/A'}`
  });

  // Limit audit logs to last 200 entries
  if (db.auditLogs.length > 200) {
    db.auditLogs = db.auditLogs.slice(0, 200);
  }

  writeDatabase(db);
  return record;
}

// Delete a screening record
export function deleteScreeningRecord(id: string): boolean {
  const db = readDatabase();
  const initialLen = db.screenings.length;
  db.screenings = db.screenings.filter(s => s.id !== id);

  if (db.screenings.length !== initialLen) {
    db.auditLogs.unshift({
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'SCREENING_DELETED',
      details: `Screening ID: ${id} deleted.`
    });
    writeDatabase(db);
    return true;
  }
  return false;
}
