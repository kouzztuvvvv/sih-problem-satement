import { PatientDemographics, ScreeningResult } from '../types';

export interface DatabasePatient {
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

export interface DatabaseStats {
  totalScreenings: number;
  totalPatients: number;
  highRiskCount: number;
  lastModified: string;
  auditLogsCount: number;
}

// Fetch all screenings from server database
export async function fetchDatabaseScreenings(): Promise<ScreeningResult[]> {
  try {
    const res = await fetch('/api/database/screenings');
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.screenings || [];
  } catch (err) {
    console.warn('Failed to fetch from server database, fallback to local:', err);
    return [];
  }
}

// Save screening to server database
export async function saveScreeningToDatabase(screening: ScreeningResult): Promise<ScreeningResult> {
  try {
    const res = await fetch('/api/database/screenings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(screening)
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.screening;
  } catch (err) {
    console.warn('Error saving to server database:', err);
    return screening;
  }
}

// Delete screening from server database
export async function deleteScreeningFromDatabase(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/database/screenings/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (err) {
    console.warn('Error deleting from server database:', err);
    return false;
  }
}

// Fetch all patients from server database
export async function fetchDatabasePatients(): Promise<DatabasePatient[]> {
  try {
    const res = await fetch('/api/database/patients');
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.patients || [];
  } catch (err) {
    console.warn('Failed to fetch patients from server database:', err);
    return [];
  }
}

// Save patient profile directly to server database
export async function savePatientToDatabase(patient: PatientDemographics): Promise<{ success: boolean; patient?: DatabasePatient; error?: string }> {
  try {
    const res = await fetch('/api/database/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patient)
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP error ${res.status}`);
    }
    const data = await res.json();
    return { success: true, patient: data.patient };
  } catch (err: any) {
    console.warn('Error saving patient to server database:', err);
    return { success: false, error: err?.message || 'Failed to save patient' };
  }
}

// Fetch database summary statistics
export async function fetchDatabaseStats(): Promise<DatabaseStats | null> {
  try {
    const res = await fetch('/api/database/stats');
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    return null;
  }
}
