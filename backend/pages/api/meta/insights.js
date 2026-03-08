export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return res.status(200).end();
  }

  const { token, account_id = "act_521962199812037", date_preset = "last_7d" } = req.query;

  if (!token) {
    return res.status(400).json({ error: "Token não informado." });
  }

  try {
    const url = new URL(`https://graph.facebook.com/v19.0/${account_id}/insights`);
    url.searchParams.set("fields", "campaign_id,campaign_name,spend,impressions,clicks,ctr,actions,action_values,purchase_roas");
    url.searchParams.set("date_preset", date_preset);
    url.searchParams.set("level", "campaign");
    url.searchParams.set("access_token", token);

    const metaRes = await fetch(url.toString());
    const data = await metaRes.json();

    if (data.error) {
      return res.status(400).json({ error: data.error.message });
    }

    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: "Erro ao conectar com Meta API: " + err.message });
  }
}
