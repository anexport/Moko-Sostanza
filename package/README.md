# MOKO SOSTANZA Dental CRM - Gestionale per Dentisti

![MOKO SOSTANZA Dental CRM](./src/assets/images/logos/dental-crm-logo-basic.svg)

Un sistema di gestione completo per studi dentistici e cliniche odontoiatriche, sviluppato con React, TypeScript e Tailwind CSS.

## 🚀 Caratteristiche

- **Dashboard interattiva**: Visualizza metriche chiave come appuntamenti, nuovi pazienti e fatturato
- **Gestione pazienti**: Registra, visualizza e modifica informazioni sui pazienti
- **Gestione appuntamenti**: Pianifica e gestisci appuntamenti con calendario integrato
- **Fatturazione**: Crea e gestisci fatture, con reportistica finanziaria
- **Gestione trattamenti**: Catalogo completo dei trattamenti offerti
- **Gestione inventario**: Monitora prodotti e materiali
- **Interfaccia multi-ruolo**: Viste separate per dentisti e personale della clinica
- **Design responsive**: Funziona su desktop, tablet e dispositivi mobili
- **Tema chiaro/scuro**: Supporto per modalità chiara e scura

## 📋 Prerequisiti

Prima di iniziare, assicurati di avere installato:

- Node.js (versione 18.x o superiore)
- npm (versione 9.x o superiore)

## 🔧 Installazione

1. Clona il repository:

   ```bash
   git clone https://github.com/daviducciope/matdash-react.git
   cd matdash-react-free-v2-0/package
   ```

2. Installa le dipendenze:

   ```bash
   npm install
   ```

   > **IMPORTANTE**: Se riscontri errori durante l'installazione, prova con:
   >
   > ```bash
   > npm install --legacy-peer-deps
   > ```
   >
   > Questo è necessario a causa di alcune dipendenze che potrebbero avere requisiti di peer dependency incompatibili.

3. Avvia il server di sviluppo:

   ```bash
   npm run dev
   ```

4. Apri il browser e vai a:
   ```
   http://localhost:5173
   ```

### Risoluzione problemi comuni

#### Problemi con React Router

Se riscontri errori relativi a React Router, assicurati di avere installato sia `react-router` che `react-router-dom` versione 7.x:

```bash
npm install react-router@7.0.2 react-router-dom@7.0.2 --save
```

Inoltre, verifica che tutti gli import nei file sorgente utilizzino `react-router-dom` invece di `react-router` per componenti come `Link`, `useLocation`, `Navigate`, ecc.

#### Errori con gli hook e i componenti di React Router

Se riscontri errori come "useNavigate() may be used only in the context of a <Router> component", "useLocation() may be used only in the context of a <Router> component", "Cannot destructure property 'basename' of 'React.useContext(...)' as it is null" o problemi con le pagine di login o altre sezioni dell'applicazione, ci sono diverse possibili cause:

1. **Import errato**: Assicurati di importare gli hook e i componenti di React Router da `react-router-dom` e non da `react-router`:

   ```diff
   - import { useNavigate, useLocation, useParams, Link, Outlet } from 'react-router';
   + import { useNavigate, useLocation, useParams, Link, Outlet } from 'react-router-dom';
   ```

2. **Componente fuori dal Router**: Assicurati che il componente che utilizza gli hook di React Router sia renderizzato all'interno di un componente Router

3. **Verifica i layout**: Controlla che i layout (come `BlankLayout.tsx` e `FullLayout.tsx`) importino correttamente i componenti da `react-router-dom`

4. **Componenti utilizzati in contesti diversi**: Se un componente viene utilizzato sia all'interno che all'esterno del contesto Router, evita di utilizzare componenti come `Link` e usa invece tag HTML standard come `<a href="...">`:

   ```diff
   - <Link to="/">Home</Link>
   + <a href="/">Home</a>
   ```

5. **Soluzione alternativa**: Se non puoi risolvere il problema con i punti precedenti, sostituisci l'uso degli hook con il componente `<Link>` di React Router dove possibile

#### Errore "Expected corresponding JSX closing tag for <Link>"

Assicurati che tutti i tag `<Link>` abbiano il corrispondente tag di chiusura `</Link>`. Questo errore può verificarsi quando si sostituisce un elemento `<div>` con un `<Link>` ma ci si dimentica di aggiornare anche il tag di chiusura.

## 🏗️ Struttura del progetto

```
package/
├── public/              # File statici
├── src/
│   ├── assets/          # Immagini, font e altri asset
│   ├── components/      # Componenti riutilizzabili
│   ├── constants/       # Costanti e configurazioni
│   ├── css/             # File CSS globali e di layout
│   ├── hooks/           # Custom React hooks
│   ├── layouts/         # Layout dell'applicazione
│   ├── routes/          # Configurazione del routing
│   ├── utils/           # Funzioni di utilità
│   ├── views/           # Componenti pagina
│   ├── App.tsx          # Componente principale
│   └── main.tsx         # Entry point
├── package.json         # Dipendenze e script
└── vite.config.ts       # Configurazione di Vite
```

## 📝 Changelog

### Fix: Implementazione funzionalità pulsante "Modifica Profilo" nella pagina profilo

- Implementata la funzionalità del pulsante "Modifica Profilo" nella pagina del profilo utente
- Aggiunta modalità di visualizzazione/modifica con campi disabilitati quando non in modalità modifica
- Implementati pulsanti "Annulla" e "Salva Modifiche" che appaiono solo in modalità modifica
- Aggiunta la possibilità di annullare le modifiche e tornare ai dati originali
- Migliorata l'esperienza utente con feedback visivo durante la modifica

### Feat: Sostituzione icona utente nella top bar con icona dentale professionale

- Sostituita l'icona dell'utente (l'omino) nella top bar con un'immagine professionale più adatta a un gestionale per dentisti
- Creata una nuova icona SVG dentale con sfondo trasparente che si integra perfettamente con lo stile dell'interfaccia
- Mantenute tutte le funzionalità dell'icona originale (menu a tendina al click)
- Migliorata l'esperienza utente con un'icona più rappresentativa del settore dentistico

### Fix: Risoluzione problema di caricamento dinamico del modulo di inventario

- Risolto il problema di caricamento dinamico del modulo Inventory.tsx
- Ricreati i file necessari per la gestione dell'inventario con implementazione completa
- Migliorata la struttura del codice con commenti esplicativi per facilitare la manutenzione
- Ottimizzata la gestione dello stato e il filtraggio dei prodotti nell'inventario
- Implementata la visualizzazione responsive della tabella dei prodotti
- Aggiunta gestione dello stato dell'inventario (OK, Basso, Critico) in base alle quantità minime

### Feat: Miglioramento funzionalità di stampa e aggiunta esportazione PDF in tutta l'applicazione

- Implementato un sistema unificato di stampa e generazione PDF in tutte le pagine principali dell'applicazione
- Aggiunti pulsanti "Scarica PDF" nelle pagine di visualizzazione fattura, elenco fatture e report finanziari
- Creati template di stampa dedicati con layout ottimizzati per ciascuna tipologia di documento
- Migliorata l'organizzazione dei dati nei template di stampa con sezioni logiche e intestazioni chiare
- Implementata la generazione di PDF con nomi file basati sul contenuto del documento
- Aggiunti indicatori di caricamento durante la generazione dei PDF per migliorare l'esperienza utente
- Ottimizzato il layout di stampa per garantire una corretta visualizzazione su carta e nei PDF
- Implementata la gestione delle pagine multiple nei PDF per documenti lunghi

### Feat: Miglioramento funzionalità di stampa e aggiunta esportazione PDF nella pagina paziente

- Implementato un template di stampa dedicato per la visualizzazione del paziente con layout ottimizzato
- Aggiunto un pulsante "Scarica PDF" che genera un file PDF con tutti i dati del paziente
- Migliorata l'organizzazione dei dati nel template di stampa con sezioni logiche e intestazioni chiare
- Implementata la generazione di PDF con nome file basato sul nome del paziente
- Aggiunti tooltip esplicativi per migliorare l'usabilità dei pulsanti
- Ottimizzato il layout di stampa per garantire una corretta visualizzazione su carta

### Feat: Registrazione interventi dentistici con tracciabilità dispositivi medici

- Implementato un sistema completo per la registrazione degli interventi dentistici
- Aggiunta distinzione tra interventi chirurgici e non chirurgici
- Creato uno schema dentale interattivo per selezionare i denti coinvolti negli interventi
- Implementata la tracciabilità dei dispositivi medici con codice UDI per gli interventi chirurgici
- Aggiunta una nuova scheda "Interventi" nella pagina del profilo paziente
- Implementate validazioni appropriate per tutti i campi, in particolare per il codice UDI

### Feat: Aggiunta campi medici alla scheda paziente

- Aggiunti nuovi campi alla scheda paziente: Codice Fiscale, Patologie Pregresse, Fumatore, Farmaci, Anamnesi
- Creata una nuova scheda "Cartella Clinica" nella pagina del profilo paziente
- Implementata la visualizzazione e la modifica dei nuovi campi medici
- Migliorata l'organizzazione delle informazioni del paziente per una migliore esperienza utente

### Feat: Aggiunta funzionalità di creazione rapida paziente nei form di selezione

- Implementato un pulsante "Nuovo Paziente" nel menu a tendina di selezione paziente
- Aggiunto un modale per la creazione rapida di un nuovo paziente con i campi essenziali
- Il nuovo paziente viene automaticamente selezionato dopo la creazione
- Migliorata l'esperienza utente nei form che richiedono la selezione di un paziente

### 1d55dee (2024-XX-XX) - Feat: Aggiunta funzionalità di eventi e allegati alla scheda paziente

- Implementato un sistema per registrare eventi nella scheda paziente (visite, prescrizioni, analisi, note)
- Aggiunta la possibilità di caricare e gestire allegati per ogni evento (documenti, immagini, referti)
- Creata una nuova scheda "Eventi e Documenti" nella pagina del profilo paziente
- Implementato un modale per l'aggiunta e la modifica degli eventi con supporto per upload di file

### 8f5a440 (2024-XX-XX) - Fix: Implementata funzionalità di stampa presenze nella pagina staff/attendance

- Aggiunta funzionalità di stampa al pulsante "Stampa Presenze" nella pagina di gestione presenze del personale
- Implementati stili CSS specifici per la stampa che nascondono elementi non necessari
- Aggiunto titolo visibile solo in stampa con informazioni sulla settimana visualizzata e data di generazione

## 🔄 Flusso di lavoro

### Autenticazione

Il sistema supporta due tipi di utenti:

- **Dentisti**: Accesso alla dashboard personale, pazienti, appuntamenti e fatturazione
- **Clinica**: Accesso alla dashboard della clinica, gestione dei dottori, personale e risorse

### Navigazione

- La barra laterale sinistra contiene il menu principale, organizzato per categorie
  - Le voci principali del menu sono in grassetto per una migliore leggibilità
  - I sottomenu utilizzano un font normale per creare una gerarchia visiva chiara
- La barra superiore mostra il logo e le informazioni dell'utente
- La barra laterale destra mostra notifiche e appuntamenti imminenti

## 🛠️ Tecnologie utilizzate

- **React**: Libreria UI
- **TypeScript**: Tipizzazione statica
- **Vite**: Build tool
- **React Router**: Routing
- **Tailwind CSS**: Framework CSS
- **Flowbite**: Componenti UI
- **ApexCharts**: Grafici e visualizzazioni
- **Formik**: Gestione form
- **Yup**: Validazione form
- **Zustand**: Gestione stato
- **jsPDF**: Generazione di documenti PDF
- **html2canvas**: Conversione HTML in immagini per PDF

## 📱 Modalità responsive

L'applicazione è completamente responsive:

- **Desktop**: Layout completo con sidebar destra e sinistra
- **Tablet**: Layout adattivo con sidebar collassabile tramite drawer
- **Mobile**: Layout ottimizzato per schermi piccoli con menu a drawer accessibili tramite pulsanti nell'header

La navigazione mobile è stata ottimizzata utilizzando drawer personalizzati con animazioni fluide per garantire un'esperienza utente intuitiva su tutti i dispositivi. I menu non occupano tutto lo schermo ma hanno una larghezza ottimale per la visualizzazione su dispositivi mobili. Si aprono e chiudono correttamente sia cliccando sui pulsanti dedicati, sia cliccando al di fuori del menu o sul pulsante di chiusura, mentre i click all'interno del menu non causano la chiusura.

## 🔐 Gestione utenti

Per simulare diversi tipi di utenti, puoi utilizzare:

```javascript
// Per simulare un utente dentista
localStorage.setItem(
  'user-session',
  JSON.stringify({
    user: {
      email: 'dentista@esempio.com',
      role: 'dentist',
    },
  }),
);

// Per simulare un utente clinica
localStorage.setItem(
  'user-session',
  JSON.stringify({
    user: {
      email: 'clinica@esempio.com',
      role: 'clinic',
    },
  }),
);
```

Ricarica la pagina dopo aver impostato la sessione utente.

## 🔍 Funzionalità principali

### Dashboard

- **Appuntamenti oggi**: Numero di appuntamenti per la giornata corrente
- **Nuovi pazienti**: Statistiche sui nuovi pazienti
- **Incasso mensile**: Grafico dell'andamento degli incassi
- **Prossimi appuntamenti**: Lista degli appuntamenti imminenti
- **Statistiche trattamenti**: Grafici sui trattamenti più frequenti

### Gestione pazienti

- Elenco completo dei pazienti
- Schede dettagliate per ogni paziente
- Funzionalità di ricerca e filtro
- Aggiunta e modifica dei dati dei pazienti
- Stampa del profilo paziente con layout ottimizzato
- Esportazione del profilo paziente in formato PDF
- Registrazione eventi nella scheda paziente (visite, prescrizioni, analisi)
- Upload e gestione di allegati (documenti, immagini, referti)
- Registrazione interventi dentistici chirurgici e non chirurgici
- Schema dentale interattivo per selezionare i denti coinvolti
- Tracciabilità dei dispositivi medici con codice UDI

### Gestione appuntamenti

- Calendario interattivo
- Prenotazione rapida
- Vista giornaliera, settimanale e mensile
- Notifiche per appuntamenti imminenti

### Fatturazione

- Creazione fatture
- Elenco fatture emesse
- Ricerca e filtro fatture
- Visualizzazione dettagliata delle fatture
- Stampa fatture con layout ottimizzato
- Esportazione fatture in formato PDF
- Reportistica finanziaria con grafici e tabelle
- Stampa ed esportazione PDF dei report finanziari

## 🧪 Testing

Per eseguire i test:

```bash
npm run test
```

## 🏭 Build per produzione

Per creare una build ottimizzata per la produzione:

```bash
npm run build
```

I file compilati saranno disponibili nella cartella `dist/`.

## 🤝 Contribuire

Le contribuzioni sono benvenute! Per favore, segui questi passaggi:

1. Forka il repository
2. Crea un branch per la tua feature (`git checkout -b feature/amazing-feature`)
3. Committa i tuoi cambiamenti (`git commit -m 'Aggiungi una feature incredibile'`)
4. Pusha al branch (`git push origin feature/amazing-feature`)
5. Apri una Pull Request

## 📄 Licenza

Questo progetto è distribuito con licenza MIT. Vedi il file `LICENSE` per maggiori informazioni.

## 📞 Contatti

Per domande o supporto, contatta:

- Email: info@mokosostanza.com
- Website: [www.mokosostanza.com](https://www.mokosostanza.com)

---

Sviluppato con ❤️ da SOSTANZA Comunicazione & Servizi
