// pages/api/meta/longtoken.js
// Troca o token de curta duração (~1h) por um de longa duração (~60 dias)
// Requer: App ID e App Secret do seu App no Facebook Developers

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const { token, app_id, app_secret } = req.query;

  if (!token || !app_id || !app_secret) {
    return res.status(400).json({ error: "Parâmetros obrigatórios: token, app_id, app_secret" });
  }

  try {
    const url = new URL("https://graph.facebook.com/v19.0/oauth/access_token");
    url.searchParams.set("grant_type", "fb_exchange_token");
    url.searchParams.set("client_id", app_id);
    url.searchParams.set("client_secret", app_secret);
    url.searchParams.set("fb_exchange_token", token);

    const metaRes = await fetch(url.toString());
    const data = await metaRes.json();

    if (data.error) return res.status(400).json({ error: data.error.message });

    // Retorna o token longo + validade
    return res.status(200).json({
      long_lived_token: data.access_token,
      expires_in_days: Math.round((data.expires_in || 5184000) / 86400),
      token_type: data.token_type,
    });
  } catch (err) {
    return res.status(500).json({ error: "Erro ao trocar token: " + err.message });
  }
}
