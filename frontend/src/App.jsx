import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Building2,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Download,
  FileText,
  History,
  ListChecks,
  Plus,
  Printer,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  Wrench
} from "lucide-react";
import "./style.css";

const STORAGE_KEYS = {
  services: "cotacerta-services",
  clients: "cotacerta-clients",
  quotes: "cotacerta-quotes",
  settings: "cotacerta-settings"
};

const startup = {
  name: "CotaCerta",
  legalName: "CotaCerta Tecnologia para Oficinas",
  tagline: "Orcamentos profissionais, valores consistentes e PDF pronto para o cliente."
};

const defaultSettings = {
  companyName: "Oficina Familia Silva",
  document: "CNPJ 12.345.678/0001-90",
  phone: "(11) 98500-1177",
  address: "Av. das Garagens, 420 - Centro",
  city: "Sao Paulo, SP",
  validDays: 7,
  warranty: "Garantia de 90 dias para servicos executados pela oficina.",
  terms: "Orcamento sujeito a aprovacao do cliente. Pecas adicionais identificadas durante a execucao serao orcadas separadamente."
};

const defaultServices = [
  {
    id: "svc-oil",
    name: "Troca de oleo e filtro",
    category: "Manutencao",
    price: 220,
    deadlineHours: 2,
    description: "Oleo semissintetico, filtro de oleo e descarte correto."
  },
  {
    id: "svc-brakes",
    name: "Revisao completa dos freios",
    category: "Seguranca",
    price: 360,
    deadlineHours: 4,
    description: "Inspecao de pastilhas, discos, fluido, limpeza e regulagem."
  },
  {
    id: "svc-suspension",
    name: "Diagnostico de suspensao",
    category: "Diagnostico",
    price: 180,
    deadlineHours: 2,
    description: "Verificacao de amortecedores, buchas, bandejas e terminais."
  },
  {
    id: "svc-injection",
    name: "Limpeza de bicos injetores",
    category: "Motor",
    price: 310,
    deadlineHours: 3,
    description: "Teste de vazao, limpeza em equipamento e equalizacao."
  },
  {
    id: "svc-alignment",
    name: "Alinhamento e balanceamento",
    category: "Rodas",
    price: 160,
    deadlineHours: 1.5,
    description: "Alinhamento computadorizado e balanceamento das quatro rodas."
  },
  {
    id: "svc-electric",
    name: "Diagnostico eletrico",
    category: "Eletrica",
    price: 240,
    deadlineHours: 3,
    description: "Scanner, verificacao de carga, aterramentos, fusivel e chicotes."
  }
];

const defaultClients = [
  {
    id: "cli-marcos",
    name: "Marcos Almeida",
    phone: "(11) 98888-1200",
    email: "marcos@email.com",
    vehicle: "Honda Civic 2018",
    plate: "BRA2E19"
  },
  {
    id: "cli-camila",
    name: "Camila Ribeiro",
    phone: "(11) 97777-4533",
    email: "camila@email.com",
    vehicle: "Chevrolet Onix 2021",
    plate: "QWE4R56"
  }
];

const statusMap = {
  sent: "Enviado",
  approved: "Aprovado",
  rejected: "Recusado"
};

function readStorage(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function createId(prefix) {
  if (window.crypto?.randomUUID) return `${prefix}-${window.crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function formatDate(value) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(value));
}

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + Number(days || 0));
  return nextDate.toISOString();
}

function formatDuration(hours) {
  const numericHours = Number(hours || 0);
  if (numericHours <= 0) return "A combinar";
  if (numericHours < 1) return "Menos de 1 hora";
  if (numericHours < 8) {
    return `${numericHours.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} h`;
  }

  const days = Math.ceil(numericHours / 8);
  return `${days} ${days === 1 ? "dia util" : "dias uteis"}`;
}

function makeQuoteNumber() {
  const today = new Date();
  const date = today.toISOString().slice(2, 10).replace(/-/g, "");
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `CC-${date}-${suffix}`;
}

function App() {
  const [activeView, setActiveView] = useState("quote");
  const [settings, setSettings] = useState(() =>
    readStorage(STORAGE_KEYS.settings, defaultSettings)
  );
  const [services, setServices] = useState(() =>
    readStorage(STORAGE_KEYS.services, defaultServices)
  );
  const [clients, setClients] = useState(() =>
    readStorage(STORAGE_KEYS.clients, defaultClients)
  );
  const [quotes, setQuotes] = useState(() => readStorage(STORAGE_KEYS.quotes, []));
  const [selectedClientId, setSelectedClientId] = useState(
    () => readStorage(STORAGE_KEYS.clients, defaultClients)[0]?.id || ""
  );
  const [vehicle, setVehicle] = useState(defaultClients[0]?.vehicle || "");
  const [plate, setPlate] = useState(defaultClients[0]?.plate || "");
  const [serviceQuery, setServiceQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState([
    { serviceId: "svc-oil", quantity: 1 },
    { serviceId: "svc-brakes", quantity: 1 }
  ]);
  const [notes, setNotes] = useState("Veiculo avaliado para revisao preventiva.");
  const [currentQuote, setCurrentQuote] = useState(null);
  const [printQuote, setPrintQuote] = useState(null);
  const [toast, setToast] = useState("");
  const [serviceDraft, setServiceDraft] = useState({
    name: "",
    category: "Manutencao",
    price: "",
    deadlineHours: "",
    description: ""
  });
  const [clientDraft, setClientDraft] = useState({
    name: "",
    phone: "",
    email: "",
    vehicle: "",
    plate: ""
  });

  useEffect(() => writeStorage(STORAGE_KEYS.settings, settings), [settings]);
  useEffect(() => writeStorage(STORAGE_KEYS.services, services), [services]);
  useEffect(() => writeStorage(STORAGE_KEYS.clients, clients), [clients]);
  useEffect(() => writeStorage(STORAGE_KEYS.quotes, quotes), [quotes]);

  const selectedClient = useMemo(
    () => clients.find((client) => client.id === selectedClientId) || clients[0] || null,
    [clients, selectedClientId]
  );

  const categories = useMemo(
    () => Array.from(new Set(services.map((service) => service.category))).sort(),
    [services]
  );

  const quoteItems = useMemo(
    () =>
      selectedItems
        .map((item) => {
          const service = services.find((candidate) => candidate.id === item.serviceId);
          if (!service) return null;

          const quantity = Math.max(1, Number(item.quantity || 1));
          return {
            ...service,
            quantity,
            subtotal: service.price * quantity,
            totalHours: Number(service.deadlineHours || 0) * quantity
          };
        })
        .filter(Boolean),
    [selectedItems, services]
  );

  const filteredServices = useMemo(() => {
    const normalizedQuery = serviceQuery.trim().toLowerCase();
    if (!normalizedQuery) return services;

    return services.filter((service) =>
      `${service.name} ${service.category} ${service.description}`
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [serviceQuery, services]);

  const subtotal = quoteItems.reduce((sum, item) => sum + item.subtotal, 0);
  const totalHours = quoteItems.reduce((sum, item) => sum + item.totalHours, 0);
  const approvedValue = quotes
    .filter((quote) => quote.status === "approved")
    .reduce((sum, quote) => sum + quote.total, 0);

  function showToast(message) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }

  function handleClientChange(clientId) {
    const client = clients.find((candidate) => candidate.id === clientId);
    setSelectedClientId(clientId);
    setVehicle(client?.vehicle || "");
    setPlate(client?.plate || "");
  }

  function updateSetting(field, value) {
    setSettings((current) => ({ ...current, [field]: value }));
  }

  function addServiceToQuote(serviceId) {
    setSelectedItems((current) => {
      const exists = current.some((item) => item.serviceId === serviceId);

      if (exists) {
        return current.map((item) =>
          item.serviceId === serviceId
            ? { ...item, quantity: Number(item.quantity || 1) + 1 }
            : item
        );
      }

      return [...current, { serviceId, quantity: 1 }];
    });
  }

  function changeItemQuantity(serviceId, quantity) {
    setSelectedItems((current) =>
      current.map((item) =>
        item.serviceId === serviceId
          ? { ...item, quantity: Math.max(1, Number(quantity || 1)) }
          : item
      )
    );
  }

  function removeItem(serviceId) {
    setSelectedItems((current) => current.filter((item) => item.serviceId !== serviceId));
  }

  function buildQuote(status = "sent") {
    const createdAt = new Date().toISOString();
    return {
      id: createId("quote"),
      number: makeQuoteNumber(),
      status,
      createdAt,
      validUntil: addDays(createdAt, settings.validDays),
      startup,
      company: settings,
      client: selectedClient,
      vehicle: {
        model: vehicle.trim(),
        plate: plate.trim().toUpperCase()
      },
      items: quoteItems,
      notes: notes.trim(),
      subtotal,
      total: subtotal,
      totalHours
    };
  }

  function validateQuote() {
    if (!selectedClient) return "Cadastre ou selecione um cliente.";
    if (!vehicle.trim()) return "Informe o veiculo.";
    if (!plate.trim()) return "Informe a placa.";
    if (quoteItems.length === 0) return "Adicione pelo menos um servico.";
    return "";
  }

  function saveQuote({ shouldPrint = false } = {}) {
    const validationError = validateQuote();
    if (validationError) {
      showToast(validationError);
      return;
    }

    const quote = buildQuote("sent");
    setCurrentQuote(quote);
    setQuotes((current) => [quote, ...current]);
    showToast(`Orcamento ${quote.number} gerado.`);

    if (shouldPrint) {
      setPrintQuote(quote);
      window.setTimeout(() => window.print(), 120);
    }
  }

  function printExistingQuote(quote) {
    setCurrentQuote(quote);
    setPrintQuote(quote);
    window.setTimeout(() => window.print(), 120);
  }

  function duplicateQuote(quote) {
    setSelectedClientId(quote.client?.id || "");
    setVehicle(quote.vehicle?.model || "");
    setPlate(quote.vehicle?.plate || "");
    setSelectedItems(
      quote.items.map((item) => ({
        serviceId: item.id,
        quantity: item.quantity
      }))
    );
    setNotes(quote.notes || "");
    setCurrentQuote(quote);
    setActiveView("quote");
  }

  function updateQuoteStatus(quoteId, status) {
    setQuotes((current) =>
      current.map((quote) => (quote.id === quoteId ? { ...quote, status } : quote))
    );
  }

  function clearQuotes() {
    setQuotes([]);
    setCurrentQuote(null);
    setPrintQuote(null);
    showToast("Historico limpo.");
  }

  function addService(event) {
    event.preventDefault();
    const price = Number(serviceDraft.price);
    const deadlineHours = Number(serviceDraft.deadlineHours);

    if (!serviceDraft.name.trim() || !price || !deadlineHours) {
      showToast("Preencha nome, valor e prazo do servico.");
      return;
    }

    const service = {
      id: createId("svc"),
      name: serviceDraft.name.trim(),
      category: serviceDraft.category.trim() || "Geral",
      price,
      deadlineHours,
      description: serviceDraft.description.trim()
    };

    setServices((current) => [service, ...current]);
    setServiceDraft({
      name: "",
      category: "Manutencao",
      price: "",
      deadlineHours: "",
      description: ""
    });
    showToast("Servico cadastrado.");
  }

  function removeService(serviceId) {
    setServices((current) => current.filter((service) => service.id !== serviceId));
    setSelectedItems((current) => current.filter((item) => item.serviceId !== serviceId));
  }

  function addClient(event) {
    event.preventDefault();

    if (!clientDraft.name.trim() || !clientDraft.phone.trim()) {
      showToast("Preencha nome e WhatsApp do cliente.");
      return;
    }

    const client = {
      id: createId("cli"),
      name: clientDraft.name.trim(),
      phone: clientDraft.phone.trim(),
      email: clientDraft.email.trim(),
      vehicle: clientDraft.vehicle.trim(),
      plate: clientDraft.plate.trim().toUpperCase()
    };

    setClients((current) => [client, ...current]);
    setSelectedClientId(client.id);
    setVehicle(client.vehicle);
    setPlate(client.plate);
    setClientDraft({
      name: "",
      phone: "",
      email: "",
      vehicle: "",
      plate: ""
    });
    showToast("Cliente cadastrado.");
  }

  function removeClient(clientId) {
    const remainingClients = clients.filter((client) => client.id !== clientId);
    setClients(remainingClients);

    if (selectedClientId === clientId) {
      const nextClient = remainingClients[0] || null;
      setSelectedClientId(nextClient?.id || "");
      setVehicle(nextClient?.vehicle || "");
      setPlate(nextClient?.plate || "");
    }
  }

  const printableQuote = printQuote || currentQuote;

  return (
    <>
      <div className="app-shell min-h-screen bg-[#f4f7f5] text-[#17211f]">
        <header className="sticky top-0 z-30 border-b border-[#d9e1dc] bg-[#f8fbf9]/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-lg bg-[#0f6b57] text-white shadow-sm">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-black uppercase text-[#b06f13]">
                  {startup.legalName}
                </p>
                <h1 className="text-xl font-black text-[#0d3029]">{startup.name}</h1>
              </div>
            </div>

            <nav className="grid grid-cols-2 gap-2 sm:flex">
              {[
                ["quote", ClipboardList, "Orcamento"],
                ["services", Wrench, "Servicos"],
                ["clients", UserRound, "Clientes"],
                ["history", History, "Historico"]
              ].map(([view, Icon, label]) => (
                <button
                  key={view}
                  type="button"
                  onClick={() => setActiveView(view)}
                  className={`inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-black transition ${
                    activeView === view
                      ? "border-[#0f6b57] bg-[#0f6b57] text-white"
                      : "border-[#d9e1dc] bg-white text-[#20312d] hover:border-[#9ab3aa]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>
        </header>

        {toast ? (
          <div className="fixed right-4 top-20 z-40 rounded-lg border border-[#c9ded5] bg-white px-4 py-3 text-sm font-black text-[#0f6b57] shadow-lg">
            {toast}
          </div>
        ) : null}

        <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:py-7">
          <section className="mb-5 grid gap-3 md:grid-cols-4">
            <MetricCard icon={Wrench} label="Servicos" value={services.length} />
            <MetricCard icon={FileText} label="Orcamentos" value={quotes.length} />
            <MetricCard
              icon={BadgeCheck}
              label="Aprovados"
              value={quotes.filter((quote) => quote.status === "approved").length}
            />
            <MetricCard
              icon={ShieldCheck}
              label="Valor aprovado"
              value={formatCurrency(approvedValue)}
            />
          </section>

          {activeView === "quote" ? (
            <QuoteView
              clients={clients}
              selectedClient={selectedClient}
              selectedClientId={selectedClientId}
              handleClientChange={handleClientChange}
              vehicle={vehicle}
              setVehicle={setVehicle}
              plate={plate}
              setPlate={setPlate}
              settings={settings}
              updateSetting={updateSetting}
              serviceQuery={serviceQuery}
              setServiceQuery={setServiceQuery}
              services={filteredServices}
              quoteItems={quoteItems}
              selectedItems={selectedItems}
              addServiceToQuote={addServiceToQuote}
              changeItemQuantity={changeItemQuantity}
              removeItem={removeItem}
              notes={notes}
              setNotes={setNotes}
              subtotal={subtotal}
              totalHours={totalHours}
              currentQuote={currentQuote}
              saveQuote={saveQuote}
            />
          ) : null}

          {activeView === "services" ? (
            <ServicesView
              categories={categories}
              serviceDraft={serviceDraft}
              setServiceDraft={setServiceDraft}
              addService={addService}
              services={services}
              removeService={removeService}
            />
          ) : null}

          {activeView === "clients" ? (
            <ClientsView
              clientDraft={clientDraft}
              setClientDraft={setClientDraft}
              addClient={addClient}
              clients={clients}
              removeClient={removeClient}
            />
          ) : null}

          {activeView === "history" ? (
            <HistoryView
              quotes={quotes}
              updateQuoteStatus={updateQuoteStatus}
              printExistingQuote={printExistingQuote}
              duplicateQuote={duplicateQuote}
              clearQuotes={clearQuotes}
            />
          ) : null}
        </main>
      </div>

      <PrintDocument quote={printableQuote} />
    </>
  );
}

function MetricCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-[#d9e1dc] bg-white p-4 shadow-sm">
      <Icon className="mb-3 h-5 w-5 text-[#0f6b57]" />
      <p className="text-sm font-black text-[#66756f]">{label}</p>
      <p className="mt-1 text-2xl font-black text-[#132622]">{value}</p>
    </div>
  );
}

function QuoteView({
  clients,
  selectedClient,
  selectedClientId,
  handleClientChange,
  vehicle,
  setVehicle,
  plate,
  setPlate,
  settings,
  updateSetting,
  serviceQuery,
  setServiceQuery,
  services,
  quoteItems,
  addServiceToQuote,
  changeItemQuantity,
  removeItem,
  notes,
  setNotes,
  subtotal,
  totalHours,
  currentQuote,
  saveQuote
}) {
  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-5">
        <div className="rounded-lg border border-[#d9e1dc] bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase text-[#b06f13]">Atendimento</p>
              <h2 className="text-xl font-black text-[#132622]">Novo orcamento</h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded-lg bg-[#edf7f3] px-3 py-2 text-sm font-black text-[#0f6b57]">
              <CalendarClock className="h-4 w-4" />
              {formatDuration(totalHours)}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="field">
              <span>Cliente</span>
              <select
                value={selectedClientId}
                onChange={(event) => handleClientChange(event.target.value)}
              >
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>WhatsApp</span>
              <input value={selectedClient?.phone || ""} readOnly />
            </label>

            <label className="field">
              <span>Veiculo</span>
              <input
                value={vehicle}
                onChange={(event) => setVehicle(event.target.value)}
                placeholder="Ex.: Honda Civic 2018"
              />
            </label>

            <label className="field">
              <span>Placa</span>
              <input
                value={plate}
                onChange={(event) => setPlate(event.target.value.toUpperCase())}
                placeholder="ABC1D23"
              />
            </label>
          </div>
        </div>

        <div className="rounded-lg border border-[#d9e1dc] bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase text-[#b06f13]">Tabela</p>
              <h2 className="text-xl font-black text-[#132622]">Servicos do orçamento</h2>
            </div>
            <label className="search-field">
              <Search className="h-4 w-4" />
              <input
                value={serviceQuery}
                onChange={(event) => setServiceQuery(event.target.value)}
                placeholder="Buscar servico"
              />
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {services.map((service) => (
              <article
                key={service.id}
                className="rounded-lg border border-[#dfe7e2] bg-[#fbfdfc] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="rounded-md bg-[#fff1d8] px-2 py-1 text-xs font-black text-[#8a570c]">
                      {service.category}
                    </span>
                    <h3 className="mt-3 font-black text-[#132622]">{service.name}</h3>
                    <p className="mt-1 text-sm font-semibold text-[#65736f]">
                      {service.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => addServiceToQuote(service.id)}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#0f6b57] text-white transition hover:bg-[#0b5646]"
                    title="Adicionar servico"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-sm font-black text-[#20312d]">
                  <span>{formatCurrency(service.price)}</span>
                  <span className="text-[#98a6a0]">•</span>
                  <span>{formatDuration(service.deadlineHours)}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      <aside className="space-y-5">
        <div className="rounded-lg border border-[#d9e1dc] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-[#0f6b57]" />
            <h2 className="text-lg font-black text-[#132622]">Resumo</h2>
          </div>

          <div className="space-y-3">
            {quoteItems.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[#b9c8c1] bg-[#fbfdfc] p-4 text-sm font-bold text-[#66756f]">
                Nenhum servico adicionado.
              </div>
            ) : null}

            {quoteItems.map((item) => (
              <div
                key={item.id}
                className="grid gap-3 rounded-lg border border-[#e2e9e5] bg-[#fbfdfc] p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-black text-[#132622]">{item.name}</h3>
                    <p className="text-xs font-bold text-[#66756f]">
                      {formatCurrency(item.price)} cada
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-[#f1c6c0] bg-[#fff5f3] text-[#a33b2f]"
                    title="Remover servico"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(event) => changeItemQuantity(item.id, event.target.value)}
                    className="h-10 w-20 rounded-lg border border-[#d9e1dc] bg-white px-3 font-black outline-none focus:border-[#0f6b57]"
                  />
                  <strong className="text-[#0d3029]">{formatCurrency(item.subtotal)}</strong>
                </div>
              </div>
            ))}
          </div>

          <label className="field mt-4">
            <span>Observacoes</span>
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows="4" />
          </label>

          <div className="mt-4 rounded-lg bg-[#132622] p-4 text-white">
            <div className="flex justify-between text-sm font-bold text-[#cfe0d9]">
              <span>Prazo estimado</span>
              <span>{formatDuration(totalHours)}</span>
            </div>
            <div className="mt-3 flex justify-between border-t border-white/15 pt-3 text-xl font-black">
              <span>Total</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
          </div>

          <div className="mt-4 grid gap-2">
            <button
              type="button"
              onClick={() => saveQuote()}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0f6b57] px-4 py-3 font-black text-white transition hover:bg-[#0b5646]"
            >
              <FileText className="h-4 w-4" />
              Gerar orcamento
            </button>
            <button
              type="button"
              onClick={() => saveQuote({ shouldPrint: true })}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#0f6b57] bg-white px-4 py-3 font-black text-[#0f6b57] transition hover:bg-[#edf7f3]"
            >
              <Download className="h-4 w-4" />
              Gerar PDF
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-[#d9e1dc] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[#0f6b57]" />
            <h2 className="text-lg font-black text-[#132622]">Empresa</h2>
          </div>
          <div className="grid gap-3">
            <label className="field">
              <span>Nome fantasia</span>
              <input
                value={settings.companyName}
                onChange={(event) => updateSetting("companyName", event.target.value)}
              />
            </label>
            <label className="field">
              <span>Telefone</span>
              <input
                value={settings.phone}
                onChange={(event) => updateSetting("phone", event.target.value)}
              />
            </label>
            <label className="field">
              <span>Validade em dias</span>
              <input
                type="number"
                min="1"
                value={settings.validDays}
                onChange={(event) => updateSetting("validDays", event.target.value)}
              />
            </label>
          </div>
          {currentQuote ? (
            <div className="mt-4 rounded-lg bg-[#fff8e9] p-3 text-sm font-black text-[#8a570c]">
              Ultimo documento: {currentQuote.number}
            </div>
          ) : null}
        </div>
      </aside>
    </section>
  );
}

function ServicesView({
  categories,
  serviceDraft,
  setServiceDraft,
  addService,
  services,
  removeService
}) {
  function updateDraft(field, value) {
    setServiceDraft((current) => ({ ...current, [field]: value }));
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[380px_minmax(0,1fr)]">
      <form
        onSubmit={addService}
        className="rounded-lg border border-[#d9e1dc] bg-white p-5 shadow-sm"
      >
        <h2 className="text-xl font-black text-[#132622]">Cadastrar servico</h2>
        <div className="mt-4 grid gap-3">
          <label className="field">
            <span>Nome</span>
            <input
              value={serviceDraft.name}
              onChange={(event) => updateDraft("name", event.target.value)}
              placeholder="Ex.: Troca de correia dentada"
            />
          </label>
          <label className="field">
            <span>Categoria</span>
            <input
              value={serviceDraft.category}
              onChange={(event) => updateDraft("category", event.target.value)}
              list="categories"
            />
            <datalist id="categories">
              {categories.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="field">
              <span>Valor</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={serviceDraft.price}
                onChange={(event) => updateDraft("price", event.target.value)}
              />
            </label>
            <label className="field">
              <span>Prazo em horas</span>
              <input
                type="number"
                min="0"
                step="0.5"
                value={serviceDraft.deadlineHours}
                onChange={(event) => updateDraft("deadlineHours", event.target.value)}
              />
            </label>
          </div>
          <label className="field">
            <span>Descricao</span>
            <textarea
              value={serviceDraft.description}
              onChange={(event) => updateDraft("description", event.target.value)}
              rows="4"
            />
          </label>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0f6b57] px-4 py-3 font-black text-white transition hover:bg-[#0b5646]"
          >
            <Plus className="h-4 w-4" />
            Salvar servico
          </button>
        </div>
      </form>

      <div className="rounded-lg border border-[#d9e1dc] bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black text-[#132622]">Tabela de servicos</h2>
        <div className="mt-4 overflow-x-auto rounded-lg border border-[#dfe7e2]">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead className="bg-[#edf7f3] text-sm font-black text-[#0d3029]">
              <tr>
                <th className="px-4 py-3">Servico</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Prazo</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3 text-right">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dfe7e2] text-sm font-semibold text-[#20312d]">
              {services.map((service) => (
                <tr key={service.id}>
                  <td className="px-4 py-3">
                    <strong className="block text-[#132622]">{service.name}</strong>
                    <span className="text-[#66756f]">{service.description}</span>
                  </td>
                  <td className="px-4 py-3">{service.category}</td>
                  <td className="px-4 py-3">{formatDuration(service.deadlineHours)}</td>
                  <td className="px-4 py-3 font-black">{formatCurrency(service.price)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => removeService(service.id)}
                      className="inline-grid h-9 w-9 place-items-center rounded-lg border border-[#f1c6c0] bg-[#fff5f3] text-[#a33b2f]"
                      title="Excluir servico"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function ClientsView({ clientDraft, setClientDraft, addClient, clients, removeClient }) {
  function updateDraft(field, value) {
    setClientDraft((current) => ({ ...current, [field]: value }));
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[380px_minmax(0,1fr)]">
      <form
        onSubmit={addClient}
        className="rounded-lg border border-[#d9e1dc] bg-white p-5 shadow-sm"
      >
        <h2 className="text-xl font-black text-[#132622]">Cadastrar cliente</h2>
        <div className="mt-4 grid gap-3">
          <label className="field">
            <span>Nome</span>
            <input
              value={clientDraft.name}
              onChange={(event) => updateDraft("name", event.target.value)}
              placeholder="Nome do cliente"
            />
          </label>
          <label className="field">
            <span>WhatsApp</span>
            <input
              value={clientDraft.phone}
              onChange={(event) => updateDraft("phone", event.target.value)}
              placeholder="(00) 00000-0000"
            />
          </label>
          <label className="field">
            <span>E-mail</span>
            <input
              value={clientDraft.email}
              onChange={(event) => updateDraft("email", event.target.value)}
              placeholder="cliente@email.com"
            />
          </label>
          <label className="field">
            <span>Veiculo</span>
            <input
              value={clientDraft.vehicle}
              onChange={(event) => updateDraft("vehicle", event.target.value)}
              placeholder="Modelo e ano"
            />
          </label>
          <label className="field">
            <span>Placa</span>
            <input
              value={clientDraft.plate}
              onChange={(event) => updateDraft("plate", event.target.value.toUpperCase())}
              placeholder="ABC1D23"
            />
          </label>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0f6b57] px-4 py-3 font-black text-white transition hover:bg-[#0b5646]"
          >
            <Plus className="h-4 w-4" />
            Salvar cliente
          </button>
        </div>
      </form>

      <div className="rounded-lg border border-[#d9e1dc] bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black text-[#132622]">Clientes</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {clients.map((client) => (
            <article
              key={client.id}
              className="rounded-lg border border-[#dfe7e2] bg-[#fbfdfc] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-black text-[#132622]">{client.name}</h3>
                  <p className="mt-1 text-sm font-semibold text-[#66756f]">{client.phone}</p>
                  <p className="mt-3 text-sm font-black text-[#20312d]">{client.vehicle}</p>
                  <p className="text-sm font-semibold text-[#66756f]">{client.plate}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeClient(client.id)}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[#f1c6c0] bg-[#fff5f3] text-[#a33b2f]"
                  title="Excluir cliente"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function HistoryView({
  quotes,
  updateQuoteStatus,
  printExistingQuote,
  duplicateQuote,
  clearQuotes
}) {
  if (quotes.length === 0) {
    return (
      <section className="rounded-lg border border-[#d9e1dc] bg-white p-8 text-center shadow-sm">
        <History className="mx-auto mb-3 h-10 w-10 text-[#0f6b57]" />
        <h2 className="text-2xl font-black text-[#132622]">Nenhum orcamento emitido</h2>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-[#d9e1dc] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black text-[#132622]">Historico de orcamentos</h2>
        <button
          type="button"
          onClick={clearQuotes}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#f1c6c0] bg-[#fff5f3] px-3 py-2 text-sm font-black text-[#a33b2f]"
        >
          <Trash2 className="h-4 w-4" />
          Limpar historico
        </button>
      </div>
      <div className="mt-4 overflow-x-auto rounded-lg border border-[#dfe7e2]">
        <table className="w-full min-w-[820px] border-collapse text-left">
          <thead className="bg-[#edf7f3] text-sm font-black text-[#0d3029]">
            <tr>
              <th className="px-4 py-3">Numero</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Veiculo</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#dfe7e2] text-sm font-semibold text-[#20312d]">
            {quotes.map((quote) => (
              <tr key={quote.id}>
                <td className="px-4 py-3">
                  <strong className="block text-[#132622]">{quote.number}</strong>
                  <span className="text-[#66756f]">{formatDate(quote.createdAt)}</span>
                </td>
                <td className="px-4 py-3">{quote.client?.name}</td>
                <td className="px-4 py-3">
                  {quote.vehicle?.model}
                  <span className="block text-[#66756f]">{quote.vehicle?.plate}</span>
                </td>
                <td className="px-4 py-3 font-black">{formatCurrency(quote.total)}</td>
                <td className="px-4 py-3">
                  <select
                    value={quote.status}
                    onChange={(event) => updateQuoteStatus(quote.id, event.target.value)}
                    className="rounded-lg border border-[#d9e1dc] bg-white px-3 py-2 font-black text-[#20312d] outline-none focus:border-[#0f6b57]"
                  >
                    {Object.entries(statusMap).map(([status, label]) => (
                      <option key={status} value={status}>
                        {label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => printExistingQuote(quote)}
                      className="inline-grid h-9 w-9 place-items-center rounded-lg border border-[#0f6b57] bg-white text-[#0f6b57]"
                      title="Gerar PDF"
                    >
                      <Printer className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => duplicateQuote(quote)}
                      className="inline-grid h-9 w-9 place-items-center rounded-lg bg-[#0f6b57] text-white"
                      title="Reutilizar orcamento"
                    >
                      <FileText className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function PrintDocument({ quote }) {
  if (!quote) return null;

  return (
    <section className="print-area">
      <div className="print-sheet">
        <header className="print-header">
          <div>
            <p className="print-kicker">{quote.startup.name}</p>
            <h1>{quote.company.companyName}</h1>
            <p>{quote.company.document}</p>
            <p>
              {quote.company.address} · {quote.company.city}
            </p>
            <p>{quote.company.phone}</p>
          </div>
          <div className="print-number">
            <span>Orcamento</span>
            <strong>{quote.number}</strong>
            <p>Emitido em {formatDate(quote.createdAt)}</p>
          </div>
        </header>

        <div className="print-grid">
          <div>
            <span>Cliente</span>
            <strong>{quote.client?.name}</strong>
            <p>{quote.client?.phone}</p>
            {quote.client?.email ? <p>{quote.client.email}</p> : null}
          </div>
          <div>
            <span>Veiculo</span>
            <strong>{quote.vehicle.model}</strong>
            <p>Placa {quote.vehicle.plate}</p>
            <p>Valido ate {formatDate(quote.validUntil)}</p>
          </div>
        </div>

        <table className="print-table">
          <thead>
            <tr>
              <th>Servico</th>
              <th>Qtd.</th>
              <th>Prazo</th>
              <th>Unitario</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {quote.items.map((item) => (
              <tr key={item.id}>
                <td>
                  <strong>{item.name}</strong>
                  <p>{item.description}</p>
                </td>
                <td>{item.quantity}</td>
                <td>{formatDuration(item.totalHours)}</td>
                <td>{formatCurrency(item.price)}</td>
                <td>{formatCurrency(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="print-summary">
          <div>
            <span>Prazo estimado</span>
            <strong>{formatDuration(quote.totalHours)}</strong>
          </div>
          <div>
            <span>Total do orçamento</span>
            <strong>{formatCurrency(quote.total)}</strong>
          </div>
        </div>

        <div className="print-notes">
          <div>
            <span>Observacoes</span>
            <p>{quote.notes || "Sem observacoes adicionais."}</p>
          </div>
          <div>
            <span>Garantia</span>
            <p>{quote.company.warranty}</p>
          </div>
          <div>
            <span>Condicoes</span>
            <p>{quote.company.terms}</p>
          </div>
        </div>

        <footer className="print-footer">
          <div>
            <span>Assinatura do cliente</span>
          </div>
          <div>
            <CheckCircle2 />
            <p>Documento gerado pela {quote.startup.legalName}</p>
          </div>
        </footer>
      </div>
    </section>
  );
}

export default App;
