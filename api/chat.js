// api/chat.js
import fetch from 'node-fetch'; 

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // The 'messages' array now contains the System Prompt (with the fixes) 
  const fullConversation = req.body.messages; 
  
  // Securely retrieves the secret key
  const apiKey = process.env.API_KEY; 

  if (!apiKey) {
    return res.status(500).json({ 
        error: 'Configuration Error: API_KEY environment variable is not set on the server.',
        details: 'Check Vercel Settings -> Environment Variables and ensure it is scoped.'
    });
  }

  if (!fullConversation || fullConversation.length === 0) {
      return res.status(400).json({ error: 'No messages provided.' });
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        // Required for OpenRouter logging/tracking
        "HTTP-Referer": "https://xeno.onl", 
        "X-Title": "Xeno Help RAG"
      },
      body: JSON.stringify({
        model: "tngtech/deepseek-r1t2-chimera:free", // A strong model good at instructions/formatting
        messages: fullConversation // Send the full, contextualized conversation
      })
    });

    const data = await response.json();

    if (!response.ok) {
        // If OpenRouter returns an error (e.g., API key problem, model issue)
        console.error("OpenRouter Error Response:", data);
        throw new Error(data.error?.message || `External API Error: ${response.status}`);
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error("AI Request Failed:", error);
    // Send a generic 500 back to the client, but log the specific issue on the server
    return res.status(500).json({ error: `Failed to fetch AI response. Details: ${error.message}` });
  }
}
