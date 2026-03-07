// pages/api/ai/chat.js
// Proxy para Google Gemini API

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const { apiKey, prompt, system } = req.body;

  if (!apiKey) return res.status(400).json({ error: "API Key do Gemini não informada." });

  try {
    const fullPrompt = system ? `${system}\n\n${prompt}` : prompt;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const geminiRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: { maxOutputTokens: 1500, temperature: 0.7 },
      }),
    });

    const data = await geminiRes.json();
    if (data.error) return res.status(400).json({ error: data.error.message });

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sem resposta.";
    return res.status(200).json({ text });
  } catch (err) {
    return res.status(500).json({ error: "Erro ao conectar com Gemini: " + err.message });
  }
}
