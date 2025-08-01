import { TranscriptionClient } from '@/components/features/transcription-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Note Taker - ScholarAI',
  description: 'Real-time speech-to-text transcription for your lectures and study sessions.',
};

export default function TranscriptionPage() {
  return (
    <div className="p-4 sm:p-6 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-headline tracking-tight">Note Taker</h1>
        <p className="text-muted-foreground">Use real-time transcription to capture notes from your lectures or while you study.</p>
      </header>
      <TranscriptionClient />
    </div>
  );
}
