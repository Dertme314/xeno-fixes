// api/chat.js

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const fullConversation = req.body.messages;

  if (!Array.isArray(fullConversation)) {
    return res.status(400).json({ error: "Invalid message format." });
  }

  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "API key missing.",
      details: "Add API_KEY in Vercel > Environment Variables."
    });
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Referer": "https://xeno.onl",
        "X-Title": "Xeno Help RAG"
      },
      body: JSON.stringify({
        model: "tngtech/deepseek-r1t2-chimera:free",
        messages: fullConversation,
        temperature: 0.7,
        max_tokens: 500
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenRouter Error:", data);
      return res.status(response.status).json({
        error: data.error || "External API Error"
      });
    }

    // Only return what the frontend actually needs
    return res.status(200).json({
      choices: data.choices
    });

  } catch (err) {
    console.error("AI Request Failed:", err);
    return res.status(500).json({
      error: "Failed to reach AI server.",
      details: err.message
    });
  }
}
