export default function Home() {
  return (
    <div style={{ fontFamily: "monospace", padding: 40, background: "#07070f", color: "#ffcb50", minHeight: "100vh" }}>
      <h1>🚀 Go Orbit — API</h1>
      <p style={{ color: "#aaa", marginTop: 12 }}>Backend rodando. Endpoints disponíveis:</p>
      <ul style={{ marginTop: 16, lineHeight: 2.2, color: "#f0ede6" }}>
        <li><code>/api/meta/insights?token=SEU_TOKEN</code> — Métricas de campanhas</li>
        <li><code>/api/meta/creatives?token=SEU_TOKEN</code> — Criativos dos anúncios</li>
      </ul>
      <p style={{ marginTop: 24, color: "#555", fontSize: 12 }}>
        Conta: act_521962199812037 · by Gotannus
      </p>
    </div>
  );
}
