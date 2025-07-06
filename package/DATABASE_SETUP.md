# 🏥 MOKO SOSTANZA - Database Setup

This guide will help you set up the same local database with identical data.

## Prerequisites

- Node.js and npm installed
- Supabase CLI installed (`npm install -g @supabase/cli`)

## Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd package
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start Supabase locally**
   ```bash
   supabase start
   ```
   
   This will:
   - Start the local Supabase instance
   - Create the database schema
   - Load sample data from `supabase/seed.sql`
   - **Display the local credentials** (copy these!)

4. **Create .env file**
   After `supabase start` completes, it will show you the local credentials. Create a `.env` file in the project root: (package folder)
   ```bash
   # Create .env file with the credentials shown by supabase start
   cat > .env << 'EOF'
   VITE_SUPABASE_URL=http://127.0.0.1:54321
   VITE_SUPABASE_ANON_KEY=<copy-the-anon-key-from-supabase-start-output>
   EOF
   ```

5. **Verify the setup**
   - Open Supabase Studio: http://localhost:54323
   - Check that you have:
     - 4 doctors (Dr. Mario Rossi, Dr. Anna Verdi, Dr. Luca Bianchi, Dr. Sara Neri)
     - 2 patients (Mario Rossi, Giulia Bianchi)
     - 8 treatments (from Visita di Controllo to Sbiancamento)
     - 4 appointments
     - 2 invoices

5. **Start the frontend**
   ```bash
   npm run dev
   ```

## Database Information

- **Studio URL**: http://localhost:54323
- **API URL**: http://localhost:54321
- **Database URL**: postgresql://postgres:postgres@localhost:54322/postgres

## Sample Data Included

### Doctors (4)
- Dr. Mario Rossi (Ortodonzia)
- Dr. Anna Verdi (Endodonzia)
- Dr. Luca Bianchi (Chirurgia Orale)
- Dr. Sara Neri (Igiene Dentale)

### Patients (2)
- Mario Rossi
- Giulia Bianchi

### Treatments (8)
- Visita di Controllo (€50)
- Pulizia Dentale (€80)
- Otturazione (€120)
- Estrazione (€100)
- Devitalizzazione (€300)
- Impianto Dentale (€800)
- Ortodonzia Mobile (€200)
- Sbiancamento (€250)

### Appointments (4)
- Various scheduled appointments for the coming days

### Invoices (2)
- INV-2025-002: Mario Rossi, €122 (draft)
- INV-2025-003: Giulia Bianchi, €305 (paid)

## Troubleshooting

If you encounter issues:

1. **Reset the database**
   ```bash
   supabase db reset
   ```

2. **Check logs**
   ```bash
   supabase status
   ```

3. **Verify seed data**
   ```bash
   supabase db seed
   ```

## Making Changes

- The seed file is located at `supabase/seed.sql`
- Any changes to this file will be applied when running `supabase db reset`
- The frontend connects to the local database automatically via `.env` configuration
