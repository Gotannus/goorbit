// pages/api/ai/chat.js
// Proxy para Google Gemini API e Anthropic Claude API

const DEFAULT_GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-1.5-flash",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
];

const DEFAULT_CLAUDE_MODELS = [
  "claude-3-7-sonnet-latest",
  "claude-3-5-sonnet-latest",
  "claude-3-5-haiku-latest",
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
  const msg = `${err.message || ""} ${err.status || ""} ${err.type || ""}`.toLowerCase();
  return statusCode === 429 || msg.includes("quota exceeded") || msg.includes("resource_exhausted") || msg.includes("rate_limit");
}

function isModelUnavailableError(statusCode, err = {}) {
  const msg = `${err.message || ""} ${err.status || ""}`.toLowerCase();
  return statusCode === 404 || msg.includes("model") || msg.includes("not found") || msg.includes("not supported");
}

function quotaMessage(provider, retrySeconds) {
  const waitText = retrySeconds ? ` Tente novamente em ~${retrySeconds}s.` : "";
  if (provider === "claude") {
    return "Sua chave do Claude está sem cota disponível no momento ou bateu limite de taxa." + waitText;
  }

  return (
    "Sua chave do Gemini está sem cota disponível no momento. " +
    "No Google AI Studio, use uma API key de um projeto com faturamento habilitado " +
    "ou troque para um modelo com quota disponível no seu tier." +
    waitText
  );
}

function normalizeModelList(requestedModel, requestedModels, defaults) {
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

  const merged = [...explicit, ...defaults];
  return [...new Set(merged)];
}

async function callGemini({ key, fullPrompt, modelCandidates }) {
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
        return {
          ok: false,
          status: 429,
          body: {
            error: quotaMessage("gemini", retryIn),
            reason: "quota_exceeded",
            retryAfterSeconds: retryIn,
            provider: "gemini",
            model: modelName,
            raw: lastError,
          },
        };
      }

      if (isModelUnavailableError(geminiRes.status, err)) continue;
      continue;
    }

    const parts = data.candidates?.[0]?.content?.parts ?? [];
    const text = parts
      .map((part) => part.text || part.inlineData?.data || "")
      .join("\n")
      .trim();

    if (!text) {
      return { ok: false, status: 502, body: { error: "Gemini respondeu sem conteúdo de texto." } };
    }

    return { ok: true, body: { text, provider: "gemini", model: modelName } };
  }

  return {
    ok: false,
    status: 400,
    body: {
      error: lastError || "Não foi possível gerar conteúdo no Gemini.",
      provider: "gemini",
      triedModels: modelCandidates,
    },
  };
}

async function callClaude({ key, fullPrompt, system, modelCandidates }) {
  let lastError = "";

  for (const modelName of modelCandidates) {
    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: modelName,
        system: system || undefined,
        max_tokens: 1500,
        temperature: 0.7,
        messages: [{ role: "user", content: fullPrompt }],
      }),
    });

    const data = await claudeRes.json();
    if (!claudeRes.ok || data?.error) {
      const err = data?.error || {};
      const errStatus = err?.type || err?.status || "";
      lastError = [err.message || data?.message || `Falha no modelo ${modelName}`, errStatus && `(type/status: ${errStatus})`].filter(Boolean).join(" ");

      if (isQuotaError(claudeRes.status, err)) {
        const retryIn = parseRetrySeconds(lastError, claudeRes.headers.get("retry-after"));
        return {
          ok: false,
          status: 429,
          body: {
            error: quotaMessage("claude", retryIn),
            reason: "quota_exceeded",
            retryAfterSeconds: retryIn,
            provider: "claude",
            model: modelName,
            raw: lastError,
          },
        };
      }

      if (isModelUnavailableError(claudeRes.status, err)) continue;
      continue;
    }

    const text = (data?.content || [])
      .map((part) => (part?.type === "text" ? part.text : ""))
      .join("\n")
      .trim();

    if (!text) {
      return { ok: false, status: 502, body: { error: "Claude respondeu sem conteúdo de texto." } };
    }

    return { ok: true, body: { text, provider: "claude", model: modelName } };
  }

  return {
    ok: false,
    status: 400,
    body: {
      error: lastError || "Não foi possível gerar conteúdo no Claude.",
      hint: "Verifique se o modelo selecionado está disponível na sua conta Anthropic e se a chave pertence ao workspace correto.",
      provider: "claude",
      triedModels: modelCandidates,
    },
  };
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const { provider = "gemini", apiKey, prompt, system, model, models } = req.body ?? {};
  const selectedProvider = provider === "claude" ? "claude" : "gemini";
  const key =
    apiKey ||
    (selectedProvider === "claude" ? process.env.CLAUDE_API_KEY : process.env.GEMINI_API_KEY);

  if (!key) {
    return res
      .status(400)
      .json({ error: `API Key do ${selectedProvider === "claude" ? "Claude" : "Gemini"} não informada.` });
  }
  if (!prompt?.trim()) return res.status(400).json({ error: "Prompt vazio." });

  try {
    const fullPrompt = selectedProvider === "claude" ? prompt : system ? `${system}\n\n${prompt}` : prompt;

    const modelCandidates = normalizeModelList(
      model,
      models,
      selectedProvider === "claude" ? DEFAULT_CLAUDE_MODELS : DEFAULT_GEMINI_MODELS
    );

    const response =
      selectedProvider === "claude"
        ? await callClaude({ key, fullPrompt, system, modelCandidates })
        : await callGemini({ key, fullPrompt, modelCandidates });

    if (response.ok) return res.status(200).json(response.body);
    return res.status(response.status || 400).json(response.body);
  } catch (err) {
    return res.status(500).json({ error: `Erro ao conectar com ${selectedProvider}: ` + err.message });
  }
}
