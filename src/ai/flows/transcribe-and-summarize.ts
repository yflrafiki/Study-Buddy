'use server';
/**
 * @fileOverview An AI flow to transcribe and summarize an audio file.
 *
 * - transcribeAndSummarizeAudio - Transcribes and summarizes an audio file.
 * - TranscribeAndSummarizeAudioInput - The input type for the function.
 * - TranscribeAndSummarizeAudioOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranscribeAndSummarizeAudioInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "An audio file to process, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type TranscribeAndSummarizeAudioInput = z.infer<typeof TranscribeAndSummarizeAudioInputSchema>;

const TranscribeAndSummarizeAudioOutputSchema = z.object({
  transcription: z.string().describe('The full transcription of the audio.'),
  summary: z.string().describe('A concise summary of the transcription.'),
});
export type TranscribeAndSummarizeAudioOutput = z.infer<typeof TranscribeAndSummarizeAudioOutputSchema>;

export async function transcribeAndSummarizeAudio(
  input: TranscribeAndSummarizeAudioInput
): Promise<TranscribeAndSummarizeAudioOutput> {
  return transcribeAndSummarizeAudioFlow(input);
}

const prompt = ai.definePrompt({
  name: 'transcribeAndSummarizePrompt',
  input: {schema: TranscribeAndSummarizeAudioInputSchema},
  output: {schema: TranscribeAndSummarizeAudioOutputSchema},
  prompt: `You are an expert at transcribing and summarizing audio content.

  First, transcribe the provided audio file precisely.
  Second, create a concise, bullet-pointed summary of the key topics and action items from the transcription.

  Audio: {{media url=audioDataUri}}`,
});

const transcribeAndSummarizeAudioFlow = ai.defineFlow(
  {
    name: 'transcribeAndSummarizeAudioFlow',
    inputSchema: TranscribeAndSummarizeAudioInputSchema,
    outputSchema: TranscribeAndSummarizeAudioOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
