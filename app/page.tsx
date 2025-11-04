import { PromptForm } from "@/components/builder/PromptForm";
import { ReadingPreview } from "@/components/preview/ReadingPreview";
import { BookOpen } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="h-10 w-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-black">
              Academic Reading Test Generator
            </h1>
          </div>
          <p className="text-lg text-black max-w-2xl mx-auto">
            Generate C1-level BUEPT-style reading passages with comprehensive questions and answer keys
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Form */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <PromptForm />
          </div>

          {/* Right Column - Preview */}
          <div>
            <ReadingPreview />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-black">
          <p>
            Powered by Kerem Uğurlu • Built for Tuğçe Camgöz • Generate high-quality academic reading assessments
          </p>
        </footer>
      </div>
    </main>
  );
}
