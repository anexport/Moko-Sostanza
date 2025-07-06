import { Table, Badge, Button, Select } from "flowbite-react";
import { Icon } from "@iconify/react";
import SimpleBar from "simplebar-react";
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  AppointmentService,
  getAppointmentTitle,
  getAppointmentColor,
  type AppointmentWithDetails
} from "../../services/AppointmentService";
import AppointmentModal from "../../components/appointments/AppointmentModal";

const Appointments = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Oggi");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<number | null>(null);
  const [filteredAppointments, setFilteredAppointments] = useState<AppointmentWithDetails[]>([]);

  // Load appointments data
  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const result = await AppointmentService.getAppointments();
      setAppointments(result.appointments);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  // Apri automaticamente il modale quando si accede alla rotta /appointments/new o /clinic/appointments/new
  useEffect(() => {
    if (location.pathname === '/appointments/new' || location.pathname === '/clinic/appointments/new') {
      openNewAppointmentModal();
    }
  }, [location.pathname]);

  // Filtra gli appuntamenti in base alla selezione
  useEffect(() => {
    const today = new Date();
    const todayStr = formatDateToYYYYMMDD(today);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const tomorrowStr = formatDateToYYYYMMDD(tomorrow);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    let filtered;

    switch (filter) {
      case "Oggi":
        filtered = appointments.filter(a => a.date === todayStr);
        break;
      case "Domani":
        filtered = appointments.filter(a => a.date === tomorrowStr);
        break;
      case "Questa Settimana":
        filtered = appointments.filter(a => {
          const appointmentDate = new Date(a.date);
          return appointmentDate >= startOfWeek && appointmentDate <= endOfWeek;
        });
        break;
      case "Questo Mese":
        filtered = appointments.filter(a => {
          const appointmentDate = new Date(a.date);
          return appointmentDate >= startOfMonth && appointmentDate <= endOfMonth;
        });
        break;
      default:
        filtered = appointments;
    }

    // Ordina per data e ora
    filtered.sort((a, b) => {
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date);
      }
      return a.startTime.localeCompare(b.startTime);
    });

    setFilteredAppointments(filtered);
  }, [appointments, filter]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(e.target.value);
  };

  const openNewAppointmentModal = () => {
    setSelectedAppointment(null);
    setIsModalOpen(true);
  };

  const openEditAppointmentModal = (appointmentId: number) => {
    setSelectedAppointment(appointmentId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);

    // Se siamo nella rotta /appointments/new o /clinic/appointments/new, reindirizza alla pagina principale degli appuntamenti
    if (location.pathname === '/appointments/new') {
      navigate('/appointments');
    } else if (location.pathname === '/clinic/appointments/new') {
      navigate('/clinic/appointments');
    }
  };

  // Formatta la data da YYYY-MM-DD a DD/MM/YYYY
  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  // Formatta la data da Date a YYYY-MM-DD
  const formatDateToYYYYMMDD = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Ottieni l'appuntamento selezionato
  const selectedAppointmentData = selectedAppointment !== null
    ? appointments.find(a => a.id === selectedAppointment)
    : undefined;

  // Funzione per ottenere il colore dello stato
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confermato':
        return "bg-lightsuccess text-success";
      case 'in attesa':
        return "bg-lightwarning text-warning";
      case 'cancellato':
        return "bg-lighterror text-error";
      case 'completato':
        return "bg-lightgray text-dark";
      default:
        return "bg-lightprimary text-primary";
    }
  };

  // Funzione per ottenere il testo dello stato con la prima lettera maiuscola
  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <>
      <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h5 className="card-title">Gestione Appuntamenti</h5>
          <div className="flex flex-wrap gap-3 items-center">
            <Select
              id="date-filter"
              className="w-full sm:w-auto"
              value={filter}
              onChange={handleFilterChange}
              required
            >
              <option value="Oggi">Oggi</option>
              <option value="Domani">Domani</option>
              <option value="Questa Settimana">Questa Settimana</option>
              <option value="Questo Mese">Questo Mese</option>
            </Select>
            <Button color="primary" className="flex items-center gap-2" onClick={openNewAppointmentModal}>
              <Icon icon="solar:add-circle-outline" height={20} />
              <span className="hidden sm:inline">Nuovo Appuntamento</span>
              <span className="sm:hidden">Nuovo</span>
            </Button>
            <Button color="secondary" className="flex items-center gap-2" as={Link} to="/calendar">
              <Icon icon="solar:calendar-mark-line-duotone" height={20} />
              <span>Calendario</span>
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table hoverable className="table-auto w-full">
            <Table.Head>
              <Table.HeadCell className="p-4">Paziente</Table.HeadCell>
              <Table.HeadCell className="p-4">Data</Table.HeadCell>
              <Table.HeadCell className="p-4">Ora</Table.HeadCell>
              <Table.HeadCell className="p-4 hidden md:table-cell">Dottore</Table.HeadCell>
              <Table.HeadCell className="p-4 hidden lg:table-cell">Trattamento</Table.HeadCell>
              <Table.HeadCell className="p-4">Stato</Table.HeadCell>
              <Table.HeadCell className="p-4">Azioni</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y divide-border dark:divide-darkborder">
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((appointment) => {
                  const patient = getPatientById(appointment.patientId);
                  const doctor = getDoctorById(appointment.doctorId);
                  const treatment = getTreatmentById(appointment.treatmentId);

                  if (!patient || !doctor || !treatment) return null;

                  return (
                    <Table.Row key={appointment.id}>
                      <Table.Cell className="p-4">
                        <div className="flex gap-2 items-center">
                          <div>
                            <h6 className="text-sm font-medium">{patient.name}</h6>
                          </div>
                        </div>
                      </Table.Cell>
                      <Table.Cell className="p-4">
                        <p className="text-sm">{formatDate(appointment.date)}</p>
                      </Table.Cell>
                      <Table.Cell className="p-4">
                        <p className="text-sm">{appointment.startTime} - {appointment.endTime}</p>
                      </Table.Cell>
                      <Table.Cell className="p-4 hidden md:table-cell">
                        <p className="text-sm">{doctor.name}</p>
                      </Table.Cell>
                      <Table.Cell className="p-4 hidden lg:table-cell">
                        <p className="text-sm">{treatment.name}</p>
                      </Table.Cell>
                      <Table.Cell className="p-4">
                        <Badge className={getStatusColor(appointment.status)}>
                          {formatStatus(appointment.status)}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell className="p-4">
                        <div className="flex gap-2">
                          <Button color="primary" size="xs" onClick={() => openEditAppointmentModal(appointment.id)}>
                            <Icon icon="solar:pen-outline" height={16} />
                          </Button>
                          <Button color="secondary" size="xs" onClick={() => navigate(`/calendar?date=${appointment.date}`)}>
                            <Icon icon="solar:calendar-mark-line-duotone" height={16} />
                          </Button>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  );
                })
              ) : (
                <Table.Row>
                  <Table.Cell colSpan={7} className="text-center py-4">
                    <p className="text-gray-500">Nessun appuntamento trovato</p>
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>
        </div>
      </div>

      {/* Modale per la creazione/modifica degli appuntamenti */}
      <AppointmentModal
        isOpen={isModalOpen}
        onClose={closeModal}
        appointment={selectedAppointmentData}
      />
    </>
  );
};

export default Appointments;
