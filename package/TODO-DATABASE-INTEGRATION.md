# 🏥 MOKO SOSTANZA - Database Integration TODO

**Project Status**: Supabase backend implemented, PatientService ✅ complete
**Goal**: Replace ALL mock data with real Supabase database integration

---

## 🔥 PHASE 1: CRITICAL SERVICE LAYER (HIGH PRIORITY)

### ⚠️ 1. Create Missing Core Services
**These services are referenced but don't exist - needed immediately**

- [ ] **DoctorService.ts** - MISSING BUT CRITICAL
  - Create complete CRUD service for doctors table
  - Methods: getDoctors(), getDoctorById(), createDoctor(), updateDoctor(), deleteDoctor()
  - Used by: AppointmentService, Appointments.tsx
  - **Complexity**: Medium (similar to PatientService)

- [ ] **TreatmentService.ts** - MISSING BUT CRITICAL  
  - Create complete CRUD service for treatments table
  - Methods: getTreatments(), getTreatmentById(), createTreatment(), updateTreatment(), deleteTreatment()
  - Used by: AppointmentService, Appointments.tsx
  - **Complexity**: Medium (similar to PatientService)

### ⚠️ 2. Rewrite Core Services (HIGH PRIORITY)

- [ ] **AppointmentService.ts** - COMPLETE REWRITE NEEDED
  - **Current**: Zustand store with mock data
  - **Target**: Supabase service class like PatientService
  - **Changes**: 
    - Replace `useAppointmentStore` with database calls
    - Implement appointment CRUD with patient/doctor/treatment joins
    - Update type definitions to match database schema
    - Add calendar/date filtering capabilities
  - **Complexity**: High (most complex due to relationships)
  - **Blocks**: Appointments.tsx, Calendar.tsx, Dashboard.tsx

- ✅ **InvoiceService.ts** - COMPLETE DATABASE INTEGRATION ✅
  - **Status**: Fully integrated with Supabase database
  - **Features**:
    - ✅ Complete CRUD operations with patient relationships
    - ✅ Database field mappings (camelCase → snake_case)
    - ✅ Automatic invoice number generation (INV-YYYY-001)
    - ✅ Payment status tracking and due date monitoring
    - ✅ Revenue statistics and monthly reporting
    - ✅ Tax calculations and totals
  - **API Tested**: ✅ Successfully creates invoices via Supabase
  - **Ready for**: Billing.tsx update and Dashboard revenue integration

- [ ] **DentalProcedureService.ts** - CONVERT FROM ZUSTAND
  - **Current**: Zustand store with mock procedure generation  
  - **Target**: Database service for dental procedures and medical devices
  - **Changes**:
    - Convert Zustand store to service class
    - Implement procedure-device relationships
    - Handle teeth involvement arrays
    - Add UDI compliance for medical devices
  - **Complexity**: Medium-High
  - **Blocks**: DentalProcedureList.tsx, patient procedure history

- [ ] **PatientEventService.ts** - CONVERT FROM ZUSTAND
  - **Current**: Zustand store with mock events
  - **Target**: Database service for patient events and attachments
  - **Changes**:
    - Convert Zustand store to service class  
    - Implement event-attachment relationships
    - Add file upload handling (Supabase Storage)
    - Update event type filtering
  - **Complexity**: Medium-High (file handling complexity)
  - **Blocks**: Patient history, event modals

---

## 🔶 PHASE 2: SECONDARY SERVICES (MEDIUM PRIORITY)

- [ ] **ReminderService.ts** - CONVERT FROM ZUSTAND
  - **Current**: Zustand store with mock reminders
  - **Target**: Database service for reminders/tasks
  - **Changes**: Convert store to database CRUD operations
  - **Complexity**: Low-Medium
  - **Blocks**: ReminderModal.tsx

- [ ] **ProductService.ts** - CREATE NEW SERVICE
  - **Current**: Not exists, hardcoded inventory data in components
  - **Target**: Complete product/inventory management service
  - **Changes**: Create from scratch for products table
  - **Complexity**: Medium
  - **Blocks**: Inventory.tsx, ProductRevenue.tsx

---

## 🎯 PHASE 3: CRITICAL UI COMPONENTS (HIGH PRIORITY)

### ⚠️ Main Application Views

- [ ] **Dashboard.tsx** - REPLACE ALL HARDCODED STATS
  - **Current**: Hardcoded numbers (8 appointments, 12 patients, €4,500 revenue)
  - **Target**: Real-time statistics from database
  - **Changes**:
    - Replace all hardcoded statistics with service calls
    - Connect to PatientService.getPatientStats()
    - Add appointment count from AppointmentService
    - Calculate real revenue from InvoiceService ✅ (service ready)
  - **Complexity**: Medium
  - **Dependencies**: All service updates (InvoiceService ✅ ready)

- [ ] **Appointments.tsx** - UPDATE FOR NEW SERVICE
  - **Current**: Uses old AppointmentService store
  - **Target**: Use new database-backed AppointmentService
  - **Changes**: Update all service calls and data handling
  - **Complexity**: Medium
  - **Dependencies**: AppointmentService.ts ✅, DoctorService.ts ✅, TreatmentService.ts ✅

- ✅ **Billing.tsx** - COMPLETE DATABASE INTEGRATION ✅
  - **Status**: Fully integrated with real InvoiceService data
  - **Features**:
    - ✅ Real invoice data display with patient relationships
    - ✅ Enhanced UI with loading states and error handling
    - ✅ Proper status badges and formatting
    - ✅ Search functionality with database queries
    - ✅ Live testing verified: 2 invoices displaying correctly
  - **Ready for**: Dashboard revenue integration

- ✅ **Calendar.tsx** - COMPLETE DATABASE INTEGRATION ✅
  - **Status**: Fully integrated with new AppointmentService
  - **Features**:
    - ✅ Real appointment data from database
    - ✅ Loading states and error handling
    - ✅ Real doctor and treatment information
    - ✅ Data refresh after appointment changes
  - **Dependencies**: AppointmentService.ts ✅ completed

---

## 🔶 PHASE 4: DASHBOARD COMPONENTS (MEDIUM PRIORITY)

- [ ] **TotalIncome.tsx** - REAL REVENUE DATA
  - **Current**: Hardcoded $680, +18%
  - **Target**: Calculate from invoice data
  - **Dependencies**: InvoiceService.ts

- [ ] **ProductRevenue.tsx** - REAL PRODUCT DATA  
  - **Current**: Mock `ProductTableData`
  - **Target**: Real product/sales data
  - **Dependencies**: ProductService.ts

- [ ] **RevenueForecast.tsx** - REAL FORECAST DATA
  - **Current**: Hardcoded chart data
  - **Target**: Calculated forecasts from historical data
  - **Dependencies**: InvoiceService.ts

- [ ] **NewCustomers.tsx** - REAL PATIENT STATS
  - **Target**: Real new patient statistics
  - **Dependencies**: PatientService.ts (already done)

- [ ] **DailyActivity.tsx** - REAL ACTIVITY DATA
  - **Target**: Real appointment/activity data  
  - **Dependencies**: AppointmentService.ts

---

## 🔧 PHASE 5: COMPONENT UPDATES (MEDIUM PRIORITY)

- [ ] **RightSidebar.tsx** - REAL RECENT APPOINTMENTS
  - **Current**: Mock `recentAppointments` array
  - **Target**: Real recent appointments from database
  - **Dependencies**: AppointmentService.ts

- [ ] **DentalProcedureList.tsx** - UPDATE FOR NEW SERVICE
  - **Current**: Uses DentalProcedureService store
  - **Target**: Use new database service
  - **Dependencies**: DentalProcedureService.ts

- [ ] **Inventory.tsx** - REAL INVENTORY DATA
  - **Current**: Mock `fallbackInventory` data
  - **Target**: Real product data from database
  - **Dependencies**: ProductService.ts

---

## 🔧 PHASE 6: MODAL COMPONENTS (LOW PRIORITY)

- [ ] **AppointmentModal.tsx** - Update for new service
- [ ] **ReminderModal.tsx** - Update for new service  
- [ ] **PatientEventModal.tsx** - Update for new service
- [ ] **DentalProcedureModal.tsx** - Update for new service

---

## 📝 PHASE 7: FORM COMPONENTS REVIEW

Review all form components to ensure they work with the new database schema:
- [ ] **PatientForm.tsx** - Verify field mappings
- [ ] **TreatmentForm.tsx** - Update for TreatmentService
- [ ] **InvoiceForm.tsx** - Update for InvoiceService
- [ ] **MedicalDeviceForm.tsx** - Update for DentalProcedureService

---

## 🧹 PHASE 8: CLEANUP (LOW PRIORITY)

- [ ] Remove old type imports referencing `'../db/client'`
- [ ] Clean up unused mock data constants
- [ ] Update type definitions to match database schema
- [ ] Remove unused Zustand stores
- [ ] Add proper error boundaries for database operations

---

## 📊 IMPLEMENTATION STATISTICS

**Total Files to Update**: 24+
**Services to Create/Rewrite**: 6 
**Views to Update**: 8
**Components to Update**: 12+

**Estimated Completion Time**: 
- Phase 1 (Critical): 3-4 days
- Phase 2-3 (Core UI): 2-3 days  
- Phase 4-6 (Secondary): 2-3 days
- **Total**: 7-10 days

---

## 🎯 RECOMMENDED IMPLEMENTATION ORDER

1. **Start with missing services** (DoctorService, TreatmentService)
2. **Rewrite AppointmentService** (most complex, blocks many components)
3. **Update main views** (Appointments, Dashboard, Billing)
4. **Complete remaining services** (Invoice, DentalProcedure, PatientEvent)  
5. **Update dashboard components and UI details**

---

## ✅ COMPLETED

### ✅ Phase 1 - Critical Service Layer (COMPLETED)
- ✅ **DoctorService.ts** - Complete CRUD operations, search, pagination, statistics
- ✅ **TreatmentService.ts** - Complete CRUD operations, categories, pricing
- ✅ **AppointmentService.ts** - Complete rewrite from Zustand to Supabase with relationships
- ✅ **RightSidebar.tsx** - Updated to use real appointment data from database
- ✅ **Calendar.tsx** - Updated to use new AppointmentService with loading states
- ✅ **PatientService.ts** - Fully integrated with Supabase (already completed)
- ✅ **Patients.tsx** - Updated to use real database (verified working)
- ✅ **Database Schema** - Complete and ready
- ✅ **Supabase Setup** - Local development environment ready and tested

### ✅ Phase 2 - Secondary Services (IN PROGRESS)
- ✅ **InvoiceService.ts** - Complete rewrite from mock data to Supabase
  - ✅ **CRUD operations** with patient relationships
  - ✅ **Database compatibility** - Status values aligned with schema (draft/sent/paid/overdue)
  - ✅ **API tested** - Successfully creates invoices via Supabase API
  - ✅ **Advanced features** - Invoice number generation, statistics, monthly revenue
  - ✅ **Tax calculations** - Automatic subtotal/tax/total calculations
  - ✅ **Payment tracking** - Mark as paid, due date monitoring

- ✅ **Billing.tsx** - Complete integration with real invoice data
  - ✅ **Real data display** - Replaced mock `BillingData` with InvoiceService
  - ✅ **Patient relationships** - Shows real patient names from database
  - ✅ **Enhanced UI** - Loading states, error handling, proper status badges
  - ✅ **Search functionality** - Works with real database queries
  - ✅ **Format improvements** - Italian dates, euro currency, status translations
  - ✅ **Live testing** - Verified with real invoices: Mario Rossi (€122) + Giulia Bianchi (€305)

### ✅ Database Verification (COMPLETED)
- ✅ **Supabase Local** - Running and accessible
- ✅ **API Endpoints** - Doctors and treatments APIs tested and working
- ✅ **Real Data Integration** - Frontend successfully displaying real database data:
  - Patients: Mario Rossi, Giulia Bianchi (from `patients` table)
  - Doctors: Dr. Mario Rossi, Dr. Anna Verdi, Dr. Luca Bianchi, Dr. Sara Neri (from `doctors` table)
  - Treatments: 8 treatments with correct pricing (from `treatments` table)
  - Invoices: 2 test invoices working in Billing view (from `invoices` table)
  - Appointments: Real upcoming appointments in RightSidebar and Calendar

---

**Next Action**: Continue Phase 2 - Convert ReminderService from Zustand to Supabase, then create ProductService

---

## 📋 DETAILED ANALYSIS: Why DoctorService & TreatmentService Are Critical

### **Current Database Status ✅**
```sql
-- ✅ DOCTORS TABLE (4 entries)
SELECT * FROM doctors;
 id |       name       | specialization  |  color  
----+------------------+-----------------+---------
  1 | Dr. Mario Rossi  | Ortodonzia      | #FF5733
  2 | Dr. Anna Verdi   | Endodonzia      | #33FF57
  3 | Dr. Luca Bianchi | Chirurgia Orale | #3357FF
  4 | Dr. Sara Neri    | Igiene Dentale  | #FF33F5

-- ✅ TREATMENTS TABLE (8 entries)
SELECT * FROM treatments;
 id |        name         | duration | price  |   category    
----+---------------------+----------+--------+---------------
  1 | Visita di Controllo |       30 |  50.00 | Prevenzione  
  2 | Pulizia Dentale     |       45 |  80.00 | Igiene       
  3 | Otturazione         |       60 | 120.00 | Conservativa 
  4 | Estrazione          |       45 | 100.00 | Chirurgia    
  5 | Devitalizzazione    |       90 | 300.00 | Endodonzia   
  6 | Impianto Dentale    |      120 | 800.00 | Implantologia
  7 | Ortodonzia Mobile   |       30 | 200.00 | Ortodonzia   
  8 | Sbiancamento        |       60 | 250.00 | Estetica     
```

### **🔥 The Problem: Mock Data vs Real Data**

**AppointmentService.ts currently uses MOCK data:**
```javascript
// ❌ MOCK DATA - WRONG DOCTOR NAMES
const sampleDoctors: Doctor[] = [
  { id: 1, name: "Dr. Bianchi", specialization: "Dentista generico", color: "#1E88E5" },
  { id: 2, name: "Dr. Verdi", specialization: "Ortodontista", color: "#00BCD4" },
  { id: 3, name: "Dr. Rossi", specialization: "Chirurgo orale", color: "#4CAF50" }
];

// ❌ MOCK DATA - DIFFERENT TREATMENTS
const sampleTreatments: Treatment[] = [
  { id: 1, name: "Pulizia dentale", duration: 30, price: 80, category: "Igiene" },
  { id: 2, name: "Controllo ortodontico", duration: 45, price: 100, category: "Ortodonzia" },
  // ...
];
```

**But database has REAL data with different names and prices!**
- Mock: "Dr. Bianchi" vs Real: "Dr. Mario Rossi"
- Mock: Pulizia €80 vs Real: Pulizia €80 ✓ (some match, some don't)

### **💥 What Breaks Without These Services:**

#### **1. Appointment Forms** 
- **AppointmentModal.tsx**: Dropdown shows wrong doctor names
- Users select "Dr. Bianchi" but database expects "Dr. Mario Rossi"
- **Result**: Appointment creation fails or shows wrong data

#### **2. Doctor Management Pages**
- **/views/doctors/Doctors.tsx**: Empty list or errors (no service to fetch data)
- **/views/doctors/NewDoctor.tsx**: Can't create doctors
- **/views/doctors/EditDoctor.tsx**: Can't edit existing doctors

#### **3. Treatment Management Pages**
- **/views/treatments/Treatments.tsx**: Empty list or errors
- **/views/treatments/NewTreatment.tsx**: Can't create treatments
- Treatment pricing inconsistencies

#### **4. Data Integrity Issues**
- Appointments reference `doctor_id: 1` but show wrong doctor name
- Reports and statistics use wrong doctor/treatment data
- Billing shows incorrect treatment prices

### **🎯 Components Currently Affected:**

**Views with Doctor/Treatment Dependencies:**
```
Found 18 files using Doctor|Treatment:
├── /views/doctors/Doctors.tsx           ❌ No service = broken
├── /views/doctors/NewDoctor.tsx         ❌ No service = broken  
├── /views/doctors/EditDoctor.tsx        ❌ No service = broken
├── /views/doctors/ViewDoctor.tsx        ❌ No service = broken
├── /views/treatments/Treatments.tsx     ❌ No service = broken
├── /views/treatments/NewTreatment.tsx   ❌ No service = broken
├── /views/appointments/Appointments.tsx ⚠️  Uses mock data
├── /views/calendar/Calendar.tsx         ⚠️  Uses mock data
├── /components/appointments/AppointmentModal.tsx ⚠️ Wrong dropdowns
└── /components/treatments/TreatmentForm.tsx      ⚠️ Wrong data
```

### **✅ Solution: Create Database Services**

**DoctorService.ts** will provide:
```javascript
// ✅ REAL DATABASE DATA
class DoctorService {
  static async getDoctors() {
    const { data } = await supabase.from('doctors').select('*')
    return data // Real: Dr. Mario Rossi, Dr. Anna Verdi, etc.
  }
  
  static async getDoctorById(id) { /* ... */ }
  static async createDoctor(data) { /* ... */ }
  static async updateDoctor(id, data) { /* ... */ }
  static async deleteDoctor(id) { /* ... */ }
}
```

**TreatmentService.ts** will provide:
```javascript
// ✅ REAL DATABASE DATA  
class TreatmentService {
  static async getTreatments() {
    const { data } = await supabase.from('treatments').select('*')
    return data // Real: Visita di Controllo €50, Pulizia €80, etc.
  }
  // + CRUD methods
}
```

### **🔄 Implementation Impact:**

**Immediate Benefits:**
1. **Appointment forms work correctly** with real doctor/treatment lists
2. **Doctor management pages function** (currently broken)
3. **Treatment management pages function** (currently broken)  
4. **Data consistency** between appointments and actual records
5. **Accurate pricing** in forms and invoices

**Dependencies Fixed:**
- AppointmentService can fetch real doctor/treatment data
- All doctor/treatment management views become functional
- Appointment creation works with correct data
- Reports and statistics use accurate information

### **🎯 Alternative Approaches Considered:**

1. **Embed in AppointmentService**: Could add doctor/treatment queries directly
   - ❌ **Cons**: Violates single responsibility, harder to maintain
   
2. **Use direct Supabase calls in components**: Skip service layer
   - ❌ **Cons**: Code duplication, no error handling, harder testing

3. **Create DoctorService & TreatmentService**: ✅ **Chosen approach**
   - ✅ **Pros**: Reusable, maintainable, consistent with PatientService pattern
   - ✅ **Pros**: Enables all doctor/treatment management features
   - ✅ **Pros**: Provides single source of truth for doctor/treatment data

**Conclusion**: These services are essential for the application to function correctly with real data rather than inconsistent mock data.