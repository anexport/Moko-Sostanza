import { useState, useEffect } from 'react';
import { Modal, Button, Badge } from 'flowbite-react';
import { Icon } from '@iconify/react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { 
  AppointmentService,
  getStatusBadgeColor, 
  type Appointment,
  type Patient,
  type Doctor,
  type Treatment,
  type AppointmentWithDetails
} from '../../services/AppointmentService';

interface DayAppointmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  onNewAppointment: (date: string) => void;
  onEditAppointment: (id: number) => void;
}

export default function DayAppointmentsModal({ 
  isOpen, 
  onClose, 
  date,
  onNewAppointment,
  onEditAppointment 
}: DayAppointmentsModalProps) {
  const [dayAppointments, setDayAppointments] = useState<AppointmentWithDetails[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && date) {
      loadDayAppointments();
    }
  }, [isOpen, date]);

  const loadDayAppointments = async () => {
    try {
      setLoading(true);
      const appointments = await AppointmentService.getAppointmentsByDate(date);
      setDayAppointments(appointments);
    } catch (error) {
      console.error('Error loading day appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAppointment = async (appointmentId: number) => {
    try {
      await AppointmentService.deleteAppointment(appointmentId);
      await loadDayAppointments(); // Reload appointments after deletion
    } catch (error) {
      console.error('Error deleting appointment:', error);
    }
  };

  const confirmDeleteAppointment = (id: number) => {
    if (window.confirm('Sei sicuro di voler eliminare questo appuntamento?')) {
      handleDeleteAppointment(id);
    }
  };

  return (
    <Modal show={isOpen} onClose={onClose} size="xl">
      <Modal.Header>
        Appuntamenti del {format(new Date(date), 'd MMMM yyyy', { locale: it })}
      </Modal.Header>
      <Modal.Body>
        <div className="space-y-4">
          <Button color="primary" onClick={() => onNewAppointment(date)}>
            <Icon icon="solar:calendar-add-bold" className="mr-2 h-5 w-5" />
            Nuovo Appuntamento
          </Button>

          {loading ? (
            <div className="text-center text-gray-500">
              Caricamento appuntamenti...
            </div>
          ) : dayAppointments.length === 0 ? (
            <div className="text-center text-gray-500">
              Nessun appuntamento per questa data
            </div>
          ) : (
            <div className="space-y-4">
              {dayAppointments.map((appointment) => {
                const patient = appointment.patient;
                const doctor = appointment.doctor;
                const treatment = appointment.treatment;
                
                return (
                  <div
                    key={appointment.id}
                    className="mb-4 p-4 rounded-lg border"
                    style={{ borderLeftWidth: '4px', borderLeftColor: doctor?.color || '#cccccc' }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-lg">
                          {patient ? `${patient.first_name} ${patient.last_name}` : 'Paziente non trovato'}
                        </div>
                        <div className="text-gray-600">
                          {appointment.start_time} - {appointment.end_time} | {doctor ? doctor.name : 'Dottore non trovato'}
                        </div>
                        <div className="mt-2">
                          <Badge color={getStatusBadgeColor(appointment.status)}>
                            {appointment.status}
                          </Badge>
                          <span className="ml-2 text-sm">{treatment ? treatment.name : 'Trattamento non trovato'}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          color="light"
                          onClick={() => onEditAppointment(appointment.id)}
                        >
                          <Icon icon="solar:pen-2-outline" className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          color="failure"
                          onClick={() => confirmDeleteAppointment(appointment.id)}
                        >
                          <Icon icon="solar:trash-bin-trash-outline" className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button color="gray" onClick={onClose}>
          Chiudi
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
