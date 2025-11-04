export interface SimpleValidationResult {
  isValid: boolean;
  score: number;
  issues: string[];
  stats: {
    paragraphs: number;
    totalQuestions: number;
    multipleChoice: number;
    trueFalse: number;
    totalAnswers: number;
  };
}

export function validatePassageSimple(raw: string): SimpleValidationResult {
  const issues: string[] = [];
  const stats = {
    paragraphs: 0,
    totalQuestions: 0,
    multipleChoice: 0,
    trueFalse: 0,
    totalAnswers: 0
  };

  // 1. Check paragraphs
  const paraMatches = raw.match(/\(\d+\)/g) || [];
  stats.paragraphs = new Set(paraMatches).size;
  if (stats.paragraphs < 15) {
    issues.push(`Need 15 paragraphs (found ${stats.paragraphs})`);
  }

  // 2. Check Questions section exists
  const hasQuestions = /Questions\s*$/im.test(raw);
  if (!hasQuestions) {
    issues.push("Questions section missing");
  }

  // 3. Check Answer Key section exists
  const hasAnswerKey = /Answer\s*Key\s*$/im.test(raw);
  if (!hasAnswerKey) {
    issues.push("Answer Key section missing");
  }

  // 4. Count questions (simple - just numbered items)
  const questionsSection = raw.match(/Questions\s*$([\s\S]+?)Answer\s*Key\s*$/im);
  if (questionsSection) {
    const questionNumbers = questionsSection[1].match(/^\s*\d+\.\s/gm) || [];
    stats.totalQuestions = questionNumbers.length;
    
    // Check for A) B) C) D) options - we DON'T want these
    const hasMultipleChoiceOptions = /A\)\s+[^\n]+\n\s*B\)\s+[^\n]+\n\s*C\)\s+[^\n]+\n\s*D\)\s+/i.test(questionsSection[1]);
    if (hasMultipleChoiceOptions) {
      issues.push("CRITICAL: Multiple choice options found - only Short Answer and Main Idea questions allowed!");
    }
    
    if (stats.totalQuestions < 20) {
      issues.push(`Need 20+ questions (found ${stats.totalQuestions})`);
    }
  }

  // 5. Count answers
  const answerKeySection = raw.split(/Answer\s*Key\s*$/im).pop() || '';
  const answerNumbers = answerKeySection.match(/^\s*\d+[\.)]\s/gm) || [];
  stats.totalAnswers = answerNumbers.length;

  if (stats.totalAnswers < 20) {
    issues.push(`Need 20+ answers (found ${stats.totalAnswers})`);
  }

  // Check if question and answer counts match (within 2)
  if (Math.abs(stats.totalQuestions - stats.totalAnswers) > 2) {
    issues.push(`Question count (${stats.totalQuestions}) doesn't match answer count (${stats.totalAnswers})`);
  }

  // Calculate score
  let score = 100;
  score -= issues.length * 20;
  if (stats.paragraphs >= 15) score += 15;
  if (stats.totalQuestions >= 20) score += 15;
  score = Math.max(0, Math.min(100, score));

  const isValid = 
    issues.length === 0 && 
    stats.totalQuestions >= 20 && 
    stats.totalAnswers >= 20 &&
    stats.paragraphs >= 15;

  return { isValid, score, issues, stats };
}

