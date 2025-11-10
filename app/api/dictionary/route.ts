import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { DictionaryInput, DictionaryOutput } from "@/lib/schema";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `
Sen sıcak tonlarda konuşan, Türkçe'yi kusursuz kullanan bir sözlük asistanısın.
Kullanıcının verdiği İngilizce kelime için iki bilgi sağlayacaksın:
1) "meaning": Kelimenin Türkçe açıklaması. En az 2 cümle, en fazla 4 cümle olmalı. Gündelik ama öğretici bir tonda yaz.
2) "example": Kelimenin doğal bir İngilizce örnek cümlesi. Cümlede kelimenin kendisi mutlaka geçsin.

YANIT FORMATIN:
{
  "meaning": "...",
  "example": "..."
}

Başka hiçbir metin ekleme. JSON dışında açıklama yapma.
`.trim();

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          error: "OpenAI API key not configured",
          details: "OPENAI_API_KEY değerini .env.local dosyanıza ekleyip sunucuyu yeniden başlatın."
        },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { word } = DictionaryInput.parse(body);

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.5,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Kelime: "${word}"\nLütfen yalnızca JSON çıktı ver.`
        }
      ]
    });

    const content = completion.choices[0]?.message?.content?.trim() ?? "";
    if (!content) {
      throw new Error("Boş yanıt alındı");
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : content;

    const parsed = DictionaryOutput.parse(JSON.parse(jsonString));

    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error("❌ Dictionary API error:", error);

    if (error?.name === "ZodError") {
      return NextResponse.json(
        {
          error: "Invalid input",
          details: error?.errors?.map((e: any) => e.message).join(", ") ?? "Geçersiz istek"
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to fetch dictionary entry",
        details: error?.message ?? "Bilinmeyen hata"
      },
      { status: 500 }
    );
  }
}

