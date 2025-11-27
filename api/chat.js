// api/chat.js

// Using node-fetch explicitly ensures compatibility across Vercel environments.
// If your deployment previously worked without this line, you can try removing it,
// but it's a good safeguard against ReferenceError: fetch is not defined.
import fetch from 'node-fetch'; 

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // The 'messages' array now contains the System Prompt (with the fixes) 
  // and the user's conversation history.
  const fullConversation = req.body.messages; 
  
  // This securely retrieves the secret key from your Vercel Environment Variables
  const apiKey = process.env.API_KEY; 

  if (!apiKey) {
    return res.status(500).json({ 
        error: 'Configuration Error: API_KEY environment variable is not set on the server.',
        details: 'Check Vercel Settings -> Environment Variables and ensure it is scoped to the Production/Preview environment.'
    });
  }

  // Ensure we have messages to send
  if (!fullConversation || fullConversation.length === 0) {
      return res.status(400).json({ error: 'No messages provided.' });
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        // Headers required by OpenRouter for usage tracking and routing
        "HTTP-Referer": "https://xeno.onl", 
        "X-Title": "Xeno Help RAG"
      },
      body: JSON.stringify({
        model: "tngtech/deepseek-r1t2-chimera:free", // The model to use
        messages: fullConversation // Send the full, contextualized conversation
      })
    });

    const data = await response.json();

    if (!response.ok) {
        // Log the specific error from OpenRouter for debugging
        console.error("OpenRouter Error Response:", data);
        throw new Error(data.error?.message || `External API Error: ${response.status}`);
    }

    // Send the AI's reply back to your frontend
    return res.status(200).json(data);

  } catch (error) {
    console.error("AI Request Failed:", error);
    return res.status(500).json({ error: `Failed to fetch AI response. Details: ${error.message}` });
  }
}
