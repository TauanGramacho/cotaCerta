# CotaCerta Backend

Backend simples em Node.js/Express para demonstrar uma API do CotaCerta em ambiente local.

No deploy da Vercel, o app usa a rota `/api/health` da pasta raiz `api/`. Os dados reais do prototipo ficam no localStorage do navegador, sem banco de dados.

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

Os dados desta API local ficam em `backend/data.json`, criado automaticamente no primeiro uso. No app hospedado, a persistencia do prototipo fica no navegador via localStorage.
