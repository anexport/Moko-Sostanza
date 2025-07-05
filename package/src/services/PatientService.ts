/**
 * MOKO SOSTANZA Dental CRM - Patient Service
 * 
 * Servizio per la gestione dei pazienti
 * Connected to Supabase database
 */

import { supabase } from '../lib/supabase';
import { Database } from '../types/database';

type Patient = Database['public']['Tables']['patients']['Row'];
type CreatePatientData = Database['public']['Tables']['patients']['Insert'];
type UpdatePatientData = Database['public']['Tables']['patients']['Update'];

// Export types
export { type Patient, type CreatePatientData, type UpdatePatientData };

export interface PatientWithRelations extends Patient {
  appointments?: any[];
  invoices?: any[];
  files?: any[];
  patientUDIs?: any[];
  notifications?: any[];
}


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
      sortBy = 'last_name',
      sortOrder = 'asc'
    } = pagination;

    let query = supabase.from('patients').select('*');

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,fiscal_code.ilike.%${searchTerm}%`);
    }

    // Apply other filters
    if (filters.city) {
      query = query.ilike('city', `%${filters.city}%`);
    }

    if (filters.isSmoker !== undefined) {
      query = query.eq('is_smoker', filters.isSmoker);
    }

    if (filters.hasAllergies !== undefined) {
      query = filters.hasAllergies ? query.not('allergies', 'is', null) : query.is('allergies', null);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: patients, error, count } = await query;
    
    if (error) throw error;

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true });

    return {
      patients: patients || [],
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit),
        hasNext: page * limit < (totalCount || 0),
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Recupera un paziente per ID
   */
  static async getPatientById(id: string, includeRelations = false): Promise<PatientWithRelations | null> {
    const { data: patient, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    if (!includeRelations) {
      return patient;
    }

    // TODO: Load related data when needed
    return {
      ...patient,
      appointments: [],
      invoices: [],
      files: [],
      patientUDIs: [],
      notifications: [],
    };
  }

  /**
   * Crea un nuovo paziente
   */
  static async createPatient(data: CreatePatientData): Promise<Patient> {
    const { data: patient, error } = await supabase
      .from('patients')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return patient;
  }

  /**
   * Aggiorna un paziente esistente
   */
  static async updatePatient(id: string, data: UpdatePatientData): Promise<Patient> {
    const { data: patient, error } = await supabase
      .from('patients')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return patient;
  }

  /**
   * Elimina un paziente
   */
  static async deletePatient(id: string): Promise<void> {
    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Cerca pazienti per nome, email o codice fiscale
   */
  static async searchPatients(query: string, limit = 10): Promise<Patient[]> {
    const { data: patients, error } = await supabase
      .from('patients')
      .select('*')
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,fiscal_code.ilike.%${query}%`)
      .order('last_name')
      .limit(limit);

    if (error) throw error;
    return patients || [];
  }

  /**
   * Verifica se un email è già in uso
   */
  static async isEmailTaken(email: string, excludeId?: string): Promise<boolean> {
    let query = supabase.from('patients').select('id').eq('email', email);
    
    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    return (data?.length || 0) > 0;
  }

  /**
   * Verifica se un codice fiscale è già in uso
   */
  static async isFiscalCodeTaken(fiscalCode: string, excludeId?: string): Promise<boolean> {
    let query = supabase.from('patients').select('id').eq('fiscal_code', fiscalCode);
    
    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    return (data?.length || 0) > 0;
  }

  /**
   * Ottieni statistiche sui pazienti
   */
  static async getPatientStats() {
    const { count: totalPatients } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true });

    const { count: smokersCount } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .eq('is_smoker', true);

    const { count: patientsWithAllergies } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .not('allergies', 'is', null);

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const { count: newPatientsThisMonth } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
      .lt('created_at', `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`);

    return {
      totalPatients: totalPatients || 0,
      newPatientsThisMonth: newPatientsThisMonth || 0,
      smokersCount: smokersCount || 0,
      patientsWithAllergies: patientsWithAllergies || 0,
      smokersPercentage: (totalPatients || 0) > 0 ? ((smokersCount || 0) / (totalPatients || 0)) * 100 : 0,
      allergiesPercentage: (totalPatients || 0) > 0 ? ((patientsWithAllergies || 0) / (totalPatients || 0)) * 100 : 0,
    };
  }
}

export default PatientService;
