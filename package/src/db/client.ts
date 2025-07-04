/**
 * MOKO SOSTANZA Dental CRM - Database Client Placeholder
 * 
 * This file will be configured for database connection when ready.
 * Currently using mock data in the application.
 */

// Placeholder - database connection will be implemented later
export const prisma = null;

// Placeholder types for future database integration
export type Patient = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: Date;
  fiscalCode?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  province?: string;
  medicalHistory?: string;
  allergies?: string;
  medications?: string;
  isSmoker: boolean;
  anamnesis?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Appointment = {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  status: string;
  appointmentType: string;
  priority: string;
  patientId: string;
  notes?: string;
  reminderSent: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Invoice = {
  id: string;
  invoiceNumber: string;
  issueDate: Date;
  dueDate: Date;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  status: string;
  paymentMethod?: string;
  paymentDate?: Date;
  patientId: string;
  description?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
};
