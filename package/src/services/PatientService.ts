/**
 * MOKO SOSTANZA Dental CRM - Patient Service
 * 
 * Servizio per la gestione dei pazienti
 * Currently using mock data - will be connected to database later
 */

import { type Patient } from '../db/client';

// Tipi per le operazioni sui pazienti
export type CreatePatientData = Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdatePatientData = Partial<CreatePatientData>;

export interface PatientWithRelations extends Patient {
  appointments?: any[];
  invoices?: any[];
  files?: any[];
  patientUDIs?: any[];
  notifications?: any[];
}

// Mock data for development
const mockPatients: Patient[] = [
  {
    id: '1',
    firstName: 'Mario',
    lastName: 'Rossi',
    email: 'mario.rossi@example.com',
    phone: '+39 333 1234567',
    dateOfBirth: new Date('1980-05-15'),
    fiscalCode: 'RSSMRA80E15H501X',
    address: 'Via Roma 123',
    city: 'Milano',
    postalCode: '20100',
    province: 'MI',
    medicalHistory: 'Nessuna patologia rilevante',
    allergies: 'Penicillina',
    medications: 'Nessuna',
    isSmoker: false,
    anamnesis: 'Paziente collaborativo',
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-01-15'),
  },
  {
    id: '2',
    firstName: 'Giulia',
    lastName: 'Bianchi',
    email: 'giulia.bianchi@example.com',
    phone: '+39 333 7654321',
    dateOfBirth: new Date('1992-08-22'),
    fiscalCode: 'BNCGLI92M62F205Y',
    address: 'Corso Venezia 45',
    city: 'Milano',
    postalCode: '20121',
    province: 'MI',
    medicalHistory: 'Diabete tipo 2',
    allergies: null,
    medications: 'Metformina',
    isSmoker: false,
    anamnesis: 'Controlli regolari',
    createdAt: new Date('2023-02-10'),
    updatedAt: new Date('2023-02-10'),
  },
];

export interface PatientSearchFilters {
  search?: string;
  city?: string;
  isSmoker?: boolean;
  hasAllergies?: boolean;
  dateOfBirthFrom?: Date;
  dateOfBirthTo?: Date;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: keyof Patient;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Servizio per la gestione completa dei pazienti
 */
export class PatientService {
  /**
   * Recupera tutti i pazienti con paginazione e filtri
   */
  static async getPatients(
    filters: PatientSearchFilters = {},
    pagination: PaginationOptions = {}
  ) {
    const {
      page = 1,
      limit = 20,
      sortBy = 'lastName',
      sortOrder = 'asc'
    } = pagination;

    // Mock implementation - filter and paginate mockPatients
    let filteredPatients = [...mockPatients];

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredPatients = filteredPatients.filter(patient =>
        patient.firstName.toLowerCase().includes(searchTerm) ||
        patient.lastName.toLowerCase().includes(searchTerm) ||
        patient.email?.toLowerCase().includes(searchTerm) ||
        patient.fiscalCode?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply other filters
    if (filters.city) {
      filteredPatients = filteredPatients.filter(patient =>
        patient.city?.toLowerCase().includes(filters.city!.toLowerCase())
      );
    }

    if (filters.isSmoker !== undefined) {
      filteredPatients = filteredPatients.filter(patient => patient.isSmoker === filters.isSmoker);
    }

    if (filters.hasAllergies !== undefined) {
      filteredPatients = filteredPatients.filter(patient => 
        filters.hasAllergies ? patient.allergies !== null : patient.allergies === null
      );
    }

    // Apply pagination
    const skip = (page - 1) * limit;
    const paginatedPatients = filteredPatients.slice(skip, skip + limit);

    return {
      patients: paginatedPatients,
      pagination: {
        page,
        limit,
        total: filteredPatients.length,
        totalPages: Math.ceil(filteredPatients.length / limit),
        hasNext: page * limit < filteredPatients.length,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Recupera un paziente per ID
   */
  static async getPatientById(id: string, includeRelations = false): Promise<PatientWithRelations | null> {
    const patient = mockPatients.find(p => p.id === id);
    if (!patient) return null;

    // Return patient with optional relations (mock empty arrays for now)
    return {
      ...patient,
      ...(includeRelations && {
        appointments: [],
        invoices: [],
        files: [],
        patientUDIs: [],
        notifications: [],
      }),
    };
  }

  /**
   * Crea un nuovo paziente
   */
  static async createPatient(data: CreatePatientData): Promise<Patient> {
    const newPatient: Patient = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockPatients.push(newPatient);
    return newPatient;
  }

  /**
   * Aggiorna un paziente esistente
   */
  static async updatePatient(id: string, data: UpdatePatientData): Promise<Patient> {
    const patientIndex = mockPatients.findIndex(p => p.id === id);
    if (patientIndex === -1) throw new Error('Patient not found');
    
    mockPatients[patientIndex] = {
      ...mockPatients[patientIndex],
      ...data,
      updatedAt: new Date(),
    };
    
    return mockPatients[patientIndex];
  }

  /**
   * Elimina un paziente
   */
  static async deletePatient(id: string): Promise<void> {
    const patientIndex = mockPatients.findIndex(p => p.id === id);
    if (patientIndex === -1) throw new Error('Patient not found');
    
    mockPatients.splice(patientIndex, 1);
  }

  /**
   * Cerca pazienti per nome, email o codice fiscale
   */
  static async searchPatients(query: string, limit = 10): Promise<Patient[]> {
    const searchTerm = query.toLowerCase();
    return mockPatients
      .filter(patient =>
        patient.firstName.toLowerCase().includes(searchTerm) ||
        patient.lastName.toLowerCase().includes(searchTerm) ||
        patient.email?.toLowerCase().includes(searchTerm) ||
        patient.fiscalCode?.toLowerCase().includes(searchTerm)
      )
      .slice(0, limit);
  }

  /**
   * Verifica se un email è già in uso
   */
  static async isEmailTaken(email: string, excludeId?: string): Promise<boolean> {
    return mockPatients.some(patient => 
      patient.email === email && patient.id !== excludeId
    );
  }

  /**
   * Verifica se un codice fiscale è già in uso
   */
  static async isFiscalCodeTaken(fiscalCode: string, excludeId?: string): Promise<boolean> {
    return mockPatients.some(patient => 
      patient.fiscalCode === fiscalCode && patient.id !== excludeId
    );
  }

  /**
   * Ottieni statistiche sui pazienti
   */
  static async getPatientStats() {
    const totalPatients = mockPatients.length;
    const smokersCount = mockPatients.filter(p => p.isSmoker).length;
    const patientsWithAllergies = mockPatients.filter(p => p.allergies !== null).length;
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const newPatientsThisMonth = mockPatients.filter(p => 
      p.createdAt.getMonth() === currentMonth && p.createdAt.getFullYear() === currentYear
    ).length;

    return {
      totalPatients,
      newPatientsThisMonth,
      smokersCount,
      patientsWithAllergies,
      smokersPercentage: totalPatients > 0 ? (smokersCount / totalPatients) * 100 : 0,
      allergiesPercentage: totalPatients > 0 ? (patientsWithAllergies / totalPatients) * 100 : 0,
    };
  }
}

export default PatientService;
