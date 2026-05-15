# CotaCerta

Protótipo web para uma matéria de processos de negócio. A startup fictícia **CotaCerta** ajuda oficinas e pequenos prestadores a criar orçamentos padronizados, evitando erro de digitação em valores enviados por WhatsApp.

## O que o sistema faz

- Cadastra serviços com valor, categoria, descrição e prazo.
- Cadastra clientes com contato, veículo e placa.
- Monta um orçamento escolhendo cliente e serviços cadastrados.
- Calcula total e prazo estimado automaticamente.
- Gera um documento em formato de impressão/PDF pelo navegador.
- Mantém histórico local de orçamentos com status: enviado, aprovado ou recusado.
- Salva os dados no `localStorage`, sem banco de dados obrigatório.

## Rodar localmente

```bash
npm install
npm run dev
```

Depois abra:

```txt
http://localhost:5173
```

## Gerar PDF

Na tela `Orcamento`, clique em `Gerar PDF`. O navegador abre a janela de impressão; escolha `Salvar como PDF`.

## Contexto da ideia

O fluxo modela uma oficina que hoje escreve orçamentos manualmente em mensagem de WhatsApp. A proposta do CotaCerta é transformar esse processo em uma rotina simples: cadastrar serviços uma vez, selecionar o cliente, gerar o documento e acompanhar o status do orçamento.
