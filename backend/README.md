# CotaCerta Backend

Backend simples em Node.js/Express para demonstrar uma API do CotaCerta.

## Rodar

```bash
cd backend
npm install
npm run dev
```

URL local:

```txt
http://localhost:3001/api/health
```

## Rotas

- `GET /api/health`
- `GET /api/services`
- `POST /api/services`
- `GET /api/clients`
- `POST /api/clients`
- `GET /api/quotes`
- `POST /api/quotes`
- `PATCH /api/quotes/:id/status`

Os dados ficam em `backend/data.json`, criado automaticamente no primeiro uso.
