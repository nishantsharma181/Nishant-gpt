import "dotenv/config";

// Cache the active model so we don't fetch the list on every message
let cachedWorkingModel = null;

const getActiveGroqModel = async (apiKey) => {
  if (cachedWorkingModel) return cachedWorkingModel;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/models", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const data = await res.json();
    if (!res.ok || !data.data || data.data.length === 0) {
      console.error("❌ Failed to retrieve model list from Groq:", data);
      return null;
    }

    // Filter chat-capable models and pick the first available
    const availableModels = data.data
      .map((m) => m.id)
      .filter((id) => !id.includes("whisper") && !id.includes("guard"));

    console.log(" Detected available Groq models on your key:", availableModels);

    if (availableModels.length > 0) {
      cachedWorkingModel = availableModels[0];
      return cachedWorkingModel;
    }
  } catch (err) {
    console.error("❌ Error fetching available models from Groq:", err.message);
  }

  return null;
};

const getOpenAIAPIResponse = async (message) => {
  const apiKey = process.env.GROQ_API_KEY?.trim();

  if (!apiKey) {
    console.error("❌ GROQ_API_KEY is missing in your backend .env file.");
    return "Error: GROQ_API_KEY is missing in backend .env file.";
  }

  // 1. Automatically pick the active model from your account
  const activeModel = await getActiveGroqModel(apiKey);

  if (!activeModel) {
    return "Error: No active chat models found on this Groq API key.";
  }

  console.log(`🚀 Using active model: ${activeModel}`);

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: activeModel,
          messages: [
            {
              role: "system",
              content: "You are Akash GPT, an authentic, fast, and helpful AI assistant.",
            },
            {
              role: "user",
              content: message,
            },
          ],
          temperature: 0.7,
          max_tokens: 1024,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Groq Execution Error:", JSON.stringify(data, null, 2));
      return data?.error?.message || "Error: Unable to get response from Groq AI.";
    }

    return data.choices?.[0]?.message?.content || "No response received.";
  } catch (err) {
    console.error("❌ Request Error:", err.message);
    return "Error connecting to Groq AI service.";
  }
};

export default getOpenAIAPIResponse;
