// pages/api/ai/chat.js
// Proxy para Google Gemini API

const DEFAULT_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-1.5-flash",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
];

function parseRetrySeconds(message = "", retryAfterHeader = "") {
  const header = Number(retryAfterHeader);
  if (!Number.isNaN(header) && header > 0) return Math.ceil(header);

  const match = String(message).match(/retry in\s+([\d.]+)s/i);
  if (!match) return null;

  const sec = Number(match[1]);
  return Number.isNaN(sec) ? null : Math.ceil(sec);
}

function isQuotaError(statusCode, err = {}) {
  const msg = `${err.message || ""} ${err.status || ""}`.toLowerCase();
  return statusCode === 429 || msg.includes("quota exceeded") || msg.includes("resource_exhausted");
}

function isModelUnavailableError(statusCode, err = {}) {
  const msg = `${err.message || ""} ${err.status || ""}`.toLowerCase();
  return statusCode === 404 || msg.includes("model") || msg.includes("not found") || msg.includes("not supported");
}

function quotaMessage(retrySeconds) {
  const waitText = retrySeconds ? ` Tente novamente em ~${retrySeconds}s.` : "";
  return (
    "Sua chave do Gemini está sem cota disponível no momento. " +
    "No Google AI Studio, use uma API key de um projeto com faturamento habilitado " +
    "ou troque para um modelo com quota disponível no seu tier." +
    waitText
  );
}

function normalizeModelList(requestedModel, requestedModels) {
  const explicit = [];

  if (typeof requestedModel === "string" && requestedModel.trim()) {
    explicit.push(requestedModel.trim());
  }

  if (Array.isArray(requestedModels)) {
    for (const model of requestedModels) {
      if (typeof model === "string" && model.trim()) {
        explicit.push(model.trim());
      }
    }
  }

  const merged = [...explicit, ...DEFAULT_MODELS];
  return [...new Set(merged)];
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const { apiKey, prompt, system, model, models } = req.body ?? {};
  const key = apiKey || process.env.GEMINI_API_KEY;

  if (!key) return res.status(400).json({ error: "API Key do Gemini não informada." });
  if (!prompt?.trim()) return res.status(400).json({ error: "Prompt vazio." });

  try {
    const fullPrompt = system ? `${system}\n\n${prompt}` : prompt;
    const modelCandidates = normalizeModelList(model, models);

    let lastError = "";
    for (const modelName of modelCandidates) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${key}`;
      const geminiRes = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }],
          generationConfig: { maxOutputTokens: 1500, temperature: 0.7 },
        }),
      });

      const data = await geminiRes.json();
      if (!geminiRes.ok || data?.error) {
        const err = data?.error || {};
        lastError = err.message || `Falha no modelo ${modelName}`;

        if (isQuotaError(geminiRes.status, err)) {
          const retryIn = parseRetrySeconds(lastError, geminiRes.headers.get("retry-after"));
          return res.status(429).json({
            error: quotaMessage(retryIn),
            reason: "quota_exceeded",
            retryAfterSeconds: retryIn,
            model: modelName,
            raw: lastError,
          });
        }

        if (isModelUnavailableError(geminiRes.status, err)) {
          continue;
        }

        continue;
      }

      const parts = data.candidates?.[0]?.content?.parts ?? [];
      const text = parts
        .map((part) => part.text || part.inlineData?.data || "")
        .join("\n")
        .trim();

      if (!text) {
        return res.status(502).json({ error: "Gemini respondeu sem conteúdo de texto." });
      }

      return res.status(200).json({ text, model: modelName });
    }

    return res.status(400).json({
      error: lastError || "Não foi possível gerar conteúdo no Gemini.",
      triedModels: modelCandidates,
    });
  } catch (err) {
    return res.status(500).json({ error: "Erro ao conectar com Gemini: " + err.message });
  }
}
