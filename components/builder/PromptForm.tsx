"use client";

import { useState, useEffect, type ChangeEvent, useRef, type FormEvent } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { BookOpen, Loader2, Shuffle, Sparkles } from "lucide-react";
import { getRandomTopic } from "@/lib/topics";
import { validatePassageSimple } from "@/lib/simpleValidator";

const ALL_QUESTION_TYPES = [
  "Short Answer",
  "Main Idea"
];

export function PromptForm() {
  const {
    topic,
    domain,
    level,
    length,
    sidebox,
    questionTypes,
    batchCount,
    isGenerating,
    setTopic,
    setDomain,
    setLevel,
    setLength,
    setSidebox,
    setQuestionTypes,
    setBatchCount,
    setGenerating,
    setRawContent,
    setParsedContent,
    setScorecard,
    setPassages,
    addPassage
  } = useAppStore();

  const [localQuestionTypes, setLocalQuestionTypes] = useState<string[]>(questionTypes);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [easterEggImage, setEasterEggImage] = useState("");
  const [easterEggMessage, setEasterEggMessage] = useState("");
  const [showBeautyFlow, setShowBeautyFlow] = useState(false);
  const [beautyStep, setBeautyStep] = useState(1);
  const [beautyName, setBeautyName] = useState("");
  const [beautyMood, setBeautyMood] = useState("");
  const [beautySuperpower, setBeautySuperpower] = useState("");
  const [beautySecretAdmire, setBeautySecretAdmire] = useState("");
  const [badPhotoPreview, setBadPhotoPreview] = useState<string | null>(null);
  const [goodPhotoPreview, setGoodPhotoPreview] = useState<string | null>(null);
  const [noBadPhoto, setNoBadPhoto] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState<
    Array<{ id: number; left: string; color: string; delay: string; duration: string; size: number }>
  >([]);
  const [showFinalCelebration, setShowFinalCelebration] = useState(false);
  const confettiTimeoutRef = useRef<number | null>(null);
  const celebrationTimeoutRef = useRef<number | null>(null);
  const [showDictionary, setShowDictionary] = useState(false);
  const [dictionaryWord, setDictionaryWord] = useState("");
  const [dictionaryResult, setDictionaryResult] = useState<{ meaning: string; example: string } | null>(null);
  const [dictionaryError, setDictionaryError] = useState<string | null>(null);
  const [dictionaryLoading, setDictionaryLoading] = useState(false);

  const beautyStepLabels = [
    "Tanışma",
    "Kötü Foto",
    "Favori Foto",
    "Analiz",
    "Sonuç"
  ];

  // Easter egg trigger - check topic for secret keywords
  useEffect(() => {
    const topicLower = topic.toLowerCase();
    
    if (topicLower.includes("tuğçe")) {
      setShowEasterEgg(true);
      setEasterEggImage("/IMG_0220.PNG");
      setEasterEggMessage("Minik bir sürpriz daha! 🎉");
    } else if (topicLower.includes("kerem")) {
      setShowEasterEgg(true);
      setEasterEggImage("/foto2.JPG");
      setEasterEggMessage("Başka benim olduğum foto yoktu");
    } else {
      setShowEasterEgg(false);
      setEasterEggImage("");
      setEasterEggMessage("");
    }
  }, [topic]);

  const triggerConfetti = () => {
    if (typeof window === "undefined") {
      return;
    }
    if (!showConfetti) {
      setShowConfetti(true);
    }
    if (confettiTimeoutRef.current !== null) {
      window.clearTimeout(confettiTimeoutRef.current);
      confettiTimeoutRef.current = null;
    }
    const palette = ["#f97316", "#ec4899", "#8b5cf6", "#22d3ee", "#facc15", "#34d399"];
    const pieces = Array.from({ length: 45 }, (_, index) => ({
      id: index,
      left: `${Math.random() * 100}%`,
      color: palette[Math.floor(Math.random() * palette.length)],
      delay: `${Math.random() * 0.4}s`,
      duration: `${2.8 + Math.random() * 1.4}s`,
      size: Math.floor(Math.random() * 10) + 6
    }));
    setConfettiPieces(pieces);
    confettiTimeoutRef.current = window.setTimeout(() => {
      setShowConfetti(false);
      setConfettiPieces([]);
      confettiTimeoutRef.current = null;
    }, 3200);
  };

  const resetBeautyFlow = () => {
    setBeautyStep(1);
    setBeautyName("");
    setBeautyMood("");
    setBeautySuperpower("");
    setBeautySecretAdmire("");
    setNoBadPhoto(false);
    if (confettiTimeoutRef.current !== null && typeof window !== "undefined") {
      window.clearTimeout(confettiTimeoutRef.current);
      confettiTimeoutRef.current = null;
    }
    if (celebrationTimeoutRef.current !== null && typeof window !== "undefined") {
      window.clearTimeout(celebrationTimeoutRef.current);
      celebrationTimeoutRef.current = null;
    }
    if (badPhotoPreview) {
      URL.revokeObjectURL(badPhotoPreview);
    }
    if (goodPhotoPreview) {
      URL.revokeObjectURL(goodPhotoPreview);
    }
    setBadPhotoPreview(null);
    setGoodPhotoPreview(null);
    setShowConfetti(false);
    setConfettiPieces([]);
    setShowFinalCelebration(false);
  };

  useEffect(() => {
    if (showBeautyFlow && beautyStep === 4) {
      const timer = setTimeout(() => {
        setBeautyStep(5);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [beautyStep, showBeautyFlow]);

  useEffect(() => {
    if (beautyStep === 5) {
      triggerConfetti();
      setShowFinalCelebration(true);
      if (celebrationTimeoutRef.current !== null && typeof window !== "undefined") {
        window.clearTimeout(celebrationTimeoutRef.current);
      }
      celebrationTimeoutRef.current = typeof window !== "undefined" ? window.setTimeout(() => {
        setShowFinalCelebration(false);
        celebrationTimeoutRef.current = null;
      }, 4000) : null;
    }
  }, [beautyStep]);

  const handleOpenBeautyFlow = () => {
    resetBeautyFlow();
    setShowBeautyFlow(true);
  };

  const handleCloseBeautyFlow = () => {
    if (confettiTimeoutRef.current !== null && typeof window !== "undefined") {
      window.clearTimeout(confettiTimeoutRef.current);
      confettiTimeoutRef.current = null;
    }
    if (celebrationTimeoutRef.current !== null && typeof window !== "undefined") {
      window.clearTimeout(celebrationTimeoutRef.current);
      celebrationTimeoutRef.current = null;
    }
    resetBeautyFlow();
    setShowBeautyFlow(false);
  };

  const resetDictionary = () => {
    setDictionaryWord("");
    setDictionaryResult(null);
    setDictionaryError(null);
    setDictionaryLoading(false);
  };

  const handleOpenDictionary = () => {
    resetDictionary();
    setShowDictionary(true);
  };

  const handleCloseDictionary = () => {
    resetDictionary();
    setShowDictionary(false);
  };

  const handleDictionaryLookup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = dictionaryWord.trim();
    if (!trimmed) {
      setDictionaryError("Bir kelime yazmalısın.");
      return;
    }

    setDictionaryError(null);
    setDictionaryLoading(true);

    try {
      const response = await fetch("/api/dictionary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: trimmed })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.details || "Sözlük kaydı alınamadı.");
      }

      const data = await response.json();
      setDictionaryResult(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Beklenmeyen bir hata oluştu.";
      setDictionaryError(message);
      setDictionaryResult(null);
    } finally {
      setDictionaryLoading(false);
    }
  };

  const handleBadPhotoUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (badPhotoPreview) {
      URL.revokeObjectURL(badPhotoPreview);
    }
    const url = URL.createObjectURL(file);
    setBadPhotoPreview(url);
    setNoBadPhoto(false);
  };

  const handleGoodPhotoUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (goodPhotoPreview) {
      URL.revokeObjectURL(goodPhotoPreview);
    }
    const url = URL.createObjectURL(file);
    setGoodPhotoPreview(url);
  };

  const handleRandomTopic = () => {
    const randomTopic = getRandomTopic();
    setTopic(randomTopic.topic);
    setDomain(randomTopic.domain);
  };

  const handleQuestionTypeToggle = (type: string) => {
    if (localQuestionTypes.includes(type)) {
      setLocalQuestionTypes(localQuestionTypes.filter(t => t !== type));
    } else {
      setLocalQuestionTypes([...localQuestionTypes, type]);
    }
  };

  const validatePassage = (raw: string) => {
    const result = validatePassageSimple(raw);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('\n📊 Validation:', result.isValid ? '✅ PASS' : '❌ FAIL');
      console.log(`Score: ${result.score}%`);
      console.log(`Paragraphs: ${result.stats.paragraphs}, Questions: ${result.stats.totalQuestions}, Answers: ${result.stats.totalAnswers}`);
      if (result.issues.length > 0) {
        console.log('Issues:', result.issues.join(', '));
      }
    }
    
    return result;
  };

  const generateSinglePassage = async (passageId: number, retryCount = 0, useRandomTopic = false): Promise<any> => {
    const maxRetries = 5;
    
    // Use random topic if requested (for batch generation)
    let currentTopic = topic;
    let currentDomain = domain;
    
    if (useRandomTopic || batchCount > 1) {
      const randomPick = getRandomTopic();
      currentTopic = randomPick.topic;
      currentDomain = randomPick.domain;
    }
    
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: currentTopic,
        domain: currentDomain,
        level,
        length,
        sidebox,
        questionTypes: localQuestionTypes,
        language: "EN",
        retryCount,
        strictMode: retryCount > 0
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("❌ API Error:", errorData);
      throw new Error(errorData.error || errorData.details || "Generation failed - check API key");
    }

    const data = await response.json();
    
    // Use simple validation
    const validation = validatePassage(data.raw);
    
    // If validation fails and we have retries left, try again
    if (!validation.isValid && retryCount < maxRetries) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔄 Retry ${retryCount + 1}/${maxRetries}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      return generateSinglePassage(passageId, retryCount + 1, useRandomTopic);
    }
    
    // Return passage
    return {
      id: passageId,
      raw: data.raw,
      parsed: data.parsed,
      scorecard: data.scorecard,
      validation,
      retryCount,
      needsRegeneration: !validation.isValid,
      topicUsed: currentTopic
    };
  };

  const handleGenerate = async () => {
      if (localQuestionTypes.length < 1) {
      alert("Please select at least 1 question type");
      return;
    }

    setQuestionTypes(localQuestionTypes);
    setGenerating(true);
    setRawContent("");
    setParsedContent(null);
    setScorecard(null);
    setPassages([]); // Clear previous passages

    try {
      const generatedPassages = [];

      for (let i = 0; i < batchCount; i++) {
        console.log(`\n🎯 Generating Passage ${i + 1} of ${batchCount}...`);
        
        // Use random topics for batch generation
        const useRandomTopic = batchCount > 1;
        const passage = await generateSinglePassage(i + 1, 0, useRandomTopic);
        
        if (passage.retryCount > 0) {
          console.log(`✅ Passage ${i + 1} generated after ${passage.retryCount} automatic adjustments`);
        } else {
          console.log(`✅ Passage ${i + 1} generated successfully`);
        }
        
        generatedPassages.push(passage);
        
        // Update store with all passages so far
        setPassages([...generatedPassages]);
        
        // Keep last one for backward compatibility
        setRawContent(passage.raw);
        setParsedContent(passage.parsed);
        setScorecard(passage.scorecard);
      }
      
      // Check if any passages need regeneration (silent, no user notification)
      const failedPassages = generatedPassages.filter(p => p.needsRegeneration);
      if (failedPassages.length > 0 && process.env.NODE_ENV === 'development') {
        console.log(`ℹ️ ${failedPassages.length} passage(s) may need manual adjustment`);
      }
      
    } catch (error) {
      console.error("❌ Generation error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      if (errorMessage.includes("API key") || errorMessage.includes("401") || errorMessage.includes("authentication")) {
        alert("❌ OpenAI API Key Error!\n\n1. Make sure you have .env.local file\n2. Add your API key: OPENAI_API_KEY=sk-...\n3. Restart the dev server (npm run dev)\n\nCheck console for details.");
      } else {
        alert(`❌ Generation failed: ${errorMessage}\n\nCheck browser console for details.`);
      }
    } finally {
      setGenerating(false);
    }
  };

  const getWordCount = () => {
    switch (length) {
      case "short": return 800;
      case "medium": return 1200;
      case "long": return 1800;
      default: return 1800;
    }
  };

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-sm border">
      <div>
        <h2 className="text-2xl font-bold mb-2 text-gray-900">Generate Reading Passage</h2>
        <p className="text-sm text-gray-900">Configure parameters for your C1-level academic reading test</p>
      </div>

      <div className="space-y-4">
        {/* Topic */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <Label htmlFor="topic">Topic {batchCount === 1 ? '*' : '(Auto-Random)'}</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRandomTopic}
              disabled={isGenerating || batchCount > 1}
            >
              <Shuffle className="h-4 w-4 mr-1" />
              Random Pick
            </Button>
          </div>
          <Input
            id="topic"
            value={batchCount > 1 ? "🎲 Random topics will be used" : topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., AI and Cultural Memory"
            className="mt-1"
            disabled={batchCount > 1 || isGenerating}
          />
          {batchCount > 1 && (
            <p className="text-xs text-blue-600 mt-1">
              Each passage will use a different random topic automatically
            </p>
          )}
        </div>

        {/* Domain */}
        <div>
          <Label htmlFor="domain">Domain {batchCount > 1 ? '(Auto-Random)' : ''}</Label>
          <Input
            id="domain"
            value={batchCount > 1 ? "🎲 Random domains will be used" : domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="e.g., science/philosophy"
            className="mt-1"
            disabled={batchCount > 1 || isGenerating}
          />
        </div>

        {/* Level */}
        <div>
          <Label htmlFor="level">Level</Label>
          <Select value={level} onValueChange={(value: "B2" | "C1") => setLevel(value)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="B2">B2</SelectItem>
              <SelectItem value="C1">C1</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Length */}
        <div>
          <Label htmlFor="length">Length (~{getWordCount()} words)</Label>
          <Select value={length} onValueChange={(value: "short" | "medium" | "long") => setLength(value)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="short">Short (~800 words)</SelectItem>
              <SelectItem value="medium">Medium (~1200 words)</SelectItem>
              <SelectItem value="long">Long (~1800 words)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Batch Count */}
        <div>
          <Label htmlFor="batch-count">Number of Passages to Generate</Label>
          <Select value={batchCount.toString()} onValueChange={(value) => setBatchCount(parseInt(value))}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} {num === 1 ? 'passage' : 'passages'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Question Types */}
        <div>
          <Label className="mb-2 block text-gray-900 font-semibold">Question Types * (select all recommended)</Label>
          <div className="grid grid-cols-2 gap-2 p-4 bg-gray-50 rounded-md max-h-64 overflow-y-auto">
            {ALL_QUESTION_TYPES.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={type}
                  checked={localQuestionTypes.includes(type)}
                  onCheckedChange={() => handleQuestionTypeToggle(type)}
                />
                <Label htmlFor={type} className="text-sm cursor-pointer text-gray-900 font-medium">
                  {type}
                </Label>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-900 mt-1 font-medium">
            Selected: {localQuestionTypes.length} / {ALL_QUESTION_TYPES.length}
          </p>
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !topic || localQuestionTypes.length < 1}
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating {batchCount > 1 ? `${batchCount} Passages` : 'Passage'}...
            </>
          ) : (
            `Generate ${batchCount > 1 ? `${batchCount} Reading Passages` : 'Reading Passage'}`
          )}
        </Button>
      </div>

      {/* Easter Egg Dialog */}
      <Dialog open={showEasterEgg} onOpenChange={setShowEasterEgg}>
        <DialogContent className="max-w-2xl">
          <DialogTitle className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 animate-in slide-in-from-top text-center">
            ✨ Sürpriiiiz! ✨
          </DialogTitle>
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Sparkles className="h-12 w-12 text-yellow-500 animate-pulse" />
            </div>
            <p className="text-xl text-gray-700 font-semibold animate-in slide-in-from-bottom">
              Easter egg bulundu! 🎊
            </p>
            
            {/* Fotoğraf */}
            {easterEggImage && (
              <div className="relative overflow-hidden rounded-xl shadow-2xl border-4 border-gradient-to-r from-purple-400 to-pink-400">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-200/20 to-pink-200/20 animate-pulse"></div>
                <img 
                  src={easterEggImage} 
                  alt="Special Surprise" 
                  className="w-full h-auto max-h-[70vh] object-contain animate-in zoom-in duration-700 relative z-10"
                />
              </div>
            )}
            
            <p className="text-sm text-gray-600 italic font-medium">
              {easterEggMessage || "Tuğçe Camgöz için yapıldı!"}
            </p>
            
            <Button 
              onClick={() => setShowEasterEgg(false)}
              className="mx-auto"
            >
              Teşekkürler! 😊
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dictionary Dialog */}
      <Dialog
        open={showDictionary}
        onOpenChange={(open) => {
          if (open) {
            resetDictionary();
            setShowDictionary(true);
          } else {
            handleCloseDictionary();
          }
        }}
      >
        <DialogContent className="w-full max-w-lg rounded-2xl border border-indigo-100 bg-white px-6 py-6 shadow-xl sm:px-8">
          <DialogTitle className="text-center text-2xl font-semibold text-indigo-600">
            📚 Mini Sözlük
          </DialogTitle>
          <p className="mt-2 text-center text-sm text-gray-600">
            Kelimeyi yaz, Türkçe açıklamasını ve şık bir İngilizce örneğini hemen görelim.
          </p>

          <form className="mt-5 space-y-4" onSubmit={handleDictionaryLookup}>
            <div className="space-y-2">
              <Label htmlFor="dictionary-word" className="text-sm font-semibold text-gray-900">
                Kelime
              </Label>
              <Input
                id="dictionary-word"
                value={dictionaryWord}
                onChange={(event) => setDictionaryWord(event.target.value)}
                placeholder="Örn. serendipity"
                autoComplete="off"
                autoFocus
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-indigo-500 hover:bg-indigo-600"
              disabled={dictionaryLoading || dictionaryWord.trim().length === 0}
            >
              {dictionaryLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Yorumlar hazırlanıyor...
                </>
              ) : (
                "Anlamını Göster"
              )}
            </Button>
          </form>

          {dictionaryError && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {dictionaryError}
            </div>
          )}

          {dictionaryResult && (
            <div className="mt-5 space-y-4 rounded-2xl bg-gradient-to-br from-indigo-50 via-white to-indigo-100/60 p-5 shadow-inner">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-indigo-700">Türkçe Anlamı</h3>
                <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">
                  {dictionaryResult.meaning}
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold uppercase tracking-wide text-indigo-500">İngilizce Örnek</h4>
                <p className="rounded-xl border border-indigo-200 bg-white/80 px-4 py-3 text-sm italic text-gray-700 shadow-sm">
                  {dictionaryResult.example}
                </p>
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <Button
              type="button"
              variant="ghost"
              onClick={handleCloseDictionary}
              className="text-sm font-medium text-indigo-500 hover:text-indigo-600"
            >
              Kapat ve Reading’e geri dön
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Beauty Flow Dialog */}
      <Dialog
        open={showBeautyFlow}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseBeautyFlow();
          } else {
            handleOpenBeautyFlow();
          }
        }}
      >
        <DialogContent className="flex w-full max-w-xl max-h-[calc(100vh-32px)] flex-col overflow-hidden bg-white p-0 shadow-xl sm:max-w-2xl">
          {showConfetti && (
            <div className="pointer-events-none absolute inset-0 overflow-hidden z-20" aria-hidden="true">
              {confettiPieces.map((piece) => (
                <span
                  key={piece.id}
                  className="confetti-piece"
                  style={{
                    left: piece.left,
                    backgroundColor: piece.color,
                    animationDelay: piece.delay,
                    animationDuration: piece.duration,
                    width: `${piece.size}px`,
                    height: `${piece.size * 1.5}px`
                  }}
                />
              ))}
            </div>
          )}

          <div className="relative z-10 flex flex-1 min-h-0 flex-col">
            <div className="flex flex-col gap-3 border-b bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <DialogTitle className="text-lg font-bold text-gray-900 text-center sm:text-2xl sm:text-left">
                ⭐ Kusursuzluk Testi (Tamamen Ciddiyetsiz) ⭐
              </DialogTitle>
              <div className="flex items-center justify-center gap-3 text-sm text-gray-600 sm:justify-end">
                <span className="font-medium">
                  Adım {beautyStep} / {beautyStepLabels.length}
                </span>
                <div className="flex items-center gap-1.5">
                  {beautyStepLabels.map((label, index) => {
                    const sequence = index + 1;
                    const isComplete = sequence < beautyStep;
                    const isCurrent = sequence === beautyStep;
                    const widthClass = isCurrent ? "w-10" : isComplete ? "w-8" : "w-5";
                    const colorClass = isCurrent ? "bg-pink-500" : isComplete ? "bg-pink-400" : "bg-gray-200";
                    return (
                      <div
                        key={label}
                        className={`h-2 rounded-full transition-all duration-300 ${widthClass} ${colorClass}`}
                        title={`Adım ${sequence}: ${label}`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex-1 min-h-0 space-y-6 overflow-y-auto bg-gray-50 px-4 py-5 sm:px-6">
              {beautyStep === 1 && (
                <div className="space-y-5">
                  <p className="text-center text-gray-700">
                    Önce birkaç soruyla seni biraz tanıyalım. Bu bilgiler sadece övgülerini özelleştirmek için kullanılır.
                  </p>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-gray-900 font-semibold">Adın nedir?</Label>
                      <Input
                        value={beautyName}
                        onChange={(event) => {
                          const value = event.target.value;
                          setBeautyName(value);
                          const normalized = value.trim().toLowerCase();
                          if (normalized === "tuğçe" || normalized === "tugce") {
                            triggerConfetti();
                          }
                        }}
                        placeholder="Burası tamamen gizli bir alan..."
                        className="text-gray-900"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-900 font-semibold">
                        Bugünkü ruh halini tek kelimeyle anlat{" "}
                        <span className="font-normal text-pink-500">(bu kısma kötü bir şey yazamazsınız)</span>
                      </Label>
                      <Input
                        value={beautyMood}
                        onChange={(event) => setBeautyMood(event.target.value)}
                        placeholder="Örn. ışıl ışıl, şahane, efsanevi..."
                        className="text-gray-900"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-900 font-semibold">Güzellik süper gücün nedir?</Label>
                      <Input
                        value={beautySuperpower}
                        onChange={(event) => setBeautySuperpower(event.target.value)}
                        placeholder="Örn. gülüşüm, gözlerim, enerjim..."
                        className="text-gray-900"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-900 font-semibold">Sana gizliden hayran olan biri ne söylerdi?</Label>
                      <Input
                        value={beautySecretAdmire}
                        onChange={(event) => setBeautySecretAdmire(event.target.value)}
                        placeholder="Bir sır veriyoruz, burada kalıyor..."
                        className="text-gray-900"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCloseBeautyFlow}
                      className="sm:hidden"
                    >
                      Vazgeç
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setBeautyStep(2)}
                      disabled={!beautyName || !beautyMood || !beautySuperpower}
                    >
                      Sıradaki adım →
                    </Button>
                  </div>
                </div>
              )}

              {beautyStep === 2 && (
                <div className="space-y-5">
                  <div className="space-y-3">
                    <p className="text-center text-gray-700 font-medium">
                      Şimdi senden <span className="font-semibold">sözde kötü</span> bir fotoğraf istiyoruz. Elbette bu tamamen bilimsel bir test(!)
                    </p>
                    <label
                      htmlFor="bad-photo-upload"
                      className="block w-full cursor-pointer rounded-xl border-2 border-dashed border-pink-300 bg-white p-6 text-center transition hover:border-pink-400"
                    >
                      <input
                        id="bad-photo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleBadPhotoUpload}
                      />
                      <div className="space-y-2 text-pink-600">
                        <Sparkles className="mx-auto h-8 w-8" />
                        <p className="font-semibold">“Kötü” fotoğrafını yüklemek için tıkla</p>
                        <p className="text-xs text-pink-500">Merak etme, hiçbir yere kaydetmiyoruz.</p>
                      </div>
                    </label>
                  </div>
                  {badPhotoPreview && (
                    <div className="space-y-3">
                      <div className="relative overflow-hidden rounded-xl border shadow-sm">
                        <img
                          src={badPhotoPreview}
                          alt="Kötü fotoğraf (sözde)"
                          className="h-auto max-h-[55vh] w-full object-cover object-center sm:max-h-72"
                        />
                      </div>
                      <div className="rounded-lg border border-amber-200 bg-amber-100 p-4 text-center text-sm font-semibold text-amber-700">
                        Kötü fotoğraf demiştik. Bu fazla güzel. Bilim kurulunu zor durumda bırakıyorsun.
                      </div>
                      <div className="flex items-start gap-2">
                        <Checkbox
                          id="no-bad-photo"
                          checked={noBadPhoto}
                          onCheckedChange={(value) => setNoBadPhoto(value === true)}
                        />
                        <Label htmlFor="no-bad-photo" className="cursor-pointer text-sm leading-relaxed text-gray-900">
                          Çok güzel olduğum için kötü fotoğrafım yok.
                        </Label>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setBeautyStep(1)}>
                      ← Geri dön
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setBeautyStep(3)}
                      disabled={!badPhotoPreview || !noBadPhoto}
                    >
                      Tamam, kabul edin güzelliği →
                    </Button>
                  </div>
                </div>
              )}

              {beautyStep === 3 && (
                <div className="space-y-5">
                  <p className="text-center text-gray-700 font-medium">
                    Şimdi de favori fotoğraflarından birini paylaş. Sadece görmek istiyoruz, hiçbir yere kaydedilmiyor. 💖
                  </p>
                    <label
                      htmlFor="good-photo-upload"
                      className="block w-full cursor-pointer rounded-xl border-2 border-dashed border-indigo-300 bg-white p-6 text-center transition hover:border-indigo-400"
                    >
                    <input
                      id="good-photo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleGoodPhotoUpload}
                    />
                    <div className="space-y-2 text-indigo-600">
                      <Sparkles className="mx-auto h-8 w-8" />
                      <p className="font-semibold">En çok sevdiğin fotoğrafı yüklemek için tıkla</p>
                      <p className="text-xs text-indigo-500">Güzellik algılarımızı kalibre ediyoruz (!)</p>
                    </div>
                  </label>
                  {goodPhotoPreview && (
                    <div className="space-y-3">
                      <div className="relative overflow-hidden rounded-xl border shadow-sm">
                        <img
                          src={goodPhotoPreview}
                          alt="Güzel fotoğraf"
                          className="h-auto max-h-[55vh] w-full object-cover object-center sm:max-h-72"
                        />
                      </div>
                      <p className="text-center text-sm text-indigo-600">
                        *Bu fotoğraf sadece bu sayfada kalıyor. Sonrasında tamamen unutuyoruz.*
                      </p>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setBeautyStep(2)}>
                      ← Geri dön
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setBeautyStep(4)}
                      disabled={!goodPhotoPreview}
                    >
                      Analizi Başlat →
                    </Button>
                  </div>
                </div>
              )}

              {beautyStep === 4 && (
                <div className="flex flex-col items-center gap-4 py-10 text-center">
                  <Loader2 className="h-10 w-10 animate-spin text-pink-500" />
                  <p className="text-lg font-semibold text-gray-900">
                    Güzellik katsayısı hesaplanıyor...
                  </p>
                  <p className="max-w-sm text-sm text-gray-600">
                    Bilimsel olmayan algoritmalarımız şu anda ekran başında büyülenmiş durumda. Lütfen birkaç saniye bekleyiniz.
                  </p>
                </div>
              )}

              {beautyStep === 5 && (
                <div className="space-y-4 pb-6 text-center text-sm leading-relaxed sm:text-base">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-pink-600 sm:text-2xl">Sonuç: Resmen kusursuzsun! ✨</h3>
                    {beautyName && (
                      <p className="text-gray-700">
                        {beautyName} olarak resmen yeni güzellik standardı ilan edildin.
                      </p>
                    )}
                    <p className="text-gray-700">
                      {beautyMood
                        ? `Bugünkü ruh halini “${beautyMood}” olarak belirtmen kesinlikle doğru: o enerji şu an bu sayfayı aydınlatıyor.`
                        : "Bugün bile ışığınla ortalığı parlatıyorsun."}
                    </p>
                    {beautySuperpower && (
                      <p className="text-gray-700">
                        Güzellik süper gücün: <span className="font-semibold">{beautySuperpower}</span>. Bunu fark etmeyenler için göz doktoru randevusu ayarlayıp gönderiyoruz.
                      </p>
                    )}
                    {beautySecretAdmire && (
                      <p className="text-gray-700 italic">
                        Gizli hayran mesajı: “{beautySecretAdmire}” — bu sözlerin sahibi kim bilmiyoruz ama haklıymış.
                      </p>
                    )}
                  </div>
                  <div className="space-y-2 rounded-xl border border-pink-200 bg-pink-50 p-4 text-pink-700 sm:p-5">
                    <p className="font-semibold">Ayrıca bilim kurulunun ortak kararı şu:</p>
                    <p>
                      “Kötü fotoğraf diye bir şeyin yok. Yüklediğin her şey başyapıt.” Bu yüzden test burada bitiyor, çünkü sensiz grafikleri gösteremiyoruz — grafikleri bile görünmez kılıyor güzelliğin.
                    </p>
                  </div>
                  {beautyName && (
                    <p className="text-sm text-gray-600">
                      Not düşüldü: {beautyName} = “görsel başyapıt”. Başka sorusu olan?
                    </p>
                  )}
                  <p className="text-xs uppercase tracking-widest text-gray-400">
                    made by onedio
                  </p>
                  <Button type="button" onClick={handleCloseBeautyFlow}>
                    Teşekkürler, moralim şahlandı! Reading çözmeye devam edebilirim.
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {showFinalCelebration && (
        <div className="fixed inset-0 z-[60] pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-100/70 via-white/60 to-purple-100/70 animate-pulse" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-4 text-center">
            <span className="text-3xl sm:text-5xl font-bold text-pink-500 animate-bounce">
              🎉 O H A! 🎉
            </span>
            <p className="max-w-xl text-base sm:text-lg text-gray-700 bg-white/80 px-4 py-3 rounded-full shadow-sm">
              Bütün algoritmalar şaşkın, yüzünün parlatıcı kreme bile ihtiyacı yok.
            </p>
          </div>
        </div>
      )}

      <div className="pt-4 border-t space-y-6">
        <div className="flex flex-col gap-3 rounded-lg border border-indigo-100 bg-indigo-50/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-indigo-700">Kelimeye takıldın mı?</p>
            <p className="text-xs text-indigo-500">
              Mini sözlükten Türkçe anlamı ve havalı bir İngilizce örneği hemen yakala.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleOpenDictionary}
            className="w-full border-indigo-200 text-indigo-600 hover:bg-indigo-500 hover:text-white sm:w-auto"
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Sözlüğe Git
          </Button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-600">
            Moral takviyesi mi lazım? Minik bir sürprizle günü güzelleştirebilirsin.
          </p>
          <Button
            type="button"
            variant="secondary"
            onClick={handleOpenBeautyFlow}
            className="w-full sm:w-auto"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Hızlı Jest: Güzellik Analizi
          </Button>
        </div>
      </div>
    </div>
  );
}

