
export const aiCommands = {
  ai: async (args) => {
    const question = args.join(" ").trim();

    if (!question) {
      return "🤖 Usage: .ai ask your question";
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return "❌ AI API key is not configured.";
    }

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: "You are SITANI AI, a helpful assistant."
              },
              {
                role: "user",
                content: question
              }
            ]
          })
        }
      );

      if (!response.ok) {
        return "❌ AI service error. Check your API key.";
      }

      const data = await response.json();

      return data.choices?.[0]?.message?.content
        || "No answer received.";
    } catch (error) {
      return "❌ Could not connect to AI.";
    }
  }
};
