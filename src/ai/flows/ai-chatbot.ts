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

// Mock search tool. In a real application, you would replace this with a call
// to a search engine API.
const searchTool = ai.defineTool(
  {
    name: 'search',
    description: 'Search for information on the web.',
    inputSchema: z.object({
      query: z.string(),
    }),
    outputSchema: z.string(),
  },
  async input => {
    // This is a mock implementation.
    // Replace with a real search API call.
    console.log(`Searching for: ${input.query}`);
    if (input.query.toLowerCase().includes('weather')) {
      return 'The weather is sunny, 25°C.';
    }
    if (input.query.toLowerCase().includes('news')) {
      return 'The top news is that AI is transforming the world.';
    }
    return 'No information found.';
  }
);


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
  tools: [searchTool],
  prompt: `You are a helpful AI chatbot that answers questions.
  If the user provides context, answer based on that context.
  If the user asks for real-time information, or something you don't know, use the search tool.

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
