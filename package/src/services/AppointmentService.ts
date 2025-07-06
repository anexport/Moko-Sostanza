/**
 * MOKO SOSTANZA Dental CRM - Appointment Service
 *
 * Servizio per la gestione degli appuntamenti
 * Integrato con Supabase database
 */

import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

// Tipi dal database
export type Appointment = Database['public']['Tables']['appointments']['Row'];
export type AppointmentInsert = Database['public']['Tables']['appointments']['Insert'];
export type AppointmentUpdate = Database['public']['Tables']['appointments']['Update'];
export type Patient = Database['public']['Tables']['patients']['Row'];
export type Doctor = Database['public']['Tables']['doctors']['Row'];
export type Treatment = Database['public']['Tables']['treatments']['Row'];

// Tipo per appuntamento con dati correlati
export interface AppointmentWithDetails extends Appointment {
  patient?: Patient;
  doctor?: Doctor;
  treatment?: Treatment;
}

// Interfacce per le opzioni di ricerca e paginazione
export interface AppointmentSearchFilters {
  search?: string;
  patientId?: number;
  doctorId?: number;
  treatmentId?: number;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AppointmentListResult {
  appointments: AppointmentWithDetails[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class AppointmentService {
  /**
   * Ottieni tutti gli appuntamenti con filtri e paginazione
   */
  static async getAppointments(
    filters: AppointmentSearchFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<AppointmentListResult> {
    try {
      let query = supabase
        .from('appointments')
        .select(`
          *,
          patient:patients(*),
          doctor:doctors(*),
          treatment:treatments(*)
        `, { count: 'exact' });

      // Applica filtri
      if (filters.patientId) {
        query = query.eq('patient_id', filters.patientId);
      }

      if (filters.doctorId) {
        query = query.eq('doctor_id', filters.doctorId);
      }

      if (filters.treatmentId) {
        query = query.eq('treatment_id', filters.treatmentId);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.dateFrom) {
        query = query.gte('date', filters.dateFrom);
      }

      if (filters.dateTo) {
        query = query.lte('date', filters.dateTo);
      }

      // Filtro di ricerca per nome paziente
      if (filters.search) {
        query = query.or(`notes.ilike.%${filters.search}%`);
      }

      // Applica ordinamento
      const sortBy = pagination.sortBy || 'date';
      const sortOrder = pagination.sortOrder || 'desc';
      
      if (sortBy === 'date') {
        query = query.order('date', { ascending: sortOrder === 'asc' });
        query = query.order('start_time', { ascending: true });
      } else {
        query = query.order(sortBy, { ascending: sortOrder === 'asc' });
      }

      // Applica paginazione
      const page = pagination.page || 1;
      const limit = pagination.limit || 50;
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      const { data: appointments, error, count } = await query;

      if (error) {
        throw new Error(`Errore nel recupero degli appuntamenti: ${error.message}`);
      }

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      return {
        appointments: appointments || [],
        pagination: {
          total,
          page,
          limit,
          totalPages
        }
      };
    } catch (error) {
      console.error('Errore in getAppointments:', error);
      throw error;
    }
  }

  /**
   * Ottieni un appuntamento per ID con dettagli
   */
  static async getAppointmentById(id: number): Promise<AppointmentWithDetails | null> {
    try {
      const { data: appointment, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:patients(*),
          doctor:doctors(*),
          treatment:treatments(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Appuntamento non trovato
        }
        throw new Error(`Errore nel recupero dell'appuntamento: ${error.message}`);
      }

      return appointment;
    } catch (error) {
      console.error('Errore in getAppointmentById:', error);
      throw error;
    }
  }

  /**
   * Crea un nuovo appuntamento
   */
  static async createAppointment(appointmentData: AppointmentInsert): Promise<AppointmentWithDetails> {
    try {
      // Verifica conflitti di orario per il dottore
      const conflict = await this.checkTimeConflict(
        appointmentData.doctor_id!,
        appointmentData.date!,
        appointmentData.start_time!,
        appointmentData.end_time!
      );

      if (conflict) {
        throw new Error(`Conflitto di orario: il dottore ha già un appuntamento dalle ${conflict.start_time} alle ${conflict.end_time}`);
      }

      const { data: appointment, error } = await supabase
        .from('appointments')
        .insert(appointmentData)
        .select(`
          *,
          patient:patients(*),
          doctor:doctors(*),
          treatment:treatments(*)
        `)
        .single();

      if (error) {
        throw new Error(`Errore nella creazione dell'appuntamento: ${error.message}`);
      }

      if (!appointment) {
        throw new Error('Appuntamento creato ma non restituito dal database');
      }

      return appointment;
    } catch (error) {
      console.error('Errore in createAppointment:', error);
      throw error;
    }
  }

  /**
   * Aggiorna un appuntamento esistente
   */
  static async updateAppointment(id: number, appointmentData: AppointmentUpdate): Promise<AppointmentWithDetails> {
    try {
      // Se si stanno modificando orario o dottore, verifica conflitti
      if (appointmentData.doctor_id || appointmentData.date || appointmentData.start_time || appointmentData.end_time) {
        const existingAppointment = await this.getAppointmentById(id);
        if (!existingAppointment) {
          throw new Error('Appuntamento non trovato');
        }

        const doctorId = appointmentData.doctor_id || existingAppointment.doctor_id;
        const date = appointmentData.date || existingAppointment.date;
        const startTime = appointmentData.start_time || existingAppointment.start_time;
        const endTime = appointmentData.end_time || existingAppointment.end_time;

        const conflict = await this.checkTimeConflict(doctorId, date, startTime, endTime, id);
        if (conflict) {
          throw new Error(`Conflitto di orario: il dottore ha già un appuntamento dalle ${conflict.start_time} alle ${conflict.end_time}`);
        }
      }

      const { data: appointment, error } = await supabase
        .from('appointments')
        .update(appointmentData)
        .eq('id', id)
        .select(`
          *,
          patient:patients(*),
          doctor:doctors(*),
          treatment:treatments(*)
        `)
        .single();

      if (error) {
        throw new Error(`Errore nell'aggiornamento dell'appuntamento: ${error.message}`);
      }

      if (!appointment) {
        throw new Error('Appuntamento non trovato o non aggiornato');
      }

      return appointment;
    } catch (error) {
      console.error('Errore in updateAppointment:', error);
      throw error;
    }
  }

  /**
   * Elimina un appuntamento
   */
  static async deleteAppointment(id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Errore nell'eliminazione dell'appuntamento: ${error.message}`);
      }
    } catch (error) {
      console.error('Errore in deleteAppointment:', error);
      throw error;
    }
  }

  /**
   * Ottieni appuntamenti per data
   */
  static async getAppointmentsByDate(date: string): Promise<AppointmentWithDetails[]> {
    try {
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:patients(*),
          doctor:doctors(*),
          treatment:treatments(*)
        `)
        .eq('date', date)
        .order('start_time');

      if (error) {
        throw new Error(`Errore nel recupero degli appuntamenti per data: ${error.message}`);
      }

      return appointments || [];
    } catch (error) {
      console.error('Errore in getAppointmentsByDate:', error);
      throw error;
    }
  }

  /**
   * Ottieni appuntamenti per paziente
   */
  static async getAppointmentsByPatient(patientId: number): Promise<AppointmentWithDetails[]> {
    try {
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:patients(*),
          doctor:doctors(*),
          treatment:treatments(*)
        `)
        .eq('patient_id', patientId)
        .order('date', { ascending: false })
        .order('start_time', { ascending: false });

      if (error) {
        throw new Error(`Errore nel recupero degli appuntamenti per paziente: ${error.message}`);
      }

      return appointments || [];
    } catch (error) {
      console.error('Errore in getAppointmentsByPatient:', error);
      throw error;
    }
  }

  /**
   * Ottieni appuntamenti per dottore
   */
  static async getAppointmentsByDoctor(doctorId: number): Promise<AppointmentWithDetails[]> {
    try {
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:patients(*),
          doctor:doctors(*),
          treatment:treatments(*)
        `)
        .eq('doctor_id', doctorId)
        .order('date', { ascending: false })
        .order('start_time', { ascending: false });

      if (error) {
        throw new Error(`Errore nel recupero degli appuntamenti per dottore: ${error.message}`);
      }

      return appointments || [];
    } catch (error) {
      console.error('Errore in getAppointmentsByDoctor:', error);
      throw error;
    }
  }

  /**
   * Ottieni appuntamenti in un range di date
   */
  static async getAppointmentsByDateRange(startDate: string, endDate: string): Promise<AppointmentWithDetails[]> {
    try {
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:patients(*),
          doctor:doctors(*),
          treatment:treatments(*)
        `)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date')
        .order('start_time');

      if (error) {
        throw new Error(`Errore nel recupero degli appuntamenti per range di date: ${error.message}`);
      }

      return appointments || [];
    } catch (error) {
      console.error('Errore in getAppointmentsByDateRange:', error);
      throw error;
    }
  }

  /**
   * Verifica conflitti di orario per un dottore
   */
  static async checkTimeConflict(
    doctorId: number,
    date: string,
    startTime: string,
    endTime: string,
    excludeAppointmentId?: number
  ): Promise<Appointment | null> {
    try {
      let query = supabase
        .from('appointments')
        .select('*')
        .eq('doctor_id', doctorId)
        .eq('date', date)
        .neq('status', 'cancellato');

      if (excludeAppointmentId) {
        query = query.neq('id', excludeAppointmentId);
      }

      const { data: appointments, error } = await query;

      if (error) {
        throw new Error(`Errore nella verifica dei conflitti: ${error.message}`);
      }

      // Verifica sovrapposizioni di orario
      for (const appointment of appointments || []) {
        const existingStart = appointment.start_time;
        const existingEnd = appointment.end_time;

        // Verifica se c'è sovrapposizione
        if (
          (startTime >= existingStart && startTime < existingEnd) ||
          (endTime > existingStart && endTime <= existingEnd) ||
          (startTime <= existingStart && endTime >= existingEnd)
        ) {
          return appointment;
        }
      }

      return null;
    } catch (error) {
      console.error('Errore in checkTimeConflict:', error);
      throw error;
    }
  }

  /**
   * Ottieni statistiche degli appuntamenti
   */
  static async getAppointmentStats(): Promise<{
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    byStatus: { [key: string]: number };
  }> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      const startOfWeekStr = startOfWeek.toISOString().split('T')[0];
      
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      const startOfMonthStr = startOfMonth.toISOString().split('T')[0];

      // Ottieni tutti gli appuntamenti
      const { data: allAppointments, error: allError } = await supabase
        .from('appointments')
        .select('date, status');

      if (allError) {
        throw new Error(`Errore nel recupero delle statistiche: ${allError.message}`);
      }

      // Appuntamenti di oggi
      const { data: todayAppointments, error: todayError } = await supabase
        .from('appointments')
        .select('id', { count: 'exact' })
        .eq('date', today);

      if (todayError) {
        throw new Error(`Errore nel recupero degli appuntamenti di oggi: ${todayError.message}`);
      }

      // Appuntamenti di questa settimana
      const { data: weekAppointments, error: weekError } = await supabase
        .from('appointments')
        .select('id', { count: 'exact' })
        .gte('date', startOfWeekStr);

      if (weekError) {
        throw new Error(`Errore nel recupero degli appuntamenti della settimana: ${weekError.message}`);
      }

      // Appuntamenti di questo mese
      const { data: monthAppointments, error: monthError } = await supabase
        .from('appointments')
        .select('id', { count: 'exact' })
        .gte('date', startOfMonthStr);

      if (monthError) {
        throw new Error(`Errore nel recupero degli appuntamenti del mese: ${monthError.message}`);
      }

      const total = allAppointments?.length || 0;
      const byStatus: { [key: string]: number } = {};

      allAppointments?.forEach(appointment => {
        if (appointment.status) {
          byStatus[appointment.status] = (byStatus[appointment.status] || 0) + 1;
        }
      });

      return {
        total,
        today: todayAppointments?.length || 0,
        thisWeek: weekAppointments?.length || 0,
        thisMonth: monthAppointments?.length || 0,
        byStatus
      };
    } catch (error) {
      console.error('Errore in getAppointmentStats:', error);
      throw error;
    }
  }

  /**
   * Ottieni i prossimi appuntamenti
   */
  static async getUpcomingAppointments(limit: number = 5): Promise<AppointmentWithDetails[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const currentTime = new Date().toTimeString().split(' ')[0].substring(0, 5);

      const { data: appointments, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:patients(*),
          doctor:doctors(*),
          treatment:treatments(*)
        `)
        .or(`date.gt.${today},and(date.eq.${today},start_time.gte.${currentTime})`)
        .in('status', ['confermato', 'in attesa'])
        .order('date')
        .order('start_time')
        .limit(limit);

      if (error) {
        throw new Error(`Errore nel recupero dei prossimi appuntamenti: ${error.message}`);
      }

      return appointments || [];
    } catch (error) {
      console.error('Errore in getUpcomingAppointments:', error);
      throw error;
    }
  }
}

// Funzioni di utilità
export const formatAppointmentTime = (appointment: Appointment): string => {
  return `${appointment.start_time} - ${appointment.end_time}`;
};

export const getAppointmentDuration = (appointment: Appointment): number => {
  const startParts = appointment.start_time.split(':').map(Number);
  const endParts = appointment.end_time.split(':').map(Number);

  const startMinutes = startParts[0] * 60 + startParts[1];
  const endMinutes = endParts[0] * 60 + endParts[1];

  return endMinutes - startMinutes;
};

export const getAppointmentTitle = (appointment: AppointmentWithDetails): string => {
  const patientName = appointment.patient?.first_name && appointment.patient?.last_name
    ? `${appointment.patient.first_name} ${appointment.patient.last_name}`
    : appointment.patient?.first_name || 'Paziente';
  
  const treatmentName = appointment.treatment?.name || 'Trattamento';

  return `${patientName} - ${treatmentName}`;
};

export const getAppointmentColor = (appointment: AppointmentWithDetails): string => {
  if (appointment.doctor?.color) {
    return appointment.doctor.color;
  }

  // Colori predefiniti in base allo stato
  switch (appointment.status) {
    case 'confermato':
      return '#4CAF50';
    case 'in attesa':
      return '#FFC107';
    case 'cancellato':
      return '#F44336';
    case 'completato':
      return '#9E9E9E';
    default:
      return '#1E88E5';
  }
};

export const getStatusBadgeColor = (status: string): string => {
  switch (status) {
    case 'confermato':
      return 'success';
    case 'in attesa':
      return 'warning';
    case 'cancellato':
      return 'failure';
    case 'completato':
      return 'info';
    default:
      return 'default';
  }
};

export default AppointmentService;