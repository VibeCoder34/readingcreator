import { NextRequest, NextResponse } from "next/server";
import { GenInput } from "@/lib/schema";
import { SYSTEM_PROMPT, fillUserPrompt } from "@/lib/templates";
import { generateReading } from "@/lib/llm";
import { validateGenerated, parseGenerated } from "@/lib/validators";

export const runtime = 'nodejs'; // Can use 'edge' if needed

export async function POST(req: NextRequest) {
  try {
    // Check API key first
    if (!process.env.OPENAI_API_KEY) {
      console.error("❌ OPENAI_API_KEY is not set in environment variables");
      return NextResponse.json(
        { 
          error: "OpenAI API key not configured",
          details: "Please add OPENAI_API_KEY to your .env.local file and restart the server"
        },
        { status: 500 }
      );
    }

    const body = await req.json();
    console.log("📥 Received request:", { topic: body.topic, questionTypes: body.questionTypes?.length });
    
    // Validate input
    let input;
    try {
      input = GenInput.parse(body);
    } catch (zodError: any) {
      console.error("❌ Validation error:", zodError.errors);
      return NextResponse.json(
        { 
          error: "Invalid input",
          details: zodError.errors?.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ') || "Schema validation failed"
        },
        { status: 400 }
      );
    }
    
    const strictMode = body.strictMode || false;
    const retryCount = body.retryCount || 0;
    
    // Calculate word count based on length - VERY LONG
    const wordCount = input.words || (() => {
      switch (input.length) {
        case "short": return 2000;
        case "medium": return 2800;
        case "long": return 3500;
        default: return 3500;
      }
    })();

    // Build enhanced user prompt with stricter instructions if retrying
    let enhancedUserPrompt = fillUserPrompt({
      topic: input.topic,
      domain: input.domain,
      level: input.level,
      length: input.length,
      words: wordCount,
      sidebox: input.sidebox,
      questionTypes: input.questionTypes
    });

    // Add extra strictness for retries
    if (strictMode || retryCount > 0) {
      enhancedUserPrompt += `\n\n⚠️ RETRY ${retryCount + 1}

YOU WROTE MULTIPLE CHOICE OPTIONS (A, B, C, D) IN THE PREVIOUS ATTEMPT!

DO NOT WRITE:
- A) Option
- B) Option  
- C) Option
- D) Option

ONLY WRITE SHORT ANSWER QUESTIONS LIKE:
1. What is the main focus?
2. What does paragraph 3 discuss?
3. How is X defined?

NO A/B/C/D OPTIONS! ONLY QUESTIONS!`;
    }

    // Generate content
    const raw = await generateReading({
      system: SYSTEM_PROMPT,
      user: enhancedUserPrompt
    });

    // Validate and parse
    const scorecard = validateGenerated(raw);
    const parsed = parseGenerated(raw);

    return NextResponse.json({
      raw,
      parsed,
      scorecard
    });
  } catch (error) {
    console.error("❌ Generation error:", error);
    
    let errorMessage = "Failed to generate content";
    let errorDetails = error instanceof Error ? error.message : String(error);
    
    // Check for common OpenAI errors
    if (errorDetails.includes("API key")) {
      errorMessage = "Invalid OpenAI API key";
      errorDetails = "Please check your OPENAI_API_KEY in .env.local";
    } else if (errorDetails.includes("insufficient_quota")) {
      errorMessage = "OpenAI API quota exceeded";
      errorDetails = "Please check your OpenAI account billing and usage limits";
    } else if (errorDetails.includes("rate_limit")) {
      errorMessage = "Rate limit exceeded";
      errorDetails = "Please wait a moment and try again";
    }
    
    return NextResponse.json(
      { error: errorMessage, details: errorDetails },
      { status: 500 }
    );
  }
}

