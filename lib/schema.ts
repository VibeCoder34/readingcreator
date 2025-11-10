import { z } from "zod";

export const GenInput = z.object({
  topic: z.string().min(3),
  domain: z.string().default("science/tech/philosophy/urban"),
  level: z.enum(["B2","C1"]).default("C1"),
  length: z.enum(["short","medium","long"]).default("long"),
  words: z.number().min(800).max(3000).optional(),
  sidebox: z.boolean().default(false),
  questionTypes: z.array(z.string()).min(1), // Reduced from 5 to 1
  language: z.literal("EN").default("EN")
});
export type GenInput = z.infer<typeof GenInput>;

export const GenOutput = z.object({
  raw: z.string(),
  parsed: z.object({
    title: z.string(),
    paragraphs: z.array(z.string()),
    sideBox: z.string().optional(),
    questions: z.record(z.string(), z.array(z.string())), // { "A) Vocabulary in Context": [...], ... }
    answerKey: z.array(z.string())
  }),
  scorecard: z.object({
    score: z.number(),
    checks: z.array(z.object({ id: z.string(), pass: z.boolean(), note: z.string().optional() }))
  })
});
export type GenOutput = z.infer<typeof GenOutput>;

export const DictionaryInput = z.object({
  word: z.string().min(1, "Kelime girmelisin").max(64, "Kelime çok uzun")
});
export type DictionaryInput = z.infer<typeof DictionaryInput>;

export const DictionaryOutput = z.object({
  meaning: z.string(),
  example: z.string()
});
export type DictionaryOutput = z.infer<typeof DictionaryOutput>;

