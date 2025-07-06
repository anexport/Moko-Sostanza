-- 🏥 MOKO SOSTANZA Dental CRM - Database Seed File
-- This file contains sample data for local development
-- Run with: supabase db reset

-- Clear existing data
TRUNCATE TABLE public.invoices CASCADE;
TRUNCATE TABLE public.appointments CASCADE;
TRUNCATE TABLE public.treatments CASCADE;
TRUNCATE TABLE public.doctors CASCADE;
TRUNCATE TABLE public.patients CASCADE;

-- Reset sequences
ALTER SEQUENCE IF EXISTS doctors_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS patients_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS treatments_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS appointments_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS invoices_id_seq RESTART WITH 1;

-- Insert Doctors
INSERT INTO public.doctors (id, name, specialization, color, phone, email, created_at, updated_at) VALUES 
('1', 'Dr. Mario Rossi', 'Ortodonzia', '#FF5733', NULL, NULL, '2025-07-04 11:57:29.178605+00', '2025-07-04 11:57:29.178605+00'),
('2', 'Dr. Anna Verdi', 'Endodonzia', '#33FF57', NULL, NULL, '2025-07-04 11:57:29.178605+00', '2025-07-04 11:57:29.178605+00'),
('3', 'Dr. Luca Bianchi', 'Chirurgia Orale', '#3357FF', NULL, NULL, '2025-07-04 11:57:29.178605+00', '2025-07-04 11:57:29.178605+00'),
('4', 'Dr. Sara Neri', 'Igiene Dentale', '#FF33F5', NULL, NULL, '2025-07-04 11:57:29.178605+00', '2025-07-04 11:57:29.178605+00');

-- Insert Patients
INSERT INTO public.patients (id, first_name, last_name, phone, email, date_of_birth, gender, address, created_at, updated_at) VALUES 
('1', 'Mario', 'Rossi', '+39 123 456 7890', 'mario.rossi@email.com', '1980-05-15', 'M', 'Via Roma 123, Milano', '2025-07-04 11:57:29.178605+00', '2025-07-04 11:57:29.178605+00'),
('2', 'Giulia', 'Bianchi', '+39 987 654 3210', 'giulia.bianchi@email.com', '1985-09-22', 'F', 'Via Garibaldi 456, Roma', '2025-07-04 11:57:29.178605+00', '2025-07-04 11:57:29.178605+00');

-- Insert Treatments
INSERT INTO public.treatments (id, name, duration, price, category, description, created_at, updated_at) VALUES 
('1', 'Visita di Controllo', 30, 50.00, 'Prevenzione', 'Controllo generale dello stato di salute dentale', '2025-07-04 11:57:29.178605+00', '2025-07-04 11:57:29.178605+00'),
('2', 'Pulizia Dentale', 45, 80.00, 'Igiene', 'Rimozione del tartaro e pulizia professionale', '2025-07-04 11:57:29.178605+00', '2025-07-04 11:57:29.178605+00'),
('3', 'Otturazione', 60, 120.00, 'Conservativa', 'Otturazione di carie con materiale composito', '2025-07-04 11:57:29.178605+00', '2025-07-04 11:57:29.178605+00'),
('4', 'Estrazione', 45, 100.00, 'Chirurgia', 'Estrazione di dente non recuperabile', '2025-07-04 11:57:29.178605+00', '2025-07-04 11:57:29.178605+00'),
('5', 'Devitalizzazione', 90, 300.00, 'Endodonzia', 'Trattamento endodontico per salvare il dente', '2025-07-04 11:57:29.178605+00', '2025-07-04 11:57:29.178605+00'),
('6', 'Impianto Dentale', 120, 800.00, 'Implantologia', 'Inserimento di impianto dentale in titanio', '2025-07-04 11:57:29.178605+00', '2025-07-04 11:57:29.178605+00'),
('7', 'Ortodonzia Mobile', 30, 200.00, 'Ortodonzia', 'Applicazione di apparecchio ortodontico mobile', '2025-07-04 11:57:29.178605+00', '2025-07-04 11:57:29.178605+00'),
('8', 'Sbiancamento', 60, 250.00, 'Estetica', 'Sbiancamento professionale dei denti', '2025-07-04 11:57:29.178605+00', '2025-07-04 11:57:29.178605+00');

-- Insert Sample Appointments
INSERT INTO public.appointments (id, patient_id, doctor_id, treatment_id, appointment_date, appointment_time, duration, status, notes, created_at, updated_at) VALUES 
('1', '1', '1', '1', '2025-07-08', '09:00:00', 30, 'scheduled', 'Controllo di routine', '2025-07-04 11:57:29.178605+00', '2025-07-04 11:57:29.178605+00'),
('2', '2', '2', '2', '2025-07-09', '10:30:00', 45, 'scheduled', 'Pulizia semestrale', '2025-07-04 11:57:29.178605+00', '2025-07-04 11:57:29.178605+00'),
('3', '1', '3', '3', '2025-07-10', '14:00:00', 60, 'scheduled', 'Otturazione molare superiore', '2025-07-04 11:57:29.178605+00', '2025-07-04 11:57:29.178605+00'),
('4', '2', '4', '8', '2025-07-11', '16:00:00', 60, 'scheduled', 'Sbiancamento estetico', '2025-07-04 11:57:29.178605+00', '2025-07-04 11:57:29.178605+00');

-- Insert Sample Invoices
INSERT INTO public.invoices (id, patient_id, invoice_number, issue_date, due_date, subtotal, tax_rate, tax_amount, total, status, payment_method, payment_date, description, created_at, updated_at) VALUES 
('1', '1', 'INV-2025-002', '2025-07-04', '2025-07-19', 100.00, 22.00, 22.00, 122.00, 'draft', NULL, NULL, 'Visita di controllo e pulizia dentale', '2025-07-04 11:57:29.178605+00', '2025-07-04 11:57:29.178605+00'),
('2', '2', 'INV-2025-003', '2025-07-04', '2025-07-19', 250.00, 22.00, 55.00, 305.00, 'paid', 'Contanti', '2025-07-04', 'Sbiancamento dentale professionale', '2025-07-04 11:57:29.178605+00', '2025-07-04 11:57:29.178605+00');

-- Update sequences to current max values
SELECT setval('doctors_id_seq', (SELECT MAX(id) FROM doctors));
SELECT setval('patients_id_seq', (SELECT MAX(id) FROM patients));
SELECT setval('treatments_id_seq', (SELECT MAX(id) FROM treatments));
SELECT setval('appointments_id_seq', (SELECT MAX(id) FROM appointments));
SELECT setval('invoices_id_seq', (SELECT MAX(id) FROM invoices));