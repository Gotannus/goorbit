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
      "id,name,status,creative{id,name,title,body,link_url,call_to_action_type,object_story_spec,asset_feed_spec,thumbnail_url,image_url,video_id}"
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
      creativeName: ad.creative?.name || "",
      title: ad.creative?.title || ad.creative?.object_story_spec?.link_data?.message || "—",
      body: ad.creative?.body || ad.creative?.object_story_spec?.link_data?.description || "—",
      link_url: ad.creative?.link_url || ad.creative?.object_story_spec?.link_data?.link || "",
      call_to_action_type: ad.creative?.call_to_action_type || ad.creative?.object_story_spec?.link_data?.call_to_action?.type || "",
      object_story_spec: ad.creative?.object_story_spec || null,
      asset_feed_spec: ad.creative?.asset_feed_spec || null,
      thumbnail_url: ad.creative?.thumbnail_url || null,
      image_url: ad.creative?.image_url || null,
      video_id: ad.creative?.video_id || ad.creative?.object_story_spec?.video_data?.video_id || null,
      imageUrl: ad.creative?.image_url || ad.creative?.thumbnail_url || null,
    }));

    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(200).json({ data: creatives });
  } catch (err) {
    return res.status(500).json({ error: "Erro ao conectar com Meta API: " + err.message });
  }
}
