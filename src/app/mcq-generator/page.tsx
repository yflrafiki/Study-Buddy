import { MCQGeneratorClient } from '@/components/features/mcq-generator-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MCQ Generator - ScholarAI',
  description: 'Upload a PDF to generate multiple-choice questions automatically.',
};

export default function MCQGeneratorPage() {
  return (
    <div className="p-4 sm:p-6 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-headline tracking-tight">MCQ Generator</h1>
        <p className="text-muted-foreground">Upload a PDF to generate multiple-choice questions automatically.</p>
      </header>
      <MCQGeneratorClient />
    </div>
  );
}
