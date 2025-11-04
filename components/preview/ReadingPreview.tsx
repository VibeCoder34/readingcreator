"use client";

import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Download, FileText, RefreshCcw } from "lucide-react";
import { useState } from "react";

export function ReadingPreview() {
  const { passages, isGenerating, updatePassage, topic, domain, level, length, sidebox, questionTypes } = useAppStore();
  const [isExporting, setIsExporting] = useState(false);
  const [regeneratingId, setRegeneratingId] = useState<number | null>(null);

  const handleRegeneratePassage = async (passageId: number) => {
    setRegeneratingId(passageId);
    
    try {
      console.log(`🔄 Regenerating Passage ${passageId}...`);
      
      let retryCount = 0;
      const maxRetries = 3;
      let success = false;
      
      while (!success && retryCount <= maxRetries) {
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic,
            domain,
            level,
            length,
            sidebox,
            questionTypes,
            language: "EN",
            retryCount
          })
        });

        if (!response.ok) {
          throw new Error("Regeneration failed");
        }

        const data = await response.json();
        
        // Simple validation check
        const isValid = data.scorecard.score >= 80;
        
        if (isValid) {
          // Success! Update the passage
          const updatedPassage = {
            id: passageId,
            raw: data.raw,
            parsed: data.parsed,
            scorecard: data.scorecard,
            retryCount,
            needsRegeneration: false
          };
          
          updatePassage(passageId, updatedPassage);
          console.log(`✅ Passage ${passageId} regenerated successfully!`);
          success = true;
        } else {
          retryCount++;
          console.warn(`❌ Regeneration attempt ${retryCount}/${maxRetries + 1} failed. Retrying...`);
          
          if (retryCount <= maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
      
      if (!success) {
        alert(`Failed to regenerate Passage ${passageId} after ${maxRetries + 1} attempts. Please try again.`);
      }
      
    } catch (error) {
      console.error("Regeneration error:", error);
      alert(`Failed to regenerate Passage ${passageId}. Please try again.`);
    } finally {
      setRegeneratingId(null);
    }
  };

  if (passages.length === 0 && !isGenerating) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm border">
        <div className="text-center text-black py-12">
          <FileText className="h-16 w-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-semibold">No content generated yet</p>
          <p className="text-sm mt-2">Fill out the form and click Generate to create reading passages</p>
        </div>
      </div>
    );
  }

  const escapeHtml = (text: string) => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      // Create HTML for print
      let html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Reading Passages</title>
  <style>
    @page { size: A4; margin: 2cm; }
    body { font-family: 'Times New Roman', Georgia, serif; font-size: 12pt; line-height: 1.6; color: #000; }
    h1 { text-align: center; font-size: 20pt; margin: 1em 0; page-break-after: avoid; }
    h2 { font-size: 16pt; margin: 1.5em 0 0.5em; border-bottom: 2px solid #000; padding-bottom: 0.3em; page-break-after: avoid; }
    h3 { font-size: 14pt; margin: 1em 0 0.5em; font-weight: bold; page-break-after: avoid; }
    p { margin: 0.8em 0; text-align: justify; }
    .passage-separator { page-break-before: always; border-top: 3px solid #000; margin: 2em 0; padding-top: 1em; }
    .answer-section { page-break-before: always; margin-top: 2em; }
    .question { margin: 1em 0; }
    .answer { margin: 0.5em 0 0.5em 1em; }
    @media print {
      body { -webkit-print-color-adjust: exact; }
      h1, h2, h3 { page-break-after: avoid; }
    }
  </style>
</head>
<body>
`;

      passages.forEach((passage, idx) => {
        if (idx > 0) html += `<div class="passage-separator"></div>`;
        
        html += `<h1>Passage ${passage.id}: ${escapeHtml(passage.parsed.title)}</h1>`;
        html += `<h2>Reading Text</h2>`;
        
        passage.parsed.paragraphs.forEach(para => {
          html += `<p>${escapeHtml(para)}</p>`;
        });
        
        html += `<h2>Questions for Passage ${passage.id}</h2>`;
        Object.entries(passage.parsed.questions).forEach(([label, items]) => {
          html += `<h3>${escapeHtml(label)}</h3>`;
          items.forEach(item => {
            html += `<div class="question">${escapeHtml(item)}</div>`;
          });
        });
      });

      html += `<div class="answer-section"><h2>Answer Keys</h2>`;
      passages.forEach((passage) => {
        html += `<h3>Passage ${passage.id} - Answer Key</h3>`;
        if (passage.parsed.answerKey?.length > 0) {
          passage.parsed.answerKey.forEach(answer => {
            html += `<div class="answer">${escapeHtml(answer)}</div>`;
          });
        }
      });
      html += `</div></body></html>`;

      // Download HTML
      const blob = new Blob([html], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reading-passages-${Date.now()}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      // Open for printing
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 500);
      }
    } catch (error) {
      console.error("PDF export error:", error);
      alert("PDF export failed");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportDocx = async () => {
    setIsExporting(true);
    try {
      // Send all passages to DOCX endpoint
      const response = await fetch("/api/export/docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passages: passages.map(p => p.parsed) })
      });

      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reading-passages-${Date.now()}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("DOCX export error:", error);
      alert("DOCX export failed");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Export Buttons */}
      <div className="flex gap-2 justify-end sticky top-0 bg-white/95 backdrop-blur z-10 p-4 rounded-lg shadow-sm border">
        <Button 
          onClick={handleExportDocx} 
          disabled={isExporting || passages.length === 0}
          variant="default"
          size="lg"
        >
          <Download className="mr-2 h-4 w-4" />
          {isExporting ? 'Exporting...' : 'Export DOCX'}
        </Button>
        <Button 
          onClick={handleExportPdf} 
          disabled={isExporting || passages.length === 0}
          variant="outline"
          size="lg"
        >
          <Download className="mr-2 h-4 w-4" />
          {isExporting ? 'Exporting...' : 'Export PDF'}
        </Button>
      </div>

      {/* Progress Indicator */}
      {isGenerating && (
        <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
          <p className="text-sm font-medium text-blue-900">
            Generating passages... {passages.length} completed
          </p>
        </div>
      )}

      {/* Success Banner */}
      {passages.length > 0 && !isGenerating && (
        <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded">
          <h3 className="font-bold text-green-900 mb-2">✅ Generation Complete</h3>
          <p className="text-sm text-green-800">
            {passages.length} {passages.length === 1 ? 'passage' : 'passages'} generated successfully
            {passages.some(p => p.retryCount && p.retryCount > 0) && ' with automatic quality adjustments'}
          </p>
        </div>
      )}

      {/* Passages with Questions */}
      {passages.map((passage, idx) => (
        <div key={passage.id} className="space-y-6">
          {/* Passage Divider */}
          {idx > 0 && (
            <div className="border-t-4 border-gray-300 pt-6">
              <div className="text-center text-gray-500 text-sm font-medium">• • •</div>
            </div>
          )}

          {/* Passage Number Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center justify-center w-12 h-12 rounded-full text-white font-bold text-lg ${
                passage.scorecard.score >= 80 ? 'bg-green-600' : 
                passage.scorecard.score >= 60 ? 'bg-yellow-600' : 'bg-red-600'
              }`}>
                {passage.id}
              </span>
              <div>
                <h2 className="text-xl font-bold text-black">Passage {passage.id}</h2>
                {passage.topicUsed && passages.length > 1 && (
                  <p className="text-xs text-gray-500 mb-1">Topic: {passage.topicUsed}</p>
                )}
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm text-gray-600">
                    Quality: {passage.validation?.score || passage.scorecard.score}%
                  </p>
                  {(passage.validation?.score || passage.scorecard.score) >= 80 ? (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">Excellent</span>
                  ) : (passage.validation?.score || passage.scorecard.score) >= 60 ? (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">Good</span>
                  ) : (
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">Needs Review</span>
                  )}
                  
                  {passage.validation && (
                    <>
                      <span className="text-xs text-gray-500">|</span>
                      <span className="text-xs text-gray-600">
                        {passage.validation.stats.totalQuestions} questions, {passage.validation.stats.totalAnswers} answers
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Regenerate Button (only if needed) */}
            {passage.needsRegeneration && (
              <Button
                onClick={() => handleRegeneratePassage(passage.id)}
                disabled={regeneratingId !== null}
                variant="destructive"
                size="sm"
              >
                {regeneratingId === passage.id ? (
                  <>
                    <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  <>
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Regenerate This Passage
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Reading Text */}
          <div className="p-6 bg-white rounded-lg shadow-sm border">
            <h3 className="text-2xl font-bold mb-6 text-black">{passage.parsed.title}</h3>
            <div className="space-y-4">
              {passage.parsed.paragraphs.map((para, pIdx) => (
                <p key={pIdx} className="text-justify leading-relaxed text-black">
                  {para}
                </p>
              ))}
            </div>

            {passage.parsed.sideBox && (
              <div className="border-2 border-gray-300 p-4 mt-6 bg-gray-50 rounded">
                <h4 className="font-bold mb-2 text-black">Box A:</h4>
                <p className="text-justify text-black">{passage.parsed.sideBox}</p>
              </div>
            )}
          </div>

          {/* Validation Stats (if available) */}
          {passage.validation && passage.validation.issues.length > 0 && (
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="font-semibold text-sm text-yellow-900 mb-2">
                ⚠️ Quality Issues
              </p>
              <ul className="text-xs text-yellow-800 space-y-1">
                {passage.validation.issues.map((issue: string, idx: number) => (
                  <li key={idx}>• {issue}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Questions for this Passage */}
          <div className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg shadow-sm border-2 border-purple-200">
            <h3 className="text-xl font-bold mb-4 text-purple-900">
              Questions for Passage {passage.id}
            </h3>
            <div className="space-y-6">
              {Object.entries(passage.parsed.questions).map(([label, items], qIdx) => (
                <div key={qIdx} className="space-y-3">
                  <h4 className="text-lg font-semibold text-black bg-white px-3 py-2 rounded">{label}</h4>
                  {items.map((item, itemIdx) => (
                    <div key={itemIdx} className="pl-4 py-2 border-l-2 border-purple-300 bg-white/50 rounded">
                      <p className="whitespace-pre-wrap text-black">{item}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* Answer Keys Section - At the very end */}
      {passages.length > 0 && (
        <div className="border-t-4 border-green-600 pt-8 mt-12">
          <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow-lg border-2 border-green-300">
            <h2 className="text-2xl font-bold mb-6 text-green-900 text-center">
              📝 Answer Keys
            </h2>
            
            {passages.map((passage) => (
              <div key={`answer-${passage.id}`} className="mb-8 last:mb-0">
                <h3 className="text-lg font-bold mb-3 text-black bg-green-100 px-4 py-2 rounded">
                  Answer Key for Passage {passage.id}
                </h3>
                
                {passage.parsed.answerKey && passage.parsed.answerKey.length > 0 ? (
                  <div className="space-y-2">
                    {passage.parsed.answerKey.map((answer, idx) => (
                      <div key={idx} className="p-3 bg-white border-l-4 border-green-500 rounded shadow-sm">
                        <p className="text-sm text-black whitespace-pre-wrap">{answer}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm text-yellow-800">No answer key found for this passage</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
