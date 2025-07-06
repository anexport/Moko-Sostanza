/**
 * MOKO SOSTANZA Dental CRM - Treatment Service
 *
 * Servizio per la gestione dei trattamenti
 * Integrato con Supabase database
 */

import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

// Tipi dal database
type Treatment = Database['public']['Tables']['treatments']['Row'];
type TreatmentInsert = Database['public']['Tables']['treatments']['Insert'];
type TreatmentUpdate = Database['public']['Tables']['treatments']['Update'];

// Interfacce per le opzioni di ricerca e paginazione
export interface TreatmentSearchFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface TreatmentListResult {
  treatments: Treatment[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class TreatmentService {
  /**
   * Ottieni tutti i trattamenti con filtri e paginazione
   */
  static async getTreatments(
    filters: TreatmentSearchFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<TreatmentListResult> {
    try {
      let query = supabase.from('treatments').select('*', { count: 'exact' });

      // Applica filtri di ricerca
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,category.ilike.%${filters.search}%`);
      }

      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.minPrice !== undefined) {
        query = query.gte('price', filters.minPrice);
      }

      if (filters.maxPrice !== undefined) {
        query = query.lte('price', filters.maxPrice);
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

      const { data: treatments, error, count } = await query;

      if (error) {
        throw new Error(`Errore nel recupero dei trattamenti: ${error.message}`);
      }

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      return {
        treatments: treatments || [],
        pagination: {
          total,
          page,
          limit,
          totalPages
        }
      };
    } catch (error) {
      console.error('Errore in getTreatments:', error);
      throw error;
    }
  }

  /**
   * Ottieni un trattamento per ID
   */
  static async getTreatmentById(id: number): Promise<Treatment | null> {
    try {
      const { data: treatment, error } = await supabase
        .from('treatments')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Trattamento non trovato
        }
        throw new Error(`Errore nel recupero del trattamento: ${error.message}`);
      }

      return treatment;
    } catch (error) {
      console.error('Errore in getTreatmentById:', error);
      throw error;
    }
  }

  /**
   * Crea un nuovo trattamento
   */
  static async createTreatment(treatmentData: TreatmentInsert): Promise<Treatment> {
    try {
      const { data: treatment, error } = await supabase
        .from('treatments')
        .insert(treatmentData)
        .select()
        .single();

      if (error) {
        throw new Error(`Errore nella creazione del trattamento: ${error.message}`);
      }

      if (!treatment) {
        throw new Error('Trattamento creato ma non restituito dal database');
      }

      return treatment;
    } catch (error) {
      console.error('Errore in createTreatment:', error);
      throw error;
    }
  }

  /**
   * Aggiorna un trattamento esistente
   */
  static async updateTreatment(id: number, treatmentData: TreatmentUpdate): Promise<Treatment> {
    try {
      const { data: treatment, error } = await supabase
        .from('treatments')
        .update(treatmentData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Errore nell'aggiornamento del trattamento: ${error.message}`);
      }

      if (!treatment) {
        throw new Error('Trattamento non trovato o non aggiornato');
      }

      return treatment;
    } catch (error) {
      console.error('Errore in updateTreatment:', error);
      throw error;
    }
  }

  /**
   * Elimina un trattamento
   */
  static async deleteTreatment(id: number): Promise<void> {
    try {
      // Prima verifica se il trattamento ha appuntamenti associati
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('id')
        .eq('treatment_id', id)
        .limit(1);

      if (appointmentsError) {
        throw new Error(`Errore nella verifica degli appuntamenti: ${appointmentsError.message}`);
      }

      if (appointments && appointments.length > 0) {
        throw new Error('Impossibile eliminare il trattamento: ha appuntamenti associati');
      }

      const { error } = await supabase
        .from('treatments')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Errore nell'eliminazione del trattamento: ${error.message}`);
      }
    } catch (error) {
      console.error('Errore in deleteTreatment:', error);
      throw error;
    }
  }

  /**
   * Ottieni tutte le categorie disponibili
   */
  static async getCategories(): Promise<string[]> {
    try {
      const { data: treatments, error } = await supabase
        .from('treatments')
        .select('category');

      if (error) {
        throw new Error(`Errore nel recupero delle categorie: ${error.message}`);
      }

      // Estrai categorie uniche
      const categories = [...new Set(treatments?.map(t => t.category).filter(Boolean) || [])];
      return categories.sort();
    } catch (error) {
      console.error('Errore in getCategories:', error);
      throw error;
    }
  }

  /**
   * Ottieni trattamenti per categoria
   */
  static async getTreatmentsByCategory(category: string): Promise<Treatment[]> {
    try {
      const { data: treatments, error } = await supabase
        .from('treatments')
        .select('*')
        .eq('category', category)
        .order('name');

      if (error) {
        throw new Error(`Errore nel recupero dei trattamenti per categoria: ${error.message}`);
      }

      return treatments || [];
    } catch (error) {
      console.error('Errore in getTreatmentsByCategory:', error);
      throw error;
    }
  }

  /**
   * Ottieni statistiche sui trattamenti
   */
  static async getTreatmentStats(): Promise<{
    total: number;
    categories: { [key: string]: number };
    averagePrice: number;
    priceRange: { min: number; max: number };
  }> {
    try {
      const { data: treatments, error } = await supabase
        .from('treatments')
        .select('category, price');

      if (error) {
        throw new Error(`Errore nel recupero delle statistiche: ${error.message}`);
      }

      const total = treatments?.length || 0;
      const categories: { [key: string]: number } = {};
      let totalPrice = 0;
      let minPrice = Infinity;
      let maxPrice = -Infinity;

      treatments?.forEach(treatment => {
        if (treatment.category) {
          categories[treatment.category] = (categories[treatment.category] || 0) + 1;
        }
        
        if (treatment.price !== null) {
          totalPrice += treatment.price;
          minPrice = Math.min(minPrice, treatment.price);
          maxPrice = Math.max(maxPrice, treatment.price);
        }
      });

      const averagePrice = total > 0 ? totalPrice / total : 0;
      
      return {
        total,
        categories,
        averagePrice,
        priceRange: {
          min: minPrice === Infinity ? 0 : minPrice,
          max: maxPrice === -Infinity ? 0 : maxPrice
        }
      };
    } catch (error) {
      console.error('Errore in getTreatmentStats:', error);
      throw error;
    }
  }

  /**
   * Verifica se un trattamento può essere eliminato
   */
  static async canDeleteTreatment(id: number): Promise<{
    canDelete: boolean;
    reason?: string;
    appointmentCount?: number;
  }> {
    try {
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select('id', { count: 'exact' })
        .eq('treatment_id', id);

      if (error) {
        throw new Error(`Errore nella verifica: ${error.message}`);
      }

      const appointmentCount = appointments?.length || 0;

      if (appointmentCount > 0) {
        return {
          canDelete: false,
          reason: `Il trattamento ha ${appointmentCount} appuntamenti associati`,
          appointmentCount
        };
      }

      return {
        canDelete: true,
        appointmentCount: 0
      };
    } catch (error) {
      console.error('Errore in canDeleteTreatment:', error);
      throw error;
    }
  }

  /**
   * Ricerca trattamenti avanzata
   */
  static async searchTreatments(searchTerm: string, limit: number = 10): Promise<Treatment[]> {
    try {
      const { data: treatments, error } = await supabase
        .from('treatments')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`)
        .order('name')
        .limit(limit);

      if (error) {
        throw new Error(`Errore nella ricerca dei trattamenti: ${error.message}`);
      }

      return treatments || [];
    } catch (error) {
      console.error('Errore in searchTreatments:', error);
      throw error;
    }
  }

  /**
   * Ottieni i trattamenti più popolari (con più appuntamenti)
   */
  static async getPopularTreatments(limit: number = 5): Promise<Array<Treatment & { appointment_count: number }>> {
    try {
      const { data: treatments, error } = await supabase
        .from('treatments')
        .select(`
          *,
          appointments!inner(id)
        `)
        .order('appointments.count', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Errore nel recupero dei trattamenti popolari: ${error.message}`);
      }

      // Trasforma i dati per includere il conteggio degli appuntamenti
      const result = treatments?.map(treatment => ({
        ...treatment,
        appointment_count: treatment.appointments?.length || 0
      })) || [];

      return result;
    } catch (error) {
      console.error('Errore in getPopularTreatments:', error);
      throw error;
    }
  }
}

export default TreatmentService;