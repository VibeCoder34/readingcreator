import OpenAI from "openai";

export async function generateReading({ system, user }: { system: string; user: string }) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  
  try {
    const chat = await client.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.3, // Very low for strict format following
      max_tokens: 6000,
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
      stream: false
    });
    return chat.choices[0]?.message?.content ?? "";
  } catch (error: any) {
    console.error("❌ OpenAI API Error:", error.message);
    throw error;
  }
}

export async function* generateReadingStream({ system, user }: { system: string; user: string }) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  const stream = await client.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.7,
    messages: [{ role: "system", content: system }, { role: "user", content: user }],
    stream: true
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || "";
    if (content) {
      yield content;
    }
  }
}

