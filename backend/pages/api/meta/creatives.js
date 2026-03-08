function getPurchases(actions = []) {
  const keys = [
    "offsite_conversion.fb_pixel_purchase",
    "purchase",
    "omni_purchase",
    "web_in_store_purchase",
  ];
  for (const key of keys) {
    const found = actions.find((a) => a.action_type === key);
    if (found) return Number(found.value || 0);
  }
  return 0;
}

function extractImageUrl(creative = {}) {
  return (
    creative.image_url ||
    creative.thumbnail_url ||
    creative.object_story_spec?.link_data?.picture ||
    creative.object_story_spec?.video_data?.image_url ||
    creative.asset_feed_spec?.images?.[0]?.url ||
    null
  );
}

function extractTitle(creative = {}) {
  return (
    creative.title ||
    creative.object_story_spec?.link_data?.name ||
    creative.object_story_spec?.video_data?.title ||
    creative.name ||
    "—"
  );
}

function extractBody(creative = {}) {
  return (
    creative.body ||
    creative.object_story_spec?.link_data?.message ||
    creative.object_story_spec?.video_data?.message ||
    creative.object_story_spec?.link_data?.description ||
    "—"
  );
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return res.status(200).end();
  }

  const { token, account_id = "act_521962199812037", date_preset = "last_7d", limit = "80" } = req.query;

  if (!token) {
    return res.status(400).json({ error: "Token não informado." });
  }

  try {
    const url = new URL(`https://graph.facebook.com/v19.0/${account_id}/ads`);
    url.searchParams.set(
      "fields",
      [
        "id",
        "name",
        "status",
        "creative{id,name,title,body,image_url,thumbnail_url,object_story_spec,asset_feed_spec}",
        `insights.date_preset(${date_preset}){spend,impressions,clicks,ctr,actions}`,
      ].join(",")
    );
    url.searchParams.set("effective_status", '["ACTIVE","PAUSED"]');
    url.searchParams.set("limit", limit);
    url.searchParams.set("access_token", token);

    const metaRes = await fetch(url.toString());
    const data = await metaRes.json();

    if (data.error) {
      return res.status(400).json({ error: data.error.message });
    }

    const creatives = (data.data || []).map((ad) => {
      const insight = ad.insights?.data?.[0] || {};
      const spend = Number(insight.spend || 0);
      const clicks = Number(insight.clicks || 0);
      const impressions = Number(insight.impressions || 0);
      const ctr = Number(insight.ctr || 0);
      const conversions = getPurchases(insight.actions || []);
      const cpa = conversions > 0 ? spend / conversions : 999;

      return {
        adId: ad.id,
        adName: ad.name,
        status: ad.status,
        creativeId: ad.creative?.id,
        title: extractTitle(ad.creative),
        body: extractBody(ad.creative),
        imageUrl: extractImageUrl(ad.creative),
        spend,
        clicks,
        impressions,
        ctr,
        conversions,
        cpa,
      };
    });

    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(200).json({ data: creatives });
  } catch (err) {
    return res.status(500).json({ error: "Erro ao conectar com Meta API: " + err.message });
  }
}
