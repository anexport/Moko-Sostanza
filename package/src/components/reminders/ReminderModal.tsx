import { useState, useEffect } from 'react';
import { Modal, Button, Label, TextInput, Textarea } from 'flowbite-react';
import { ReminderService, Reminder } from '../../services/ReminderService';

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  reminder?: Reminder;
  selectedDate?: string;
  selectedTime?: string;
  onSave?: () => void; // Callback per refreshare i dati
}

const ReminderModal = ({ 
  isOpen, 
  onClose, 
  reminder, 
  selectedDate, 
  selectedTime,
  onSave 
}: ReminderModalProps) => {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    title: '',
    text: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Inizializza il form quando si apre il modale
  useEffect(() => {
    if (reminder) {
      // Modifica di un promemoria esistente
      setFormData({
        date: reminder.date,
        time: reminder.time,
        title: reminder.title,
        text: reminder.text
      });
    } else {
      // Nuovo promemoria
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        date: selectedDate || today,
        time: selectedTime || '09:00',
        title: '',
        text: ''
      });
    }
  }, [reminder, selectedDate, selectedTime, isOpen]);
  
  // Gestisce i cambiamenti nei campi del form
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Gestisce l'invio del form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      if (reminder) {
        // Aggiorna un promemoria esistente
        await ReminderService.updateReminder(reminder.id, formData);
      } else {
        // Crea un nuovo promemoria
        await ReminderService.createReminder(formData);
      }
      
      onSave?.(); // Ricarica i dati
      onClose();
    } catch (err) {
      console.error('Error saving reminder:', err);
      setError(err instanceof Error ? err.message : 'Errore durante il salvataggio');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Modal show={isOpen} onClose={onClose} size="md">
      <Modal.Header>
        {reminder ? 'Modifica Promemoria' : 'Nuovo Promemoria'}
      </Modal.Header>
      <Modal.Body>
        {error && (
          <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
              <Label htmlFor="time" value="Ora" />
              <TextInput
                id="time"
                name="time"
                type="time"
                value={formData.time}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="title" value="Titolo" />
            <TextInput
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Inserisci un titolo per il promemoria"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="text" value="Testo" />
            <Textarea
              id="text"
              name="text"
              value={formData.text}
              onChange={handleChange}
              placeholder="Inserisci il testo del promemoria"
              rows={4}
              required
            />
          </div>
          
          <div className="flex justify-end gap-4 mt-6">
            <Button color="light" onClick={onClose} disabled={isLoading}>
              Annulla
            </Button>
            <Button type="submit" color="primary" disabled={isLoading}>
              {isLoading ? 'Salvataggio...' : reminder ? 'Aggiorna' : 'Salva'}
            </Button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default ReminderModal;
