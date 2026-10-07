import "dotenv/config";

const getOpenAIAPIResponse = async (message) => {
  const apiKey = process.env.GROQ_API_KEY?.trim();

  if (!apiKey) {
    console.error("❌ GROQ_API_KEY is missing.");
    return "Error: GROQ_API_KEY is missing in backend .env file.";
  }

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
          model: "openai/gpt-oss-20b",

          messages: [
            {
              role: "system",
              content:
                "You are Nishant Gpt, a helpful, intelligent, fast, and friendly AI assistant. Answer questions clearly and accurately.",
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
      console.error(
        "❌ Groq API Error:",
        JSON.stringify(data, null, 2)
      );

      return (
        data?.error?.message ||
        "Error: Unable to get response from Groq AI."
      );
    }

    return (
      data?.choices?.[0]?.message?.content ||
      "Sorry, I couldn't generate a response."
    );

  } catch (err) {
    console.error("❌ Groq Request Error:", err.message);

    return "Error connecting to Groq AI service.";
  }
};

export default getOpenAIAPIResponse;
