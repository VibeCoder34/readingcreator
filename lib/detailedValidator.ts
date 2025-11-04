export interface ValidationResult {
  isValid: boolean;
  score: number;
  errors: string[];
  warnings: string[];
  details: {
    hasTitle: boolean;
    paragraphCount: number;
    hasQuestions: boolean;
    hasAnswerKey: boolean;
    questionStats: {
      total: number;
      multipleChoice: number;
      withoutOptions: number; // MC questions missing A,B,C,D
      vocabulary: number;
      reference: number;
      sentenceInsertion: number;
      shortAnswer: number;
    };
    answerStats: {
      total: number;
      matchesQuestions: boolean;
    };
    criticalIssues: string[];
  };
}

export function validatePassageDetailed(raw: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const criticalIssues: string[] = [];
  
  // 1. Check Title
  const hasTitle = !!raw.match(/^[^\n]+$/m);
  if (!hasTitle) {
    criticalIssues.push("Missing title");
  }

  // 2. Check Paragraphs
  const paraMatches = raw.match(/\(\d+\)/g) || [];
  const paragraphCount = new Set(paraMatches).size;
  if (paragraphCount < 12) {
    criticalIssues.push(`Only ${paragraphCount} paragraphs (need 12+)`);
  } else if (paragraphCount > 16) {
    warnings.push(`Too many paragraphs: ${paragraphCount}`);
  }

  // 3. Extract Questions Section
  const questionsMatch = raw.match(/(?:^|\n)(?:##?\s*)?Questions\s*$([\s\S]+?)(?:^|\n)(?:##?\s*)?Answer\s*Key\s*$/im);
  const hasQuestions = !!questionsMatch;
  
  if (!hasQuestions) {
    criticalIssues.push("Questions section missing or malformed");
  }

  const questionsText = questionsMatch ? questionsMatch[1] : "";
  
  // 4. Analyze Questions in Detail
  const questionStats = {
    total: 0,
    multipleChoice: 0,
    withoutOptions: 0,
    vocabulary: 0,
    reference: 0,
    sentenceInsertion: 0,
    shortAnswer: 0
  };

  if (questionsText) {
    // Count all numbered questions
    const allQuestions = questionsText.match(/^\s*\d+\.\s+/gm) || [];
    questionStats.total = allQuestions.length;

    // Check Multiple Choice questions - very strict pattern
    // Pattern: question number, question text, then A) B) C) D) on separate lines
    const mcPattern = /\d+\.\s+[^\n]+\n\s*A\)\s+[^\n]+\n\s*B\)\s+[^\n]+\n\s*C\)\s+[^\n]+\n\s*D\)\s+[^\n]+/g;
    const properMCQuestions = questionsText.match(mcPattern) || [];
    questionStats.multipleChoice = properMCQuestions.length;

    // Find MC section and check for malformed questions
    const mcSectionMatch = questionsText.match(/(?:Multiple\s*Choice)([\s\S]+?)(?=(?:\n[A-Z]\)\s+[A-Z][a-z])|Answer\s*Key|$)/i);
    if (mcSectionMatch) {
      const mcSection = mcSectionMatch[1];
      const mcQuestionsInSection = mcSection.match(/^\s*\d+\.\s+/gm) || [];
      const expectedMC = mcQuestionsInSection.length;
      
      // Count properly formatted MC questions in this section
      const properMCInSection = mcSection.match(/\d+\.\s+[^\n]+\n\s*A\)\s+[^\n]+\n\s*B\)\s+[^\n]+\n\s*C\)\s+[^\n]+\n\s*D\)\s+[^\n]+/g) || [];
      const actualProperMC = properMCInSection.length;
      
      questionStats.withoutOptions = Math.max(0, expectedMC - actualProperMC);
      
      if (questionStats.withoutOptions > 0) {
        criticalIssues.push(`${questionStats.withoutOptions} Multiple Choice questions have format errors (missing or malformed options)`);
      }
      
      // Check for options appearing BEFORE question (wrong order)
      const wrongOrderPattern = /A\)\s+[^\n]+\n\s*B\)\s+[^\n]+\n\s*C\)\s+[^\n]+\n\s*D\)\s+[^\n]+\n\s*\d+\./;
      if (wrongOrderPattern.test(mcSection)) {
        criticalIssues.push("Multiple Choice options appearing BEFORE question text (wrong order)");
        questionStats.withoutOptions = Math.max(questionStats.withoutOptions, 1);
      }
      
      // Check for options on same line as question
      const sameLinePattern = /\d+\.\s+[^\n]*A\)[^\n]*B\)[^\n]*C\)[^\n]*D\)/;
      if (sameLinePattern.test(mcSection)) {
        criticalIssues.push("Multiple Choice options on same line as question (must be separate lines)");
        questionStats.withoutOptions = Math.max(questionStats.withoutOptions, 1);
      }
    }

    // Check Vocabulary questions - must have options too
    const vocabSectionMatch = questionsText.match(/(?:Vocabulary(?:\s+in\s+Context)?)([\s\S]+?)(?=(?:\n[A-Z]\)\s+[A-Z][a-z])|Answer\s*Key|$)/i);
    if (vocabSectionMatch) {
      const vocabSection = vocabSectionMatch[1];
      
      // More flexible pattern for vocabulary questions with options
      const vocabWithOptions = vocabSection.match(/\d+\.\s+[^\n]*(?:word|phrase)[^\n]*\n\s*A\)\s+[^\n]+\n\s*B\)\s+[^\n]+\n\s*C\)\s+[^\n]+\n\s*D\)\s+[^\n]+/gi) || [];
      questionStats.vocabulary = vocabWithOptions.length;
      
      const vocabQuestionsCount = (vocabSection.match(/^\s*\d+\.\s+/gm) || []).length;
      const vocabWithoutOptions = Math.max(0, vocabQuestionsCount - vocabWithOptions.length);
      
      if (vocabWithoutOptions > 0) {
        criticalIssues.push(`${vocabWithoutOptions} Vocabulary questions missing A/B/C/D options`);
        questionStats.withoutOptions = Math.max(questionStats.withoutOptions, 0) + vocabWithoutOptions;
      }
    }

    // Check Reference questions (pronoun questions)
    const refPattern = /"(?:these|they|it|their|this|those|which)"/gi;
    questionStats.reference = (questionsText.match(refPattern) || []).length;

    // Check Sentence Insertion
    const insertionPattern = /\[A\]|\[B\]|\[C\]|\[D\]/g;
    const hasInsertion = insertionPattern.test(questionsText);
    questionStats.sentenceInsertion = hasInsertion ? 1 : 0;

    // Short Answer (approximate)
    const shortAnswerSection = questionsText.match(/(?:Short\s*Answer|A\))[^]*?(?=\n[B-Z]\)|$)/i);
    if (shortAnswerSection) {
      const shortQs = shortAnswerSection[0].match(/^\s*\d+\.\s+/gm) || [];
      questionStats.shortAnswer = shortQs.length;
    }
  }

  if (questionStats.total < 20) {
    criticalIssues.push(`Only ${questionStats.total} questions (need 20+)`);
  }

  // 5. Check Answer Key
  const answerKeyMatch = raw.match(/(?:^|\n)(?:##?\s*)?Answer\s*Key\s*$/im);
  const hasAnswerKey = !!answerKeyMatch;
  
  if (!hasAnswerKey) {
    criticalIssues.push("Answer Key section missing");
  }

  const answerStats = {
    total: 0,
    matchesQuestions: false
  };

  if (hasAnswerKey) {
    const afterAnswerKey = raw.split(/(?:^|\n)(?:##?\s*)?Answer\s*Key\s*$/im).pop() || '';
    const answers = afterAnswerKey.match(/^\s*\d+[\.)]\s+/gm) || [];
    answerStats.total = answers.length;
    answerStats.matchesQuestions = Math.abs(answerStats.total - questionStats.total) <= 2; // Allow 2 difference
    
    if (!answerStats.matchesQuestions) {
      criticalIssues.push(`Answer count (${answerStats.total}) doesn't match question count (${questionStats.total})`);
    }
    
    if (answerStats.total < 15) {
      criticalIssues.push(`Only ${answerStats.total} answers in Answer Key`);
    }
  }

  // 6. Calculate score
  let score = 100;
  
  // Deduct heavily for critical issues
  score -= criticalIssues.length * 25;
  
  // Deduct for warnings
  score -= warnings.length * 5;
  
  // Deduct for MC questions without options
  score -= questionStats.withoutOptions * 15;
  
  // Bonus for good stats
  if (questionStats.total >= 25) score += 5;
  if (questionStats.multipleChoice >= 5 && questionStats.withoutOptions === 0) score += 10;
  if (answerStats.matchesQuestions) score += 10;
  
  score = Math.max(0, Math.min(100, score));

  const isValid = 
    criticalIssues.length === 0 && 
    hasTitle && 
    hasQuestions && 
    hasAnswerKey && 
    questionStats.total >= 20 &&
    questionStats.withoutOptions === 0 && // NO questions without options
    answerStats.total >= 15;

  return {
    isValid,
    score,
    errors,
    warnings,
    details: {
      hasTitle,
      paragraphCount,
      hasQuestions,
      hasAnswerKey,
      questionStats,
      answerStats,
      criticalIssues
    }
  };
}

export function getValidationSummary(result: ValidationResult): string {
  const lines: string[] = [];
  
  lines.push(`Validation Score: ${result.score}%`);
  lines.push(`Status: ${result.isValid ? '✅ VALID - Ready to use' : '❌ INVALID - Will retry automatically'}`);
  lines.push('');
  
  if (result.details.criticalIssues.length > 0) {
    lines.push('🔴 Critical Issues (triggering retry):');
    result.details.criticalIssues.forEach(issue => {
      lines.push(`  ❌ ${issue}`);
    });
    lines.push('');
  }
  
  lines.push('📊 Content Analysis:');
  lines.push(`  Paragraphs: ${result.details.paragraphCount} ${result.details.paragraphCount >= 12 ? '✓' : '✗'}`);
  lines.push(`  Total Questions: ${result.details.questionStats.total} ${result.details.questionStats.total >= 20 ? '✓' : '✗'}`);
  lines.push(`  Multiple Choice (properly formatted): ${result.details.questionStats.multipleChoice} ${result.details.questionStats.multipleChoice >= 5 ? '✓' : '✗'}`);
  lines.push(`  MC with format errors: ${result.details.questionStats.withoutOptions} ${result.details.questionStats.withoutOptions === 0 ? '✓' : '✗ CRITICAL'}`);
  lines.push(`  Vocabulary: ${result.details.questionStats.vocabulary}`);
  lines.push(`  Reference: ${result.details.questionStats.reference}`);
  lines.push(`  Total Answers: ${result.details.answerStats.total} ${result.details.answerStats.matchesQuestions ? '✓' : '✗'}`);
  
  if (!result.isValid) {
    lines.push('');
    lines.push('⚠️ This output will be automatically regenerated due to validation failures.');
  }
  
  return lines.join('\n');
}

