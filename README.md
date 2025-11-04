# Academic Reading Test Generator

A Next.js application that generates C1-level BUEPT-style academic reading passages with comprehensive questions and answer keys using OpenAI's GPT models.

## Features

- 🎯 **C1-Level Content**: Generates advanced academic reading passages
- 📚 **Multiple Question Types**: Short Answer, Multiple Choice, Vocabulary-in-context, Reference, Sentence Insertion, NOT/EXCEPT, Matching Headings, Main Idea, Paragraph Purpose, Compare/Contrast, Inference, and Explicit Detail
- ✅ **Quality Validation**: Built-in scorecard to assess generated content quality
- 📝 **Live Preview**: Tabbed interface showing Reading, Questions, Answer Key, and Scorecard
- 💾 **Export Options**: Export to PDF and DOCX formats
- 🎨 **Modern UI**: Built with TailwindCSS and shadcn/ui components
- ⚡ **Real-time Generation**: Powered by OpenAI GPT-4

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: shadcn/ui + Radix UI
- **State Management**: Zustand
- **Validation**: Zod
- **AI**: OpenAI API
- **Export**: docx library for DOCX, HTML-to-PDF for PDF

## Getting Started

### Prerequisites

- Node.js 18+ installed
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd tugceuygulama
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Add your OpenAI API key to `.env.local`:
```
OPENAI_API_KEY=your_openai_api_key_here
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Quick Start Example

1. **Topic**: "Quiet Revolutions in the City: Small Designs for Urban Heat"
2. **Domain**: urban design / climate
3. **Level**: C1
4. **Length**: long (~1800 words)
5. **Side Box**: YES
6. **Question Types**: Select at least 5 from the available options

Click **Generate Reading Passage** and watch as the AI creates:
- A compelling title
- 10-14 numbered academic paragraphs
- Optional Box A for compare/contrast
- Grouped questions by type
- A comprehensive answer key at the end

### Default Configuration

The app comes pre-configured with sensible defaults:
- **Topic**: "AI and Cultural Memory"
- **Domain**: "science/philosophy"
- **Level**: C1
- **Length**: long (~1800 words)
- **Side Box**: Enabled
- **All 12 question types** selected by default

### Quality Checks

The built-in validator checks for:
- ✅ Title presence
- ✅ 10-14 numbered paragraphs
- ✅ Questions section
- ✅ Answer key section
- ✅ Proper ordering (Answer Key after Questions)
- ✅ Reference pronouns in quotes
- ✅ Sentence insertion spots [A][B][C][D]
- ✅ NOT/EXCEPT questions (if requested)
- ✅ Multiple choice options (A-D)

Aim for a score of **80% or higher** for best quality.

## Project Structure

```
tugceuygulama/
├── app/
│   ├── api/
│   │   ├── generate/route.ts       # Main generation endpoint
│   │   └── export/
│   │       ├── pdf/route.ts        # PDF export
│   │       └── docx/route.ts       # DOCX export
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── builder/
│   │   └── PromptForm.tsx          # Input form component
│   ├── preview/
│   │   └── ReadingPreview.tsx      # Preview with tabs
│   └── ui/                         # shadcn/ui components
├── lib/
│   ├── schema.ts                   # Zod validation schemas
│   ├── templates.ts                # LLM prompts
│   ├── validators.ts               # Quality checks
│   ├── llm.ts                      # OpenAI integration
│   ├── utils.ts                    # Utility functions
│   └── export/
│       ├── pdf.ts                  # PDF generation
│       └── docx.ts                 # DOCX generation
└── store/
    └── useAppStore.ts              # Zustand state management
```

## API Endpoints

### POST /api/generate
Generates a reading passage with questions and answer key.

**Request Body:**
```json
{
  "topic": "AI and Cultural Memory",
  "domain": "science/philosophy",
  "level": "C1",
  "length": "long",
  "sidebox": true,
  "questionTypes": ["Short Answer", "Multiple Choice", ...],
  "language": "EN"
}
```

**Response:**
```json
{
  "raw": "...",
  "parsed": {
    "title": "...",
    "paragraphs": [...],
    "sideBox": "...",
    "questions": {...},
    "answerKey": [...]
  },
  "scorecard": {
    "score": 85,
    "checks": [...]
  }
}
```

### POST /api/export/pdf
Exports the parsed content as a PDF-ready HTML file.

### POST /api/export/docx
Exports the parsed content as a DOCX file.

## Acceptance Criteria (DoD)

- ✅ Title + 10–14 numbered long paragraphs
- ✅ Optional Box A included when requested
- ✅ "Questions" grouped by requested types (labels A, B, C…)
- ✅ Answer Key appears only at the very end
- ✅ Reference pronoun Q has a real, unique antecedent in passage
- ✅ Sentence insertion has 3–4 slots with one best position
- ✅ At least one NOT/EXCEPT if requested
- ✅ MC has one best answer with 3–4 options
- ✅ Export to PDF/DOCX works
- ✅ Scorecard ≥ 80 with defaults

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | Yes |

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue on the GitHub repository.
