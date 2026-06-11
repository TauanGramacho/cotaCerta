# CotaCerta

Prototipo web para uma materia de processos de negocio. O CotaCerta ajuda oficinas e pequenos prestadores de servico a criar orcamentos padronizados, reduzindo erros de digitacao e melhorando a apresentacao para o cliente.

## Projeto online

Frontend publicado via GitHub Pages:

```txt
https://tauangramacho.github.io/cotaCerta/
```

## O que o sistema faz

- Cadastra servicos com valor, categoria, descricao e prazo.
- Cadastra clientes com contato, veiculo e placa.
- Monta um orcamento escolhendo cliente e servicos cadastrados.
- Calcula total e prazo estimado automaticamente.
- Gera documento para impressao ou salvamento em PDF.
- Permite compartilhamento digital do orcamento com texto pronto para WhatsApp.
- Mantem historico local de orcamentos com status.
- Inclui um backend simples em Node.js/Express para demonstrar API.

## Rodar frontend localmente

```bash
npm install
npm run dev
```

Depois abra:

```txt
http://localhost:5173
```

## Rodar backend localmente

```bash
cd backend
npm install
npm run dev
```

API local:

```txt
http://localhost:3001/api/health
```

Rotas principais:

- `GET /api/services`
- `POST /api/services`
- `GET /api/clients`
- `POST /api/clients`
- `GET /api/quotes`
- `POST /api/quotes`
- `PATCH /api/quotes/:id/status`

## Observacao sobre hospedagem

O GitHub Pages hospeda apenas o frontend estatico. O backend simples fica no repositorio para demonstracao local da API e pode ser publicado futuramente em um servico como Render, Railway, Fly.io ou similar.
