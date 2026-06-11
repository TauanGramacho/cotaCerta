module.exports = function handler(req, res) {
  res.status(200).json({
    ok: true,
    service: "cotacerta-vercel-api",
    project: "CotaCerta",
    storage: "localStorage no navegador, sem banco de dados",
    features: [
      "cadastro de clientes",
      "cadastro de servicos",
      "composicao de orcamento",
      "geracao de documento",
      "exportacao para PDF/impressao",
      "compartilhamento digital"
    ]
  });
};
