/**
 * MOKO SOSTANZA Dental CRM - Invoice Service
 *
 * Servizio per la gestione delle fatture
 * Integrato con Supabase database
 */

import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

// Tipi dal database
type Invoice = Database['public']['Tables']['invoices']['Row'];
type InvoiceInsert = Database['public']['Tables']['invoices']['Insert'];
type InvoiceUpdate = Database['public']['Tables']['invoices']['Update'];
type Patient = Database['public']['Tables']['patients']['Row'];

// Tipo per fattura con dati correlati
export interface InvoiceWithDetails extends Invoice {
  patient?: Patient;
}

// Interfacce per le opzioni di ricerca e paginazione
export interface InvoiceSearchFilters {
  search?: string;
  patientId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  amountFrom?: number;
  amountTo?: number;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface InvoiceListResult {
  invoices: InvoiceWithDetails[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class InvoiceService {
  /**
   * Ottieni tutte le fatture con filtri e paginazione
   */
  static async getInvoices(
    filters: InvoiceSearchFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<InvoiceListResult> {
    try {
      let query = supabase
        .from('invoices')
        .select(`
          *,
          patient:patients(*)
        `, { count: 'exact' });

      // Applica filtri
      if (filters.patientId) {
        query = query.eq('patient_id', filters.patientId);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.dateFrom) {
        query = query.gte('issue_date', filters.dateFrom);
      }

      if (filters.dateTo) {
        query = query.lte('issue_date', filters.dateTo);
      }

      if (filters.amountFrom !== undefined) {
        query = query.gte('total', filters.amountFrom);
      }

      if (filters.amountTo !== undefined) {
        query = query.lte('total', filters.amountTo);
      }

      // Filtro di ricerca per numero fattura e descrizione
      if (filters.search) {
        query = query.or(`invoice_number.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      // Applica ordinamento
      const sortBy = pagination.sortBy || 'issue_date';
      const sortOrder = pagination.sortOrder || 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Applica paginazione
      const page = pagination.page || 1;
      const limit = pagination.limit || 20;
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      const { data: invoices, error, count } = await query;

      if (error) {
        throw new Error(`Errore nel recupero delle fatture: ${error.message}`);
      }

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      return {
        invoices: invoices || [],
        pagination: {
          total,
          page,
          limit,
          totalPages
        }
      };
    } catch (error) {
      console.error('Errore in getInvoices:', error);
      throw error;
    }
  }

  /**
   * Ottieni una fattura per ID con dettagli
   */
  static async getInvoiceById(id: string): Promise<InvoiceWithDetails | null> {
    try {
      const { data: invoice, error } = await supabase
        .from('invoices')
        .select(`
          *,
          patient:patients(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Fattura non trovata
        }
        throw new Error(`Errore nel recupero della fattura: ${error.message}`);
      }

      return invoice;
    } catch (error) {
      console.error('Errore in getInvoiceById:', error);
      throw error;
    }
  }

  /**
   * Crea una nuova fattura
   */
  static async createInvoice(invoiceData: InvoiceInsert): Promise<InvoiceWithDetails> {
    try {
      // Genera numero fattura se non fornito
      if (!invoiceData.invoice_number) {
        const invoiceNumber = await this.generateInvoiceNumber();
        invoiceData.invoice_number = invoiceNumber;
      }

      const { data: invoice, error } = await supabase
        .from('invoices')
        .insert(invoiceData)
        .select(`
          *,
          patient:patients(*)
        `)
        .single();

      if (error) {
        throw new Error(`Errore nella creazione della fattura: ${error.message}`);
      }

      if (!invoice) {
        throw new Error('Fattura creata ma non restituita dal database');
      }

      return invoice;
    } catch (error) {
      console.error('Errore in createInvoice:', error);
      throw error;
    }
  }

  /**
   * Aggiorna una fattura esistente
   */
  static async updateInvoice(id: string, invoiceData: InvoiceUpdate): Promise<InvoiceWithDetails> {
    try {
      const { data: invoice, error } = await supabase
        .from('invoices')
        .update(invoiceData)
        .eq('id', id)
        .select(`
          *,
          patient:patients(*)
        `)
        .single();

      if (error) {
        throw new Error(`Errore nell'aggiornamento della fattura: ${error.message}`);
      }

      if (!invoice) {
        throw new Error('Fattura non trovata o non aggiornata');
      }

      return invoice;
    } catch (error) {
      console.error('Errore in updateInvoice:', error);
      throw error;
    }
  }

  /**
   * Elimina una fattura
   */
  static async deleteInvoice(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Errore nell'eliminazione della fattura: ${error.message}`);
      }
    } catch (error) {
      console.error('Errore in deleteInvoice:', error);
      throw error;
    }
  }

  /**
   * Marca una fattura come pagata
   */
  static async markAsPaid(
    id: string, 
    paymentMethod: string, 
    paymentDate: string = new Date().toISOString().split('T')[0]
  ): Promise<InvoiceWithDetails> {
    try {
      const updateData: InvoiceUpdate = {
        status: 'paid',
        payment_method: paymentMethod,
        payment_date: paymentDate,
        updated_at: new Date().toISOString()
      };

      return await this.updateInvoice(id, updateData);
    } catch (error) {
      console.error('Errore in markAsPaid:', error);
      throw error;
    }
  }

  /**
   * Ottieni statistiche delle fatture
   */
  static async getInvoiceStats(year?: number): Promise<{
    totalInvoices: number;
    paidInvoices: number;
    overdueInvoices: number;
    totalRevenue: number;
    pendingRevenue: number;
    paymentRate: number;
  }> {
    try {
      const currentYear = year || new Date().getFullYear();
      const startOfYear = `${currentYear}-01-01`;
      const endOfYear = `${currentYear}-12-31`;

      // Ottieni tutte le fatture dell'anno
      const { data: yearInvoices, error: yearError } = await supabase
        .from('invoices')
        .select('*')
        .gte('issue_date', startOfYear)
        .lte('issue_date', endOfYear);

      if (yearError) {
        throw new Error(`Errore nel recupero delle fatture dell'anno: ${yearError.message}`);
      }

      // Ottieni fatture scadute
      const today = new Date().toISOString().split('T')[0];
      const { data: overdueInvoicesData, error: overdueError } = await supabase
        .from('invoices')
        .select('*')
        .in('status', ['sent', 'overdue'])
        .lt('due_date', today);

      if (overdueError) {
        throw new Error(`Errore nel recupero delle fatture scadute: ${overdueError.message}`);
      }

      const totalInvoices = yearInvoices?.length || 0;
      const paidInvoices = yearInvoices?.filter(inv => inv.status === 'paid').length || 0;
      const overdueInvoices = overdueInvoicesData?.length || 0;
      
      const totalRevenue = yearInvoices
        ?.filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + (inv.total || 0), 0) || 0;
        
      const pendingRevenue = yearInvoices
        ?.filter(inv => ['draft', 'sent'].includes(inv.status || ''))
        .reduce((sum, inv) => sum + (inv.total || 0), 0) || 0;

      const paymentRate = totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0;

      return {
        totalInvoices,
        paidInvoices,
        overdueInvoices,
        totalRevenue,
        pendingRevenue,
        paymentRate
      };
    } catch (error) {
      console.error('Errore in getInvoiceStats:', error);
      throw error;
    }
  }

  /**
   * Ottieni fatture in scadenza
   */
  static async getUpcomingDueInvoices(days: number = 7): Promise<InvoiceWithDetails[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);
      const futureDateStr = futureDate.toISOString().split('T')[0];

      const { data: invoices, error } = await supabase
        .from('invoices')
        .select(`
          *,
          patient:patients(*)
        `)
        .eq('status', 'sent')
        .gte('due_date', today)
        .lte('due_date', futureDateStr)
        .order('due_date');

      if (error) {
        throw new Error(`Errore nel recupero delle fatture in scadenza: ${error.message}`);
      }

      return invoices || [];
    } catch (error) {
      console.error('Errore in getUpcomingDueInvoices:', error);
      throw error;
    }
  }

  /**
   * Ottieni fatture per paziente
   */
  static async getInvoicesByPatient(patientId: string): Promise<InvoiceWithDetails[]> {
    try {
      const { data: invoices, error } = await supabase
        .from('invoices')
        .select(`
          *,
          patient:patients(*)
        `)
        .eq('patient_id', patientId)
        .order('issue_date', { ascending: false });

      if (error) {
        throw new Error(`Errore nel recupero delle fatture per paziente: ${error.message}`);
      }

      return invoices || [];
    } catch (error) {
      console.error('Errore in getInvoicesByPatient:', error);
      throw error;
    }
  }

  /**
   * Genera numero fattura progressivo
   */
  static async generateInvoiceNumber(): Promise<string> {
    try {
      const currentYear = new Date().getFullYear();
      
      // Ottieni l'ultima fattura dell'anno corrente
      const { data: lastInvoice, error } = await supabase
        .from('invoices')
        .select('invoice_number')
        .like('invoice_number', `INV-${currentYear}-%`)
        .order('invoice_number', { ascending: false })
        .limit(1);

      if (error) {
        throw new Error(`Errore nella generazione del numero fattura: ${error.message}`);
      }

      let nextNumber = 1;
      
      if (lastInvoice && lastInvoice.length > 0) {
        const lastNumber = lastInvoice[0].invoice_number;
        const match = lastNumber?.match(/INV-\d{4}-(\d+)/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
        }
      }

      return `INV-${currentYear}-${nextNumber.toString().padStart(3, '0')}`;
    } catch (error) {
      console.error('Errore in generateInvoiceNumber:', error);
      // Fallback: usa timestamp
      const timestamp = Date.now().toString().slice(-6);
      const currentYear = new Date().getFullYear();
      return `INV-${currentYear}-${timestamp}`;
    }
  }

  /**
   * Calcola totale fattura con tasse
   */
  static calculateInvoiceTotal(subtotal: number, taxRate: number = 22): {
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    total: number;
  } {
    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount;

    return {
      subtotal,
      taxRate,
      taxAmount: Math.round(taxAmount * 100) / 100,
      total: Math.round(total * 100) / 100
    };
  }

  /**
   * Ottieni ricavi per mese (per grafici)
   */
  static async getMonthlyRevenue(year: number = new Date().getFullYear()): Promise<Array<{
    month: number;
    revenue: number;
    invoiceCount: number;
  }>> {
    try {
      const { data: invoices, error } = await supabase
        .from('invoices')
        .select('issue_date, total, status')
        .gte('issue_date', `${year}-01-01`)
        .lte('issue_date', `${year}-12-31`)
        .eq('status', 'paid');

      if (error) {
        throw new Error(`Errore nel recupero dei ricavi mensili: ${error.message}`);
      }

      // Raggruppa per mese
      const monthlyData: { [key: number]: { revenue: number; count: number } } = {};
      
      // Inizializza tutti i mesi
      for (let i = 1; i <= 12; i++) {
        monthlyData[i] = { revenue: 0, count: 0 };
      }

      invoices?.forEach(invoice => {
        const month = new Date(invoice.issue_date).getMonth() + 1;
        monthlyData[month].revenue += invoice.total || 0;
        monthlyData[month].count += 1;
      });

      return Object.entries(monthlyData).map(([month, data]) => ({
        month: parseInt(month),
        revenue: data.revenue,
        invoiceCount: data.count
      }));
    } catch (error) {
      console.error('Errore in getMonthlyRevenue:', error);
      throw error;
    }
  }
}

export default InvoiceService;