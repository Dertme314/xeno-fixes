// api/chat.js

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const fullConversation = req.body.messages;

  if (!Array.isArray(fullConversation)) {
    return res.status(400).json({ error: "Invalid message format." });
  }

  const openRouterKey = process.env.OPENROUTER_API_KEY; // Rename this in your .env
  const geminiKey = process.env.GEMINI_API_KEY;       // Add this to your .env

  if (!openRouterKey || !geminiKey) {
    return res.status(500).json({
      error: "API keys missing.",
      details: "Ensure both OPENROUTER_API_KEY and GEMINI_API_KEY are set."
    });
  }

  // --- ATTEMPT 1: Primary (DeepSeek via OpenRouter) ---
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openRouterKey}`,
        "Content-Type": "application/json",
        "Referer": "https://xeno.onl",
        "X-Title": "Xeno Help RAG"
      },
      body: JSON.stringify({
        model: "tngtech/deepseek-r1t2-chimera:free",
        messages: fullConversation,
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter Error: ${response.statusText}`);
    }

    const data = await response.json();
    return res.status(200).json({ choices: data.choices });

  } catch (primaryError) {
    console.warn("Primary Model Failed. Switching to Backup...", primaryError.message);

    // --- ATTEMPT 2: Backup (Gemini via Google) ---
    try {
      // We use Google's OpenAI-Compatibility endpoint so we don't need to change the message format
      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${geminiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gemini-2.0-flash-exp", 
          messages: fullConversation,
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Backup Model Also Failed:", data);
        return res.status(response.status).json({ error: "All AI services failed." });
      }

      return res.status(200).json({ choices: data.choices });

    } catch (backupError) {
      console.error("Critical Failure:", backupError);
      return res.status(500).json({ error: "Service unavailable." });
    }
  }
}
