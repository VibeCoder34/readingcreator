import { NextRequest, NextResponse } from "next/server";
import { generateDocxMultiple } from "@/lib/export/docx";

export async function POST(req: NextRequest) {
  try {
    const { passages } = await req.json();

    if (!passages || passages.length === 0) {
      return NextResponse.json({ error: "No content provided" }, { status: 400 });
    }

    const buffer = await generateDocxMultiple(passages);

    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="reading-passages-${Date.now()}.docx"`
      }
    });
  } catch (error) {
    console.error("DOCX export error:", error);
    return NextResponse.json(
      { error: "Failed to export DOCX" },
      { status: 500 }
    );
  }
}

