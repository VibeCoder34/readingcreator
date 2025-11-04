export function generatePdfHtml(parsed: {
  title: string;
  paragraphs: string[];
  sideBox?: string;
  questions: Record<string, string[]>;
  answerKey: string[];
}): string {
  // Escape HTML to prevent issues
  const escapeHtml = (text: string) => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(parsed.title)}</title>
  <style>
    @page {
      size: A4;
      margin: 2.5cm;
    }
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
    body {
      font-family: 'Georgia', 'Times New Roman', serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #000;
      max-width: 21cm;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      text-align: center;
      font-size: 20pt;
      margin-bottom: 1.5em;
      color: #000;
      font-weight: bold;
      page-break-after: avoid;
    }
    h2 {
      font-size: 16pt;
      margin-top: 2em;
      margin-bottom: 0.8em;
      color: #000;
      font-weight: bold;
      border-bottom: 2px solid #000;
      padding-bottom: 0.3em;
      page-break-after: avoid;
    }
    h3 {
      font-size: 14pt;
      margin-top: 1.2em;
      margin-bottom: 0.6em;
      color: #000;
      font-weight: bold;
      page-break-after: avoid;
    }
    p {
      margin-bottom: 1em;
      text-align: justify;
      color: #000;
      page-break-inside: avoid;
    }
    .box {
      border: 2px solid #000;
      padding: 1em;
      margin: 1.5em 0;
      background-color: #f5f5f5;
      page-break-inside: avoid;
    }
    .box h3 {
      margin-top: 0;
    }
    .question-item {
      margin-bottom: 1.2em;
      color: #000;
      white-space: pre-wrap;
      page-break-inside: avoid;
    }
    .answer-key-item {
      margin-bottom: 0.6em;
      padding: 0.3em 0;
      color: #000;
      page-break-inside: avoid;
    }
    .answer-key-item::before {
      content: "• ";
      font-weight: bold;
    }
    @media print {
      h1, h2, h3 {
        page-break-after: avoid;
      }
      .question-item, .answer-key-item, p {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <h1>${escapeHtml(parsed.title)}</h1>
  
  <h2>Reading Passage</h2>
  ${parsed.paragraphs.map(p => `<p>${escapeHtml(p)}</p>`).join('\n')}
  
  ${parsed.sideBox ? `
    <div class="box">
      <h3>Box A:</h3>
      <p>${escapeHtml(parsed.sideBox)}</p>
    </div>
  ` : ''}
  
  <h2>Questions</h2>
  ${Object.entries(parsed.questions).map(([label, items]) => `
    <h3>${escapeHtml(label)}</h3>
    ${items.map(item => `<div class="question-item">${escapeHtml(item)}</div>`).join('\n')}
  `).join('\n')}
  
  <h2>Answer Key</h2>
  ${parsed.answerKey.length > 0 
    ? parsed.answerKey.map(answer => `<div class="answer-key-item">${escapeHtml(answer)}</div>`).join('\n')
    : '<p>No answers available</p>'
  }
</body>
</html>
  `;

  return html;
}

