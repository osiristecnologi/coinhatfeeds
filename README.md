# CoinHatFeeds

Plataforma de memecoins em tempo real com menu lateral completo.

## Estrutura

```
meu-projeto/
├── frontend/
│   ├── index.html      ← UI principal (menu ☰ + tabs)
│   ├── app.js          ← Toda a lógica JS (i18n, drawer, API, chatbot)
│   └── style.css       ← Estilos (drawer, cards, animações)
│
└── backend/
    ├── server.js           ← Express + rotas + serve frontend
    ├── package.json
    ├── routes/
    │   ├── news.js         ← GET /api/news?lang=pt
    │   ├── presales.js     ← GET /api/presales?status=active
    │   ├── alpha.js        ← GET /api/alpha
    │   ├── airdrops.js     ← GET /api/airdrops
    │   └── sponsors.js     ← GET /api/sponsors?tier=gold
    └── services/
        ├── newsService.js      ← Claude + web_search → notícias
        ├── presalesService.js  ← Dados de pré-vendas
        ├── alphaService.js     ← Sinais alpha
        ├── airdropsService.js  ← Airdrops
        └── sponsorsService.js  ← Patrocinadores
```

## Menu ☰ — 5 Abas

| Aba        | Rota API            | Conteúdo                                |
|------------|---------------------|-----------------------------------------|
| 📰 Notícias | `/api/news`        | Claude + web_search, 8 notícias ao vivo |
| 🚀 Pré-vendas | `/api/presales`  | Cards com barra de progresso            |
| ⚡ Alpha    | `/api/alpha`       | Sinais insider com tag de risco         |
| 🎁 Airdrops | `/api/airdrops`   | Cards com tarefas e recompensas         |
| 💎 Parceiros | `/api/sponsors`  | Patrocinadores com tier gold/silver     |

## Setup

```bash
cd backend
npm install
node server.js          # http://localhost:3001
```

Sem backend: abra `frontend/index.html` diretamente — funciona standalone via fallback.

## Adicionar novas abas

1. `backend/services/myService.js` — lógica de dados
2. `backend/routes/my.js`          — `router.get('/', ...)`
3. `server.js`                     — `app.use('/api/my', require('./routes/my'))`
4. `frontend/index.html`           — novo botão `.dtab`
5. `frontend/app.js`               — `fetchMy()` + `renderMy()` + case no `renderTab()`
6. `i18n` em `app.js`              — adicionar chave `dtMy` em todos os idiomas
