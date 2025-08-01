// A chatbot powered by generative AI to answer questions based on uploaded content or other academic topics.
'use server';

/**
 * @fileOverview An AI chatbot flow that answers questions based on provided context.
 *
 * - aiChatbot - A function that accepts a query and context and returns an answer.
 * - AiChatbotInput - The input type for the aiChatbot function.
 * - AiChatbotOutput - The return type for the aiChatbot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiChatbotInputSchema = z.object({
  query: z.string().describe('The question to ask the chatbot.'),
  context: z.string().describe('The context to answer the question based on.'),
});
export type AiChatbotInput = z.infer<typeof AiChatbotInputSchema>;

const AiChatbotOutputSchema = z.object({
  answer: z.string().describe('The answer to the question.'),
});
export type AiChatbotOutput = z.infer<typeof AiChatbotOutputSchema>;

export async function aiChatbot(input: AiChatbotInput): Promise<AiChatbotOutput> {
  return aiChatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiChatbotPrompt',
  input: {
    schema: AiChatbotInputSchema,
  },
  output: {
    schema: AiChatbotOutputSchema,
  },
  prompt: `You are a helpful AI chatbot that answers questions based on the provided context.

Context: {{{context}}}

Question: {{{query}}}

Answer: `,
});

const aiChatbotFlow = ai.defineFlow(
  {
    name: 'aiChatbotFlow',
    inputSchema: AiChatbotInputSchema,
    outputSchema: AiChatbotOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
