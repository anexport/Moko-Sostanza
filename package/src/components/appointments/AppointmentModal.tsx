import { useState, useEffect } from 'react';
import { Modal, Button, Label, TextInput, Select, Textarea } from 'flowbite-react';
import { Icon } from '@iconify/react';
import { AppointmentService, type Appointment, type Patient, type Doctor, type Treatment } from '../../services/AppointmentService';
import { PatientService } from '../../services/PatientService';
import { DoctorService } from '../../services/DoctorService';
import { TreatmentService } from '../../services/TreatmentService';
import QuickPatientModal from '../patients/QuickPatientModal';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment?: Appointment;
  selectedDate?: string;
  selectedTime?: string;
}

const AppointmentModal = ({ isOpen, onClose, appointment, selectedDate, selectedTime }: AppointmentModalProps) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(false);
  const [isQuickPatientModalOpen, setIsQuickPatientModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: 0,
    treatmentId: 0,
    date: '',
    startTime: '',
    endTime: '',
    status: 'confermato' as Appointment['status'],
    notes: ''
  });

  // Load data when modal opens
  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [patientsResult, doctorsResult, treatmentsResult] = await Promise.all([
        PatientService.getPatients(),
        DoctorService.getDoctors(),
        TreatmentService.getTreatments()
      ]);
      
      setPatients(patientsResult.patients || []);
      setDoctors(doctorsResult.doctors || []);
      setTreatments(treatmentsResult.treatments || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calcola l'ora di fine in base al trattamento selezionato
  const calculateEndTime = (startTime: string, treatmentId: number) => {
    if (!startTime || !treatmentId) return '';

    const treatment = treatments.find(t => t.id === treatmentId);
    if (!treatment) return '';

    const [hours, minutes] = startTime.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + treatment.duration;

    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;

    return `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
  };

  // Inizializza il form quando si apre il modale
  useEffect(() => {
    if (appointment) {
      // Modifica di un appuntamento esistente
      setFormData({
        patientId: appointment.patient_id,
        doctorId: appointment.doctor_id,
        treatmentId: appointment.treatment_id,
        date: appointment.date,
        startTime: appointment.start_time,
        endTime: appointment.end_time,
        status: appointment.status,
        notes: appointment.notes || ''
      });
    } else {
      // Nuovo appuntamento
      setFormData({
        patientId: patients.length > 0 ? patients[0].id : '',
        doctorId: doctors.length > 0 ? doctors[0].id : 0,
        treatmentId: treatments.length > 0 ? treatments[0].id : 0,
        date: selectedDate || new Date().toISOString().split('T')[0],
        startTime: selectedTime || '09:00',
        endTime: '',
        status: 'confermato',
        notes: ''
      });
    }
  }, [isOpen, appointment, selectedDate, selectedTime, patients, doctors, treatments]);

  // Aggiorna l'ora di fine quando cambia il trattamento o l'ora di inizio
  useEffect(() => {
    if (formData.treatmentId && formData.startTime) {
      const endTime = calculateEndTime(formData.startTime, formData.treatmentId);
      setFormData(prev => ({ ...prev, endTime }));
    }
  }, [formData.treatmentId, formData.startTime]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Gestisce l'apertura del modale per l'aggiunta rapida di un paziente
  const handleOpenQuickPatientModal = () => {
    setIsQuickPatientModalOpen(true);
  };

  // Gestisce la chiusura del modale per l'aggiunta rapida di un paziente
  const handleCloseQuickPatientModal = () => {
    setIsQuickPatientModalOpen(false);
  };

  // Gestisce l'aggiunta di un nuovo paziente
  const handlePatientAdded = async (patientId: string) => {
    // Ricarica la lista dei pazienti per includere il nuovo paziente
    try {
      const patientsResult = await PatientService.getPatients();
      setPatients(patientsResult.patients || []);
      
      // Aggiorna il form con il nuovo paziente selezionato
      setFormData(prev => ({ ...prev, patientId }));
    } catch (error) {
      console.error('Error reloading patients:', error);
      // Anche se c'è un errore nel ricaricare, aggiorna comunque il form
      setFormData(prev => ({ ...prev, patientId }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      
      const appointmentData = {
        patient_id: formData.patientId,
        doctor_id: formData.doctorId,
        treatment_id: formData.treatmentId,
        date: formData.date,
        start_time: formData.startTime,
        end_time: formData.endTime,
        status: formData.status,
        notes: formData.notes
      };

      if (appointment) {
        // Aggiorna un appuntamento esistente
        await AppointmentService.updateAppointment(appointment.id, appointmentData);
      } else {
        // Crea un nuovo appuntamento
        await AppointmentService.createAppointment(appointmentData);
      }

      onClose();
    } catch (error) {
      console.error('Error saving appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={isOpen} onClose={onClose} size="lg">
      <Modal.Header>
        {appointment ? 'Modifica Appuntamento' : 'Nuovo Appuntamento'}
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label htmlFor="patientId" value="Paziente" />
              <Button
                color="light"
                size="xs"
                onClick={handleOpenQuickPatientModal}
                className="flex items-center gap-1 py-1"
              >
                <Icon icon="solar:add-circle-outline" height={16} />
                <span className="text-xs">Nuovo Paziente</span>
              </Button>
            </div>
            <Select
              id="patientId"
              name="patientId"
              value={formData.patientId}
              onChange={handleChange}
              required
            >
              <option value="">Seleziona un paziente</option>
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>
                  {patient.first_name} {patient.last_name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="doctorId" value="Dottore" />
            <Select
              id="doctorId"
              name="doctorId"
              value={formData.doctorId}
              onChange={handleChange}
              required
            >
              <option value="">Seleziona un dottore</option>
              {doctors.map(doctor => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name} ({doctor.specialization})
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="treatmentId" value="Trattamento" />
            <Select
              id="treatmentId"
              name="treatmentId"
              value={formData.treatmentId}
              onChange={handleChange}
              required
            >
              <option value="">Seleziona un trattamento</option>
              {treatments.map(treatment => (
                <option key={treatment.id} value={treatment.id}>
                  {treatment.name} ({treatment.duration} min - €{treatment.price})
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date" value="Data" />
              <TextInput
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="startTime" value="Ora di inizio" />
              <TextInput
                id="startTime"
                name="startTime"
                type="time"
                value={formData.startTime}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="endTime" value="Ora di fine (calcolata automaticamente)" />
              <TextInput
                id="endTime"
                name="endTime"
                type="time"
                value={formData.endTime}
                readOnly
              />
            </div>

            <div>
              <Label htmlFor="status" value="Stato" />
              <Select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="confermato">Confermato</option>
                <option value="in attesa">In attesa</option>
                <option value="cancellato">Cancellato</option>
                <option value="completato">Completato</option>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="notes" value="Note" />
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button color="light" onClick={onClose}>
              Annulla
            </Button>
            <Button type="submit" color="primary">
              {appointment ? 'Aggiorna' : 'Salva'}
            </Button>
          </div>
        </form>
      </Modal.Body>

      {/* Modale per l'aggiunta rapida di un paziente */}
      <QuickPatientModal
        isOpen={isQuickPatientModalOpen}
        onClose={handleCloseQuickPatientModal}
        onPatientAdded={handlePatientAdded}
      />
    </Modal>
  );
};

export default AppointmentModal;
