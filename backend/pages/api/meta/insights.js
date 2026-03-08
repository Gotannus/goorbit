export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return res.status(200).end();
  }

  const {
    token,
    account_id = "act_521962199812037",
    date_preset = "last_7d",
    time_increment,
    limit = "200",
  } = req.query;

  if (!token) {
    return res.status(400).json({ error: "Token não informado." });
  }

  try {
    // 1) Buscar status das campanhas para filtrar corretamente no frontend
    const campaignsUrl = new URL(`https://graph.facebook.com/v19.0/${account_id}/campaigns`);
    campaignsUrl.searchParams.set("fields", "id,name,effective_status,status");
    campaignsUrl.searchParams.set("limit", "500");
    campaignsUrl.searchParams.set("access_token", token);

    const campRes = await fetch(campaignsUrl.toString());
    const campData = await campRes.json();
    const statusMap = Object.fromEntries(
      (campData.data || []).map((c) => [c.id, c.effective_status || c.status || "UNKNOWN"])
    );

    // 2) Insights de campanhas
    const url = new URL(`https://graph.facebook.com/v19.0/${account_id}/insights`);
    url.searchParams.set(
      "fields",
      "campaign_id,campaign_name,date_start,date_stop,spend,impressions,clicks,ctr,actions,action_values,purchase_roas"
    );
    url.searchParams.set("date_preset", date_preset);
    url.searchParams.set("level", "campaign");
    url.searchParams.set("limit", limit);
    if (time_increment) url.searchParams.set("time_increment", String(time_increment));
    url.searchParams.set("access_token", token);

    const metaRes = await fetch(url.toString());
    const data = await metaRes.json();

    if (data.error) {
      return res.status(400).json({ error: data.error.message });
    }

    const enriched = {
      ...data,
      data: (data.data || []).map((row) => ({
        ...row,
        campaign_effective_status: statusMap[row.campaign_id] || "UNKNOWN",
      })),
    };

    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(200).json(enriched);
  } catch (err) {
    return res.status(500).json({ error: "Erro ao conectar com Meta API: " + err.message });
  }
}
