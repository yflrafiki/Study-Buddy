import { ImageAnimatorClient } from '@/components/features/image-animator-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Image Animator - ScholarAI',
  description: 'Convert static images into simple animated visual aids.',
};

export default function ImageAnimatorPage() {
  return (
    <div className="p-4 sm:p-6 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-headline tracking-tight">Image Animator</h1>
        <p className="text-muted-foreground">Upload an image, turn it into a cartoon with AI, and apply simple animations.</p>
      </header>
      <ImageAnimatorClient />
    </div>
  );
}
