-- 🏥 MOKO SOSTANZA Dental CRM - Database Seed File
-- This file contains sample data for local development
-- Run with: supabase db reset

-- Clear existing data (in correct order due to foreign key constraints)
TRUNCATE TABLE public.invoices CASCADE;
TRUNCATE TABLE public.appointments CASCADE;
TRUNCATE TABLE public.treatments CASCADE;
TRUNCATE TABLE public.doctors CASCADE;
TRUNCATE TABLE public.patients CASCADE;
TRUNCATE TABLE public.reminders CASCADE;

-- Reset sequences
ALTER SEQUENCE IF EXISTS doctors_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS treatments_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS appointments_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS reminders_id_seq RESTART WITH 1;

-- Insert Doctors
INSERT INTO public.doctors (name, specialization, color, phone, email, created_at, updated_at) VALUES 
('Dr. Mario Rossi', 'Ortodonzia', '#FF5733', '+39 123 456 7890', 'mario.rossi@clinic.com', now(), now()),
('Dr. Anna Verdi', 'Endodonzia', '#33FF57', '+39 987 654 3210', 'anna.verdi@clinic.com', now(), now()),
('Dr. Luca Bianchi', 'Chirurgia Orale', '#3357FF', '+39 555 123 4567', 'luca.bianchi@clinic.com', now(), now()),
('Dr. Sara Neri', 'Igiene Dentale', '#FF33F5', '+39 333 987 6543', 'sara.neri@clinic.com', now(), now());

-- Insert Patients (using UUID for id as per schema)
INSERT INTO public.patients (id, first_name, last_name, phone, email, date_of_birth, address, city, postal_code, province, medical_history, anamnesis, created_at, updated_at) VALUES 
(gen_random_uuid(), 'Mario', 'Rossi', '+39 123 456 7890', 'mario.rossi@email.com', '1980-05-15', 'Via Roma 123', 'Milano', '20100', 'MI', 'Nessuna patologia significativa', 'Paziente in buona salute generale', now(), now()),
(gen_random_uuid(), 'Giulia', 'Bianchi', '+39 987 654 3210', 'giulia.bianchi@email.com', '1985-09-22', 'Via Garibaldi 456', 'Roma', '00100', 'RM', 'Allergia a penicillina', 'Paziente con allergie farmacologiche', now(), now()),
(gen_random_uuid(), 'Francesca', 'Neri', '+39 555 111 2222', 'francesca.neri@email.com', '1990-03-10', 'Via Dante 789', 'Napoli', '80100', 'NA', 'Diabete tipo 2', 'Paziente diabetico sotto controllo', now(), now()),
(gen_random_uuid(), 'Giuseppe', 'Verdi', '+39 333 444 5555', 'giuseppe.verdi@email.com', '1975-11-30', 'Corso Italia 321', 'Torino', '10100', 'TO', 'Ipertensione', 'Paziente iperteso in terapia', now(), now());

-- Insert Treatments
INSERT INTO public.treatments (name, duration, price, category, description, created_at, updated_at) VALUES 
('Visita di Controllo', 30, 50.00, 'Prevenzione', 'Controllo generale dello stato di salute dentale', now(), now()),
('Pulizia Dentale', 45, 80.00, 'Igiene', 'Rimozione del tartaro e pulizia professionale', now(), now()),
('Otturazione', 60, 120.00, 'Conservativa', 'Otturazione di carie con materiale composito', now(), now()),
('Estrazione', 45, 100.00, 'Chirurgia', 'Estrazione di dente non recuperabile', now(), now()),
('Devitalizzazione', 90, 300.00, 'Endodonzia', 'Trattamento endodontico per salvare il dente', now(), now()),
('Impianto Dentale', 120, 800.00, 'Implantologia', 'Inserimento di impianto dentale in titanio', now(), now()),
('Ortodonzia Mobile', 30, 200.00, 'Ortodonzia', 'Applicazione di apparecchio ortodontico mobile', now(), now()),
('Sbiancamento', 60, 250.00, 'Estetica', 'Sbiancamento professionale dei denti', now(), now());

-- Insert Sample Appointments (using correct column names)
INSERT INTO public.appointments (patient_id, doctor_id, treatment_id, date, start_time, end_time, status, notes, created_at, updated_at) VALUES 
((SELECT id FROM patients WHERE first_name = 'Mario' AND last_name = 'Rossi'), 1, 1, '2025-07-08', '09:00', '09:30', 'confermato', 'Controllo di routine', now(), now()),
((SELECT id FROM patients WHERE first_name = 'Giulia' AND last_name = 'Bianchi'), 2, 2, '2025-07-09', '10:30', '11:15', 'confermato', 'Pulizia semestrale', now(), now()),
((SELECT id FROM patients WHERE first_name = 'Mario' AND last_name = 'Rossi'), 3, 3, '2025-07-10', '14:00', '15:00', 'confermato', 'Otturazione molare superiore', now(), now()),
((SELECT id FROM patients WHERE first_name = 'Giulia' AND last_name = 'Bianchi'), 4, 8, '2025-07-11', '16:00', '17:00', 'confermato', 'Sbiancamento estetico', now(), now()),
((SELECT id FROM patients WHERE first_name = 'Francesca' AND last_name = 'Neri'), 1, 5, '2025-07-12', '09:00', '10:30', 'in attesa', 'Devitalizzazione premolare', now(), now()),
((SELECT id FROM patients WHERE first_name = 'Giuseppe' AND last_name = 'Verdi'), 2, 4, '2025-07-15', '11:00', '11:45', 'confermato', 'Estrazione dente del giudizio', now(), now());

-- Insert Sample Invoices
INSERT INTO public.invoices (id, patient_id, invoice_number, issue_date, due_date, subtotal, tax_rate, tax_amount, total, status, payment_method, payment_date, description, created_at, updated_at) VALUES 
(gen_random_uuid(), (SELECT id FROM patients WHERE first_name = 'Mario' AND last_name = 'Rossi'), 'INV-2025-002', '2025-07-04', '2025-07-19', 100.00, 22.00, 22.00, 122.00, 'draft', NULL, NULL, 'Visita di controllo e pulizia dentale', now(), now()),
(gen_random_uuid(), (SELECT id FROM patients WHERE first_name = 'Giulia' AND last_name = 'Bianchi'), 'INV-2025-003', '2025-07-04', '2025-07-19', 250.00, 22.00, 55.00, 305.00, 'paid', 'Contanti', '2025-07-04', 'Sbiancamento dentale professionale', now(), now());

-- Insert Sample Reminders
INSERT INTO public.reminders (date, time, title, text, completed, created_at, updated_at) VALUES 
('2025-07-08', '08:30', 'Preparazione sala operatoria', 'Preparare la sala per l''intervento di ortodonzia delle 09:00', false, now(), now()),
('2025-07-09', '10:00', 'Controllo scorte', 'Verificare le scorte di materiali per pulizia dentale', false, now(), now()),
('2025-07-10', '13:30', 'Chiamata paziente', 'Richiamare il paziente per conferma appuntamento', false, now(), now());