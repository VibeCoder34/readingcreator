export function validateGenerated(raw: string) {
  const checks = [];

  const hasTitle = !!raw.match(/^[^\n]+$/m);
  checks.push({ id: "title", pass: hasTitle });

  const paraMatches = raw.match(/\(\d+\)/g) || [];
  const paraCount = new Set(paraMatches).size;
  const paraPass = paraCount >= 12 && paraCount <= 16;
  checks.push({ id: "paragraphCount(12–16)", pass: paraPass, note: `found=${paraCount}` });

  // Enhanced Questions check
  const hasQuestions = /(^|\n)(?:##?\s*)?Questions\s*$/im.test(raw);
  checks.push({ id: "hasQuestions", pass: hasQuestions, note: hasQuestions ? "✓" : "❌ CRITICAL: Questions section missing!" });

  // Enhanced Answer Key check
  const hasAnswerKey = /(^|\n)(?:##?\s*)?Answer\s*Key\s*$/im.test(raw);
  checks.push({ id: "hasAnswerKey", pass: hasAnswerKey, note: hasAnswerKey ? "✓" : "❌ CRITICAL: Answer Key missing!" });

  // Ensure Answer Key appears AFTER Questions
  const qIdx = raw.search(/(^|\n)(?:##?\s*)?Questions\s*$/im);
  const aIdx = raw.search(/(^|\n)(?:##?\s*)?Answer\s*Key\s*$/im);
  const orderPass = qIdx >= 0 && aIdx > qIdx;
  checks.push({ id: "answerKeyAfterQuestions", pass: orderPass, note: `Q=${qIdx} A=${aIdx}` });

  // Count questions - ensure there are actually questions
  const questionsSection = raw.match(/(?:^|\n)(?:##?\s*)?Questions\s*$([\s\S]+?)(?:^|\n)(?:##?\s*)?Answer\s*Key\s*$/im);
  if (questionsSection && questionsSection[1]) {
    const questionCount = (questionsSection[1].match(/\n\s*\d+\.\s/g) || []).length;
    const hasEnoughQuestions = questionCount >= 20;
    checks.push({ id: "questionCount(minimum 20)", pass: hasEnoughQuestions, note: `found=${questionCount}` });
  } else {
    checks.push({ id: "questionCount(minimum 20)", pass: false, note: "Questions section not found" });
  }

  // Check if answer key has content
  const answerKeySection = raw.split(/(?:^|\n)(?:##?\s*)?Answer\s*Key\s*$/im).pop() || '';
  const answerCount = (answerKeySection.match(/\n\s*\d+[\.)]\s/g) || []).length;
  const hasEnoughAnswers = answerCount >= 15;
  checks.push({ id: "answerKeyHasContent", pass: hasEnoughAnswers, note: `found=${answerCount} answers` });

  // Reference pronoun presence
  const refPronoun = /"(these|they|it|their|this|those)"/i.test(raw);
  checks.push({ id: "referencePronounPresent", pass: refPronoun });

  // Sentence insertion spots [A][B][C][D]
  const insertionSpots = raw.match(/\[[A-D]\]/g) || [];
  const insertionPass = new Set(insertionSpots).size >= 3;
  checks.push({ id: "sentenceInsertionSpots", pass: insertionPass, note: `found=${insertionSpots.length}` });

  // MC options A) B) C) D)
  const mcOptions = /(^|\n)\s*\d+\.\s[\s\S]*?A\)\s[\s\S]*?B\)\s[\s\S]*?C\)\s[\s\S]*?D\)/.test(raw);
  checks.push({ id: "multipleChoiceOptions(A–D)", pass: mcOptions });

  // Build score
  const score = Math.round(100 * (checks.filter(c => c.pass).length / checks.length));
  
  // Log critical failures
  if (!hasQuestions) console.error("❌ CRITICAL VALIDATION FAILURE: Questions section is missing!");
  if (!hasAnswerKey) console.error("❌ CRITICAL VALIDATION FAILURE: Answer Key section is missing!");
  
  return { score, checks };
}

export function parseGenerated(raw: string) {
  try {
    // Extract title (first line before first paragraph)
    const titleMatch = raw.match(/^(.+?)(?=\(\s*1\s*\))/s);
    const title = titleMatch ? titleMatch[1].trim().replace(/^#+\s*/, '') : "Untitled";

    // Extract paragraphs - fix numbering
    const paragraphsSection = raw.split(/Questions\s*$/im)[0] || raw;
    const paraMatches = [...paragraphsSection.matchAll(/\(\s*(\d+)\s*\)\s*([^(]*?)(?=\(\s*\d+\s*\)|Questions|$)/gs)];
    
    // Sort by number and renumber sequentially
    const sortedParas = paraMatches
      .map(m => ({ num: parseInt(m[1]), text: m[2].trim() }))
      .sort((a, b) => a.num - b.num);
    
    const paragraphs = sortedParas.map((p, idx) => `(${idx + 1}) ${p.text}`);

    // Extract Side Box A
    const boxMatch = raw.match(/Box A:\s*(.+?)(?=\n\n(?:Questions|##\s*Questions))/is);
    const sideBox = boxMatch ? boxMatch[1].trim() : undefined;

    // Extract questions section
    const questionsMatch = raw.match(/(?:^|\n)(?:##\s*)?Questions\s*$(.+?)(?:^|\n)(?:##\s*)?Answer Key\s*$/ims);
    const questionsText = questionsMatch ? questionsMatch[1] : "";
    
    // Parse question groups (A), B), C)...)
    const questions: Record<string, string[]> = {};
    const groupMatches = [...questionsText.matchAll(/([A-Z]\))\s*(.+?)(?=[A-Z]\)|$)/gs)];
    groupMatches.forEach(match => {
      const label = match[1];
      const content = match[2].trim();
      const items = content.split(/\n(?=\d+\.)/g).filter(Boolean);
      questions[label] = items;
    });

    // Extract answer key - aggressive parsing
    let answerKey: string[] = [];
    
    // Find the last occurrence of "Answer Key" (case insensitive)
    const answerKeyRegex = /(?:^|\n)(?:##?\s*)?(?:answer\s*key|answer\s*keys)(?:\s*:)?\s*$/im;
    const answerKeyIndex = raw.search(answerKeyRegex);
    
    if (answerKeyIndex !== -1) {
      // Get everything after "Answer Key" heading
      const afterAnswerKey = raw.substring(answerKeyIndex);
      
      // Remove the heading itself
      const contentAfterHeading = afterAnswerKey.replace(answerKeyRegex, '');
      
      // Split by newlines and clean up
      answerKey = contentAfterHeading
        .split(/\n/)
        .map(line => line.trim())
        .filter(line => {
          // Keep lines that have actual content
          if (!line || line.length === 0) return false;
          // Skip markdown headers
          if (line.match(/^#{1,6}\s/)) return false;
          // Skip lines that are just separators
          if (line.match(/^[=\-*_]{3,}$/)) return false;
          return true;
        });
    }

    // Fallback: try to find numbered answers
    if (answerKey.length === 0) {
      const numberedAnswers = raw.match(/(?:^|\n)\d+[\.)]\s+.+/gm);
      if (numberedAnswers) {
        const lastSection = raw.split(/answer\s*key/i).pop() || '';
        const numberedInAnswerKey = lastSection.match(/(?:^|\n)\d+[\.)]\s+.+/gm);
        if (numberedInAnswerKey) {
          answerKey = numberedInAnswerKey.map(line => line.trim());
        }
      }
    }

    console.log('DEBUG - Answer Key Index:', answerKeyIndex);
    console.log('DEBUG - Parsed answer key count:', answerKey.length);
    console.log('DEBUG - Parsed answer key:', answerKey);

    return {
      title,
      paragraphs,
      sideBox,
      questions,
      answerKey
    };
  } catch (error) {
    console.error('Parse error:', error);
    return {
      title: "Parse Error",
      paragraphs: [],
      sideBox: undefined,
      questions: {},
      answerKey: []
    };
  }
}

