import { NextRequest, NextResponse } from "next/server";
import { generatePdfHtml } from "@/lib/export/pdf";

export async function POST(req: NextRequest) {
  try {
    const { parsed } = await req.json();

    if (!parsed) {
      return NextResponse.json({ error: "No content provided" }, { status: 400 });
    }

    const html = generatePdfHtml(parsed);

    // For a simple implementation, we'll return HTML that can be printed to PDF
    // In production, you might want to use a library like puppeteer or playwright
    // For now, we'll use a simple approach with the browser's print-to-PDF
    
    // Return HTML with headers that suggest printing
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `inline; filename="reading-passage.html"`
      }
    });
  } catch (error) {
    console.error("PDF export error:", error);
    return NextResponse.json(
      { error: "Failed to export PDF" },
      { status: 500 }
    );
  }
}


