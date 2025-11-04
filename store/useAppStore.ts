import { create } from 'zustand';

export interface ParsedContent {
  title: string;
  paragraphs: string[];
  sideBox?: string;
  questions: Record<string, string[]>;
  answerKey: string[];
}

export interface Scorecard {
  score: number;
  checks: Array<{ id: string; pass: boolean; note?: string }>;
}

export interface GeneratedPassage {
  id: number;
  raw: string;
  parsed: ParsedContent;
  scorecard: Scorecard;
  validation?: any;
  retryCount?: number;
  needsRegeneration?: boolean;
  topicUsed?: string;
}

interface AppState {
  // Generation state
  isGenerating: boolean;
  rawContent: string;
  parsedContent: ParsedContent | null;
  scorecard: Scorecard | null;
  passages: GeneratedPassage[];
  
  // Form inputs
  topic: string;
  domain: string;
  level: "B2" | "C1";
  length: "short" | "medium" | "long";
  sidebox: boolean;
  questionTypes: string[];
  batchCount: number;
  
  // Actions
  setGenerating: (isGenerating: boolean) => void;
  setRawContent: (raw: string) => void;
  setParsedContent: (parsed: ParsedContent | null) => void;
  setScorecard: (scorecard: Scorecard | null) => void;
  setPassages: (passages: GeneratedPassage[]) => void;
  addPassage: (passage: GeneratedPassage) => void;
  updatePassage: (id: number, passage: GeneratedPassage) => void;
  setTopic: (topic: string) => void;
  setDomain: (domain: string) => void;
  setLevel: (level: "B2" | "C1") => void;
  setLength: (length: "short" | "medium" | "long") => void;
  setSidebox: (sidebox: boolean) => void;
  setQuestionTypes: (types: string[]) => void;
  setBatchCount: (count: number) => void;
  reset: () => void;
}

const DEFAULT_QUESTION_TYPES = [
  "Short Answer",
  "Main Idea"
];

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  isGenerating: false,
  rawContent: "",
  parsedContent: null,
  scorecard: null,
  passages: [],
  topic: "AI and Cultural Memory",
  domain: "science/philosophy",
  level: "C1",
  length: "long",
  sidebox: false,
  questionTypes: DEFAULT_QUESTION_TYPES,
  batchCount: 1,
  
  // Actions
  setGenerating: (isGenerating) => set({ isGenerating }),
  setRawContent: (raw) => set({ rawContent: raw }),
  setParsedContent: (parsed) => set({ parsedContent: parsed }),
  setScorecard: (scorecard) => set({ scorecard }),
  setPassages: (passages) => set({ passages }),
  addPassage: (passage) => set((state) => ({ passages: [...state.passages, passage] })),
  updatePassage: (id, passage) => set((state) => ({ 
    passages: state.passages.map(p => p.id === id ? passage : p) 
  })),
  setTopic: (topic) => set({ topic }),
  setDomain: (domain) => set({ domain }),
  setLevel: (level) => set({ level }),
  setLength: (length) => set({ length }),
  setSidebox: (sidebox) => set({ sidebox }),
  setQuestionTypes: (types) => set({ questionTypes: types }),
  setBatchCount: (count) => set({ batchCount: count }),
  reset: () => set({
    isGenerating: false,
    rawContent: "",
    parsedContent: null,
    scorecard: null,
    passages: []
  })
}));

