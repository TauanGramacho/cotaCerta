# CotaCerta

Prototipo web para uma materia de processos de negocio. O CotaCerta ajuda oficinas e pequenos prestadores de servico a criar orcamentos padronizados, reduzindo erros de digitacao e melhorando a apresentacao para o cliente.

## Projeto online

Aplicacao configurada para publicacao na Vercel. A URL final sera gerada no deploy da conta Vercel do projeto.

O projeto tambem possui uma rota de backend serverless em `/api/health`.

## O que o sistema faz

- Cadastra servicos com valor, categoria, descricao e prazo.
- Cadastra clientes com contato, veiculo e placa.
- Monta um orcamento escolhendo cliente e servicos cadastrados.
- Calcula total e prazo estimado automaticamente.
- Gera documento para impressao ou salvamento em PDF.
- Permite compartilhamento digital do orcamento com texto pronto para WhatsApp.
- Mantem historico local de orcamentos com status.
- Salva os dados no localStorage do navegador, sem banco de dados.
- Inclui uma rota simples de backend na Vercel para demonstrar API.

## Backend na Vercel

Rota de verificacao:

```txt
/api/health
```

Essa rota confirma a camada de backend do prototipo. Os dados cadastrados pelo usuario ficam no localStorage do navegador, porque o projeto nao usa banco de dados.

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

A hospedagem principal do projeto deve ser feita pela Vercel, pois ela publica o frontend e tambem permite rotas `/api`. Como o projeto nao usa banco de dados, clientes, servicos e orcamentos sao salvos no localStorage do proprio navegador.
