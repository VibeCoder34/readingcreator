import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak } from "docx";

interface ParsedContent {
  title: string;
  paragraphs: string[];
  sideBox?: string;
  questions: Record<string, string[]>;
  answerKey: string[];
}

export async function generateDocxMultiple(passages: ParsedContent[]): Promise<Buffer> {
  const children: Paragraph[] = [];

  // Process each passage
  passages.forEach((parsed, passageIdx) => {
    // Page break before each new passage (except first)
    if (passageIdx > 0) {
      children.push(new Paragraph({ children: [new PageBreak()] }));
    }

    // Passage number and title
    children.push(
      new Paragraph({
        text: `Passage ${passageIdx + 1}: ${parsed.title}`,
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 }
      })
    );

    // Reading Text header
    children.push(
      new Paragraph({
        text: "Reading Text",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 150 }
      })
    );

    // Paragraphs
    parsed.paragraphs.forEach(para => {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: para })],
          spacing: { after: 200 },
          alignment: AlignmentType.JUSTIFIED
        })
      );
    });

    // Questions header
    children.push(
      new Paragraph({
        text: `Questions for Passage ${passageIdx + 1}`,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 150 }
      })
    );

    // Questions by type
    Object.entries(parsed.questions).forEach(([label, items]) => {
      children.push(
        new Paragraph({
          text: label,
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200, after: 100 }
        })
      );
      items.forEach(item => {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: item })],
            spacing: { after: 150 }
          })
        );
      });
    });
  });

  // Answer Keys section at the end (new page)
  children.push(new Paragraph({ children: [new PageBreak()] }));
  
  children.push(
    new Paragraph({
      text: "Answer Keys",
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 }
    })
  );

  passages.forEach((parsed, passageIdx) => {
    children.push(
      new Paragraph({
        text: `Answer Key for Passage ${passageIdx + 1}`,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 150 }
      })
    );

    if (parsed.answerKey && parsed.answerKey.length > 0) {
      parsed.answerKey.forEach(answer => {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: answer })],
            spacing: { after: 100 }
          })
        );
      });
    } else {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: "No answers available", italics: true })],
          spacing: { after: 100 }
        })
      );
    }
  });

  const doc = new Document({
    sections: [{
      properties: {},
      children
    }]
  });

  return await Packer.toBuffer(doc);
}

