// api/chat.js
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;
  const apiKey = process.env.API_KEY; // This grabs the key from Vercel Settings

  if (!apiKey) {
    return res.status(500).json({ error: 'API_KEY is missing in Vercel settings' });
  }

  try {
    // We inject the System Prompt here on the server side
    const systemMessage = {
      role: "system",
      content: "You are a helpful support assistant for Xeno, a Roblox script executor. Keep answers concise. If users have technical errors (like injection failing, crashes), suggest standard fixes like disabling antivirus, installing VC++ redistributables, or clearing %localappdata%/xeno."
    };

    const fullConversation = [systemMessage, ...messages];

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://xeno.onl", 
        "X-Title": "Xeno Help"
      },
      body: JSON.stringify({
        model: "tngtech/deepseek-r1t2-chimera:free", // Or any model you prefer
        messages: fullConversation
      })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error?.message || 'Error from OpenRouter');
    }

    // Send the AI's reply back to your frontend
    return res.status(200).json(data);

  } catch (error) {
    console.error("AI Error:", error);
    return res.status(500).json({ error: 'Failed to fetch AI response' });
  }
}
