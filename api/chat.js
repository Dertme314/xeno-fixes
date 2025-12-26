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
    "gemini": "google/gemini-2.0-flash-exp:free",           // 1. Primary (Fastest, Google)
    "backup_1": "google/gemini-pro-1.5-exp:free",            // 2. Backup (Stable, Google)
    "backup_2": "meta-llama/llama-3.2-11b-vision-instruct:free", // 3. Hail Mary (Meta - Different provider)
    "chimera": "tngtech/deepseek-r1t2-chimera:free",         // Thinking Model
  };

  // Helper for small delays (helps clear rate limits)
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

    // ============================================================
    // ROBUST RETRY LOGIC (3 LAYERS)
    // ============================================================
    
    // If Primary fails AND we are in "Gemini/Fast" mode (not explicitly using Chimera)
    if (result.status !== 200 && modelId !== 'chimera') {
      
      // LAYER 2: Try Google Backup
      console.warn(`Primary (${selectedModel}) failed (${result.status}). Waiting 1s then trying Backup 1...`);
      await sleep(1000); // Wait for rate limit cooldown
      
      result = await callAI(MODEL_MAP["backup_1"]);

      // LAYER 3: Try Meta Backup (Different Provider)
      if (result.status !== 200) {
        console.warn(`Backup 1 failed (${result.status}). Waiting 1s then trying Backup 2 (Llama)...`);
        await sleep(1000);
        
        result = await callAI(MODEL_MAP["backup_2"]);
      }
    }

    // ============================================================

    // If it STILL fails after 3 tries, return the error
    if (result.status !== 200) {
      console.error("Final AI Error after retries:", result.data);
      return res.status(result.status).json({ 
        error: result.data.error || "All free models are currently busy. Please try again in a moment." 
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
