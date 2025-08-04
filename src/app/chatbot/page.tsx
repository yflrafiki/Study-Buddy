import { ChatbotClient } from '@/components/features/chatbot-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Chatbot - ScholarAI',
  description: 'Ask questions based on your uploaded study materials.',
};

export default function ChatbotPage() {
  return (
    <div className="p-4 sm:p-6 md:p-8 h-full flex flex-col">
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-headline tracking-tight">AI Chatbot</h1>
        <p className="text-muted-foreground">Upload a document to ask questions about its content. The chat is stateless and does not remember past conversations.</p>
      </header>
      <ChatbotClient />
    </div>
  );
}
