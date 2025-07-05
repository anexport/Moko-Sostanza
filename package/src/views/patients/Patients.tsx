import { Table, Badge, Button, TextInput, Spinner } from "flowbite-react";
import { Icon } from "@iconify/react";
import SimpleBar from "simplebar-react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { HiSearch } from "react-icons/hi";
import PageContainer from '../../components/container/PageContainer';
import { PatientService, type Patient } from '../../services/PatientService';


const Patients = () => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load patients from database
  const loadPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await PatientService.getPatients(
        { search: searchTerm || undefined },
        { limit: 50 }
      );
      setPatients(result.patients);
    } catch (err) {
      console.error('Error loading patients:', err);
      setError('Errore nel caricamento dei pazienti');
    } finally {
      setLoading(false);
    }
  };

  // Load patients on component mount
  useEffect(() => {
    loadPatients();
  }, []);

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadPatients();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Handle search input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Verifica se siamo nella pagina di ricerca
  const isSearchPage = location.pathname === "/patients/search";

  // Imposta il focus sul campo di ricerca quando si accede alla pagina di ricerca
  useEffect(() => {
    if (isSearchPage) {
      const searchInput = document.getElementById('search-patient');
      if (searchInput) {
        searchInput.focus();
      }
    }
  }, [isSearchPage]);

  return (
    <PageContainer title="Gestione Pazienti" description="Gestisci l'elenco dei pazienti">
      <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h5 className="card-title">Gestione Pazienti</h5>
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative">
              <TextInput
                id="search-patient"
                type="text"
                placeholder="Cerca paziente..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full md:w-auto"
                icon={HiSearch}
              />
            </div>
            <Button color="primary" className="flex items-center gap-2" as={Link} to="/patients/new">
              <Icon icon="solar:add-circle-outline" height={20} />
              Nuovo Paziente
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table hoverable className="table-auto w-full">
            <Table.Head>
              <Table.HeadCell className="p-4">Nome</Table.HeadCell>
              <Table.HeadCell className="p-4 hidden sm:table-cell">Telefono</Table.HeadCell>
              <Table.HeadCell className="p-4 hidden md:table-cell">Email</Table.HeadCell>
              <Table.HeadCell className="p-4 hidden lg:table-cell">Ultima Visita</Table.HeadCell>
              <Table.HeadCell className="p-4 hidden xl:table-cell">Prossimo Appuntamento</Table.HeadCell>
              <Table.HeadCell className="p-4">Stato</Table.HeadCell>
              <Table.HeadCell className="p-4">Azioni</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y divide-border dark:divide-darkborder">
              {loading ? (
                <Table.Row>
                  <Table.Cell colSpan={7} className="text-center py-8">
                    <div className="flex justify-center items-center gap-2">
                      <Spinner size="sm" />
                      <span>Caricamento pazienti...</span>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ) : error ? (
                <Table.Row>
                  <Table.Cell colSpan={7} className="text-center py-4">
                    <p className="text-red-500">{error}</p>
                  </Table.Cell>
                </Table.Row>
              ) : patients.length > 0 ? (
                patients.map((patient) => (
                <Table.Row key={patient.id}>
                  <Table.Cell className="p-4">
                    <div className="flex gap-2 items-center">
                      <div>
                        <h6 className="text-sm font-medium">{patient.first_name} {patient.last_name}</h6>
                      </div>
                    </div>
                  </Table.Cell>
                  <Table.Cell className="p-4 hidden sm:table-cell">
                    <p className="text-sm">{patient.phone}</p>
                  </Table.Cell>
                  <Table.Cell className="p-4 hidden md:table-cell">
                    <p className="text-sm">{patient.email || 'N/A'}</p>
                  </Table.Cell>
                  <Table.Cell className="p-4 hidden lg:table-cell">
                    <p className="text-sm">N/A</p>
                  </Table.Cell>
                  <Table.Cell className="p-4 hidden xl:table-cell">
                    <p className="text-sm">N/A</p>
                  </Table.Cell>
                  <Table.Cell className="p-4">
                    <Badge className="bg-lightsuccess text-success">
                      Attivo
                    </Badge>
                  </Table.Cell>
                  <Table.Cell className="p-4">
                    <div className="flex gap-2">
                      <Button color="primary" size="xs" as={Link} to={`/patients/view/${patient.id}`}>
                        <Icon icon="solar:eye-outline" height={16} />
                      </Button>
                      <Button color="secondary" size="xs" as={Link} to={`/patients/edit/${patient.id}`}>
                        <Icon icon="solar:pen-outline" height={16} />
                      </Button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))
              ) : (
                <Table.Row>
                  <Table.Cell colSpan={7} className="text-center py-4">
                    <p className="text-gray-500">Nessun paziente trovato</p>
                  </Table.Cell>
                </Table.Row>
              )}
              </Table.Body>
            </Table>
          </div>
      </div>
    </PageContainer>
  );
};

export default Patients;
