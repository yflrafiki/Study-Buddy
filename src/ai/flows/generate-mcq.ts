// Generates multiple-choice questions (MCQs) from a PDF document.
'use server';
/**
 * @fileOverview Generates multiple-choice questions (MCQs) from a PDF document.
 *
 * - generateMCQs - A function that generates MCQs from a PDF document.
 * - GenerateMCQsInput - The input type for the generateMCQs function.
 * - GenerateMCQsOutput - The return type for the generateMCQs function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMCQsInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "A PDF document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  numberOfQuestions: z
    .number()
    .default(5)
    .describe('The number of multiple-choice questions to generate.'),
});
export type GenerateMCQsInput = z.infer<typeof GenerateMCQsInputSchema>;

const GenerateMCQsOutputSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string(),
      options: z.array(z.string()),
      answer: z.string(),
    })
  ),
});
export type GenerateMCQsOutput = z.infer<typeof GenerateMCQsOutputSchema>;

export async function generateMCQs(input: GenerateMCQsInput): Promise<GenerateMCQsOutput> {
  return generateMCQsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMcqPrompt',
  input: {schema: GenerateMCQsInputSchema},
  output: {schema: GenerateMCQsOutputSchema},
  prompt: `You are a teacher who specializes in creating multiple choice questions from documents.

  Create {{{numberOfQuestions}}} multiple choice questions from the following document.

  Document: {{media url=pdfDataUri}}

  Each question should have 4 possible answers, one of which is correct.
  Please provide the correct answer for each question.
  The output should be a JSON object with a list of questions. Each question should have the question text, a list of options, and the correct answer.
  `,
});

const generateMCQsFlow = ai.defineFlow(
  {
    name: 'generateMcqFlow',
    inputSchema: GenerateMCQsInputSchema,
    outputSchema: GenerateMCQsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
