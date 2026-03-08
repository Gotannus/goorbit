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
    days,
    level = "campaign",
  } = req.query;

  if (!token) {
    return res.status(400).json({ error: "Token não informado." });
  }

  const allowedLevels = ["account", "campaign", "adset", "ad"];
  if (!allowedLevels.includes(level)) {
    return res.status(400).json({ error: "Nível inválido. Use account, campaign, adset ou ad." });
  }

  const parsedDays = Number.parseInt(days, 10);
  const hasCustomWindow = Number.isFinite(parsedDays) && parsedDays > 0;

  try {
    const url = new URL(`https://graph.facebook.com/v19.0/${account_id}/insights`);

    const fieldsByLevel = {
      account: "account_id,account_name,spend,impressions,clicks,ctr,cpc,cpm,frequency,actions,action_values",
      campaign: "campaign_id,campaign_name,spend,impressions,clicks,ctr,cpc,cpm,frequency,actions,action_values",
      adset: "campaign_id,campaign_name,adset_id,adset_name,spend,impressions,clicks,ctr,cpc,cpm,frequency,actions,action_values",
      ad: "campaign_id,campaign_name,adset_id,adset_name,ad_id,ad_name,spend,impressions,clicks,ctr,cpc,cpm,frequency,actions,action_values",
    };

    url.searchParams.set("fields", fieldsByLevel[level]);
    url.searchParams.set("level", level);

    if (hasCustomWindow) {
      const until = new Date();
      const since = new Date();
      since.setDate(until.getDate() - (parsedDays - 1));
      const toISODate = (date) => date.toISOString().slice(0, 10);
      url.searchParams.set("time_range", JSON.stringify({ since: toISODate(since), until: toISODate(until) }));
    } else {
      url.searchParams.set("date_preset", date_preset);
    }

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
