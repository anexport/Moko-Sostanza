import { Table, Badge, Button, Select, TextInput, Tooltip, Spinner } from "flowbite-react";
import { Icon } from "@iconify/react";
import SimpleBar from "simplebar-react";
import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { HiSearch } from "react-icons/hi";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { InvoiceService, type InvoiceWithDetails } from "../../services/InvoiceService";

// Tipo per fattura formattata per la UI
interface FormattedInvoice {
  id: string;
  patient: string;
  date: string;
  invoice: string;
  amount: string;
  status: string;
  rawData: InvoiceWithDetails;
}

// Componente per il template di stampa dell'elenco fatture
const InvoiceListPrintTemplate = ({
  invoices,
  period
}: {
  invoices: FormattedInvoice[],
  period: string
}) => {
  return (
    <div id="print-template" className="p-8 max-w-4xl mx-auto bg-white text-black">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">ELENCO FATTURE</h1>
        <p className="text-sm text-gray-600">MOKO SOSTANZA Dental CRM</p>
        <p className="text-sm text-gray-600 mt-2">Periodo: {period}</p>
        <p className="text-sm text-gray-600">Generato il {new Date().toLocaleDateString('it-IT')}</p>
      </div>

      {/* Tabella fatture */}
      <div className="mb-8">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">Paziente</th>
              <th className="border p-2 text-left">Data</th>
              <th className="border p-2 text-left">Numero Fattura</th>
              <th className="border p-2 text-right">Importo</th>
              <th className="border p-2 text-center">Stato</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length > 0 ? (
              invoices.map((bill) => (
                <tr key={bill.id}>
                  <td className="border p-2">{bill.patient}</td>
                  <td className="border p-2">{bill.date}</td>
                  <td className="border p-2">{bill.invoice}</td>
                  <td className="border p-2 text-right">{bill.amount}</td>
                  <td className="border p-2 text-center">
                    <span className={bill.status === "Pagato" ? "text-green-600 font-bold" : "text-orange-500 font-bold"}>
                      {bill.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="border p-2 text-center">Nessuna fattura trovata</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Riepilogo */}
      <div className="mb-8">
        <div className="flex justify-between border-t border-gray-300 pt-4">
          <div>
            <p><strong>Totale fatture:</strong> {invoices.length}</p>
          </div>
          <div>
            <p><strong>Totale importo:</strong> {
              invoices.reduce((total, bill) => {
                const amount = parseFloat(bill.amount.replace('€', '').replace(',', '.').trim());
                return total + (isNaN(amount) ? 0 : amount);
              }, 0).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            } €</p>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>MOKO SOSTANZA Dental CRM - Gestionale per Dentisti</p>
        <p>Documento generato automaticamente - {new Date().toLocaleDateString('it-IT')}</p>
      </div>
    </div>
  );
};

const Billing = () => {
  const location = useLocation();
  const [selectedPeriod, setSelectedPeriod] = useState("Questo Mese");
  const [searchTerm, setSearchTerm] = useState("");
  const [invoices, setInvoices] = useState<InvoiceWithDetails[]>([]);
  const [filteredBilling, setFilteredBilling] = useState<FormattedInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPrintTemplate, setShowPrintTemplate] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const printTemplateRef = useRef<HTMLDivElement>(null);
  const pdfTemplateRef = useRef<HTMLDivElement>(null);

  // Verifica se siamo nella pagina di ricerca
  const isSearchPage = location.pathname === "/billing/search";

  // Funzione per formattare le fatture per la UI
  const formatInvoices = (invoiceList: InvoiceWithDetails[]): FormattedInvoice[] => {
    return invoiceList.map(invoice => {
      const patientName = invoice.patient?.first_name && invoice.patient?.last_name 
        ? `${invoice.patient.first_name} ${invoice.patient.last_name}`
        : invoice.patient?.first_name || 'Paziente';
      
      const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('it-IT');
      };

      const formatAmount = (amount: number | null) => {
        return amount ? `€${amount.toFixed(2).replace('.', ',')}` : '€0,00';
      };

      const formatStatus = (status: string | null) => {
        switch (status) {
          case 'paid': return 'Pagato';
          case 'sent': return 'Inviata';
          case 'draft': return 'Bozza';
          case 'overdue': return 'Scaduta';
          default: return 'Non definito';
        }
      };

      return {
        id: invoice.id,
        patient: patientName,
        date: formatDate(invoice.issue_date),
        invoice: invoice.invoice_number || '',
        amount: formatAmount(invoice.total),
        status: formatStatus(invoice.status),
        rawData: invoice
      };
    });
  };

  // Carica le fatture dal database
  const loadInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await InvoiceService.getInvoices(
        { search: searchTerm || undefined },
        { limit: 100, sortBy: 'issue_date', sortOrder: 'desc' }
      );
      setInvoices(result.invoices);
      const formattedData = formatInvoices(result.invoices);
      setFilteredBilling(formattedData);
    } catch (err) {
      console.error('Error loading invoices:', err);
      setError('Errore nel caricamento delle fatture');
    } finally {
      setLoading(false);
    }
  };

  // Carica le fatture al mount
  useEffect(() => {
    loadInvoices();
  }, []);

  // Imposta il focus sul campo di ricerca quando si accede alla pagina di ricerca
  useEffect(() => {
    if (isSearchPage) {
      const searchInput = document.getElementById('search-invoice');
      if (searchInput) {
        searchInput.focus();
      }
    }
  }, [isSearchPage]);

  // Filtra le fatture in base al termine di ricerca
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.trim() === "") {
      const formattedData = formatInvoices(invoices);
      setFilteredBilling(formattedData);
    } else {
      const formattedData = formatInvoices(invoices);
      const filtered = formattedData.filter(bill =>
        bill.patient.toLowerCase().includes(term.toLowerCase()) ||
        bill.invoice.toLowerCase().includes(term.toLowerCase()) ||
        bill.amount.includes(term)
      );
      setFilteredBilling(filtered);
    }
  };

  // Ricerca con debounce per chiamate API
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadInvoices();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPeriod(e.target.value);
  };

  // Funzione per stampare l'elenco delle fatture
  const handlePrintInvoiceList = () => {
    setShowPrintTemplate(true);
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        setShowPrintTemplate(false);
      }, 500);
    }, 300);
  };

  // Funzione per generare e scaricare il PDF dell'elenco fatture
  const handleDownloadPDF = async () => {
    // Mostra l'indicatore di caricamento
    setIsGeneratingPDF(true);

    try {
      // Assicuriamoci che il template PDF sia visibile
      if (!pdfTemplateRef.current) {
        console.error('Riferimento al template PDF non disponibile');
        setIsGeneratingPDF(false);
        return;
      }

      // Utilizziamo una versione semplificata di html2canvas + jsPDF
      const element = pdfTemplateRef.current;

      // Creiamo il canvas dall'elemento HTML
      const canvas = await html2canvas(element, {
        scale: 2, // Alta qualità
        useCORS: true,
        backgroundColor: '#ffffff',
        allowTaint: true,
        scrollX: 0,
        scrollY: 0,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight
      });

      // Creiamo il documento PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Dimensioni A4 in mm
      const pageWidth = 210;
      const pageHeight = 297;

      // Margini
      const margin = 10;

      // Dimensioni effettive dell'area di stampa
      const printWidth = pageWidth - (margin * 2);

      // Calcola le dimensioni dell'immagine nel PDF
      const imgWidth = printWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Aggiungiamo l'immagine al PDF
      // Utilizziamo un metodo più semplice per la suddivisione in pagine

      // Altezza massima per pagina
      const maxHeight = pageHeight - (margin * 2);

      // Numero di pagine necessarie
      const pageCount = Math.ceil(imgHeight / maxHeight);

      // Per ogni pagina
      for (let i = 0; i < pageCount; i++) {
        // Se non è la prima pagina, aggiungi una nuova pagina
        if (i > 0) {
          pdf.addPage();
        }

        // Calcola la posizione di inizio nel canvas
        const sourceY = (i * maxHeight / imgHeight) * canvas.height;

        // Calcola l'altezza della porzione da includere
        const sourceHeight = Math.min(
          canvas.height - sourceY,
          (maxHeight / imgHeight) * canvas.height
        );

        // Crea un canvas temporaneo per la porzione corrente
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = sourceHeight;

        // Disegna la porzione corrente sul canvas temporaneo
        const ctx = tempCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(
            canvas,
            0, sourceY, canvas.width, sourceHeight,
            0, 0, tempCanvas.width, tempCanvas.height
          );

          // Converti il canvas temporaneo in immagine
          const imgData = tempCanvas.toDataURL('image/jpeg', 1.0);

          // Aggiungi l'immagine al PDF
          pdf.addImage(
            imgData,
            'JPEG',
            margin,
            margin,
            printWidth,
            (sourceHeight * printWidth) / canvas.width
          );
        }
      }

      // Aggiungi metadati al PDF
      pdf.setProperties({
        title: `Elenco Fatture - ${selectedPeriod}`,
        subject: 'Elenco Fatture',
        author: 'MOKO SOSTANZA Dental CRM',
        keywords: 'fatture, dentista, elenco',
        creator: 'MOKO SOSTANZA Dental CRM'
      });

      // Genera il nome del file
      const fileName = `Elenco_Fatture_${selectedPeriod.replace(/\s+/g, '_')}.pdf`;

      // Scarica il PDF
      pdf.save(fileName);

    } catch (error) {
      console.error('Errore durante la generazione del PDF:', error);
    } finally {
      // Nascondi l'indicatore di caricamento
      setIsGeneratingPDF(false);
    }
  };

  return (
    <>
      <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words">
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h5 className="card-title">Gestione Fatturazione</h5>
            <div className="flex gap-2">
              <Tooltip content="Stampa l'elenco delle fatture">
                <Button color="light" className="flex items-center gap-2 no-print" onClick={handlePrintInvoiceList}>
                  <Icon icon="solar:printer-outline" height={20} />
                  <span className="hidden sm:inline">Stampa Elenco</span>
                  <span className="sm:hidden">Stampa</span>
                </Button>
              </Tooltip>
              <Tooltip content="Scarica l'elenco delle fatture in formato PDF">
                <Button
                  color="light"
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 no-print"
                  disabled={isGeneratingPDF}
                >
                  {isGeneratingPDF ? (
                    <>
                      <div className="animate-spin h-5 w-5 border-2 border-gray-500 border-t-transparent rounded-full"></div>
                      <span className="hidden sm:inline">Generazione...</span>
                      <span className="sm:hidden">PDF...</span>
                    </>
                  ) : (
                    <>
                      <Icon icon="solar:file-download-outline" height={20} />
                      <span className="hidden sm:inline">Scarica PDF</span>
                      <span className="sm:hidden">PDF</span>
                    </>
                  )}
                </Button>
              </Tooltip>
              <Button color="primary" className="flex items-center gap-2" as={Link} to="/billing/new">
                <Icon icon="solar:add-circle-outline" height={20} />
                <span className="hidden sm:inline">Nuova Fattura</span>
                <span className="sm:hidden">Nuova</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 no-print">
            <div className="relative">
              <TextInput
                id="search-invoice"
                type="text"
                placeholder="Cerca fattura..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full"
                icon={HiSearch}
              />
            </div>
            <Select
              id="period-filter"
              className="w-full"
              value={selectedPeriod}
              onChange={handleSelectChange}
              required
            >
              <option value="Questo Mese">Questo Mese</option>
              <option value="Mese Scorso">Mese Scorso</option>
              <option value="Questo Trimestre">Questo Trimestre</option>
              <option value="Quest'Anno">Quest'Anno</option>
            </Select>
          </div>

          {/* Titolo per la stampa */}
          <div className="hidden print:block print:mb-4">
            <h2 className="text-2xl font-bold text-center">Elenco Fatture</h2>
            <p className="text-center text-gray-500 mt-2">
              Periodo: {selectedPeriod}
            </p>
            <p className="text-center text-gray-500 mt-1">
              Generato il {new Date().toLocaleDateString('it-IT')}
            </p>
          </div>
        </div>

        {/* Stili per la stampa */}
        <style type="text/css" media="print">
          {`
            @media print {
              body * {
                visibility: hidden;
              }
              #print-template, #print-template * {
                visibility: visible;
              }
              #print-template {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                font-size: 12pt;
                line-height: 1.3;
              }
              table {
                page-break-inside: avoid;
                font-size: 10pt;
              }
              table tr {
                page-break-inside: avoid;
              }
              p {
                orphans: 3;
                widows: 3;
              }
              h1, h2, h3, h4 {
                page-break-after: avoid;
              }
              @page {
                size: A4;
                margin: 15mm;
              }
              .no-print {
                display: none !important;
              }
            }
          `}
        </style>

        {/* Template di stampa (nascosto normalmente, visibile solo durante la stampa) */}
        {showPrintTemplate && (
          <div className="fixed top-0 left-0 w-full h-0 overflow-hidden print:h-auto print:overflow-visible">
            <div ref={printTemplateRef} className="bg-white">
              <InvoiceListPrintTemplate invoices={filteredBilling} period={selectedPeriod} />
            </div>
          </div>
        )}

        {/* Template di stampa nascosto ma renderizzato per la generazione PDF */}
        <div className="fixed top-0 left-0 w-full opacity-0 pointer-events-none" style={{ zIndex: -9999 }}>
          <div id="pdf-template" ref={pdfTemplateRef} className="bg-white p-0 m-0">
            <InvoiceListPrintTemplate invoices={filteredBilling} period={selectedPeriod} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table hoverable className="table-auto w-full">
            <Table.Head>
              <Table.HeadCell className="p-4">Paziente</Table.HeadCell>
              <Table.HeadCell className="p-4">Data</Table.HeadCell>
              <Table.HeadCell className="p-4 hidden md:table-cell md:print:table-cell">Numero Fattura</Table.HeadCell>
              <Table.HeadCell className="p-4">Importo</Table.HeadCell>
              <Table.HeadCell className="p-4">Stato</Table.HeadCell>
              <Table.HeadCell className="p-4 no-print">Azioni</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y divide-border dark:divide-darkborder">
              {loading ? (
                <Table.Row>
                  <Table.Cell colSpan={6} className="text-center py-4">
                    <div className="flex justify-center items-center">
                      <Spinner size="md" />
                      <span className="ml-2 text-gray-500">Caricamento fatture...</span>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ) : error ? (
                <Table.Row>
                  <Table.Cell colSpan={6} className="text-center py-4">
                    <p className="text-red-500">{error}</p>
                  </Table.Cell>
                </Table.Row>
              ) : filteredBilling.length > 0 ? (
                filteredBilling.map((bill) => (
                <Table.Row key={bill.id}>
                  <Table.Cell className="p-4">
                    <div className="flex gap-2 items-center">
                      <div>
                        <h6 className="text-sm font-medium">{bill.patient}</h6>
                      </div>
                    </div>
                  </Table.Cell>
                  <Table.Cell className="p-4">
                    <p className="text-sm">{bill.date}</p>
                  </Table.Cell>
                  <Table.Cell className="p-4 hidden md:table-cell md:print:table-cell">
                    <p className="text-sm">{bill.invoice}</p>
                  </Table.Cell>
                  <Table.Cell className="p-4">
                    <p className="text-sm">{bill.amount}</p>
                  </Table.Cell>
                  <Table.Cell className="p-4">
                    <Badge
                      className={
                        bill.status === "Pagato"
                          ? "bg-lightsuccess text-success"
                          : bill.status === "Inviata"
                          ? "bg-lightinfo text-info"
                          : bill.status === "Bozza"
                          ? "bg-lightwarning text-warning"
                          : bill.status === "Scaduta"
                          ? "bg-lighterror text-error"
                          : "bg-lightgray text-gray"
                      }
                    >
                      {bill.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell className="p-4 no-print">
                    <div className="flex gap-2">
                      <Button color="primary" size="xs" as={Link} to={`/billing/invoices/${bill.id}`}>
                        <Icon icon="solar:eye-outline" height={16} />
                      </Button>
                      <Button
                        color="secondary"
                        size="xs"
                        onClick={() => {
                          window.open(`/billing/invoices/${bill.id}?print=true`, '_blank');
                        }}
                      >
                        <Icon icon="solar:printer-outline" height={16} />
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
                ))
              ) : (
                <Table.Row>
                  <Table.Cell colSpan={6} className="text-center py-4">
                    <p className="text-gray-500">Nessuna fattura trovata</p>
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>
        </div>
      </div>
    </>
  );
};

export default Billing;
