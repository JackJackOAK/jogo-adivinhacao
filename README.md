# Jogo de Adivinhação

Protótipo de um jogo de cartas de adivinhação com host: cada carta tem um tema, uma resposta e 10 dicas, ordenadas da mais difícil para a mais fácil. Só o host vê a tela — ele lê a dica em voz alta para os jogadores.

## Estrutura do projeto

```
jogo-adivinhacao/
├── backend/
│   ├── data/cartas.json     # banco de cartas (tema, resposta, 10 dicas)
│   ├── server.js            # API Express
│   └── package.json
└── frontend/
    ├── src/
    │   ├── App.jsx           # tela do host e lógica do jogo
    │   ├── App.css
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## Modelo de dados de uma carta

```json
{
  "id": "filmes-001",
  "tema": "Filmes",
  "resposta": "De Volta para o Futuro",
  "dicas": [
    "dica 1 (mais difícil)",
    "...",
    "dica 10 (mais fácil)"
  ]
}
```

## API (backend)

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/temas` | Lista os temas disponíveis |
| GET | `/api/cartas/aleatoria?tema=Filmes&excluir=id1,id2` | Retorna uma carta aleatória do tema, ignorando as já jogadas na sessão |

O backend só serve como banco de cartas. Todo o **estado do jogo (dica atual, pontuação, cartas usadas) fica no frontend**, em memória, via `useState` — não precisa de banco de dados nem sessão no servidor para esse protótipo.

## Lógica de pontuação

```
pontos = 10 - indiceDica
```
Dica 1 (índice 0) acertada = 10 pontos, dica 2 = 9 pontos, ... dica 10 = 1 ponto. Pular a carta = 0 pontos.

## Como rodar

**Backend:**
```bash
cd backend
npm install
npm run dev   # ou npm start
```
Sobe em `http://localhost:3001`.

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```
Abre em `http://localhost:5173` (padrão do Vite).

## Como adicionar mais cartas/temas

Basta editar `backend/data/cartas.json` e acrescentar novos objetos, com um novo `tema` se quiser (ex: "Músicas", "Séries", "Personagens históricos"). O frontend já lista os temas dinamicamente.

## Próximos passos possíveis
- Persistir cartas usadas e pontuação entre sessões (localStorage ou banco de dados)
- Modo "múltiplos times" com placar separado por time
- Painel de administração para cadastrar cartas pela interface, em vez de editar o JSON à mão
- Timer opcional por dica
