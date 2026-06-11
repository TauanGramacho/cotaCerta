const crypto = require("crypto");
const fs = require("fs/promises");
const path = require("path");
const express = require("express");
const cors = require("cors");

const app = express();
const port = Number(process.env.PORT || 3001);
const dataFile = path.join(__dirname, "data.json");

const seedData = {
  services: [
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
      id: "svc-alignment",
      name: "Alinhamento e balanceamento",
      category: "Rodas",
      price: 160,
      deadlineHours: 1.5,
      description: "Alinhamento computadorizado e balanceamento das quatro rodas."
    }
  ],
  clients: [
    {
      id: "cli-marcos",
      name: "Marcos Almeida",
      phone: "(11) 98888-1200",
      email: "marcos@email.com",
      vehicle: "Honda Civic 2018",
      plate: "BRA2E19"
    }
  ],
  quotes: []
};

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json({ limit: "1mb" }));

function createId(prefix) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function makeQuoteNumber() {
  const date = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const suffix = crypto.randomBytes(2).toString("hex").toUpperCase();
  return `CC-${date}-${suffix}`;
}

async function readData() {
  try {
    const raw = await fs.readFile(dataFile, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    await writeData(seedData);
    return seedData;
  }
}

async function writeData(data) {
  await fs.writeFile(dataFile, JSON.stringify(data, null, 2));
}

function sanitizeService(input = {}) {
  return {
    id: input.id || createId("svc"),
    name: String(input.name || "").trim(),
    category: String(input.category || "Geral").trim(),
    price: Number(input.price || 0),
    deadlineHours: Number(input.deadlineHours || 0),
    description: String(input.description || "").trim()
  };
}

function sanitizeClient(input = {}) {
  return {
    id: input.id || createId("cli"),
    name: String(input.name || "").trim(),
    phone: String(input.phone || "").trim(),
    email: String(input.email || "").trim(),
    vehicle: String(input.vehicle || "").trim(),
    plate: String(input.plate || "").trim().toUpperCase()
  };
}

app.get("/api/health", async (req, res) => {
  const data = await readData();
  res.json({
    ok: true,
    service: "cotacerta-backend",
    clients: data.clients.length,
    services: data.services.length,
    quotes: data.quotes.length
  });
});

app.get("/api/services", async (req, res) => {
  const data = await readData();
  res.json(data.services);
});

app.post("/api/services", async (req, res) => {
  const service = sanitizeService(req.body);

  if (!service.name || service.price <= 0) {
    return res.status(400).json({ error: "Informe nome e valor do servico." });
  }

  const data = await readData();
  data.services.unshift(service);
  await writeData(data);
  res.status(201).json(service);
});

app.get("/api/clients", async (req, res) => {
  const data = await readData();
  res.json(data.clients);
});

app.post("/api/clients", async (req, res) => {
  const client = sanitizeClient(req.body);

  if (!client.name || !client.phone) {
    return res.status(400).json({ error: "Informe nome e telefone do cliente." });
  }

  const data = await readData();
  data.clients.unshift(client);
  await writeData(data);
  res.status(201).json(client);
});

app.get("/api/quotes", async (req, res) => {
  const data = await readData();
  res.json(data.quotes);
});

app.post("/api/quotes", async (req, res) => {
  const data = await readData();
  const items = Array.isArray(req.body.items) ? req.body.items : [];
  const total = items.reduce((sum, item) => sum + Number(item.subtotal || 0), 0);
  const totalHours = items.reduce((sum, item) => sum + Number(item.totalHours || 0), 0);
  const createdAt = new Date().toISOString();

  if (!req.body.client?.name || items.length === 0) {
    return res.status(400).json({ error: "Informe cliente e pelo menos um servico." });
  }

  const quote = {
    id: createId("quote"),
    number: makeQuoteNumber(),
    status: "sent",
    createdAt,
    validUntil: req.body.validUntil || createdAt,
    client: req.body.client,
    vehicle: req.body.vehicle || {},
    items,
    notes: String(req.body.notes || "").trim(),
    total,
    totalHours
  };

  data.quotes.unshift(quote);
  await writeData(data);
  res.status(201).json(quote);
});

app.patch("/api/quotes/:id/status", async (req, res) => {
  const data = await readData();
  const quote = data.quotes.find((item) => item.id === req.params.id);

  if (!quote) return res.status(404).json({ error: "Orcamento nao encontrado." });

  quote.status = String(req.body.status || quote.status);
  await writeData(data);
  res.json(quote);
});

app.listen(port, () => {
  console.log(`CotaCerta backend rodando em http://localhost:${port}`);
});
