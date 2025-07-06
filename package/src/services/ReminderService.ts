import { supabase } from '../lib/supabase';

// Definizione dell'interfaccia Reminder
export interface Reminder {
  id: number;
  date: string; // formato YYYY-MM-DD
  time: string; // formato HH:MM
  title: string;
  text: string;
  completed: boolean;
  created_at?: string;
  updated_at?: string;
}

// Definizione dei tipi per le operazioni del database
export interface ReminderInsert {
  date: string;
  time: string;
  title: string;
  text: string;
  completed?: boolean;
}

export interface ReminderUpdate {
  date?: string;
  time?: string;
  title?: string;
  text?: string;
  completed?: boolean;
}

export interface ReminderSearchFilters {
  date?: string;
  completed?: boolean;
  search?: string;
}

export interface PaginationOptions {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Service class per gestire i promemoria
export class ReminderService {
  // Ottieni tutti i promemoria con filtri opzionali
  static async getReminders(
    filters: ReminderSearchFilters = {}, 
    pagination: PaginationOptions = {}
  ): Promise<Reminder[]> {
    try {
      let query = supabase.from('reminders').select('*');

      // Applica filtri
      if (filters.date) {
        query = query.eq('date', filters.date);
      }

      if (filters.completed !== undefined) {
        query = query.eq('completed', filters.completed);
      }

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,text.ilike.%${filters.search}%`);
      }

      // Applica ordinamento
      const sortBy = pagination.sortBy || 'date';
      const sortOrder = pagination.sortOrder || 'asc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Applica paginazione
      if (pagination.limit) {
        query = query.limit(pagination.limit);
      }

      if (pagination.offset) {
        query = query.range(pagination.offset, pagination.offset + (pagination.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching reminders:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getReminders:', error);
      throw error;
    }
  }

  // Ottieni un promemoria per ID
  static async getReminderById(id: number): Promise<Reminder | null> {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching reminder:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in getReminderById:', error);
      throw error;
    }
  }

  // Crea un nuovo promemoria
  static async createReminder(reminderData: ReminderInsert): Promise<Reminder> {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .insert([reminderData])
        .select()
        .single();

      if (error) {
        console.error('Error creating reminder:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in createReminder:', error);
      throw error;
    }
  }

  // Aggiorna un promemoria esistente
  static async updateReminder(id: number, reminderData: ReminderUpdate): Promise<Reminder> {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .update(reminderData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating reminder:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updateReminder:', error);
      throw error;
    }
  }

  // Elimina un promemoria
  static async deleteReminder(id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting reminder:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in deleteReminder:', error);
      throw error;
    }
  }

  // Cambia lo stato di completamento di un promemoria
  static async toggleCompleted(id: number): Promise<Reminder> {
    try {
      // Prima ottieni il promemoria corrente
      const currentReminder = await this.getReminderById(id);
      if (!currentReminder) {
        throw new Error('Reminder not found');
      }

      // Cambia lo stato
      const { data, error } = await supabase
        .from('reminders')
        .update({ completed: !currentReminder.completed })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error toggling reminder completion:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in toggleCompleted:', error);
      throw error;
    }
  }

  // Ottieni promemoria per una data specifica
  static async getRemindersByDate(date: string): Promise<Reminder[]> {
    return this.getReminders({ date });
  }

  // Ottieni promemoria futuri non completati
  static async getUpcomingReminders(count: number = 5): Promise<Reminder[]> {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .gte('date', today)
        .eq('completed', false)
        .order('date', { ascending: true })
        .order('time', { ascending: true })
        .limit(count);

      if (error) {
        console.error('Error fetching upcoming reminders:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUpcomingReminders:', error);
      throw error;
    }
  }

  // Ottieni promemoria di oggi
  static async getTodayReminders(): Promise<Reminder[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.getRemindersByDate(today);
  }

  // Ottieni promemoria scaduti non completati
  static async getOverdueReminders(): Promise<Reminder[]> {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .lt('date', today)
        .eq('completed', false)
        .order('date', { ascending: false })
        .order('time', { ascending: false });

      if (error) {
        console.error('Error fetching overdue reminders:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getOverdueReminders:', error);
      throw error;
    }
  }

  // Ottieni statistiche sui promemoria
  static async getReminderStats(): Promise<{
    total: number;
    completed: number;
    pending: number;
    today: number;
    overdue: number;
  }> {
    try {
      const today = new Date().toISOString().split('T')[0];

      const [totalResult, completedResult, todayResult, overdueResult] = await Promise.all([
        supabase.from('reminders').select('*', { count: 'exact', head: true }),
        supabase.from('reminders').select('*', { count: 'exact', head: true }).eq('completed', true),
        supabase.from('reminders').select('*', { count: 'exact', head: true }).eq('date', today),
        supabase.from('reminders').select('*', { count: 'exact', head: true }).lt('date', today).eq('completed', false)
      ]);

      const total = totalResult.count || 0;
      const completed = completedResult.count || 0;
      const todayCount = todayResult.count || 0;
      const overdueCount = overdueResult.count || 0;

      return {
        total,
        completed,
        pending: total - completed,
        today: todayCount,
        overdue: overdueCount
      };
    } catch (error) {
      console.error('Error in getReminderStats:', error);
      throw error;
    }
  }
}

// Funzioni di utilità
export const formatReminderDate = (date: string): string => {
  const dateObj = new Date(date);
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return dateObj.toLocaleDateString('it-IT', options);
};

export const isToday = (date: string): boolean => {
  const today = new Date();
  const todayFormatted = today.toISOString().split('T')[0];
  return date === todayFormatted;
};

export const isTomorrow = (date: string): boolean => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowFormatted = tomorrow.toISOString().split('T')[0];
  return date === tomorrowFormatted;
};

export const getRelativeDate = (date: string): string => {
  if (isToday(date)) return 'Oggi';
  if (isTomorrow(date)) return 'Domani';
  return formatReminderDate(date);
};

export const formatReminderTime = (time: string): string => {
  return time.substring(0, 5); // Mostra solo HH:MM
};

export const formatReminderDateTime = (date: string, time: string): string => {
  return `${getRelativeDate(date)} alle ${formatReminderTime(time)}`;
};