import { FlashcardsClient } from '@/components/features/flashcards-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Flashcard Generator - ScholarAI',
  description: 'Generate flashcards from your notes, study materials, or uploaded PDFs.',
};

export default function FlashcardsPage() {
  return (
    <div className="p-4 sm:p-6 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-headline tracking-tight">Flashcard Generator</h1>
        <p className="text-muted-foreground">Paste your text or upload a PDF to automatically create a set of flashcards.</p>
      </header>
      <FlashcardsClient />
    </div>
  );
}
