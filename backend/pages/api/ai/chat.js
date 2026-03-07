// pages/api/ai/chat.js
// Proxy para Google Gemini API

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

function quotaMessage(retrySeconds) {
  const waitText = retrySeconds ? ` Tente novamente em ~${retrySeconds}s.` : "";
  return (
    "Sua chave do Gemini está sem cota disponível no momento (free tier). " +
    "No Google AI Studio, use uma API key de um projeto com faturamento habilitado " +
    "ou gere uma nova chave com quota ativa." +
    waitText
  );
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const { apiKey, prompt, system } = req.body ?? {};
  const key = apiKey || process.env.GEMINI_API_KEY;

  if (!key) return res.status(400).json({ error: "API Key do Gemini não informada." });
  if (!prompt?.trim()) return res.status(400).json({ error: "Prompt vazio." });

  try {
    const fullPrompt = system ? `${system}

${prompt}` : prompt;
    const models = ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-1.5-flash"];

    let lastError = "";
    for (const model of models) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
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
        lastError = err.message || `Falha no modelo ${model}`;

        if (isQuotaError(geminiRes.status, err)) {
          const retryIn = parseRetrySeconds(lastError, geminiRes.headers.get("retry-after"));
          return res.status(429).json({
            error: quotaMessage(retryIn),
            reason: "quota_exceeded",
            retryAfterSeconds: retryIn,
            raw: lastError,
          });
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

      return res.status(200).json({ text, model });
    }

    return res.status(400).json({ error: lastError || "Não foi possível gerar conteúdo no Gemini." });
  } catch (err) {
    return res.status(500).json({ error: "Erro ao conectar com Gemini: " + err.message });
  }
}
