-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create patients table
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50) NOT NULL,
    date_of_birth DATE NOT NULL,
    fiscal_code VARCHAR(16),
    address TEXT NOT NULL,
    city VARCHAR(255) NOT NULL,
    postal_code VARCHAR(10) NOT NULL,
    province VARCHAR(5) NOT NULL,
    medical_history TEXT NOT NULL,
    allergies TEXT,
    medications TEXT,
    is_smoker BOOLEAN DEFAULT false,
    anamnesis TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create doctors table
CREATE TABLE doctors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    specialization VARCHAR(255) NOT NULL,
    color VARCHAR(7) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create treatments table
CREATE TABLE treatments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    duration INTEGER NOT NULL, -- in minutes
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create appointments table
CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    treatment_id INTEGER NOT NULL REFERENCES treatments(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'in attesa' CHECK (status IN ('confermato', 'in attesa', 'cancellato', 'completato')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create invoices table
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    tax_rate DECIMAL(5,2) NOT NULL,
    tax_amount DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue')),
    payment_method VARCHAR(50),
    payment_date DATE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create dental_procedures table
CREATE TABLE dental_procedures (
    id SERIAL PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('surgical', 'non-surgical')),
    procedure_type VARCHAR(255), -- for surgical procedures
    description TEXT, -- for non-surgical procedures
    teeth_involved INTEGER[], -- FDI tooth numbering
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create medical_devices table
CREATE TABLE medical_devices (
    id SERIAL PRIMARY KEY,
    procedure_id INTEGER NOT NULL REFERENCES dental_procedures(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    use_date DATE NOT NULL,
    udi_code VARCHAR(255), -- UDI compliance
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create patient_events table
CREATE TABLE patient_events (
    id SERIAL PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time TIME NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('visita', 'prescrizione', 'analisi', 'nota', 'altro')),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create event_attachments table
CREATE TABLE event_attachments (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES patient_events(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL, -- MIME type
    size INTEGER NOT NULL, -- file size in bytes
    url TEXT NOT NULL,
    upload_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reminders table
CREATE TABLE reminders (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    time TIME NOT NULL,
    title VARCHAR(255) NOT NULL,
    text TEXT NOT NULL,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    description TEXT,
    quantity INTEGER NOT NULL,
    unit VARCHAR(50) NOT NULL,
    min_quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    supplier VARCHAR(255),
    location VARCHAR(255),
    notes TEXT,
    last_order DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_patients_name ON patients(first_name, last_name);
CREATE INDEX idx_patients_email ON patients(email);
CREATE INDEX idx_patients_phone ON patients(phone);
CREATE INDEX idx_appointments_date ON appointments(date);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_invoices_patient ON invoices(patient_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_dental_procedures_patient ON dental_procedures(patient_id);
CREATE INDEX idx_patient_events_patient ON patient_events(patient_id);
CREATE INDEX idx_patient_events_date ON patient_events(date);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_quantity ON products(quantity);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON doctors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_treatments_updated_at BEFORE UPDATE ON treatments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dental_procedures_updated_at BEFORE UPDATE ON dental_procedures FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medical_devices_updated_at BEFORE UPDATE ON medical_devices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patient_events_updated_at BEFORE UPDATE ON patient_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_event_attachments_updated_at BEFORE UPDATE ON event_attachments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reminders_updated_at BEFORE UPDATE ON reminders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO doctors (name, specialization, color) VALUES
('Dr. Mario Rossi', 'Ortodonzia', '#FF5733'),
('Dr. Anna Verdi', 'Endodonzia', '#33FF57'),
('Dr. Luca Bianchi', 'Chirurgia Orale', '#3357FF'),
('Dr. Sara Neri', 'Igiene Dentale', '#FF33F5');

INSERT INTO treatments (name, duration, price, category) VALUES
('Visita di Controllo', 30, 50.00, 'Prevenzione'),
('Pulizia Dentale', 45, 80.00, 'Igiene'),
('Otturazione', 60, 120.00, 'Conservativa'),
('Estrazione', 45, 100.00, 'Chirurgia'),
('Devitalizzazione', 90, 300.00, 'Endodonzia'),
('Impianto Dentale', 120, 800.00, 'Implantologia'),
('Ortodonzia Mobile', 30, 200.00, 'Ortodonzia'),
('Sbiancamento', 60, 250.00, 'Estetica');

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
    year_part TEXT;
    seq_part TEXT;
BEGIN
    year_part := EXTRACT(YEAR FROM NOW())::TEXT;
    seq_part := LPAD(NEXTVAL('invoice_number_seq')::TEXT, 4, '0');
    RETURN 'INV-' || year_part || '-' || seq_part;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for invoice numbers
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1;

-- Row Level Security (RLS) setup
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE dental_procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policies (basic authenticated user access)
CREATE POLICY "Users can view all patients" ON patients FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert patients" ON patients FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update patients" ON patients FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Users can delete patients" ON patients FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view all appointments" ON appointments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert appointments" ON appointments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update appointments" ON appointments FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Users can delete appointments" ON appointments FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view all invoices" ON invoices FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert invoices" ON invoices FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update invoices" ON invoices FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Users can delete invoices" ON invoices FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view all dental_procedures" ON dental_procedures FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert dental_procedures" ON dental_procedures FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update dental_procedures" ON dental_procedures FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Users can delete dental_procedures" ON dental_procedures FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view all patient_events" ON patient_events FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert patient_events" ON patient_events FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update patient_events" ON patient_events FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Users can delete patient_events" ON patient_events FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view all event_attachments" ON event_attachments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert event_attachments" ON event_attachments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update event_attachments" ON event_attachments FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Users can delete event_attachments" ON event_attachments FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view all reminders" ON reminders FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert reminders" ON reminders FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update reminders" ON reminders FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Users can delete reminders" ON reminders FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view all products" ON products FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert products" ON products FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update products" ON products FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Users can delete products" ON products FOR DELETE USING (auth.role() = 'authenticated');