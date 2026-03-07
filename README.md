# 🧠 Cérebro Operacional — Backend API

Proxy para Meta Ads API. Resolve o bloqueio de CORS que impede chamadas diretas do browser.

## Deploy no Vercel (5 minutos)

### 1. Subir no GitHub
```bash
git init
git add .
git commit -m "cerebro backend"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/cerebro-backend.git
git push -u origin main
```

### 2. Deploy na Vercel
1. Acesse [vercel.com](https://vercel.com) e faça login com o GitHub
2. Clique em **"Add New Project"**
3. Importe o repositório `cerebro-backend`
4. Clique em **"Deploy"** — pronto!

A Vercel vai te dar uma URL tipo: `https://cerebro-backend-xyz.vercel.app`

### 3. Atualizar o Cérebro Operacional
No arquivo `cerebro-operacional.jsx`, na função `syncMetaAPI`, troque:
```js
// DE:
const insightsUrl = `https://graph.facebook.com/...`

// PARA:
const API_BASE = "https://cerebro-backend-xyz.vercel.app"; // sua URL da Vercel
const insightsUrl = `${API_BASE}/api/meta/insights?token=${fbToken}`;
const adsUrl = `${API_BASE}/api/meta/creatives?token=${fbToken}`;
```

## Endpoints

| Endpoint | Descrição |
|---|---|
| `GET /api/meta/insights?token=TOKEN` | Métricas de campanhas — últimos 7 dias |
| `GET /api/meta/creatives?token=TOKEN` | Criativos (imagem, título, texto) dos anúncios |

### Parâmetros opcionais
- `account_id` — ID da conta (padrão: `act_521962199812037`)
- `date_preset` — Período: `last_7d`, `last_14d`, `last_30d`, `this_month` (padrão: `last_7d`)

## Token Meta
Gere em [developers.facebook.com/tools/explorer](https://developers.facebook.com/tools/explorer) com permissões:
- `ads_read`
- `read_insights`

O token expira em ~1h. Para token de longa duração, use o endpoint de troca da Meta API.
