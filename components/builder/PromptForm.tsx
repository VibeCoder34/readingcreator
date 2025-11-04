"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Shuffle } from "lucide-react";
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
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Generate Reading Passage</h2>
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
    </div>
  );
}

