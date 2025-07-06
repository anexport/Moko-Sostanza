import { Button } from "flowbite-react";
import { Icon } from "@iconify/react";
import { Link, useNavigate } from "react-router-dom";
import SimpleBar from "simplebar-react";
import 'simplebar-react/dist/simplebar.min.css';
import { useState, useEffect } from "react";
import { ReminderService, getRelativeDate, type Reminder } from "../../../services/ReminderService";
import ReminderModal from "../../../components/reminders/ReminderModal";

// Dati di esempio per gli appuntamenti recenti
const recentAppointments = [
  {
    id: 1,
    patient: "Mario Rossi",
    date: "Oggi",
    time: "14:30",
    treatment: "Pulizia dentale",
    status: "confirmed"
  },
  {
    id: 2,
    patient: "Giulia Bianchi",
    date: "Domani",
    time: "10:00",
    treatment: "Controllo ortodontico",
    status: "pending"
  },
  {
    id: 3,
    patient: "Luca Verdi",
    date: "20/05/2023",
    time: "16:15",
    treatment: "Otturazione",
    status: "confirmed"
  }
];

// Funzione per ottenere il colore in base allo stato
const getStatusColor = (status: string) => {
  switch (status) {
    case "confirmed":
      return "text-success";
    case "pending":
      return "text-warning";
    case "cancelled":
      return "text-danger";
    default:
      return "text-bodytext";
  }
};

const MobileRightSidebar = ({ onClose }: { onClose: () => void }) => {
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [upcomingReminders, setUpcomingReminders] = useState<Reminder[]>([]);
  const [remindersLoading, setRemindersLoading] = useState(true);

  // Carica i promemoria imminenti
  useEffect(() => {
    const loadUpcomingReminders = async () => {
      try {
        setRemindersLoading(true);
        const reminders = await ReminderService.getUpcomingReminders(3);
        setUpcomingReminders(reminders);
      } catch (error) {
        console.error('Errore nel caricamento dei promemoria:', error);
      } finally {
        setRemindersLoading(false);
      }
    };

    loadUpcomingReminders();
  }, []);

  // Apri il modale per creare un nuovo promemoria
  const openReminderModal = () => {
    setIsReminderModalOpen(true);
  };

  // Chiudi il modale
  const closeReminderModal = () => {
    setIsReminderModalOpen(false);
  };

  // Ricarica i promemoria dopo il salvataggio
  const handleReminderSave = async () => {
    try {
      const reminders = await ReminderService.getUpcomingReminders(3);
      setUpcomingReminders(reminders);
    } catch (error) {
      console.error('Errore nel ricaricamento dei promemoria:', error);
    }
  };

  // Gestisci il completamento di un promemoria
  const handleToggleCompleted = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await ReminderService.toggleCompleted(id);
      // Ricarica i promemoria dopo il completamento
      const reminders = await ReminderService.getUpcomingReminders(3);
      setUpcomingReminders(reminders);
    } catch (error) {
      console.error('Errore nel completamento del promemoria:', error);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <h5 className="text-base font-medium">Menu rapido</h5>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
        >
          <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
          </svg>
          <span className="sr-only">Chiudi menu</span>
        </button>
      </div>

      {/* Pulsanti di azione rapida */}
      <div className="p-4 border-b">
        <div className="grid grid-cols-2 gap-2">
          {/* Pulsante Nuovo Appuntamento */}
          <Button
            as={Link}
            to="/appointments/new"
            color="primary"
            size="sm"
            className="flex items-center gap-2 justify-center"
            onClick={onClose}
          >
            <Icon icon="solar:calendar-add-bold" height={16} />
            <span className="text-sm">Nuovo Appuntamento</span>
          </Button>

          {/* Pulsante Aggiungi Promemoria */}
          <Button
            onClick={openReminderModal}
            color="light"
            size="sm"
            className="flex items-center gap-2 justify-center"
          >
            <Icon icon="solar:bell-add-bold" height={16} />
            <span className="text-sm">Aggiungi Promemoria</span>
          </Button>

          {/* Pulsante Pazienti */}
          <Button
            as={Link}
            to="/patients"
            color="light"
            size="sm"
            className="flex items-center gap-2 justify-center"
            onClick={onClose}
          >
            <Icon icon="solar:users-group-rounded-line-duotone" height={16} />
            <span className="text-sm">Pazienti</span>
          </Button>

          {/* Pulsante Trattamenti */}
          <Button
            as={Link}
            to="/treatments"
            color="light"
            size="sm"
            className="flex items-center gap-2 justify-center"
            onClick={onClose}
          >
            <Icon icon="solar:stethoscope-outline" height={16} />
            <span className="text-sm">Trattamenti</span>
          </Button>
        </div>
      </div>

      {/* Contenuto scrollabile */}
      <div className="flex-grow overflow-hidden">
        <SimpleBar className="h-full">
          <div className="p-4 space-y-4">
            {/* Lista ultimi appuntamenti */}
            <div>
              <h6
                className="text-dark dark:text-white text-sm font-semibold mb-2 px-1 flex items-center cursor-pointer hover:text-primary"
              >
                <Icon icon="solar:calendar-mark-line-duotone" className="mr-1" height={16} />
                <Link to="/appointments" className="flex-grow" onClick={onClose}>Prossimi Appuntamenti</Link>
                <Icon icon="solar:arrow-right-linear" className="ml-auto" height={14} />
              </h6>
              <div className="space-y-2">
                {recentAppointments.map((appointment) => (
                  <Link
                    to="/appointments"
                    key={appointment.id}
                    className="block p-2 bg-lightgray dark:bg-darkmuted rounded-lg hover:bg-lightprimary dark:hover:bg-primary/10 transition-colors cursor-pointer"
                    onClick={onClose}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-dark dark:text-white truncate">
                        {appointment.patient}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs">
                        <Icon
                          icon="solar:clock-circle-outline"
                          className={getStatusColor(appointment.status)}
                          height={12}
                        />
                        <span className="text-bodytext">
                          {appointment.date} - {appointment.time}
                        </span>
                      </div>
                      <span className="text-xs text-bodytext truncate">
                        {appointment.treatment}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Lista promemoria imminenti */}
            <div>
              <h6
                className="text-dark dark:text-white text-sm font-semibold mb-2 px-1 flex items-center cursor-pointer hover:text-primary"
              >
                <Icon icon="solar:bell-outline" className="mr-1" height={16} />
                <Link to="/calendar" className="flex-grow" onClick={onClose}>Promemoria</Link>
                <Icon icon="solar:arrow-right-linear" className="ml-auto" height={14} />
              </h6>
              <div className="space-y-2">
                {remindersLoading ? (
                  <div className="text-xs text-gray-500 text-center p-2">
                    Caricamento...
                  </div>
                ) : upcomingReminders.length > 0 ? (
                  upcomingReminders.map((reminder) => (
                    <Link
                      to="/calendar"
                      key={reminder.id}
                      className="block p-2 bg-lightgray dark:bg-darkmuted rounded-lg hover:bg-lightprimary dark:hover:bg-primary/10 transition-colors cursor-pointer"
                      onClick={onClose}
                    >
                      <div className="flex flex-col gap-0.5">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-dark dark:text-white truncate">
                            {reminder.title}
                          </span>
                          <button
                            onClick={(e) => handleToggleCompleted(reminder.id, e)}
                            className="text-gray-400 hover:text-success"
                          >
                            <Icon icon="solar:check-circle-outline" height={16} />
                          </button>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                          <Icon
                            icon="solar:clock-circle-outline"
                            className="text-warning"
                            height={12}
                          />
                          <span className="text-bodytext">
                            {getRelativeDate(reminder.date)} - {reminder.time}
                          </span>
                        </div>
                        <span className="text-xs text-bodytext truncate">
                          {reminder.text}
                        </span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-xs text-gray-500 text-center p-2">
                    Nessun promemoria imminente
                  </div>
                )}
              </div>
            </div>
          </div>
        </SimpleBar>
      </div>

      {/* Banner pubblicitari fissi */}
      <div className="p-4 border-t">
        <div className="space-y-2">
          <div className="bg-lightprimary dark:bg-primary/10 p-2 rounded-lg">
            <h6 className="text-primary text-xs font-semibold mb-1">Promozione</h6>
            <p className="text-xs text-dark/70 dark:text-white/70">
              Sconto del 20% sulla pulizia dentale!
            </p>
          </div>

          <div className="bg-lightsuccess dark:bg-success/10 p-2 rounded-lg">
            <h6 className="text-success text-xs font-semibold mb-1">Novità</h6>
            <p className="text-xs text-dark/70 dark:text-white/70">
              Ortodonzia invisibile disponibile
            </p>
          </div>
        </div>
      </div>

      {/* Modale per aggiungere/modificare promemoria */}
      <ReminderModal
        isOpen={isReminderModalOpen}
        onClose={closeReminderModal}
        onSave={handleReminderSave}
      />
    </div>
  );
};

export default MobileRightSidebar;
