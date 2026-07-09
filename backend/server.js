const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const CARTAS_PATH = path.join(__dirname, "data", "cartas.json");

function carregarCartas() {
  const raw = fs.readFileSync(CARTAS_PATH, "utf-8");
  return JSON.parse(raw);
}

// GET /api/temas -> lista os temas disponíveis
app.get("/api/temas", (req, res) => {
  const cartas = carregarCartas();
  const temas = [...new Set(cartas.map((c) => c.tema))];
  res.json(temas);
});

// GET /api/cartas/aleatoria?tema=Filmes&excluir=filmes-001,filmes-002
// Retorna uma carta aleatória do tema, evitando repetir cartas já jogadas na sessão
app.get("/api/cartas/aleatoria", (req, res) => {
  const { tema, excluir } = req.query;
  const idsExcluidos = excluir ? excluir.split(",") : [];

  const cartas = carregarCartas().filter(
    (c) => c.tema === tema && !idsExcluidos.includes(c.id)
  );

  if (cartas.length === 0) {
    return res.status(404).json({ erro: "Nenhuma carta restante para esse tema." });
  }

  const carta = cartas[Math.floor(Math.random() * cartas.length)];
  res.json(carta);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
