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

    const skip = (page - 1) * limit;

    // Costruzione dei filtri per Prisma
    const where: Prisma.InvoiceWhereInput = {};

    if (filters.search) {
      where.OR = [
        { invoiceNumber: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { patient: {
          OR: [
            { firstName: { contains: filters.search, mode: 'insensitive' } },
            { lastName: { contains: filters.search, mode: 'insensitive' } },
            { fiscalCode: { contains: filters.search, mode: 'insensitive' } },
          ]
        }},
      ];
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.patientId) {
      where.patientId = filters.patientId;
    }

    if (filters.dateFrom || filters.dateTo) {
      where.issueDate = {};
      if (filters.dateFrom) {
        where.issueDate.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.issueDate.lte = filters.dateTo;
      }
    }

    if (filters.amountFrom || filters.amountTo) {
      where.total = {};
      if (filters.amountFrom) {
        where.total.gte = filters.amountFrom;
      }
      if (filters.amountTo) {
        where.total.lte = filters.amountTo;
      }
    }

    // Esecuzione query con conteggio totale
    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              fiscalCode: true,
            },
          },
        },
      }),
      prisma.invoice.count({ where }),
    ]);

    return {
      invoices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Recupera una fattura per ID con dati del paziente
   */
  static async getInvoiceById(id: string): Promise<InvoiceWithPatient | null> {
    return await prisma.invoice.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            fiscalCode: true,
          },
        },
      },
    });
  }

  /**
   * Crea una nuova fattura
   */
  static async createInvoice(data: CreateInvoiceData): Promise<Invoice> {
    // Genera automaticamente il numero fattura se non fornito
    if (!data.invoiceNumber) {
      const lastInvoice = await prisma.invoice.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { invoiceNumber: true },
      });

      const year = new Date().getFullYear();
      let nextNumber = 1;

      if (lastInvoice?.invoiceNumber) {
        const match = lastInvoice.invoiceNumber.match(/(\d+)$/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
        }
      }

      data.invoiceNumber = `${year}-${nextNumber.toString().padStart(4, '0')}`;
    }

    return await prisma.invoice.create({
      data,
    });
  }

  /**
   * Aggiorna una fattura esistente
   */
  static async updateInvoice(id: string, data: UpdateInvoiceData): Promise<Invoice> {
    return await prisma.invoice.update({
      where: { id },
      data,
    });
  }

  /**
   * Elimina una fattura
   */
  static async deleteInvoice(id: string): Promise<void> {
    await prisma.invoice.delete({
      where: { id },
    });
  }

  /**
   * Marca una fattura come pagata
   */
  static async markAsPaid(
    id: string, 
    paymentMethod: string, 
    paymentDate: Date = new Date()
  ): Promise<Invoice> {
    return await prisma.invoice.update({
      where: { id },
      data: {
        status: 'paid',
        paymentMethod,
        paymentDate,
      },
    });
  }

  /**
   * Ottieni statistiche delle fatture
   */
  static async getInvoiceStats(year?: number) {
    const currentYear = year || new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

    const [
      totalInvoices,
      paidInvoices,
      overdueInvoices,
      totalRevenue,
      pendingRevenue,
    ] = await Promise.all([
      prisma.invoice.count({
        where: {
          issueDate: { gte: startOfYear, lte: endOfYear },
        },
      }),
      prisma.invoice.count({
        where: {
          status: 'paid',
          issueDate: { gte: startOfYear, lte: endOfYear },
        },
      }),
      prisma.invoice.count({
        where: {
          status: { in: ['sent', 'overdue'] },
          dueDate: { lt: new Date() },
        },
      }),
      prisma.invoice.aggregate({
        where: {
          status: 'paid',
          issueDate: { gte: startOfYear, lte: endOfYear },
        },
        _sum: { total: true },
      }),
      prisma.invoice.aggregate({
        where: {
          status: { in: ['draft', 'sent'] },
          issueDate: { gte: startOfYear, lte: endOfYear },
        },
        _sum: { total: true },
      }),
    ]);

    return {
      totalInvoices,
      paidInvoices,
      overdueInvoices,
      totalRevenue: totalRevenue._sum.total || 0,
      pendingRevenue: pendingRevenue._sum.total || 0,
      paymentRate: totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0,
    };
  }

  /**
   * Ottieni fatture in scadenza
   */
  static async getUpcomingDueInvoices(days = 7): Promise<InvoiceWithPatient[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return await prisma.invoice.findMany({
      where: {
        status: { in: ['sent'] },
        dueDate: {
          gte: new Date(),
          lte: futureDate,
        },
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            fiscalCode: true,
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    });
  }
}

export default InvoiceService;
