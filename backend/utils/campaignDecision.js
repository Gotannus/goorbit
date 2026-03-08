const WINDOW_RULES = {
  7: { cpaFactor: 1.0, ctrFactor: 1.0, volumeFactor: 0.85, noConvSpendFactor: 1.6 },
  15: { cpaFactor: 1.05, ctrFactor: 0.97, volumeFactor: 1.0, noConvSpendFactor: 1.8 },
  30: { cpaFactor: 1.12, ctrFactor: 0.95, volumeFactor: 1.1, noConvSpendFactor: 2.0 },
  60: { cpaFactor: 1.18, ctrFactor: 0.92, volumeFactor: 1.2, noConvSpendFactor: 2.2 },
};

const clampMin = (value, min) => Math.max(min, value);

const getWindowBaselines = (campaigns = []) => {
  const active = campaigns.filter(c => c.spend > 0);
  const totalSpend = active.reduce((sum, c) => sum + c.spend, 0);
  const totalConversions = active.reduce((sum, c) => sum + c.conversions, 0);
  const avgCtr = active.length > 0 ? active.reduce((sum, c) => sum + c.ctr, 0) / active.length : 0;
  const avgCpa = totalConversions > 0 ? totalSpend / totalConversions : 0;
  const avgVolume = active.length > 0 ? totalConversions / active.length : 0;

  return Object.entries(WINDOW_RULES).reduce((acc, [window, rules]) => {
    const targetCpa = clampMin(avgCpa * rules.cpaFactor, 10);
    const minCtr = clampMin(avgCtr * rules.ctrFactor, 1.1);
    const minScaleVolume = clampMin(Math.round(avgVolume * rules.volumeFactor), 2);

    acc[window] = {
      window: Number(window),
      targetCpa,
      minCtr,
      minScaleVolume,
      noConversionSpendLimit: clampMin(targetCpa * rules.noConvSpendFactor, 60),
      reviewCpa: targetCpa * 1.25,
      saturationCpa: targetCpa * 1.45,
    };
    return acc;
  }, {});
};

const getCampaignDecision = (campaign, baselinesByWindow) => {
  const baselines = Object.values(baselinesByWindow || {});
  if (!campaign || baselines.length === 0) {
    return { action: "ho", actionLabel: "MANTER", stage: "estabilidade", reason: "Dados insuficientes para decisão." };
  }

  const meetsScaleCount = baselines.filter(
    b => campaign.conversions >= b.minScaleVolume && campaign.cpa > 0 && campaign.cpa <= b.targetCpa && campaign.ctr >= b.minCtr,
  ).length;

  const noConversionPause =
    campaign.conversions === 0 &&
    baselines.some(b => campaign.spend >= b.noConversionSpendLimit);

  const reviewCreative = baselines.some(
    b => campaign.cpa > b.reviewCpa || campaign.ctr < b.minCtr * 0.72,
  );

  const isSaturated = baselines.some(
    b => campaign.cpa > b.saturationCpa && campaign.ctr < b.minCtr,
  );

  const minLearningSpend = baselines[0].targetCpa * 1.1;
  const inLearning = campaign.spend < minLearningSpend || campaign.conversions < 2;

  if (noConversionPause) {
    const limit = Math.min(...baselines.map(b => b.noConversionSpendLimit));
    return {
      action: "pa",
      actionLabel: "PAUSAR",
      stage: "saturação",
      reason: `Gasto sem conversão (R$${campaign.spend.toFixed(2)}) acima do limite da conta (R$${limit.toFixed(2)}).`,
    };
  }

  if (meetsScaleCount >= 3) {
    return {
      action: "sc",
      actionLabel: "ESCALAR",
      stage: "estabilidade",
      reason: `Consistência validada em ${meetsScaleCount}/4 janelas: CPA, CTR e volume mínimos atendidos.`,
    };
  }

  if (isSaturated || reviewCreative) {
    return {
      action: "rv",
      actionLabel: "REVISAR CRIATIVO",
      stage: "saturação",
      reason: "Sinais de saturação: piora de CPA e/ou CTR abaixo do esperado nas janelas de baseline.",
    };
  }

  if (inLearning) {
    return {
      action: "ho",
      actionLabel: "MANTER",
      stage: "aprendizado",
      reason: "Ainda em aprendizado: baixo spend/conversões para decisão agressiva.",
    };
  }

  return {
    action: "ho",
    actionLabel: "MANTER",
    stage: "estabilidade",
    reason: "Campanha estável versus baseline da conta; manter monitoramento.",
  };
};

export { getWindowBaselines, getCampaignDecision };

