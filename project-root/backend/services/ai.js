import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY, // this reads the key you set above
});

export async function askAI(message) {
  const completion = await openai.chat.completions.create({
    model: "openai/gpt-4o-mini",  // or any model available on OpenRouter
    messages: [{ role: "user", content: message }],
  });

  return completion.choices[0].message.content;
}

// 👇 Add this at the bottom so the script actually runs
askAI("Hello world")
  .then(console.log)
  .catch(console.error);
