import { config } from 'dotenv';
config();

import '@/ai/flows/ai-chatbot.ts';
import '@/ai/flows/flashcard-generator.ts';
import '@/ai/flows/mcq-generator.ts';
import '@/ai/flows/answer-questions.ts';
import '@/ai/flows/generate-mcq.ts';
import '@/ai/flows/generate-flashcards.ts';
import '@/ai/flows/cartoonify-image.ts';
// import '@/ai/flows/transcribe-and-summarize.ts';
