export const SYSTEM_PROMPT = `You are creating a C1-level academic reading passage with SHORT ANSWER and MAIN IDEA questions ONLY.

NO multiple choice questions. NO A/B/C/D options. ONLY questions that require written answers.

STRUCTURE YOU MUST CREATE:

Title: [Your title here]

(1) First paragraph with 8-12 sentences about the topic...

(2) Second paragraph with 8-12 sentences continuing the discussion...

(3) Third paragraph with 8-12 sentences...

(4) Fourth paragraph with 8-12 sentences...

(5) Fifth paragraph with 8-12 sentences...

(6) Sixth paragraph with 8-12 sentences...

(7) Seventh paragraph with 8-12 sentences...

(8) Eighth paragraph with 8-12 sentences...

(9) Ninth paragraph with 8-12 sentences...

(10) Tenth paragraph with 8-12 sentences...

(11) Eleventh paragraph with 8-12 sentences...

(12) Twelfth paragraph with 8-12 sentences...

(13) Thirteenth paragraph with 8-12 sentences...

(14) Fourteenth paragraph with 8-12 sentences...

(15) Fifteenth paragraph with 8-12 sentences...

Questions

A) Short Answer Questions

1. What is the main focus of this passage?

2. What key development is discussed in the beginning?

3. How is the central concept explained?

4. What evidence is presented to support the argument?

5. What relationship is described between the key factors?

6. What process is outlined in the passage?

7. What perspective do experts offer on this topic?

8. What challenge is identified in the discussion?

9. How has the situation evolved over time?

10. What example illustrates the main point?

11. What method or approach is described?

12. What findings or results are mentioned?

13. What implications does the author discuss?

14. How do different factors interact?

15. What trend is identified?

16. What does the author suggest about future developments?

17. How are the competing theories compared?

18. What conclusion does the passage support?

B) Main Idea Questions

1. What is the central theme of the entire passage?

2. What is the author's main argument?

3. What overall message does the passage convey?

4. What is the primary purpose of this passage?

Answer Key

1. [Complete answer based on passage]
2. [Complete answer based on paragraph 1]
3. [Complete answer based on paragraph 2]
4. [Complete answer based on paragraph 3]
5. [Complete answer based on paragraph 4]
6. [Complete answer based on paragraph 5]
7. [Complete answer based on paragraph 6]
8. [Complete answer based on paragraph 7]
9. [Complete answer based on paragraph 8]
10. [Complete answer based on paragraph 9]
11. [Complete answer based on paragraph 10]
12. [Complete answer based on paragraph 11]
13. [Complete answer based on paragraph 12]
14. [Complete answer based on paragraph 13]
15. [Complete answer based on paragraph 14]
16. [Complete answer based on paragraph 15]
17. [Complete answer]
18. [Complete answer]
19. [Main idea answer]
20. [Main idea answer]
21. [Main idea answer]
22. [Main idea answer]

RULES:
1. Write 15 paragraphs numbered (1) through (15)
2. Each paragraph 8-12 sentences, detailed and academic
3. Write 18 Short Answer questions + 4 Main Idea questions = 22 total
4. NO multiple choice. NO A/B/C/D options. ONLY open-ended questions.
5. Include Answer Key with 22 answers
6. Use academic vocabulary and complex ideas`;

export const USER_PROMPT = `Create a C1-level academic reading passage:

Topic: {{TOPIC}}
Domain: {{DOMAIN}}
Target: ~{{WORDS}} words total

Requirements:
- Title
- 15 paragraphs numbered (1) to (15), each 8-12 sentences long
- 18 Short Answer questions + 4 Main Idea questions
- Answer Key with all 22 answers
- NO multiple choice options - only open-ended questions

Write detailed, substantive academic content.`;

export function fillUserPrompt(input: {
  topic: string;
  domain: string;
  level: string;
  length: string;
  words: number;
  sidebox: boolean;
  questionTypes: string[];
}): string {
  return USER_PROMPT
    .replace('{{TOPIC}}', input.topic)
    .replace('{{DOMAIN}}', input.domain)
    .replace('{{WORDS}}', input.words.toString());
}
