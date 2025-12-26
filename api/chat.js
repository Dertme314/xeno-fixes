export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { messages, modelId } = req.body;
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "API key missing." });
  }

  // Define Models
  const MODEL_MAP = {
    "gemini": "google/gemini-2.0-flash-exp:free",      // Primary Fast + Vision
    "chimera": "tngtech/deepseek-r1t2-chimera:free",   // Thinking
  };

  // Helper function to call OpenRouter
  async function callAI(modelTarget) {
    console.log(`Attempting to call model: ${modelTarget}`);
    
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Referer": "https://xeno.onl",
        "X-Title": "Xeno Help RAG"
      },
      body: JSON.stringify({
        model: modelTarget,
        messages: messages,
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    const data = await response.json();
    return { status: response.status, data: data };
  }

  try {
    // 1. Try the selected model first
    let selectedModel = MODEL_MAP[modelId] || MODEL_MAP["gemini"];
    let result = await callAI(selectedModel);

    // If we get an error, we simply fail (no backup/retry logic)
    if (result.status !== 200) {
      console.error("Final AI Error:", result.data);
      // Send the actual error back to frontend so you can see it in console
      return res.status(result.status).json({ 
        error: result.data.error || "AI Busy/Rate Limited" 
      });
    }

    return res.status(200).json({ choices: result.data.choices });

  } catch (err) {
    console.error("Server Request Failed:", err);
    return res.status(500).json({
      error: "Internal Server Error",
      details: err.message
    });
  }
}
