export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return res.status(200).end();
  }

  const { token, account_id = "act_521962199812037" } = req.query;

  if (!token) {
    return res.status(400).json({ error: "Token não informado." });
  }

  try {
    const url = new URL(`https://graph.facebook.com/v19.0/${account_id}/ads`);
    url.searchParams.set(
      "fields",
      "id,name,status,creative{id,name,title,body,image_url,thumbnail_url,object_story_spec}"
    );
    url.searchParams.set("effective_status", '["ACTIVE","PAUSED"]');
    url.searchParams.set("limit", "50");
    url.searchParams.set("access_token", token);

    const metaRes = await fetch(url.toString());
    const data = await metaRes.json();

    if (data.error) {
      return res.status(400).json({ error: data.error.message });
    }

    const creatives = (data.data || []).map((ad) => ({
      adId: ad.id,
      adName: ad.name,
      status: ad.status,
      creativeId: ad.creative?.id,
      title: ad.creative?.title || ad.creative?.object_story_spec?.link_data?.message || "—",
      body: ad.creative?.body || ad.creative?.object_story_spec?.link_data?.description || "—",
      imageUrl: ad.creative?.image_url || ad.creative?.thumbnail_url || null,
    }));

    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(200).json({ data: creatives });
  } catch (err) {
    return res.status(500).json({ error: "Erro ao conectar com Meta API: " + err.message });
  }
}
