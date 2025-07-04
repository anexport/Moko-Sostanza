/**
 * MOKO SOSTANZA Dental CRM - Invoice Service
 * 
 * Servizio per la gestione delle fatture
 * Currently using mock data - will be connected to database later
 */

import { type Invoice } from '../db/client';

// Tipi per le operazioni sulle fatture
export type CreateInvoiceData = Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateInvoiceData = Partial<CreateInvoiceData>;

export interface InvoiceWithPatient extends Invoice {
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    fiscalCode: string | null;
  };
}

// Mock data for development
const mockInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2023-001',
    issueDate: new Date('2023-05-15'),
    dueDate: new Date('2023-06-15'),
    subtotal: 150.00,
    taxRate: 22.00,
    taxAmount: 33.00,
    total: 183.00,
    status: 'paid',
    paymentMethod: 'card',
    paymentDate: new Date('2023-05-20'),
    patientId: '1',
    description: 'Pulizia dentale e controllo',
    notes: 'Pagamento ricevuto',
    createdAt: new Date('2023-05-15'),
    updatedAt: new Date('2023-05-20'),
  },
  {
    id: '2',
    invoiceNumber: 'INV-2023-002',
    issueDate: new Date('2023-06-10'),
    dueDate: new Date('2023-07-10'),
    subtotal: 300.00,
    taxRate: 22.00,
    taxAmount: 66.00,
    total: 366.00,
    status: 'sent',
    paymentMethod: undefined,
    paymentDate: undefined,
    patientId: '2',
    description: 'Otturazione dente 36',
    notes: 'In attesa di pagamento',
    createdAt: new Date('2023-06-10'),
    updatedAt: new Date('2023-06-10'),
  },
];

export interface InvoiceSearchFilters {
  search?: string;
  status?: string;
  patientId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  amountFrom?: number;
  amountTo?: number;
}

export interface InvoicePaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: keyof Invoice;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Servizio per la gestione completa delle fatture
 */
export class InvoiceService {
  /**
   * Recupera tutte le fatture con paginazione e filtri
   */
  static async getInvoices(
    filters: InvoiceSearchFilters = {},
    pagination: InvoicePaginationOptions = {}
  ) {
    const {
      page = 1,
      limit = 20,
      sortBy = 'issueDate',
      sortOrder = 'desc'
    } = pagination;

    // Mock implementation - filter and paginate mockInvoices
    let filteredInvoices = [...mockInvoices];

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredInvoices = filteredInvoices.filter(invoice =>
        invoice.invoiceNumber.toLowerCase().includes(searchTerm) ||
        invoice.description?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply other filters
    if (filters.status) {
      filteredInvoices = filteredInvoices.filter(invoice => invoice.status === filters.status);
    }

    if (filters.patientId) {
      filteredInvoices = filteredInvoices.filter(invoice => invoice.patientId === filters.patientId);
    }

    if (filters.dateFrom) {
      filteredInvoices = filteredInvoices.filter(invoice => invoice.issueDate >= filters.dateFrom!);
    }

    if (filters.dateTo) {
      filteredInvoices = filteredInvoices.filter(invoice => invoice.issueDate <= filters.dateTo!);
    }

    if (filters.amountFrom) {
      filteredInvoices = filteredInvoices.filter(invoice => invoice.total >= filters.amountFrom!);
    }

    if (filters.amountTo) {
      filteredInvoices = filteredInvoices.filter(invoice => invoice.total <= filters.amountTo!);
    }

    // Apply pagination
    const skip = (page - 1) * limit;
    const paginatedInvoices = filteredInvoices.slice(skip, skip + limit);

    return {
      invoices: paginatedInvoices,
      pagination: {
        page,
        limit,
        total: filteredInvoices.length,
        totalPages: Math.ceil(filteredInvoices.length / limit),
        hasNext: page * limit < filteredInvoices.length,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Recupera una fattura per ID con dati del paziente
   */
  static async getInvoiceById(id: string): Promise<InvoiceWithPatient | null> {
    const invoice = mockInvoices.find(inv => inv.id === id);
    if (!invoice) return null;

    // Mock patient data for the invoice
    const mockPatient = {
      id: invoice.patientId,
      firstName: invoice.patientId === '1' ? 'Mario' : 'Giulia',
      lastName: invoice.patientId === '1' ? 'Rossi' : 'Bianchi',
      email: invoice.patientId === '1' ? 'mario.rossi@example.com' : 'giulia.bianchi@example.com',
      fiscalCode: invoice.patientId === '1' ? 'RSSMRA80E15H501X' : 'BNCGLI92M62F205Y',
    };

    return {
      ...invoice,
      patient: mockPatient,
    };
  }

  /**
   * Crea una nuova fattura
   */
  static async createInvoice(data: CreateInvoiceData): Promise<Invoice> {
    // Generate invoice number if not provided
    if (!data.invoiceNumber) {
      const year = new Date().getFullYear();
      const nextNumber = mockInvoices.length + 1;
      data.invoiceNumber = `INV-${year}-${nextNumber.toString().padStart(3, '0')}`;
    }

    const newInvoice: Invoice = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockInvoices.push(newInvoice);
    return newInvoice;
  }

  /**
   * Aggiorna una fattura esistente
   */
  static async updateInvoice(id: string, data: UpdateInvoiceData): Promise<Invoice> {
    const invoiceIndex = mockInvoices.findIndex(inv => inv.id === id);
    if (invoiceIndex === -1) throw new Error('Invoice not found');
    
    mockInvoices[invoiceIndex] = {
      ...mockInvoices[invoiceIndex],
      ...data,
      updatedAt: new Date(),
    };
    
    return mockInvoices[invoiceIndex];
  }

  /**
   * Elimina una fattura
   */
  static async deleteInvoice(id: string): Promise<void> {
    const invoiceIndex = mockInvoices.findIndex(inv => inv.id === id);
    if (invoiceIndex === -1) throw new Error('Invoice not found');
    
    mockInvoices.splice(invoiceIndex, 1);
  }

  /**
   * Marca una fattura come pagata
   */
  static async markAsPaid(
    id: string, 
    paymentMethod: string, 
    paymentDate: Date = new Date()
  ): Promise<Invoice> {
    const invoiceIndex = mockInvoices.findIndex(inv => inv.id === id);
    if (invoiceIndex === -1) throw new Error('Invoice not found');
    
    mockInvoices[invoiceIndex] = {
      ...mockInvoices[invoiceIndex],
      status: 'paid',
      paymentMethod,
      paymentDate,
      updatedAt: new Date(),
    };
    
    return mockInvoices[invoiceIndex];
  }

  /**
   * Ottieni statistiche delle fatture
   */
  static async getInvoiceStats(year?: number) {
    const currentYear = year || new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

    // Filter invoices by year
    const yearInvoices = mockInvoices.filter(invoice => 
      invoice.issueDate >= startOfYear && invoice.issueDate <= endOfYear
    );

    const totalInvoices = yearInvoices.length;
    const paidInvoices = yearInvoices.filter(inv => inv.status === 'paid').length;
    const overdueInvoices = mockInvoices.filter(inv => 
      ['sent', 'overdue'].includes(inv.status) && inv.dueDate < new Date()
    ).length;
    
    const totalRevenue = yearInvoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total, 0);
      
    const pendingRevenue = yearInvoices
      .filter(inv => ['draft', 'sent'].includes(inv.status))
      .reduce((sum, inv) => sum + inv.total, 0);

    return {
      totalInvoices,
      paidInvoices,
      overdueInvoices,
      totalRevenue,
      pendingRevenue,
      paymentRate: totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0,
    };
  }

  /**
   * Ottieni fatture in scadenza
   */
  static async getUpcomingDueInvoices(days = 7): Promise<InvoiceWithPatient[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    const upcomingInvoices = mockInvoices.filter(invoice => 
      invoice.status === 'sent' &&
      invoice.dueDate >= new Date() &&
      invoice.dueDate <= futureDate
    );

    // Add mock patient data to each invoice
    return upcomingInvoices.map(invoice => ({
      ...invoice,
      patient: {
        id: invoice.patientId,
        firstName: invoice.patientId === '1' ? 'Mario' : 'Giulia',
        lastName: invoice.patientId === '1' ? 'Rossi' : 'Bianchi',
        email: invoice.patientId === '1' ? 'mario.rossi@example.com' : 'giulia.bianchi@example.com',
        fiscalCode: invoice.patientId === '1' ? 'RSSMRA80E15H501X' : 'BNCGLI92M62F205Y',
      },
    }));
  }
}

export default InvoiceService;
