// Implemented Genkit flow for flashcard generation from a document.

'use server';

/**
 * @fileOverview A flashcard generator AI agent that takes a document as input.
 *
 * - generateFlashcardsFromDocument - A function that handles the flashcard generation process.
 * - GenerateFlashcardsFromDocumentInput - The input type for the generateFlashcardsFromDocument function.
 * - GenerateFlashcardsFromDocumentOutput - The return type for the generateFlashcardsFromDocument function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFlashcardsFromDocumentInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "A PDF document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateFlashcardsFromDocumentInput = z.infer<
  typeof GenerateFlashcardsFromDocumentInputSchema
>;

const GenerateFlashcardsFromDocumentOutputSchema = z.object({
  flashcards: z
    .array(
      z.object({term: z.string(), definition: z.string()})
    )
    .describe('The generated flashcards.'),
});
export type GenerateFlashcardsFromDocumentOutput = z.infer<
  typeof GenerateFlashcardsFromDocumentOutputSchema
>;

export async function generateFlashcardsFromDocument(
  input: GenerateFlashcardsFromDocumentInput
): Promise<GenerateFlashcardsFromDocumentOutput> {
  return generateFlashcardsFromDocumentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFlashcardsFromDocumentPrompt',
  input: {schema: GenerateFlashcardsFromDocumentInputSchema},
  output: {schema: GenerateFlashcardsFromDocumentOutputSchema},
  prompt: `You are an expert educator, skilled at creating flashcards from documents.\n\n  Generate flashcards from the following document. Each flashcard should have a term and a definition.\n  The term should be a key concept from the document, and the definition should be a concise explanation of the term.\n  Ensure the flashcards are accurate and helpful for studying the material.\n\n  Document: {{media url=pdfDataUri}}`,
});

const generateFlashcardsFromDocumentFlow = ai.defineFlow(
  {
    name: 'generateFlashcardsFromDocumentFlow',
    inputSchema: GenerateFlashcardsFromDocumentInputSchema,
    outputSchema: GenerateFlashcardsFromDocumentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
