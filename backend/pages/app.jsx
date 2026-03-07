import { useState, useEffect, useRef, useCallback } from "react";
import Head from "next/head";

const _css = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #07070f; }
:root {
  --gold:#ffcb50; --gold2:#ff8c00; --gdim:rgba(255,200,80,0.13);
  --green:#4ade80; --red:#f87171; --orange:#fb923c;
  --bg:#07070f; --bg2:rgba(255,255,255,0.022); --bg3:rgba(255,255,255,0.04);
  --bd:rgba(255,255,255,0.07); --bdg:rgba(255,200,80,0.17);
  --tx:#f0ede6; --txd:rgba(240,237,230,0.38); --txm:rgba(240,237,230,0.68);
  --r:14px; --mono:'DM Mono',monospace; --sans:'Syne',sans-serif;
}
.app { font-family:var(--sans); background:var(--bg); min-height:100vh; color:var(--tx); overflow-x:hidden; position:relative; }
.noise { position:fixed; inset:0; pointer-events:none; z-index:0; opacity:.32;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.05'/%3E%3C/svg%3E"); }
.grid-bg { position:fixed; inset:0; pointer-events:none; z-index:0;
  background-image:linear-gradient(rgba(255,200,80,.022) 1px,transparent 1px),linear-gradient(90deg,rgba(255,200,80,.022) 1px,transparent 1px);
  background-size:48px 48px; }
.z1 { position:relative; z-index:1; }
.hdr { display:flex; align-items:center; justify-content:space-between; padding:20px 36px; border-bottom:1px solid var(--bdg); }
.logo { display:flex; align-items:center; gap:13px; }
.lorb { width:41px; height:41px; border-radius:12px; background:linear-gradient(135deg,var(--gold),var(--gold2)); display:flex; align-items:center; justify-content:center; font-size:20px; box-shadow:0 0 26px rgba(255,200,80,.42); }
.lname { font-size:17px; font-weight:800; letter-spacing:-.4px; }
.ltag { font-family:var(--mono); font-size:10px; color:var(--gold); letter-spacing:2.5px; text-transform:uppercase; opacity:.7; margin-top:2px; }
.hright { display:flex; align-items:center; gap:11px; }
.fbst { display:flex; align-items:center; gap:7px; font-family:var(--mono); font-size:11px; padding:6px 13px; border-radius:20px; border:1px solid var(--bd); background:var(--bg3); }
.fbst.on { border-color:rgba(74,222,128,.3); color:var(--green); background:rgba(74,222,128,.06); }
.fbst.off { border-color:rgba(248,113,113,.3); color:var(--red); background:rgba(248,113,113,.06); }
.sdot { width:6px; height:6px; border-radius:50%; flex-shrink:0; }
.sdot.on { background:var(--green); box-shadow:0 0 6px var(--green); animation:pulse 2s infinite; }
.sdot.off { background:var(--red); }
.dpill { font-family:var(--mono); font-size:11px; background:var(--gdim); border:1px solid var(--bdg); padding:6px 14px; border-radius:20px; color:var(--gold); }
.tabs { display:flex; gap:2px; padding:0 36px; border-bottom:1px solid var(--bd); overflow-x:auto; scrollbar-width:none; }
.tabs::-webkit-scrollbar { display:none; }
.tab { font-family:var(--sans); font-size:12px; font-weight:700; padding:13px 17px; border-radius:8px 8px 0 0; border:1px solid transparent; border-bottom:none; background:transparent; color:var(--txd); cursor:pointer; transition:all .18s; white-space:nowrap; }
.tab:hover { color:var(--txm); }
.tab.active { background:rgba(255,200,80,.07); color:var(--gold); border-color:var(--bdg); }
.main { padding:24px 36px; display:grid; gap:18px; }
.c2 { display:grid; grid-template-columns:1fr 1fr; gap:17px; }
.c3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:17px; }
.c4 { display:grid; grid-template-columns:repeat(4,1fr); gap:13px; }
.card { background:var(--bg2); border:1px solid var(--bd); border-radius:var(--r); padding:19px; transition:border-color .2s; }
.card.gb { border-color:var(--bdg); background:rgba(255,200,80,.025); }
.card.gnb { border-color:rgba(74,222,128,.2); background:rgba(74,222,128,.025); }
.card.rdb { border-color:rgba(248,113,113,.2); background:rgba(248,113,113,.025); }
.ctitle { font-size:11px; font-weight:700; letter-spacing:1.4px; text-transform:uppercase; color:var(--txd); margin-bottom:14px; display:flex; align-items:center; gap:7px; }
.mval { font-size:26px; font-weight:800; letter-spacing:-1px; line-height:1; }
.msub { font-family:var(--mono); font-size:10px; color:var(--txd); margin-top:5px; display:flex; align-items:center; gap:5px; }
.metawrap { background:rgba(255,200,80,.025); border:1px solid var(--bdg); border-radius:var(--r); padding:19px 23px; }
.metafig { font-size:36px; font-weight:800; color:var(--gold); letter-spacing:-2px; line-height:1; }
.metaof { font-size:14px; font-weight:600; color:var(--txd); margin-left:5px; }
.metapct { font-family:var(--mono); font-size:11px; background:rgba(74,222,128,.11); color:var(--green); padding:3px 10px; border-radius:20px; border:1px solid rgba(74,222,128,.2); }
.ptrack { height:5px; background:rgba(255,255,255,.05); border-radius:10px; overflow:hidden; }
.pfill { height:100%; border-radius:10px; background:linear-gradient(90deg,#ff6b00,#ffcb50,#fff0a0); box-shadow:0 0 13px rgba(255,200,80,.48); transition:width 1.2s cubic-bezier(.4,0,.2,1); }
.milestones { display:flex; justify-content:space-between; margin-top:7px; }
.ms { font-family:var(--mono); font-size:9px; color:rgba(240,237,230,.18); }
.ms.hit { color:var(--gold); }
.btn { font-family:var(--sans); font-size:13px; font-weight:700; background:linear-gradient(135deg,var(--gold2),var(--gold)); color:#07070f; border:none; padding:10px 19px; border-radius:10px; cursor:pointer; display:inline-flex; align-items:center; gap:7px; transition:all .2s; box-shadow:0 4px 16px rgba(255,200,80,.26); }
.btn:hover { transform:translateY(-1px); box-shadow:0 6px 26px rgba(255,200,80,.4); }
.btn:disabled { opacity:.4; cursor:not-allowed; transform:none; box-shadow:none; }
.btnol { font-family:var(--sans); font-size:12px; font-weight:600; background:transparent; color:var(--gold); border:1px solid var(--bdg); padding:8px 15px; border-radius:8px; cursor:pointer; transition:all .2s; display:inline-flex; align-items:center; gap:6px; }
.btnol:hover { background:rgba(255,200,80,.07); }
.btnol:disabled { opacity:.4; cursor:not-allowed; }
.btng { font-family:var(--sans); font-size:12px; font-weight:600; background:var(--bg3); color:var(--txm); border:1px solid var(--bd); padding:8px 13px; border-radius:8px; cursor:pointer; transition:all .2s; display:inline-flex; align-items:center; gap:6px; }
.btng:hover { background:rgba(255,255,255,.06); }
.brow { display:flex; gap:8px; flex-wrap:wrap; align-items:center; }
.spin { width:13px; height:13px; border:2px solid rgba(10,10,15,.22); border-top-color:#07070f; border-radius:50%; animation:spin .6s linear infinite; display:inline-block; }
.cursor { display:inline-block; width:7px; height:13px; background:var(--gold); animation:blink 1s step-end infinite; border-radius:1px; vertical-align:middle; margin-left:2px; }
.aiout { background:rgba(255,200,80,.032); border:1px solid var(--bdg); border-radius:10px; padding:14px 16px; margin-top:12px; font-family:var(--mono); font-size:12px; line-height:1.9; color:var(--txm); white-space:pre-wrap; max-height:380px; overflow-y:auto; }
.aiout::-webkit-scrollbar { width:3px; }
.aiout::-webkit-scrollbar-thumb { background:var(--bdg); border-radius:4px; }
.airow { display:flex; gap:8px; }
.aiinput { flex:1; font-family:var(--mono); font-size:13px; background:var(--bg3); border:1px solid var(--bd); color:var(--tx); padding:10px 14px; border-radius:10px; outline:none; transition:border-color .2s; }
.aiinput:focus { border-color:var(--bdg); }
.aiinput::placeholder { color:rgba(240,237,230,.2); }
.crow { display:flex; align-items:center; gap:9px; padding:10px 12px; border-radius:9px; margin-bottom:6px; background:rgba(255,255,255,.022); border:1px solid var(--bd); transition:all .18s; cursor:default; }
.crow:hover { border-color:var(--bdg); background:rgba(255,200,80,.03); }
.cname { flex:1; font-size:12px; font-weight:600; line-height:1.3; }
.cs { font-family:var(--mono); font-size:11px; color:var(--txd); white-space:nowrap; }
.badge { font-family:var(--mono); font-size:9px; font-weight:700; padding:3px 8px; border-radius:6px; letter-spacing:.5px; text-transform:uppercase; white-space:nowrap; }
.badge.sc { background:rgba(74,222,128,.12); color:var(--green); border:1px solid rgba(74,222,128,.2); }
.badge.ho { background:rgba(255,200,80,.12); color:var(--gold); border:1px solid rgba(255,200,80,.2); }
.badge.pa { background:rgba(248,113,113,.12); color:var(--red); border:1px solid rgba(248,113,113,.2); }
.crc { background:var(--bg3); border:1px solid var(--bd); border-radius:11px; padding:15px; margin-bottom:9px; transition:all .2s; }
.crc:hover { border-color:var(--bdg); }
.crc.win { border-color:rgba(255,200,80,.32); background:rgba(255,200,80,.035); }
.ctop { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:8px; }
.crn { font-size:13px; font-weight:700; }
.cmets { display:flex; gap:13px; flex-wrap:wrap; }
.cm .lbl { font-family:var(--mono); font-size:11px; color:var(--txd); }
.cm .val { font-family:var(--mono); font-size:11px; font-weight:500; margin-left:3px; }
.chi { display:flex; align-items:flex-start; gap:10px; padding:10px 12px; border-radius:9px; margin-bottom:5px; background:rgba(255,255,255,.018); border:1px solid var(--bd); cursor:pointer; transition:all .18s; }
.chi:hover { border-color:var(--bdg); }
.chi.done { opacity:.35; }
.cbox { width:18px; height:18px; border-radius:5px; flex-shrink:0; margin-top:1px; border:1.5px solid rgba(255,200,80,.28); display:flex; align-items:center; justify-content:center; transition:all .18s; }
.chi.done .cbox { background:var(--gold); border-color:var(--gold); }
.ctxt { font-size:13px; font-weight:500; line-height:1.5; }
.chi.done .ctxt { text-decoration:line-through; }
.rr { display:flex; gap:9px; align-items:center; padding:10px 12px; border-radius:9px; margin-bottom:5px; background:rgba(255,255,255,.018); border:1px solid var(--bd); }
.rc { font-family:var(--mono); font-size:11px; min-width:125px; }
.ra { font-size:12px; font-weight:600; }
.apb { background:linear-gradient(135deg,rgba(74,222,128,.07),rgba(74,222,128,.035)); border:1px solid rgba(74,222,128,.22); border-radius:var(--r); padding:15px 19px; display:flex; align-items:center; gap:13px; }
.apo { width:38px; height:38px; border-radius:50%; flex-shrink:0; background:rgba(74,222,128,.13); border:1px solid rgba(74,222,128,.28); display:flex; align-items:center; justify-content:center; font-size:18px; animation:glow 3s ease-in-out infinite; }
.apt { font-size:14px; font-weight:700; color:var(--green); margin-bottom:2px; }
.aps { font-family:var(--mono); font-size:11px; color:var(--txd); }
.slog { font-family:var(--mono); font-size:11px; line-height:2; color:var(--txd); background:rgba(0,0,0,.28); border-radius:8px; padding:10px 12px; max-height:200px; overflow-y:auto; }
.slog::-webkit-scrollbar { width:3px; }
.slog::-webkit-scrollbar-thumb { background:var(--bdg); border-radius:4px; }
.ll { display:flex; gap:8px; }
.ts { color:rgba(255,200,80,.45); }
.lok { color:var(--green); }
.lwarn { color:var(--orange); }
.linfo { color:var(--txd); }
.fg { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
.fgrp { display:flex; flex-direction:column; gap:4px; }
.flbl { font-family:var(--mono); font-size:10px; text-transform:uppercase; letter-spacing:1.5px; color:var(--txd); }
.finp { font-family:var(--mono); font-size:13px; font-weight:500; background:var(--bg3); border:1px solid var(--bd); color:var(--tx); padding:9px 12px; border-radius:8px; outline:none; transition:border-color .2s; width:100%; }
.finp:focus { border-color:var(--bdg); }
.qa { background:var(--bg2); border:1px solid var(--bd); border-radius:var(--r); padding:17px; cursor:pointer; transition:all .18s; }
.qa:hover { border-color:var(--bdg); background:rgba(255,200,80,.035); transform:translateY(-2px); }
.qai { font-size:20px; margin-bottom:8px; }
.qat { font-size:13px; font-weight:700; margin-bottom:4px; }
.qad { font-size:11px; color:var(--txd); line-height:1.55; }
.pthin { height:3px; background:rgba(255,255,255,.05); border-radius:10px; overflow:hidden; }
.pfill2 { height:100%; background:linear-gradient(90deg,var(--gold2),var(--gold)); border-radius:10px; transition:width .5s; }
.dv { height:1px; background:var(--bd); margin:13px 0; }
.step { display:flex; gap:11px; padding:10px 12px; border-radius:9px; background:rgba(255,255,255,.018); border:1px solid var(--bd); }
.stepn { width:21px; height:21px; border-radius:6px; background:rgba(255,200,80,.13); border:1px solid var(--bdg); display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; color:var(--gold); flex-shrink:0; }
.jsontxt { width:100%; font-family:var(--mono); font-size:11px; background:rgba(0,0,0,.3); border:1px solid var(--bd); color:var(--txm); padding:12px 14px; border-radius:9px; outline:none; resize:vertical; min-height:100px; line-height:1.7; transition:border-color .2s; }
.jsontxt:focus { border-color:var(--bdg); }
.errbox { color:var(--red); font-family:var(--mono); font-size:12px; padding:9px 13px; background:rgba(248,113,113,.07); border-radius:8px; border:1px solid rgba(248,113,113,.2); }
.succbox { color:var(--green); font-family:var(--mono); font-size:12px; padding:9px 13px; background:rgba(74,222,128,.07); border-radius:8px; border:1px solid rgba(74,222,128,.2); }
.tipbox { font-family:var(--mono); font-size:11px; color:var(--txd); background:rgba(255,255,255,.03); border:1px solid var(--bd); border-radius:8px; padding:10px 13px; line-height:1.7; }
.stat-highlight { background:rgba(255,200,80,.06); border:1px solid rgba(255,200,80,.2); border-radius:10px; padding:14px 16px; display:flex; justify-content:space-between; align-items:center; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.35} }
@keyframes glow { 0%,100%{box-shadow:0 0 0 rgba(74,222,128,0)} 50%{box-shadow:0 0 18px rgba(74,222,128,.32)} }
@keyframes spin { to{transform:rotate(360deg)} }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
`;

export default function App() {
  useEffect(() => {
    const _se = document.createElement("style");
    _se.textContent = _css;
    document.head.appendChild(_se);
    return () => document.head.removeChild(_se);
  }, []);

  // ── render ──
  return (
    <>
      <Head>
        <title>Go Orbit — by Gotannus</title>
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap" rel="stylesheet"/>
      </Head>
      <AppContent />
    </>
  );
}

// ── Constants ──────────────────────────────────────────────────────────────
const TICKET = 55;       // ticket do produto principal
const CPA_REAL = 15.39;  // CPA médio REAL (sem orderbump) confirmado pelo gestor
// Obs: o FB reporta CPA calculado sobre spend/conversões pixel,
// mas o CPA real da operação (sem orderbump) é R$15,39.
// Motor de decisão usa limiares baseados neste CPA real.

const SYSTEM_PROMPT = `Você é o Go Orbit, sistema operacional de tráfego pago da Gotannus.
PRODUTO: "Mulher Forte" — ticket principal R$55.
CPA REAL MÉDIO (sem orderbump): R$15,39. Use este número como referência, não o calculado pelo FB.
TRÁFEGO: 100% Facebook Ads.
CONTA: act_521962199812037
MÉTRICAS ALVO: CPA real ≤ R$20 | ROAS ≥ 2.5 (com ticket R$55) | CTR ≥ 2% | 10+ vendas/dia
META: R$100.000 em 30 dias (≈ 1.819 vendas a R$55).
PADRÃO VENCEDOR: imagens estáticas com CRIATIVO 24 e 26 têm melhor resultado. Foco em imagens, não vídeos.
PÚBLICO: mulheres 30–55 anos, sobrecarregadas, "fortes demais para pedir ajuda".
Responda sempre em português. Seja direto, específico e orientado a ação como um gestor sênior de tráfego pago.`;

// ── DADOS REAIS DO FACEBOOK — já parseados ────────────────────────────────
const REAL_CAMPAIGNS = [
  { id:"c1",  name:"[MF] 04/12 R$310 — Conversão",         spend:2172.34, conversions:175, ctr:2.51,  impressions:455288, clicks:11430 },
  { id:"c2",  name:"[MF] 04/12 R$20 — Initiate",           spend:11.04,   conversions:0,   ctr:10.05, impressions:1333,   clicks:134   },
  { id:"c3",  name:"[MF] 11/12 R$100 — Conversão",         spend:944.49,  conversions:72,  ctr:3.08,  impressions:151054, clicks:4647  },
  { id:"c4",  name:"[MF] 13/01 R$55 CRIATIVO 24",          spend:1005.11, conversions:85,  ctr:2.30,  impressions:142419, clicks:3277  },
  { id:"c5",  name:"[MF] 22/01 R$55 CRIATIVO 24 — Cópia",  spend:65.38,   conversions:0,   ctr:2.68,  impressions:7465,   clicks:200   },
  { id:"c6",  name:"[MF] CBO R$55 — CRIATIVO 42",          spend:321.68,  conversions:19,  ctr:5.65,  impressions:33760,  clicks:1907  },
  { id:"c7",  name:"[MF] 21/02 — Criativo 20 a 24",        spend:350.16,  conversions:22,  ctr:2.61,  impressions:50700,  clicks:1325  },
  { id:"c8",  name:"[MF] 21/02 R$55 CRIATIVO 32",          spend:0,       conversions:0,   ctr:0,     impressions:0,      clicks:0     },
  { id:"c9",  name:"[MF] 21/02 R$55 CRIATIVO 26a — Cópia", spend:710.70,  conversions:45,  ctr:3.97,  impressions:47045,  clicks:1870  },
  { id:"c10", name:"[MF] 01/03 R$55 CRIATIVO 26",          spend:156.33,  conversions:11,  ctr:3.26,  impressions:10173,  clicks:332   },
  { id:"c11", name:"[MF] 01/03 R$55 CRIATIVO 24",          spend:870.10,  conversions:76,  ctr:3.09,  impressions:96850,  clicks:2988  },
  { id:"c12", name:"[MF] 01/03 — Criativo 20 a 24",        spend:26.87,   conversions:0,   ctr:2.76,  impressions:1595,   clicks:44    },
  { id:"c13", name:"[MF] 05/03 R$55 CRIATIVO 24 (a)",      spend:52.04,   conversions:2,   ctr:3.31,  impressions:6169,   clicks:204   },
  { id:"c14", name:"[MF] 05/03 R$55 CRIATIVO 31",          spend:128.27,  conversions:10,  ctr:2.55,  impressions:9970,   clicks:254   },
  { id:"c15", name:"[MF] 05/03 R$55 CRIATIVO 26",          spend:129.55,  conversions:11,  ctr:3.66,  impressions:9833,   clicks:360   },
  { id:"c16", name:"[MF] 05/03 R$55 CRIATIVO 24 (b)",      spend:130.26,  conversions:17,  ctr:3.90,  impressions:11074,  clicks:432   },
].map(c => ({
  ...c,
  revenue: c.conversions * TICKET,
  cpa: c.conversions > 0 ? c.spend / c.conversions : 999,
  roas: c.spend > 0 && c.conversions > 0 ? (c.conversions * TICKET) / c.spend : 0,
})).filter(c => c.impressions > 0);

const CHECKLIST = {
  "🌅 Manhã":  ["Analisar dados do Facebook Ads","Identificar campanhas CPA ≤ R$18 → escalar +30%","Pausar campanhas com CPA > R$25","Registrar faturamento do dia anterior"],
  "☀️ Tarde":  ["Analisar imagem vencedora do dia","Gerar 3 variações de imagem com prompt Gemini","Subir 1 nova campanha de teste (R$55/dia)","Criar 1 novo produto ou variação"],
  "🌙 Noite":  ["Analisar métricas finais do dia","Identificar padrão dos criativos 24/26","Registrar aprendizados","Planejar imagens para testar amanhã"],
};

// ── Helpers ────────────────────────────────────────────────────────────────
const fBRL  = v => `R$${Number(v).toLocaleString("pt-BR",{maximumFractionDigits:0})}`;
const fNum  = v => Number(v).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2});
// Motor calibrado para CPA real R$15,39 (sem orderbump)
// ESCALAR  → CPA ≤ R$18  (margem saudável)
// MANTER   → CPA R$18–25 (monitorar)
// PAUSAR   → CPA > R$25  (risco de prejuízo)
const cSt   = cpa => cpa <= 18 ? "sc" : cpa <= 25 ? "ho" : "pa";
const stLbl = { sc:"ESCALAR", ho:"MANTER", pa:"PAUSAR" };

// ── Parse FB JSON (manual import) ─────────────────────────────────────────
function parseFBJson(raw) {
  const rows = Array.isArray(raw) ? raw : (raw?.data ?? []);
  if (!rows.length) throw new Error("Nenhuma campanha encontrada no JSON.");
  return rows
    .map((c, i) => {
      const getPurchases = () => {
        if (!c.actions) return 0;
        const keys = ["offsite_conversion.fb_pixel_purchase","purchase","omni_purchase","web_in_store_purchase"];
        for (const k of keys) {
          const found = c.actions.find(a => a.action_type === k);
          if (found) return parseFloat(found.value);
        }
        return 0;
      };
      const conversions = getPurchases();
      const spend = parseFloat(c.spend ?? 0);
      const ctrRaw = parseFloat(c.ctr ?? 0);
      const ctr = ctrRaw > 10 ? ctrRaw / 10 : ctrRaw; // normalize
      const revenue = conversions * TICKET;
      return {
        id: c.campaign_id ?? `imp_${i}`,
        name: (c.campaign_name ?? `Campanha ${i+1}`).replace(/\[Mulher Forte\]/gi,"[MF]"),
        spend, revenue,
        impressions: parseInt(c.impressions ?? 0),
        clicks: parseInt(c.clicks ?? 0),
        conversions: Math.round(conversions),
        ctr: parseFloat(ctr.toFixed(2)),
        cpa: conversions > 0 ? spend / conversions : 999,
        roas: spend > 0 && conversions > 0 ? revenue / spend : 0,
      };
    })
    .filter(c => c.impressions > 0 || c.spend > 0);
}

// ── Main App ───────────────────────────────────────────────────────────────
function AppContent() {
  const [tab,      setTab]      = useState("dashboard");
  const [campaigns,setCampaigns]= useState(REAL_CAMPAIGNS);
  const [fbConn,   setFbConn]   = useState(true);  // real data is pre-loaded
  const [usingReal,setUsingReal]= useState(true);
  const [jsonInput,setJsonInput]= useState("");
  const [importErr,setImportErr]= useState("");
  const [importOk, setImportOk] = useState("");
  const [syncLog,  setSyncLog]  = useState([
    { ts:"agora", type:"ok",   msg:"✓ Dados reais carregados — conta act_521962199812037" },
    { ts:"agora", type:"ok",   msg:`✓ ${REAL_CAMPAIGNS.length} campanhas ativas (28/02–06/03/2026)` },
    { ts:"agora", type:"ok",   msg:`✓ CPA real (sem orderbump): R$${CPA_REAL.toFixed(2)} · Meta: ≤ R$18` },
    { ts:"agora", type:"info", msg:"✓ Motor de decisão calibrado para CPA real" },
  ]);
  const [day,      setDay]      = useState(7);
  const [fat,      setFat]      = useState(0);
  const [aiOut,    setAiOut]    = useState("");
  const [aiLoad,   setAiLoad]   = useState(false);
  const [aiCtx,    setAiCtx]    = useState("");
  const [customQ,  setCustomQ]  = useState("");
  const [autoMode, setAutoMode] = useState(false);
  const [autoLog,  setAutoLog]  = useState([]);
  const [checks,   setChecks]   = useState({});
  const [genLoad,  setGenLoad]  = useState(false);
  const [genCreat, setGenCreat] = useState([]);
  const [geminiKey,setGeminiKey]= useState("");
  const [geminiErr,setGeminiErr]= useState("");
  const [fbToken,  setFbToken]  = useState("");
  const [syncAuto, setSyncAuto] = useState(false);
  const [syncLoad, setSyncLoad] = useState(false);
  const [syncErr,  setSyncErr]  = useState("");
  const [syncOk,   setSyncOk]   = useState("");
  const [adCreatives, setAdCreatives] = useState([]);
  const [creativesLoad, setCreativesLoad] = useState(false);
  const outRef  = useRef(null);
  const autoRef = useRef(null);

  // ── Derived ──────────────────────────────────────────────────────────────
  const activeCamps  = campaigns.filter(c => c.spend > 0);
  const totSpend     = campaigns.reduce((s,c)=>s+c.spend, 0);
  const totSales     = campaigns.reduce((s,c)=>s+c.conversions, 0);
  const totRev       = totSales * TICKET;
  const avgCpa       = totSales > 0 ? totSpend / totSales : 0;
  const avgCtr       = activeCamps.length > 0 ? activeCamps.reduce((s,c)=>s+c.ctr,0)/activeCamps.length : 0;
  const roas         = totSpend > 0 ? totRev / totSpend : 0;
  const winCamp      = [...activeCamps].filter(c=>c.conversions>0).sort((a,b)=>a.cpa-b.cpa)[0];
  const chkDone      = Object.values(checks).filter(Boolean).length;
  const chkTotal     = Object.values(CHECKLIST).flat().length;
  const pct          = Math.min((fat / META_GOAL) * 100, 100);

  const totalRevReal = totRev;  // revenue from FB data this week
  const salesPerDay  = totSales / 7;
  const spendPerDay  = totSpend / 7;

  const addLog = (type, msg) => {
    const ts = new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});
    setSyncLog(l => [...l.slice(-29), {ts,type,msg}]);
  };

  // ── Manual JSON import ────────────────────────────────────────────────────
  const importJSON = () => {
    setImportErr(""); setImportOk("");
    if (!jsonInput.trim()) { setImportErr("Cole o JSON acima antes de importar."); return; }
    try {
      const raw  = JSON.parse(jsonInput);
      const norm = parseFBJson(raw);
      setCampaigns(norm);
      setUsingReal(true);
      setFbConn(true);
      setImportOk(`✓ ${norm.length} campanhas importadas com sucesso!`);
      addLog("ok", `${norm.length} campanhas atualizadas via importação manual`);
      setJsonInput("");
    } catch (e) {
      setImportErr("Erro ao processar JSON: " + e.message);
    }
  };

  // ── AI ────────────────────────────────────────────────────────────────────
  const callAI = useCallback(async (prompt, ctx="") => {
    setAiLoad(true); setAiOut(""); setAiCtx(ctx);
    try {
      const res  = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000, system:SYSTEM_PROMPT, messages:[{role:"user",content:prompt}] }),
      });
      const data = await res.json();
      const text = data.content?.map(b=>b.text||"").join("")||"Erro.";
      let i=0;
      const iv = setInterval(()=>{
        i+=5; setAiOut(text.slice(0,i));
        if(outRef.current) outRef.current.scrollTop=outRef.current.scrollHeight;
        if(i>=text.length) clearInterval(iv);
      },10);
    } catch { setAiOut("Erro de conexão com a IA."); }
    finally { setAiLoad(false); }
  },[]);

  // ── Auto analyze on first load ────────────────────────────────────────────
  useEffect(()=>{
    // Calculate real faturamento from FB data
    setFat(totRev);
  // eslint-disable-next-line
  },[]);

  // ── Sync com Meta API (via backend proxy) ────────────────────────────────
  const syncMetaAPI = async () => {
    if (!fbToken.trim()) { setSyncErr("Cole o token de acesso primeiro."); return; }
    setSyncLoad(true); setSyncErr(""); setSyncOk("");
    addLog("info", "Iniciando sincronização com Meta API…");

    // ⚠️ Troque pela URL do seu deploy na Vercel após subir o backend
    const API_BASE = "https://goorbit.vercel.app";

    try {
      // 1. Buscar insights das campanhas (últimos 7 dias)
      const insRes = await fetch(`${API_BASE}/api/meta/insights?token=${encodeURIComponent(fbToken)}`);
      const insData = await insRes.json();
      if (insData.error) throw new Error(insData.error);
      const parsed = parseFBJson(insData.data || []);
      setCampaigns(parsed);
      setUsingReal(true); setFbConn(true);
      addLog("ok", `✓ ${parsed.length} campanhas sincronizadas`);

      // 2. Buscar criativos dos anúncios ativos
      setCreativesLoad(true);
      const adsRes = await fetch(`${API_BASE}/api/meta/creatives?token=${encodeURIComponent(fbToken)}`);
      const adsData = await adsRes.json();
      if (adsData.error) throw new Error("Criativos: " + adsData.error);
      setAdCreatives(adsData.data || []);
      addLog("ok", `✓ ${(adsData.data||[]).length} criativos carregados`);
      setSyncOk(`✓ Sincronizado! ${parsed.length} campanhas + ${(adsData.data||[]).length} criativos — ${new Date().toLocaleTimeString("pt-BR")}`);
    } catch(e) {
      setSyncErr("Erro: " + e.message);
      addLog("warn", "Erro na sincronização: " + e.message);
    } finally {
      setSyncLoad(false);
      setCreativesLoad(false);
    }
  };

  // ── Generate image prompts + open Gemini ─────────────────────────────────
  // A Gemini API (como a do Facebook) bloqueia chamadas diretas do browser via CORS.
  // Solução: Claude gera prompts detalhados em JSON → cada prompt tem botão "Abrir no Gemini"
  // que abre aistudio.google.com já com o prompt preenchido.
  const genCreatives = async () => {
    setGenLoad(true);
    setGeminiErr("");

    const top3 = [...activeCamps].filter(c=>c.conversions>0).sort((a,b)=>a.cpa-b.cpa).slice(0,3);
    const briefPrompt = `Você é especialista em criativos de imagem estática para Facebook Ads.

CONTEXTO:
- Produto: "Mulher Forte" — guia digital R$55
- Público: mulheres 30–55 anos, sobrecarregadas, "fortes demais para pedir ajuda"
- CPA real: R$${CPA_REAL} (sem orderbump) | Meta CPA: ≤ R$18
- Formato vencedor: IMAGENS ESTÁTICAS com texto emocional direto (criativos 24 e 26)
- Top campanhas: ${top3.map(c=>`${c.name} (CPA R$${c.cpa.toFixed(2)}, CTR ${c.ctr}%)`).join(" | ")}

Gere 5 conceitos de IMAGEM ESTÁTICA para Facebook Ads feed (formato 4:5).

Retorne APENAS um array JSON com 5 objetos neste formato exato (sem texto antes ou depois):
[
  {
    "nome": "CRIATIVO 43",
    "angulo": "A mulher que carrega tudo sozinha finalmente para",
    "headline": "Você não precisa ser forte hoje",
    "subheadline": "O guia que toda mulher sobrecarregada precisava encontrar",
    "prompt_en": "Photorealistic vertical 4:5 Facebook ad image. A tired but dignified Brazilian woman in her 40s sitting at a kitchen table, soft morning light, warm earthy tones (terracotta, cream, dusty rose). She holds a coffee cup, eyes closed in a peaceful moment. Bold white sans-serif text overlay at top: 'Você não precisa ser forte hoje'. Smaller text below. Clean, minimal, emotional, organic feel. No stock photo aesthetic. Cinematic depth of field."
  }
]

Varie os ângulos emocionais: exaustão, culpa, libertação, reconhecimento, pertencimento.
Foco: parar o scroll. Sem cara de anúncio. Natural como post de amiga.`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:2000, system:SYSTEM_PROMPT, messages:[{role:"user",content:briefPrompt}] }),
      });
      const d = await res.json();
      const raw = d.content?.map(b=>b.text||"").join("")||"[]";
      let items = [];
      try {
        const clean = raw.replace(/```json[\s\S]*?```|```[\s\S]*?```/g, m => m.replace(/```json\n?|```\n?/g,"")).trim();
        // Find JSON array in response
        const match = clean.match(/\[[\s\S]*\]/);
        items = match ? JSON.parse(match[0]) : [];
      } catch { items = []; }

      if (!items.length) throw new Error("Erro ao parsear resposta da IA.");

      setGenCreat(prev=>[{ id:Date.now(), ts:new Date().toLocaleTimeString("pt-BR"), items },...prev.slice(0,3)]);
      addLog("ok", `${items.length} prompts de imagem gerados — clique "Abrir no Gemini" em cada um`);
    } catch(e) {
      setGeminiErr("Erro: " + e.message);
      addLog("warn","Erro ao gerar prompts: " + e.message);
    } finally { setGenLoad(false); }
  };

  // ── Auto pilot ────────────────────────────────────────────────────────────
  const runCycle = useCallback(async () => {
    const ts = new Date().toLocaleTimeString("pt-BR");
    setAutoLog(l=>[...l,`[${ts}] 🔄 Ciclo automático iniciado`]);
    const top  = [...activeCamps].filter(c=>c.conversions>0).sort((a,b)=>a.cpa-b.cpa)[0];
    const pause= activeCamps.filter(c=>cSt(c.cpa)==="pa");
    const scale= activeCamps.filter(c=>cSt(c.cpa)==="sc");
    if(scale.length) setAutoLog(l=>[...l,`[${ts}] ✅ ${scale.length} campanha(s) para ESCALAR`]);
    if(pause.length) setAutoLog(l=>[...l,`[${ts}] ⏸ ${pause.length} campanha(s) para PAUSAR`]);
    const p=`ANÁLISE AUTOMÁTICA — DADOS REAIS (7 dias)\nGasto total: R$${totSpend.toFixed(2)} | Vendas: ${totSales} | CPA médio: R$${avgCpa.toFixed(2)} | CTR: ${avgCtr.toFixed(2)}% | ROAS: ${roas.toFixed(2)}\nTop campanha: ${top?.name} (CPA R$${top?.cpa?.toFixed(2)}, ${top?.conversions} vendas)\n\nEm 5 linhas: diagnóstico · ação #1 urgente · criativo para hoje · produto para criar · projeção para R$100k.`;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:500,system:SYSTEM_PROMPT,messages:[{role:"user",content:p}]})});
      const data=await res.json();
      const brief=data.content?.map(b=>b.text||"").join("")||"";
      setAutoLog(l=>[...l,`[${ts}] 🧠 ${brief.slice(0,220)}…`]);
      addLog("ok","Brief automático gerado");
    } catch { setAutoLog(l=>[...l,`[${ts}] ⚠ Erro no brief`]); }
  },[activeCamps,totSpend,totSales,avgCpa,avgCtr,roas]);

  const toggleAuto=()=>{
    if(autoMode){clearInterval(autoRef.current);setAutoMode(false);setAutoLog(l=>[...l,`[${new Date().toLocaleTimeString("pt-BR")}] ⏹ Pausado`]);}
    else{setAutoMode(true);setAutoLog(l=>[...l,`[${new Date().toLocaleTimeString("pt-BR")}] ▶ Piloto ativado`]);runCycle();autoRef.current=setInterval(runCycle,30*60*1000);}
  };
  useEffect(()=>()=>clearInterval(autoRef.current),[]);

  const TABS=[["dashboard","📊 Dashboard"],["campanhas","📣 Campanhas"],["criativos","🎨 Criativos"],["autopilot","🤖 Piloto Auto"],["rotina","✅ Rotina"],["sync","⚡ Sync Automático"],["importar","🔗 Importar FB"],["ia","💬 IA Conselheira"]];

  return (
    <div className="app">
      <div className="noise"/><div className="grid-bg"/>
      <div className="z1">

        {/* HEADER */}
        <div className="hdr">
          <div className="logo">
            <div className="lorb">🚀</div>
            <div>
              <div className="lname">Go Orbit</div>
              <div className="ltag">by Gotannus · Low Ticket · Meta Ads</div>
            </div>
          </div>
          <div className="hright">
            <div className={`fbst ${fbConn?"on":"off"}`}>
              <div className={`sdot ${fbConn?"on":"off"}`}/>
              {fbConn ? `FB Live · act_521962199812037` : "Desconectado"}
            </div>
            <div className="dpill">7 dias · até 06/03</div>
          </div>
        </div>

        {/* TABS */}
        <div className="tabs">
          {TABS.map(([id,lbl])=>(
            <button key={id} className={`tab ${tab===id?"active":""}`} onClick={()=>setTab(id)}>{lbl}</button>
          ))}
        </div>

        {/* ═══ DASHBOARD ═══ */}
        {tab==="dashboard"&&(
          <div className="main">

            {/* Resumo real dos 7 dias */}
            <div className="card gb">
              <div className="ctitle">📡 Resumo Real — Últimos 7 Dias (28/02–06/03)</div>
              <div className="c4">
                {[
                  {lbl:"Gasto Total",val:fBRL(totSpend),sub:"7 dias"},
                  {lbl:"Vendas",val:String(totSales),sub:`~${salesPerDay.toFixed(1)}/dia`},
                  {lbl:"Faturamento",val:fBRL(totRev),sub:`Ticket R$${TICKET}`},
                  {lbl:"ROAS",val:fNum(roas),sub:`CPA R$${fNum(avgCpa)}`},
                ].map(m=>(
                  <div key={m.lbl} style={{textAlign:"center",padding:"10px 0"}}>
                    <div style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--txd)",textTransform:"uppercase",letterSpacing:1.5,marginBottom:5}}>{m.lbl}</div>
                    <div style={{fontSize:22,fontWeight:800,color:"var(--gold)",letterSpacing:-1}}>{m.val}</div>
                    <div style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--txd)",marginTop:3}}>{m.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Meta bar */}
            <div className="metawrap">
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:12}}>
                <div>
              <div style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--gold)",opacity:.7,textTransform:"uppercase",letterSpacing:2,marginBottom:5}}>Meta acumulada (ajuste manual)</div>
                  <span className="metafig">{fBRL(fat)}</span>
                  <span className="metaof">/ R$100.000</span>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:5,alignItems:"flex-end"}}>
                  <div className="metapct">{pct.toFixed(1)}%</div>
                  <div style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--txd)"}}>Falta <span style={{color:"var(--gold)",fontWeight:600}}>{fBRL(Math.round((META_GOAL-fat)/Math.max(30-day,1)))}/dia</span></div>
                </div>
              </div>
              <div className="ptrack"><div className="pfill" style={{width:`${pct}%`}}/></div>
              <div className="milestones">
                {[[23333,"D7"],[50000,"D15"],[73333,"D22"],[100000,"D30"]].map(([v,d])=>(
                  <div key={d} className={`ms ${fat>=v?"hit":""}`}>{d} {fBRL(v)}</div>
                ))}
              </div>
            </div>

            {/* Metrics */}
            <div className="c4">
              {[
                {lbl:"CPA Médio",val:`R$${fNum(avgCpa)}`,ok:avgCpa<=18,warn:avgCpa<=25,hint:avgCpa<=18?"ESCALAR":avgCpa<=25?"MANTER":"PAUSAR"},
                {lbl:"CTR Médio",val:`${fNum(avgCtr)}%`,ok:avgCtr>=2,warn:avgCtr>=1.5,hint:avgCtr>=2?"ÓTIMO":avgCtr>=1.5?"OK":"BAIXO"},
                {lbl:"Vendas 7d",val:String(totSales),ok:totSales>=70,warn:totSales>=35,hint:`~${salesPerDay.toFixed(1)}/dia`},
                {lbl:"ROAS",val:fNum(roas),ok:roas>=3,warn:roas>=2,hint:`Meta ≥ 3.0`},
              ].map(m=>(
                <div key={m.lbl} className={`card ${m.ok?"gnb":m.warn?"gb":"rdb"}`}>
                  <div className="ctitle">{m.lbl}</div>
                  <div className="mval" style={{color:m.ok?"var(--green)":m.warn?"var(--gold)":"var(--red)"}}>{m.val}</div>
                  <div className="msub">
                    <div className="sdot" style={{background:m.ok?"var(--green)":m.warn?"var(--gold)":"var(--red)",boxShadow:"none",animation:m.ok?"pulse 2s infinite":"none"}}/>
                    {m.hint}
                  </div>
                </div>
              ))}
            </div>

            {/* Winner + update */}
            <div className="c2">
              <div className="card gb">
                <div className="ctitle">🏆 Melhor Campanha da Semana</div>
                {winCamp&&<>
                  <div style={{fontSize:14,fontWeight:800,marginBottom:10,lineHeight:1.4}}>{winCamp.name}</div>
                  <div className="cmets" style={{marginBottom:14}}>
                    {[["CPA",`R$${fNum(winCamp.cpa)}`,"var(--green)"],["ROAS",fNum(winCamp.roas),"var(--gold)"],["Vendas",winCamp.conversions,"var(--tx)"],["CTR",`${fNum(winCamp.ctr)}%`,"var(--tx)"],["Gasto",fBRL(winCamp.spend),"var(--txd)"]].map(([k,v,c])=>(
                      <div key={k} className="cm"><span className="lbl">{k}</span><span className="val" style={{color:c}}>{v}</span></div>
                    ))}
                  </div>
                  <button className="btn" onClick={()=>{setTab("criativos");genCreatives();}} disabled={genLoad} style={{width:"100%"}}>
                    {genLoad?<><div className="spin"/>Gerando...</>:"✨ Gerar Variações do Criativo Top"}
                  </button>
                </>}
              </div>
              <div className="card">
                <div className="ctitle">⚙️ Ajustar Progresso</div>
                <div className="fg" style={{marginBottom:12}}>
                  <div className="fgrp">
                    <div className="flbl">Dia atual</div>
                    <input className="finp" type="number" value={day} onChange={e=>setDay(Number(e.target.value))}/>
                  </div>
                  <div className="fgrp">
                    <div className="flbl">Faturamento Total (R$)</div>
                    <input className="finp" type="number" value={fat} onChange={e=>setFat(Number(e.target.value))}/>
                  </div>
                </div>
                <button className="btn" style={{width:"100%"}} onClick={()=>callAI(
                  `DADOS REAIS DA CONTA act_521962199812037 — últimos 7 dias:\n\nGasto: R$${totSpend.toFixed(2)}\nVendas: ${totSales} (${salesPerDay.toFixed(1)}/dia)\nCPA médio: R$${avgCpa.toFixed(2)}\nCTR médio: ${avgCtr.toFixed(2)}%\nROAS: ${roas.toFixed(2)}\nFaturamento gerado: R$${totRev.toFixed(2)}\n\nTop campanha: ${winCamp?.name} (CPA R$${winCamp?.cpa?.toFixed(2)}, ${winCamp?.conversions} vendas)\n\nMeta: R$100.000 em 30 dias. Estamos no dia ${day}.\n\nDê: 1) diagnóstico honesto do desempenho atual, 2) as 3 ações mais urgentes agora, 3) projeção realista se mantiver o ritmo atual, 4) o que precisa mudar para bater R$100k.`,
                  "dash"
                )} disabled={aiLoad}>
                  {aiLoad&&aiCtx==="dash"?<><div className="spin"/>Analisando...</>:"🧠 Analisar Dados Reais com IA"}
                </button>
                {aiOut&&aiCtx==="dash"&&<div className="aiout" ref={outRef}>{aiOut}{aiLoad&&<span className="cursor"/>}</div>}
              </div>
            </div>

            {/* Sync log */}
            <div className="card">
              <div className="ctitle">📡 Status da Conexão</div>
              <div className="slog">
                {syncLog.map((l,i)=>(
                  <div key={i} className="ll">
                    <span className="ts">[{l.ts}]</span>
                    <span className={`l${l.type}`}>{l.msg}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══ CAMPANHAS ═══ */}
        {tab==="campanhas"&&(
          <div className="main">
            {/* Summary stats */}
            <div className="c3">
              {[
                {lbl:"🟢 Para Escalar",camps:activeCamps.filter(c=>cSt(c.cpa)==="sc"),col:"var(--green)",bg:"rgba(74,222,128,.06)",bd:"rgba(74,222,128,.2)"},
                {lbl:"🟡 Manter",camps:activeCamps.filter(c=>cSt(c.cpa)==="ho"),col:"var(--gold)",bg:"rgba(255,200,80,.06)",bd:"rgba(255,200,80,.2)"},
                {lbl:"🔴 Pausar",camps:activeCamps.filter(c=>cSt(c.cpa)==="pa"),col:"var(--red)",bg:"rgba(248,113,113,.06)",bd:"rgba(248,113,113,.2)"},
              ].map(g=>(
                <div key={g.lbl} style={{background:g.bg,border:`1px solid ${g.bd}`,borderRadius:"var(--r)",padding:"14px 16px"}}>
                  <div style={{fontSize:13,fontWeight:700,color:g.col,marginBottom:8}}>{g.lbl} ({g.camps.length})</div>
                  {g.camps.map(c=>(
                    <div key={c.id} style={{fontSize:11.5,color:"var(--txm)",marginBottom:4,lineHeight:1.4}}>
                      {c.name.replace("[MF] ","").slice(0,42)}
                      <span style={{fontFamily:"var(--mono)",fontSize:10,color:g.col,marginLeft:6}}>R${fNum(c.cpa)}</span>
                    </div>
                  ))}
                  {g.camps.length===0&&<div style={{fontSize:11,color:"var(--txd)"}}>Nenhuma</div>}
                </div>
              ))}
            </div>

            <div className="c2">
              <div className="card">
                <div className="ctitle">📣 Todas as Campanhas</div>
                <div style={{maxHeight:440,overflowY:"auto"}}>
                  {[...activeCamps].sort((a,b)=>a.cpa-b.cpa).map(c=>(
                    <div key={c.id} className="crow">
                      <div className="cname">{c.name.replace("[MF] ","")}</div>
                      <div className="cs">{c.conversions}v</div>
                      <div className="cs" style={{color:c.cpa<=18?"var(--green)":c.cpa<=25?"var(--gold)":"var(--red)"}}>{fNum(c.cpa)}</div>
                      <div className="cs" style={{color:"var(--txd)"}}>{fNum(c.ctr)}%</div>
                      <div className={`badge ${cSt(c.cpa)}`}>{stLbl[cSt(c.cpa)]}</div>
                    </div>
                  ))}
                </div>
                <div style={{marginTop:12}}>
                  <button className="btn" onClick={()=>callAI(
                    `Analise cada campanha abaixo com dados REAIS e dê decisão (pausar/manter/escalar/duplicar):\n${[...activeCamps].sort((a,b)=>a.cpa-b.cpa).map(c=>`- ${c.name}: CPA R$${c.cpa.toFixed(2)}, ${c.conversions} vendas, CTR ${c.ctr}%, ROAS ${c.roas.toFixed(2)}, gasto R$${c.spend.toFixed(2)}`).join("\n")}\n\nTicket: R$55. Seja direto e específico para cada uma.`,
                    "camps"
                  )} disabled={aiLoad}>
                    {aiLoad&&aiCtx==="camps"?<><div className="spin"/>...</>:"🧠 Analisar Todas com IA"}
                  </button>
                </div>
                {aiOut&&aiCtx==="camps"&&<div className="aiout" ref={outRef}>{aiOut}{aiLoad&&<span className="cursor"/>}</div>}
              </div>

              <div className="card">
                <div className="ctitle">🎯 Motor de Decisão — CPA real R${fNum(CPA_REAL)}</div>
                {[
                  {c:"CPA ≤ R$18",       a:"ESCALAR +30% imediatamente",         col:"var(--green)"},
                  {c:"CPA R$18–25",      a:"MANTER e monitorar CTR",             col:"var(--gold)"},
                  {c:"CPA R$25–35",      a:"REVISAR criativo — perigo",          col:"var(--orange)"},
                  {c:"CPA > R$35",       a:"PAUSAR — risco de prejuízo",         col:"var(--red)"},
                  {c:"CTR < 1.5%",      a:"Trocar imagem urgente",               col:"var(--red)"},
                  {c:"CTR > 4%",        a:"Escalar agressivo +50%",              col:"var(--green)"},
                  {c:"ROAS > 3.0",      a:"Duplicar campanha / novo público",    col:"var(--green)"},
                  {c:"10+ vendas/dia",  a:"Testar lookalike 1% do público",      col:"var(--green)"},
                ].map((r,i)=>(
                  <div key={i} className="rr">
                    <div className="rc" style={{color:r.col}}>{r.c}</div>
                    <div style={{color:"rgba(255,255,255,.15)",fontSize:14}}>→</div>
                    <div className="ra">{r.a}</div>
                  </div>
                ))}
                <div className="dv"/>
                <div style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--txd)"}}>
                  CPA real médio (sem orderbump): <span style={{color:"var(--gold)",fontWeight:700}}>R${fNum(CPA_REAL)}</span> · Meta: ≤ R$18
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ CRIATIVOS ═══ */}
        {tab==="criativos"&&(
          <div className="main">

            {/* Gemini key */}
            {/* Performance ranking */}
            <div className="card gb">
              <div className="ctitle">📊 Performance Real por Criativo</div>
              <div className="c4">
                {[
                  {num:"24",camps:activeCamps.filter(c=>c.name.match(/CRIATIVO 24/i))},
                  {num:"26",camps:activeCamps.filter(c=>c.name.match(/CRIATIVO 26/i))},
                  {num:"31",camps:activeCamps.filter(c=>c.name.match(/CRIATIVO 31/i))},
                  {num:"42",camps:activeCamps.filter(c=>c.name.match(/CRIATIVO 42/i))},
                ].map(g=>{
                  const totV=g.camps.reduce((s,c)=>s+c.conversions,0);
                  const totS=g.camps.reduce((s,c)=>s+c.spend,0);
                  const avgC=totV>0?totS/totV:0;
                  const avgT=g.camps.length>0?g.camps.reduce((s,c)=>s+c.ctr,0)/g.camps.length:0;
                  return(
                    <div key={g.num} className={`card ${avgC>0&&avgC<=18?"gnb":avgC>0&&avgC<=25?"gb":"rdb"}`} style={{padding:"14px"}}>
                      <div style={{fontSize:22,fontWeight:800,color:"var(--gold)",marginBottom:4}}>#{g.num}</div>
                      <div style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--txd)",marginBottom:7}}>{g.camps.length} camp.</div>
                      {totV>0?<>
                        <div style={{fontSize:13,fontWeight:700,marginBottom:2}}>{totV} vendas</div>
                        <div style={{fontFamily:"var(--mono)",fontSize:10,color:avgC<=18?"var(--green)":avgC<=25?"var(--gold)":"var(--red)"}}>CPA R${fNum(avgC)}</div>
                        <div style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--txd)"}}>CTR {fNum(avgT)}%</div>
                      </>:<div style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--txd)"}}>Sem conv.</div>}
                    </div>
                  );
                })}
              </div>
              <div style={{marginTop:10,fontFamily:"var(--mono)",fontSize:10,color:"var(--txd)",background:"rgba(255,200,80,.04)",borderRadius:7,padding:"7px 10px"}}>
                ⚠️ CPA acima = spend÷pixel. CPA real da operação (sem orderbump): <span style={{color:"var(--gold)",fontWeight:700}}>R${fNum(CPA_REAL)}</span>
              </div>
            </div>

            <div className="c2">
              {/* LEFT: geração */}
              <div className="card">
                <div className="ctitle">🖼 Gerar Imagens Estáticas para FB Ads</div>

                <div style={{background:"rgba(255,200,80,.04)",border:"1px solid rgba(255,200,80,.18)",borderRadius:10,padding:"13px 14px",marginBottom:14}}>
                  <div style={{fontSize:13,fontWeight:700,color:"var(--gold)",marginBottom:6}}>Como funciona</div>
                  <div style={{display:"grid",gap:6}}>
                    {[
                      ["1","Claude analisa suas campanhas top e cria 5 conceitos de imagem"],
                      ["2","Cada conceito tem headline em português + prompt detalhado em inglês"],
                      ["3","Clique em ✨ Abrir no Gemini — o prompt já vem preenchido"],
                      ["4","Clique em Gerar → baixe a imagem → suba no Facebook Ads"],
                    ].map(([n,t])=>(
                      <div key={n} style={{display:"flex",gap:9,alignItems:"flex-start"}}>
                        <div style={{width:18,height:18,borderRadius:5,background:"rgba(255,200,80,.15)",border:"1px solid rgba(255,200,80,.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"var(--gold)",flexShrink:0}}>{n}</div>
                        <div style={{fontSize:11.5,color:"var(--txm)",lineHeight:1.5}}>{t}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <button className="btn" style={{width:"100%",marginBottom:14}} onClick={genCreatives} disabled={genLoad}>
                  {genLoad?<><div className="spin"/>Criando conceitos...</>:"✨ Gerar 5 Conceitos de Imagem"}
                </button>

                {geminiErr&&<div className="errbox" style={{marginBottom:12}}>{geminiErr}</div>}

                <div className="ctitle" style={{marginTop:2}}>✍️ Prompt livre</div>
                <div className="airow" style={{marginBottom:8}}>
                  <input className="aiinput" placeholder="Ex: Imagem com mulher exausta mas resiliente, tons quentes…" value={customQ} onChange={e=>setCustomQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&customQ&&callAI(customQ,"criativo")}/>
                  <button className="btn" onClick={()=>callAI(customQ,"criativo")} disabled={aiLoad||!customQ}>
                    {aiLoad&&aiCtx==="criativo"?<><div className="spin"/>...</>:"→"}
                  </button>
                </div>
                <div className="brow">
                  {[
                    ["🔥 Emocional",`Crie 1 prompt COMPLETO em inglês para imagem estática Facebook Ads 4:5 do produto "Mulher Forte" (R$55). Inclua: composição, cores, tipografia, headline em português (máx 8 palavras) que aparece na imagem, mood, estilo foto realista. Público: mulheres 35–50 sobrecarregadas. Sem cara de anúncio.`],
                    ["📐 3 Formatos",`Prompts para "Mulher Forte" em 3 formatos: 4:5 feed, 9:16 stories, 1:1 quadrado. Mesmo conceito emocional adaptado. Cada prompt em inglês + headline em português.`],
                    ["💬 Depoimento",`Prompt em inglês para imagem estática estilo quote card ou screenshot de mensagem. "Mulher Forte" R$55. Parece post orgânico, não anúncio. Headline em português + prompt completo.`],
                  ].map(([l,p])=>(
                    <button key={l} className="btng" style={{fontSize:11}} onClick={()=>{setCustomQ(p);callAI(p,"criativo");}} disabled={aiLoad}>{l}</button>
                  ))}
                </div>
                {aiOut&&aiCtx==="criativo"&&<div className="aiout" ref={outRef}>{aiOut}{aiLoad&&<span className="cursor"/>}</div>}
              </div>

              {/* RIGHT: resultados */}
              <div className="card">
                <div className="ctitle">🖼 Conceitos Prontos para Gerar</div>

                {genCreat.length===0&&(
                  <div style={{color:"var(--txd)",fontFamily:"var(--mono)",fontSize:12,padding:"40px 0",textAlign:"center",lineHeight:2.4}}>
                    Nenhum conceito gerado ainda.<br/>
                    <span style={{fontSize:10,color:"var(--txd)"}}>Clique em "Gerar 5 Conceitos de Imagem"<br/>e use o botão ✨ Abrir no Gemini em cada card.</span>
                  </div>
                )}

                <div style={{maxHeight:640,overflowY:"auto",paddingRight:2}}>
                  {genCreat.map(gc=>(
                    <div key={gc.id} style={{marginBottom:20}}>
                      <div style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--txd)",marginBottom:10,paddingBottom:6,borderBottom:"1px solid var(--bd)",textTransform:"uppercase",letterSpacing:1}}>
                        Gerados às {gc.ts}
                      </div>

                      {gc.items&&gc.items.map((item,idx)=>(
                        <div key={idx} style={{marginBottom:10,background:"rgba(255,255,255,.022)",border:"1px solid var(--bd)",borderRadius:11,overflow:"hidden",transition:"border-color .18s"}}
                          onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(255,200,80,.3)"}
                          onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(255,255,255,.07)"}
                        >
                          {/* Header */}
                          <div style={{padding:"11px 13px 0 13px",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                            <div style={{fontSize:12,fontWeight:800,color:"var(--gold)"}}>{item.nome || `CRIATIVO ${idx+43}`}</div>
                            <div style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--txd)",marginTop:2}}>{idx+1}/5</div>
                          </div>

                          {/* Headline destaque */}
                          <div style={{margin:"8px 13px",background:"rgba(255,200,80,.07)",border:"1px solid rgba(255,200,80,.2)",borderRadius:7,padding:"8px 11px"}}>
                            <div style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--gold)",letterSpacing:1,textTransform:"uppercase",marginBottom:3}}>Headline da imagem</div>
                            <div style={{fontSize:14,fontWeight:800,lineHeight:1.3,color:"var(--tx)"}}>{item.headline}</div>
                            {item.subheadline&&<div style={{fontSize:11,color:"var(--txm)",marginTop:4}}>{item.subheadline}</div>}
                          </div>

                          {/* Ângulo emocional */}
                          <div style={{margin:"0 13px 8px",fontFamily:"var(--mono)",fontSize:10,color:"var(--txd)",fontStyle:"italic"}}>
                            🎯 {item.angulo}
                          </div>

                          {/* Prompt */}
                          <div style={{margin:"0 13px 10px",background:"rgba(0,0,0,.3)",borderRadius:8,padding:"10px 11px"}}>
                            <div style={{fontFamily:"var(--mono)",fontSize:9,color:"rgba(255,200,80,.5)",letterSpacing:1,textTransform:"uppercase",marginBottom:5}}>Prompt Gemini (inglês)</div>
                            <div style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--txm)",lineHeight:1.7}}>{item.prompt_en}</div>
                          </div>

                          {/* Botões */}
                          <div style={{padding:"0 13px 12px",display:"flex",gap:7}}>
                            <button className="btn" style={{flex:1,fontSize:11,padding:"8px 0",justifyContent:"center"}}
                              onClick={()=>{
                                const url = `https://aistudio.google.com/prompts/new_chat?preamble=${encodeURIComponent(item.prompt_en)}`;
                                window.open(url,"_blank");
                              }}>
                              ✨ Abrir no Gemini
                            </button>
                            <button className="btng" style={{fontSize:11,padding:"8px 11px"}}
                              onClick={()=>navigator.clipboard?.writeText(item.prompt_en).then(()=>{})}>
                              📋 Copiar
                            </button>
                            <button className="btng" style={{fontSize:11,padding:"8px 11px"}}
                              onClick={()=>window.open(`https://www.midjourney.com/imagine?prompt=${encodeURIComponent(item.prompt_en+" --ar 4:5 --v 6")}`, "_blank")}>
                              🎨 MJ
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Prompts texto puro (fallback) */}
                      {gc.promptsOnly&&<div className="aiout" style={{marginTop:0}}>{gc.promptsOnly}</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ AUTOPILOT ═══ */}
        {tab==="autopilot"&&(
          <div className="main">
            <div className={autoMode?"apb":"card gb"} style={!autoMode?{background:"rgba(255,200,80,.025)"}:{}}>
              <div className="apo" style={!autoMode?{background:"rgba(255,200,80,.1)",borderColor:"var(--bdg)",animation:"none"}:{}}>{autoMode?"🤖":"⏸"}</div>
              <div>
                <div className="apt" style={!autoMode?{color:"var(--gold)"}:{}}>{autoMode?"Piloto Automático ATIVO":"Piloto Automático Inativo"}</div>
                <div className="aps">{autoMode?"Analisando dados reais · Gerando criativos · Brief a cada 30 min":"Ative para análise contínua dos dados reais"}</div>
              </div>
              <div style={{marginLeft:"auto"}}>
                <button className={autoMode?"btng":"btn"} onClick={toggleAuto}>{autoMode?"⏹ Pausar":"▶ Ativar Piloto"}</button>
              </div>
            </div>

            <div className="c3">
              {[
                {icon:"📊",title:"Análise de Campanhas",desc:`Classifica as ${activeCamps.length} campanhas ativas (escalar/manter/pausar) em tempo real com base nos dados do Facebook.`,on:autoMode},
                {icon:"✨",title:"Geração de Criativos",desc:"Analisa os padrões dos criativos 24/26/31 e gera variações todos os dias automaticamente.",on:autoMode},
                {icon:"🧠",title:"Brief Executivo Diário",desc:"Diagnóstico + 3 ações prioritárias gerados a cada ciclo com base nos dados reais.",on:autoMode},
              ].map(m=>(
                <div key={m.title} className={`card ${m.on?"gnb":""}`}>
                  <div style={{fontSize:21,marginBottom:8}}>{m.icon}</div>
                  <div style={{fontSize:13,fontWeight:700,marginBottom:5,display:"flex",alignItems:"center",gap:7}}>
                    {m.title}{m.on&&<div className="sdot on"/>}
                  </div>
                  <div style={{fontSize:12,color:"var(--txd)",lineHeight:1.6}}>{m.desc}</div>
                </div>
              ))}
            </div>

            <div className="card">
              <div className="ctitle" style={{justifyContent:"space-between"}}>
                <span>📋 Log do Piloto</span>
                <button className="btng" style={{fontSize:11,padding:"4px 10px"}} onClick={()=>setAutoLog([])}>Limpar</button>
              </div>
              {autoLog.length===0
                ?<div style={{color:"var(--txd)",fontSize:13,fontFamily:"var(--mono)",padding:"10px 0"}}>Nenhuma atividade. Ative o piloto para começar.</div>
                :<div className="slog" style={{maxHeight:240}}>{autoLog.map((l,i)=><div key={i} className="ll"><span className="linfo">{l}</span></div>)}</div>
              }
            </div>

            <div className="card">
              <div className="ctitle">⚡ Ações Manuais</div>
              <div className="brow">
                <button className="btn" onClick={runCycle} disabled={aiLoad}>🔄 Rodar Ciclo Agora</button>
                <button className="btnol" onClick={genCreatives} disabled={genLoad}>{genLoad?<><div className="spin"/>...</>:"✨ Gerar Criativos"}</button>
                <button className="btnol" onClick={()=>callAI(
                  `Brief executivo com dados REAIS:\nGasto R$${totSpend.toFixed(2)} | Vendas ${totSales} | CPA R$${avgCpa.toFixed(2)} | CTR ${avgCtr.toFixed(2)}% | ROAS ${roas.toFixed(2)}\nTop: ${winCamp?.name} (CPA R$${winCamp?.cpa?.toFixed(2)})\n\nFormato: Diagnóstico → Ação #1 → Ação #2 → Ação #3 → Criativo para testar → Projeção para R$100k.`,
                  "auto"
                )} disabled={aiLoad}>📋 Brief Executivo</button>
              </div>
              {aiOut&&aiCtx==="auto"&&<div className="aiout" ref={outRef}>{aiOut}{aiLoad&&<span className="cursor"/>}</div>}
            </div>
          </div>
        )}

        {/* ═══ ROTINA ═══ */}
        {tab==="rotina"&&(
          <div className="main">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--txd)"}}>{chkDone}/{chkTotal} tarefas · <span style={{color:"var(--gold)"}}>{Math.round(chkDone/chkTotal*100)}%</span></div>
              <button className="btng" onClick={()=>setChecks({})}>↺ Novo Dia</button>
            </div>
            <div className="pthin"><div className="pfill2" style={{width:`${chkDone/chkTotal*100}%`}}/></div>
            <div className="c3">
              {Object.entries(CHECKLIST).map(([period,items])=>(
                <div className="card" key={period}>
                  <div className="ctitle">{period}</div>
                  {items.map((item,i)=>{
                    const k=`${period}_${i}`;
                    return(
                      <div key={k} className={`chi ${checks[k]?"done":""}`} onClick={()=>setChecks(c=>({...c,[k]:!c[k]}))}>
                        <div className="cbox">{checks[k]&&<svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="#07070f" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>}</div>
                        <div className="ctxt">{item}</div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="card">
              <div className="ctitle">📅 Plano do Dia Seguinte (IA)</div>
              <button className="btn" onClick={()=>callAI(
                `Plano para amanhã com dados reais:\nGasto hoje (média): R$${(totSpend/7).toFixed(2)}/dia | Vendas: ~${salesPerDay.toFixed(1)}/dia | CPA: R$${avgCpa.toFixed(2)} | ROAS: ${roas.toFixed(2)}\nTop: ${winCamp?.name}\n\nOrganize por Manhã/Tarde/Noite. Muito específico: qual campanha escalar, qual pausar, qual criativo subir, qual produto testar.`,
                "rotina"
              )} disabled={aiLoad}>
                {aiLoad&&aiCtx==="rotina"?<><div className="spin"/>Planejando...</>:"🧠 Gerar Plano com Dados Reais"}
              </button>
              {aiOut&&aiCtx==="rotina"&&<div className="aiout" ref={outRef}>{aiOut}{aiLoad&&<span className="cursor"/>}</div>}
            </div>
          </div>
        )}

        {/* ═══ SYNC AUTOMÁTICO ═══ */}
        {tab==="sync"&&(
          <div className="main">
            {/* Token input */}
            <div className="card gb">
              <div className="ctitle">🔑 Token de Acesso Meta</div>
              <div style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--txd)",marginBottom:10,lineHeight:1.7}}>
                Gere um token em <span style={{color:"var(--gold)"}}>developers.facebook.com/tools/explorer</span> com permissões <span style={{color:"var(--gold)"}}>ads_read</span> + <span style={{color:"var(--gold)"}}>read_insights</span>. O token fica salvo apenas nesta sessão.
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <input
                  className="finp"
                  type="password"
                  placeholder="Cole seu token de acesso aqui…"
                  value={fbToken}
                  onChange={e=>{setFbToken(e.target.value);setSyncErr("");setSyncOk("");}}
                  style={{flex:1,fontFamily:"var(--mono)",fontSize:12}}
                />
                <button className="btn" onClick={syncMetaAPI} disabled={syncLoad||!fbToken.trim()} style={{whiteSpace:"nowrap"}}>
                  {syncLoad?<><div className="spin"/>Sincronizando…</>:"⚡ Sincronizar Agora"}
                </button>
              </div>
              {syncErr&&<div className="errbox" style={{marginTop:10}}>{syncErr}</div>}
              {syncOk&&<div className="succbox" style={{marginTop:10}}>{syncOk}</div>}
            </div>

            {/* O que o sync busca */}
            <div className="c3">
              {[
                {icon:"📣",title:"Campanhas + Métricas",desc:"Busca spend, impressões, cliques, CTR e conversões dos últimos 7 dias. Atualiza o Dashboard e Campanhas automaticamente.",done:campaigns.length>0&&usingReal},
                {icon:"🎨",title:"Criativos dos Anúncios",desc:"Carrega o título, texto, imagem e status de cada anúncio ativo ou pausado. Você vê exatamente qual criativo está rodando.",done:adCreatives.length>0},
                {icon:"🧠",title:"Análise com IA",desc:"Após sync, peça uma análise instantânea: qual criativo pausar, qual escalar e o que testar amanhã com dados reais.",done:false},
              ].map(m=>(
                <div key={m.title} className={`card ${m.done?"gnb":""}`}>
                  <div style={{fontSize:21,marginBottom:8}}>{m.icon}</div>
                  <div style={{fontSize:13,fontWeight:700,marginBottom:5,display:"flex",alignItems:"center",gap:7}}>
                    {m.title}{m.done&&<div className="sdot on"/>}
                  </div>
                  <div style={{fontSize:12,color:"var(--txd)",lineHeight:1.6}}>{m.desc}</div>
                </div>
              ))}
            </div>

            {/* Criativos carregados */}
            {adCreatives.length>0&&(
              <div className="card">
                <div className="ctitle">🎨 Criativos Carregados ({adCreatives.length})</div>
                <div style={{display:"grid",gap:9}}>
                  {adCreatives.map(cr=>(
                    <div key={cr.adId} style={{display:"flex",gap:12,alignItems:"flex-start",background:"rgba(255,255,255,.022)",border:"1px solid var(--bd)",borderRadius:9,padding:"11px 13px"}}>
                      {cr.imageUrl&&(
                        <img src={cr.imageUrl} alt="criativo" style={{width:56,height:56,objectFit:"cover",borderRadius:7,flexShrink:0,border:"1px solid var(--bd)"}}/>
                      )}
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:12,fontWeight:700,marginBottom:3,lineHeight:1.3}}>{cr.adName}</div>
                        {cr.title&&cr.title!=="—"&&<div style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--gold)",marginBottom:2}}>{cr.title}</div>}
                        {cr.body&&cr.body!=="—"&&<div style={{fontSize:11,color:"var(--txd)",lineHeight:1.5}}>{cr.body.slice(0,120)}{cr.body.length>120?"…":""}</div>}
                      </div>
                      <div className={`badge ${cr.status==="ACTIVE"?"sc":"pa"}`}>{cr.status==="ACTIVE"?"ATIVO":"PAUSADO"}</div>
                    </div>
                  ))}
                </div>
                <div style={{marginTop:12}}>
                  <button className="btn" onClick={()=>callAI(
                    `Analise estes criativos que estão rodando na conta act_521962199812037:\n${adCreatives.map(c=>`- "${c.adName}" | Status: ${c.status} | Título: "${c.title}" | Texto: "${c.body?.slice(0,80)}"`).join("\n")}\n\nDados de performance das campanhas:\n${[...activeCamps].sort((a,b)=>a.cpa-b.cpa).slice(0,5).map(c=>`- ${c.name}: CPA R$${c.cpa.toFixed(2)}, CTR ${c.ctr}%, ${c.conversions} vendas`).join("\n")}\n\nDiga: quais criativos pausar agora, quais escalar, quais testar variações e por quê.`,
                    "sync_creat"
                  )} disabled={aiLoad}>
                    {aiLoad&&aiCtx==="sync_creat"?<><div className="spin"/>Analisando…</>:"🧠 Analisar Criativos com IA"}
                  </button>
                  {aiOut&&aiCtx==="sync_creat"&&<div className="aiout" ref={outRef}>{aiOut}{aiLoad&&<span className="cursor"/>}</div>}
                </div>
              </div>
            )}

            {/* Guia de como gerar o token */}
            <div className="card">
              <div className="ctitle">📖 Como Gerar o Token</div>
              <div style={{display:"grid",gap:8}}>
                {[
                  ["1","Acesse o Graph API Explorer","developers.facebook.com/tools/explorer"],
                  ["2","Selecione seu App","Escolha o app conectado à conta act_521962199812037"],
                  ["3","Gere o token","Clique em 'Generate Access Token' e autorize"],
                  ["4","Adicione as permissões","ads_read + read_insights (obrigatórias)"],
                  ["5","Cole acima e sincronize","O token expira em ~1h — gere novo quando necessário"],
                ].map(([n,t,d])=>(
                  <div key={n} className="step">
                    <div className="stepn">{n}</div>
                    <div><div style={{fontSize:12,fontWeight:700,marginBottom:2}}>{t}</div><div style={{fontSize:11.5,color:"var(--txd)",lineHeight:1.5}}>{d}</div></div>
                  </div>
                ))}
              </div>
              <div style={{marginTop:12}}>
                <button className="btnol" onClick={()=>window.open("https://developers.facebook.com/tools/explorer/","_blank")}>
                  🌐 Abrir Graph API Explorer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══ IMPORTAR FB ═══ */}
        {tab==="importar"&&(
          <div className="main">
            <div className="card gnb">
              <div className="ctitle">✅ Dados Atuais</div>
              <div style={{display:"grid",gap:8}}>
                <div className="succbox">✓ {REAL_CAMPAIGNS.length} campanhas carregadas — conta act_521962199812037 — período 28/02–06/03/2026</div>
                <div className="succbox">✓ Ticket configurado: R$55 | Total vendas: {totSales} | Gasto total: R${totSpend.toFixed(2)}</div>
              </div>
            </div>

            <div className="card gb">
              <div className="ctitle">🔄 Atualizar com Novos Dados</div>
              <div style={{display:"grid",gap:9,marginBottom:14}}>
                {[
                  ["1","Abra o Graph API Explorer","Cole a URL abaixo no browser ou acesse pelo link"],
                  ["2","Execute a query","Clique em Submit — os dados aparecem no painel direito"],
                  ["3","Copie o JSON","Ctrl+A para selecionar tudo, Ctrl+C para copiar"],
                  ["4","Cole aqui e importe","O sistema atualiza todos os painéis automaticamente"],
                ].map(([n,t,d])=>(
                  <div key={n} className="step">
                    <div className="stepn">{n}</div>
                    <div><div style={{fontSize:12,fontWeight:700,marginBottom:2}}>{t}</div><div style={{fontSize:11.5,color:"var(--txd)",lineHeight:1.5}}>{d}</div></div>
                  </div>
                ))}
              </div>

              <div className="flbl" style={{marginBottom:5}}>URL da sua conta (clique para abrir)</div>
              <div style={{fontFamily:"var(--mono)",fontSize:11,background:"rgba(0,0,0,.35)",border:"1px solid rgba(255,200,80,.15)",borderRadius:8,padding:"10px 13px",color:"var(--gold)",wordBreak:"break-all",lineHeight:1.6,marginBottom:10,cursor:"pointer"}}
                onClick={()=>window.open("https://developers.facebook.com/tools/explorer/?method=GET&path=act_521962199812037%2Finsights%3Ffields%3Dcampaign_name%2Cspend%2Cimpressions%2Cclicks%2Cactions%2Cctr%26date_preset%3Dlast_7d%26level%3Dcampaign","_blank")}>
                https://developers.facebook.com/tools/explorer/?method=GET&path=act_521962199812037/insights?fields=campaign_name,spend,impressions,clicks,actions,ctr&date_preset=last_7d&level=campaign
              </div>

              <div className="brow" style={{marginBottom:14}}>
                <button className="btnol" onClick={()=>window.open("https://developers.facebook.com/tools/explorer/?method=GET&path=act_521962199812037%2Finsights%3Ffields%3Dcampaign_name%2Cspend%2Cimpressions%2Cclicks%2Cactions%2Cctr%26date_preset%3Dlast_7d%26level%3Dcampaign","_blank")}>
                  🌐 Abrir Graph API Explorer
                </button>
              </div>

              <div className="flbl" style={{marginBottom:5}}>Cole o JSON aqui:</div>
              <textarea className="jsontxt" style={{minHeight:130}} placeholder={'{\n  "data": [\n    { "campaign_name": "...", "spend": "...", "actions": [...] }\n  ]\n}'} value={jsonInput} onChange={e=>setJsonInput(e.target.value)}/>

              {importErr&&<div className="errbox" style={{marginTop:10}}>{importErr}</div>}
              {importOk&&<div className="succbox" style={{marginTop:10}}>{importOk}</div>}

              <div className="brow" style={{marginTop:12}}>
                <button className="btn" onClick={importJSON} disabled={!jsonInput.trim()}>📥 Importar e Atualizar</button>
                <button className="btng" onClick={()=>{setJsonInput("");setImportErr("");setImportOk("");}}>Limpar</button>
              </div>
            </div>

            <div className="card">
              <div className="ctitle">📡 Log de Importações</div>
              <div className="slog">
                {syncLog.map((l,i)=>(
                  <div key={i} className="ll">
                    <span className="ts">[{l.ts}]</span>
                    <span className={`l${l.type}`}>{l.msg}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══ IA CONSELHEIRA ═══ */}
        {tab==="ia"&&(
          <div className="main">
            <div className="card">
              <div className="ctitle">💬 Pergunte ao Cérebro</div>
              <div className="airow">
                <input className="aiinput" placeholder="Ex: Por que o CRIATIVO 24 performa melhor? Como escalar sem subir o CPA?" value={customQ} onChange={e=>setCustomQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&customQ&&callAI(customQ,"ia")}/>
                <button className="btn" onClick={()=>callAI(customQ,"ia")} disabled={aiLoad||!customQ}>
                  {aiLoad&&aiCtx==="ia"?<><div className="spin"/>...</>:"Enviar"}
                </button>
              </div>
              {aiOut&&aiCtx==="ia"&&<div className="aiout" ref={outRef}>{aiOut}{aiLoad&&<span className="cursor"/>}</div>}
            </div>

            <div className="c3">
              {[
                {icon:"📊",title:"Análise Completa",desc:"Diagnóstico profundo com dados reais + 3 ações urgentes",
                  fn:()=>callAI(`DADOS REAIS — conta act_521962199812037, últimos 7 dias:\nGasto: R$${totSpend.toFixed(2)} | Vendas: ${totSales} (${salesPerDay.toFixed(1)}/dia) | CPA: R$${avgCpa.toFixed(2)} | CTR: ${avgCtr.toFixed(2)}% | ROAS: ${roas.toFixed(2)}\nTop: ${winCamp?.name} (CPA R$${winCamp?.cpa?.toFixed(2)}, ${winCamp?.conversions} vendas, R$${winCamp?.spend?.toFixed(2)} gasto)\n\nDiagnóstico completo + 3 ações prioritárias + o que está funcionando + o que precisa mudar.`,"ia")},
                {icon:"🎯",title:"Projeção R$100k",desc:"Análise realista: vou bater a meta? O que mudar?",
                  fn:()=>callAI(`Dados reais: ${salesPerDay.toFixed(1)} vendas/dia a R$55 = R$${(salesPerDay*55).toFixed(0)}/dia. Para R$100k em 30 dias preciso de R$3.333/dia = ${(3333/55).toFixed(0)} vendas/dia. CPA atual R$${avgCpa.toFixed(2)}, ROAS ${roas.toFixed(2)}. Dia ${day}/30.\n\nSeja honesto: vou bater? Quantas vendas/dia preciso ter? O que fazer para chegar lá?`,"ia")},
                {icon:"💡",title:"Novo Produto",desc:"Ideias de produtos para complementar Mulher Forte",
                  fn:()=>callAI(`O produto "Mulher Forte" (R$55) está performando com CPA R$${avgCpa.toFixed(2)}. Sugira 5 produtos complementares para criar e vender para a mesma audiência. Para cada: nome, promessa, preço, formato, por que vai vender.`,"ia")},
                {icon:"🔥",title:"Escala Urgente",desc:"Como ir de "+salesPerDay.toFixed(0)+" para "+(salesPerDay*2).toFixed(0)+" vendas/dia",
                  fn:()=>callAI(`Vendas atuais: ${salesPerDay.toFixed(1)}/dia, gasto R$${(totSpend/7).toFixed(2)}/dia, CPA R$${avgCpa.toFixed(2)}. Quero dobrar para ${(salesPerDay*2).toFixed(0)} vendas/dia nos próximos 7 dias. Plano agressivo e específico.`,"ia")},
                {icon:"✂️",title:"O que Pausar Agora",desc:"Análise de quais campanhas estão drenando verba",
                  fn:()=>callAI(`Analise estas campanhas e diga EXATAMENTE quais pausar agora e quanto vou economizar:\n${activeCamps.filter(c=>cSt(c.cpa)==="pa").map(c=>`- ${c.name}: CPA R$${c.cpa.toFixed(2)}, gasto R$${c.spend.toFixed(2)}, ${c.conversions} vendas`).join("\n")||"Nenhuma campanha para pausar no momento."}`,"ia")},
                {icon:"🧪",title:"Testes de Amanhã",desc:"3 experimentos concretos para rodar hoje",
                  fn:()=>callAI(`Com base nos dados reais (CPA R$${avgCpa.toFixed(2)}, CTR ${avgCtr.toFixed(2)}%, ROAS ${roas.toFixed(2)}): defina 3 testes específicos para rodar amanhã. Para cada: hipótese, como executar, orçamento, métrica de sucesso em 48h.`,"ia")},
              ].map(qa=>(
                <div key={qa.title} className="qa" onClick={qa.fn}>
                  <div className="qai">{qa.icon}</div>
                  <div className="qat">{qa.title}</div>
                  <div className="qad">{qa.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
