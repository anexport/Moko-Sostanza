/**
 * MOKO SOSTANZA Dental CRM - Appointment Service
 *
 * Servizio per la gestione degli appuntamenti
 * Currently using mock data - will be connected to database later
 */

import { type Appointment } from '../db/client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Definizione dei tipi
export interface Patient {
  id: number;
  name: string;
  phone: string;
  email: string;
}

export interface Doctor {
  id: number;
  name: string;
  specialization: string;
  color: string;
}

export interface Treatment {
  id: number;
  name: string;
  duration: number; // in minuti
  price: number;
  category: string;
}

export interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  treatmentId: number;
  date: string; // formato YYYY-MM-DD
  startTime: string; // formato HH:MM
  endTime: string; // formato HH:MM
  status: 'confermato' | 'in attesa' | 'cancellato' | 'completato';
  notes?: string;
}

// Dati di esempio
const samplePatients: Patient[] = [
  { id: 1, name: "Mario Rossi", phone: "+39 333 1234567", email: "mario.rossi@example.com" },
  { id: 2, name: "Giulia Bianchi", phone: "+39 333 7654321", email: "giulia.bianchi@example.com" },
  { id: 3, name: "Luca Verdi", phone: "+39 333 9876543", email: "luca.verdi@example.com" },
  { id: 4, name: "Sofia Neri", phone: "+39 333 3456789", email: "sofia.neri@example.com" },
  { id: 5, name: "Marco Gialli", phone: "+39 333 6789012", email: "marco.gialli@example.com" }
];

const sampleDoctors: Doctor[] = [
  { id: 1, name: "Dr. Bianchi", specialization: "Dentista generico", color: "#1E88E5" },
  { id: 2, name: "Dr. Verdi", specialization: "Ortodontista", color: "#00BCD4" },
  { id: 3, name: "Dr. Rossi", specialization: "Chirurgo orale", color: "#4CAF50" }
];

const sampleTreatments: Treatment[] = [
  { id: 1, name: "Pulizia dentale", duration: 30, price: 80, category: "Igiene" },
  { id: 2, name: "Controllo ortodontico", duration: 45, price: 100, category: "Ortodonzia" },
  { id: 3, name: "Otturazione", duration: 45, price: 120, category: "Conservativa" },
  { id: 4, name: "Estrazione", duration: 60, price: 150, category: "Chirurgia" },
  { id: 5, name: "Radiografia", duration: 15, price: 70, category: "Diagnostica" },
  { id: 6, name: "Impianto dentale", duration: 90, price: 1200, category: "Implantologia" },
  { id: 7, name: "Sbiancamento", duration: 60, price: 250, category: "Estetica" }
];

// Genera data e ora casuali per un appuntamento
const generateRandomDateTime = (startDate: Date, endDate: Date): { date: string, startTime: string, endTime: string } => {
  const date = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));

  // Assicuriamoci che l'ora sia tra le 9:00 e le 18:00
  const hours = 9 + Math.floor(Math.random() * 8);
  const minutes = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, 45

  date.setHours(hours, minutes, 0, 0);

  // Formato data: YYYY-MM-DD
  const dateStr = date.toISOString().split('T')[0];

  // Formato ora: HH:MM
  const startTimeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

  // Calcola l'ora di fine in base alla durata del trattamento
  const treatmentId = Math.floor(Math.random() * sampleTreatments.length) + 1;
  const treatment = sampleTreatments.find(t => t.id === treatmentId);
  const durationMinutes = treatment ? treatment.duration : 30;

  const appointmentEndDate = new Date(date);
  appointmentEndDate.setMinutes(date.getMinutes() + durationMinutes);
  const endHours = appointmentEndDate.getHours();
  const endMinutes = appointmentEndDate.getMinutes();
  const endTimeStr = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;

  return { date: dateStr, startTime: startTimeStr, endTime: endTimeStr };
};

// Genera appuntamenti di esempio
const generateSampleAppointments = (count: number): Appointment[] => {
  const appointments: Appointment[] = [];
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 15); // 15 giorni fa

  const endDate = new Date(today);
  endDate.setDate(today.getDate() + 30); // 30 giorni nel futuro

  const statuses: Appointment['status'][] = ['confermato', 'in attesa', 'cancellato', 'completato'];

  for (let i = 1; i <= count; i++) {
    const { date, startTime, endTime } = generateRandomDateTime(startDate, endDate);
    const patientId = Math.floor(Math.random() * samplePatients.length) + 1;
    const doctorId = Math.floor(Math.random() * sampleDoctors.length) + 1;
    const treatmentId = Math.floor(Math.random() * sampleTreatments.length) + 1;
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    appointments.push({
      id: i,
      patientId,
      doctorId,
      treatmentId,
      date,
      startTime,
      endTime,
      status,
      notes: Math.random() > 0.7 ? "Note aggiuntive per questo appuntamento" : undefined
    });
  }

  return appointments;
};

// Genera 30 appuntamenti di esempio
const sampleAppointments = generateSampleAppointments(30);

// Definizione dello store
interface AppointmentStore {
  patients: Patient[];
  doctors: Doctor[];
  treatments: Treatment[];
  appointments: Appointment[];

  // Azioni
  addPatient: (patient: Omit<Patient, 'id'>) => number; // Restituisce l'ID del nuovo paziente
  updatePatient: (id: number, patient: Partial<Patient>) => void;
  deletePatient: (id: number) => void;

  addDoctor: (doctor: Omit<Doctor, 'id'>) => void;
  updateDoctor: (id: number, doctor: Partial<Doctor>) => void;
  deleteDoctor: (id: number) => void;

  addTreatment: (treatment: Omit<Treatment, 'id'>) => void;
  updateTreatment: (id: number, treatment: Partial<Treatment>) => void;
  deleteTreatment: (id: number) => void;

  addAppointment: (appointment: Omit<Appointment, 'id'>) => void;
  updateAppointment: (id: number, appointment: Partial<Appointment>) => void;
  deleteAppointment: (id: number) => void;

  // Getter
  getPatientById: (id: number) => Patient | undefined;
  getDoctorById: (id: number) => Doctor | undefined;
  getTreatmentById: (id: number) => Treatment | undefined;
  getAppointmentsByDate: (date: string) => Appointment[];
  getAppointmentsByPatient: (patientId: number) => Appointment[];
  getAppointmentsByDoctor: (doctorId: number) => Appointment[];
  getAppointmentsByDateRange: (startDate: string, endDate: string) => Appointment[];
}

// Creazione dello store
export const useAppointmentStore = create<AppointmentStore>()(
  persist(
    (set, get) => ({
      patients: samplePatients,
      doctors: sampleDoctors,
      treatments: sampleTreatments,
      appointments: sampleAppointments,

      // Azioni per i pazienti
      addPatient: (patient) => {
        let newId = Math.max(0, ...get().patients.map(p => p.id)) + 1;
        set((state) => ({
          patients: [...state.patients, { ...patient, id: newId }]
        }));
        return newId; // Restituisce l'ID del nuovo paziente
      },

      updatePatient: (id, patient) => set((state) => ({
        patients: state.patients.map(p => p.id === id ? { ...p, ...patient } : p)
      })),

      deletePatient: (id) => set((state) => ({
        patients: state.patients.filter(p => p.id !== id)
      })),

      // Azioni per i dottori
      addDoctor: (doctor) => set((state) => ({
        doctors: [...state.doctors, { ...doctor, id: Math.max(0, ...state.doctors.map(d => d.id)) + 1 }]
      })),

      updateDoctor: (id, doctor) => set((state) => ({
        doctors: state.doctors.map(d => d.id === id ? { ...d, ...doctor } : d)
      })),

      deleteDoctor: (id) => set((state) => ({
        doctors: state.doctors.filter(d => d.id !== id)
      })),

      // Azioni per i trattamenti
      addTreatment: (treatment) => set((state) => ({
        treatments: [...state.treatments, { ...treatment, id: Math.max(0, ...state.treatments.map(t => t.id)) + 1 }]
      })),

      updateTreatment: (id, treatment) => set((state) => ({
        treatments: state.treatments.map(t => t.id === id ? { ...t, ...treatment } : t)
      })),

      deleteTreatment: (id) => set((state) => ({
        treatments: state.treatments.filter(t => t.id !== id)
      })),

      // Azioni per gli appuntamenti
      addAppointment: (appointment) => set((state) => ({
        appointments: [...state.appointments, { ...appointment, id: Math.max(0, ...state.appointments.map(a => a.id)) + 1 }]
      })),

      updateAppointment: (id, appointment) => set((state) => ({
        appointments: state.appointments.map(a => a.id === id ? { ...a, ...appointment } : a)
      })),

      deleteAppointment: (id) => set((state) => ({
        appointments: state.appointments.filter(a => a.id !== id)
      })),

      // Getter
      getPatientById: (id) => get().patients.find(p => p.id === id),
      getDoctorById: (id) => get().doctors.find(d => d.id === id),
      getTreatmentById: (id) => get().treatments.find(t => t.id === id),

      getAppointmentsByDate: (date) => get().appointments.filter(a => a.date === date),

      getAppointmentsByPatient: (patientId) => get().appointments.filter(a => a.patientId === patientId),

      getAppointmentsByDoctor: (doctorId) => get().appointments.filter(a => a.doctorId === doctorId),

      getAppointmentsByDateRange: (startDate, endDate) => {
        return get().appointments.filter(a => {
          return a.date >= startDate && a.date <= endDate;
        });
      }
    }),
    {
      name: 'dental-appointments-storage',
    }
  )
);

// Funzioni di utilità
export const formatAppointmentTime = (appointment: Appointment): string => {
  return `${appointment.startTime} - ${appointment.endTime}`;
};

export const getAppointmentDuration = (appointment: Appointment): number => {
  const startParts = appointment.startTime.split(':').map(Number);
  const endParts = appointment.endTime.split(':').map(Number);

  const startMinutes = startParts[0] * 60 + startParts[1];
  const endMinutes = endParts[0] * 60 + endParts[1];

  return endMinutes - startMinutes;
};

export const getAppointmentTitle = (appointment: Appointment): string => {
  const store = useAppointmentStore.getState();
  const patient = store.getPatientById(appointment.patientId);
  const treatment = store.getTreatmentById(appointment.treatmentId);

  if (patient && treatment) {
    return `${patient.name} - ${treatment.name}`;
  }

  return 'Appuntamento';
};

export const getAppointmentColor = (appointment: Appointment): string => {
  const store = useAppointmentStore.getState();
  const doctor = store.getDoctorById(appointment.doctorId);

  if (doctor) {
    return doctor.color;
  }

  // Colori predefiniti in base allo stato
  switch (appointment.status) {
    case 'confermato':
      return '#4CAF50';
    case 'in attesa':
      return '#FFC107';
    case 'cancellato':
      return '#F44336';
    case 'completato':
      return '#9E9E9E';
    default:
      return '#1E88E5';
  }
};

// Funzione di utilità per ottenere il colore del badge in base allo stato
export const getStatusBadgeColor = (status: string): string => {
  switch (status) {
    case 'confermato':
      return 'success';
    case 'in attesa':
      return 'warning';
    case 'cancellato':
      return 'failure';
    case 'completato':
      return 'info';
    default:
      return 'default';
  }
};

export default useAppointmentStore;
