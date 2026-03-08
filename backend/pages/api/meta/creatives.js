const WINDOWS = [1, 7, 15, 30, 60];
const MIN_CONVERSIONS = 2;

const getPurchases = (actions = []) => {
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
};

const extractCreativeTag = (text = "") => {
  const match = String(text).match(/CRIATIVO\s*(\d+)/i);
  return match ? match[1] : "S/TAG";
};

const buildWindowMetrics = (dailyRows, days) => {
  const slice = dailyRows.slice(-days);
  const spend = slice.reduce((sum, row) => sum + Number(row.spend || 0), 0);
  const clicks = slice.reduce((sum, row) => sum + Number(row.clicks || 0), 0);
  const impressions = slice.reduce((sum, row) => sum + Number(row.impressions || 0), 0);
  const conversions = slice.reduce((sum, row) => sum + Number(row.conversions || 0), 0);
  const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
  const cpa = conversions > 0 ? spend / conversions : 999;
  return { days, spend, clicks, impressions, conversions, ctr, cpa };
};

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
    const baseAds = new URL(`https://graph.facebook.com/v19.0/${account_id}/ads`);
    baseAds.searchParams.set(
      "fields",
      "id,name,status,creative{id,name,title,body,image_url,thumbnail_url,object_story_spec}"
    );
    baseAds.searchParams.set("effective_status", '["ACTIVE","PAUSED"]');
    baseAds.searchParams.set("limit", "200");
    baseAds.searchParams.set("access_token", token);

    const adsRes = await fetch(baseAds.toString());
    const adsPayload = await adsRes.json();
    if (adsPayload.error) {
      return res.status(400).json({ error: adsPayload.error.message });
    }

    const insightsUrl = new URL(`https://graph.facebook.com/v19.0/${account_id}/insights`);
    insightsUrl.searchParams.set(
      "fields",
      "ad_id,ad_name,date_start,spend,impressions,clicks,ctr,actions"
    );
    insightsUrl.searchParams.set("date_preset", "last_60d");
    insightsUrl.searchParams.set("time_increment", "1");
    insightsUrl.searchParams.set("level", "ad");
    insightsUrl.searchParams.set("limit", "5000");
    insightsUrl.searchParams.set("access_token", token);

    const insRes = await fetch(insightsUrl.toString());
    const insightsPayload = await insRes.json();
    if (insightsPayload.error) {
      return res.status(400).json({ error: insightsPayload.error.message });
    }

    const insightsByAd = (insightsPayload.data || []).reduce((acc, row) => {
      const adId = row.ad_id;
      if (!adId) return acc;
      if (!acc[adId]) acc[adId] = [];
      acc[adId].push({
        date: row.date_start,
        spend: Number(row.spend || 0),
        clicks: Number(row.clicks || 0),
        impressions: Number(row.impressions || 0),
        conversions: getPurchases(row.actions || []),
      });
      return acc;
    }, {});

    for (const adId of Object.keys(insightsByAd)) {
      insightsByAd[adId].sort((a, b) => a.date.localeCompare(b.date));
    }

    const creatives = (adsPayload.data || []).map((ad) => {
      const daily = insightsByAd[ad.id] || [];
      const metricsByWindow = WINDOWS.reduce((acc, days) => {
        acc[days] = buildWindowMetrics(daily, days);
        return acc;
      }, {});

      const m7 = metricsByWindow[7];
      const m1 = metricsByWindow[1];
      const status = ad.status || "PAUSED";
      const volumeEligible = m7.conversions >= MIN_CONVERSIONS;

      const efficiencyScore = volumeEligible
        ? 1000 - m7.cpa * 30 + m7.ctr * 12 + m7.conversions * 6
        : -9999;

      let trend = "estável";
      if (m1.conversions > 0 && m7.conversions > 0) {
        if (m1.cpa < m7.cpa * 0.9) trend = "subindo";
        if (m1.cpa > m7.cpa * 1.1) trend = "caindo";
      }

      return {
        adId: ad.id,
        adName: ad.name,
        status,
        creativeId: ad.creative?.id,
        creativeTag: extractCreativeTag(ad.name || ad.creative?.name || ad.creative?.title || ""),
        title: ad.creative?.title || ad.creative?.object_story_spec?.link_data?.message || "—",
        body: ad.creative?.body || ad.creative?.object_story_spec?.link_data?.description || "—",
        imageUrl: ad.creative?.image_url || ad.creative?.thumbnail_url || null,
        metrics: metricsByWindow,
        trend,
        volumeEligible,
        efficiencyScore,
      };
    });

    const ranking = [...creatives]
      .filter((item) => item.volumeEligible)
      .sort((a, b) => {
        const byCpa = a.metrics[7].cpa - b.metrics[7].cpa;
        if (byCpa !== 0) return byCpa;
        const byCtr = b.metrics[7].ctr - a.metrics[7].ctr;
        if (byCtr !== 0) return byCtr;
        return b.metrics[7].conversions - a.metrics[7].conversions;
      })
      .map((item, index) => ({
        adId: item.adId,
        adName: item.adName,
        creativeTag: item.creativeTag,
        rank: index + 1,
        cpa7: item.metrics[7].cpa,
        ctr7: item.metrics[7].ctr,
        conversions7: item.metrics[7].conversions,
      }));

    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(200).json({ data: creatives, ranking, minVolume: MIN_CONVERSIONS });
  } catch (err) {
    return res.status(500).json({ error: "Erro ao conectar com Meta API: " + err.message });
  }
}
