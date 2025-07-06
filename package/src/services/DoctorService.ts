/**
 * MOKO SOSTANZA Dental CRM - Doctor Service
 *
 * Servizio per la gestione dei dottori
 * Integrato con Supabase database
 */

import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

// Tipi dal database
type Doctor = Database['public']['Tables']['doctors']['Row'];
type DoctorInsert = Database['public']['Tables']['doctors']['Insert'];
type DoctorUpdate = Database['public']['Tables']['doctors']['Update'];

// Interfacce per le opzioni di ricerca e paginazione
export interface DoctorSearchFilters {
  search?: string;
  specialization?: string;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DoctorListResult {
  doctors: Doctor[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class DoctorService {
  /**
   * Ottieni tutti i dottori con filtri e paginazione
   */
  static async getDoctors(
    filters: DoctorSearchFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<DoctorListResult> {
    try {
      let query = supabase.from('doctors').select('*', { count: 'exact' });

      // Applica filtri di ricerca
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,specialization.ilike.%${filters.search}%`);
      }

      if (filters.specialization) {
        query = query.eq('specialization', filters.specialization);
      }

      // Applica ordinamento
      const sortBy = pagination.sortBy || 'name';
      const sortOrder = pagination.sortOrder || 'asc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Applica paginazione
      const page = pagination.page || 1;
      const limit = pagination.limit || 50;
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      const { data: doctors, error, count } = await query;

      if (error) {
        throw new Error(`Errore nel recupero dei dottori: ${error.message}`);
      }

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      return {
        doctors: doctors || [],
        pagination: {
          total,
          page,
          limit,
          totalPages
        }
      };
    } catch (error) {
      console.error('Errore in getDoctors:', error);
      throw error;
    }
  }

  /**
   * Ottieni un dottore per ID
   */
  static async getDoctorById(id: number): Promise<Doctor | null> {
    try {
      const { data: doctor, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Dottore non trovato
        }
        throw new Error(`Errore nel recupero del dottore: ${error.message}`);
      }

      return doctor;
    } catch (error) {
      console.error('Errore in getDoctorById:', error);
      throw error;
    }
  }

  /**
   * Crea un nuovo dottore
   */
  static async createDoctor(doctorData: DoctorInsert): Promise<Doctor> {
    try {
      const { data: doctor, error } = await supabase
        .from('doctors')
        .insert(doctorData)
        .select()
        .single();

      if (error) {
        throw new Error(`Errore nella creazione del dottore: ${error.message}`);
      }

      if (!doctor) {
        throw new Error('Dottore creato ma non restituito dal database');
      }

      return doctor;
    } catch (error) {
      console.error('Errore in createDoctor:', error);
      throw error;
    }
  }

  /**
   * Aggiorna un dottore esistente
   */
  static async updateDoctor(id: number, doctorData: DoctorUpdate): Promise<Doctor> {
    try {
      const { data: doctor, error } = await supabase
        .from('doctors')
        .update(doctorData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Errore nell'aggiornamento del dottore: ${error.message}`);
      }

      if (!doctor) {
        throw new Error('Dottore non trovato o non aggiornato');
      }

      return doctor;
    } catch (error) {
      console.error('Errore in updateDoctor:', error);
      throw error;
    }
  }

  /**
   * Elimina un dottore
   */
  static async deleteDoctor(id: number): Promise<void> {
    try {
      // Prima verifica se il dottore ha appuntamenti associati
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('id')
        .eq('doctor_id', id)
        .limit(1);

      if (appointmentsError) {
        throw new Error(`Errore nella verifica degli appuntamenti: ${appointmentsError.message}`);
      }

      if (appointments && appointments.length > 0) {
        throw new Error('Impossibile eliminare il dottore: ha appuntamenti associati');
      }

      const { error } = await supabase
        .from('doctors')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Errore nell'eliminazione del dottore: ${error.message}`);
      }
    } catch (error) {
      console.error('Errore in deleteDoctor:', error);
      throw error;
    }
  }

  /**
   * Ottieni tutte le specializzazioni disponibili
   */
  static async getSpecializations(): Promise<string[]> {
    try {
      const { data: doctors, error } = await supabase
        .from('doctors')
        .select('specialization');

      if (error) {
        throw new Error(`Errore nel recupero delle specializzazioni: ${error.message}`);
      }

      // Estrai specializzazioni uniche
      const specializations = [...new Set(doctors?.map(d => d.specialization).filter(Boolean) || [])];
      return specializations.sort();
    } catch (error) {
      console.error('Errore in getSpecializations:', error);
      throw error;
    }
  }

  /**
   * Ottieni statistiche sui dottori
   */
  static async getDoctorStats(): Promise<{
    total: number;
    specializations: { [key: string]: number };
  }> {
    try {
      const { data: doctors, error } = await supabase
        .from('doctors')
        .select('specialization');

      if (error) {
        throw new Error(`Errore nel recupero delle statistiche: ${error.message}`);
      }

      const total = doctors?.length || 0;
      const specializations: { [key: string]: number } = {};

      doctors?.forEach(doctor => {
        if (doctor.specialization) {
          specializations[doctor.specialization] = (specializations[doctor.specialization] || 0) + 1;
        }
      });

      return {
        total,
        specializations
      };
    } catch (error) {
      console.error('Errore in getDoctorStats:', error);
      throw error;
    }
  }

  /**
   * Verifica se un dottore può essere eliminato
   */
  static async canDeleteDoctor(id: number): Promise<{
    canDelete: boolean;
    reason?: string;
    appointmentCount?: number;
  }> {
    try {
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select('id', { count: 'exact' })
        .eq('doctor_id', id);

      if (error) {
        throw new Error(`Errore nella verifica: ${error.message}`);
      }

      const appointmentCount = appointments?.length || 0;

      if (appointmentCount > 0) {
        return {
          canDelete: false,
          reason: `Il dottore ha ${appointmentCount} appuntamenti associati`,
          appointmentCount
        };
      }

      return {
        canDelete: true,
        appointmentCount: 0
      };
    } catch (error) {
      console.error('Errore in canDeleteDoctor:', error);
      throw error;
    }
  }
}

export default DoctorService;