'use server';
/**
 * @fileOverview An AI flow to cartoonify an image.
 *
 * - cartoonifyImage - A function that takes an image and returns a cartoon version.
 * - CartoonifyImageInput - The input type for the cartoonifyImage function.
 * - CartoonifyImageOutput - The return type for the cartoonifyImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CartoonifyImageInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "An image to cartoonify, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type CartoonifyImageInput = z.infer<typeof CartoonifyImageInputSchema>;

const CartoonifyImageOutputSchema = z.object({
  cartoonDataUri: z.string().describe('The cartoonified image as a data URI.'),
});
export type CartoonifyImageOutput = z.infer<typeof CartoonifyImageOutputSchema>;

export async function cartoonifyImage(input: CartoonifyImageInput): Promise<CartoonifyImageOutput> {
  return cartoonifyImageFlow(input);
}

const cartoonifyImageFlow = ai.defineFlow(
  {
    name: 'cartoonifyImageFlow',
    inputSchema: CartoonifyImageInputSchema,
    outputSchema: CartoonifyImageOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: [
        { media: { url: input.imageDataUri } },
        { text: 'Convert this image into a photorealistic cartoon. The style should be detailed and closer to reality, suitable for educational visual aids.' },
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media.url) {
      throw new Error('Failed to generate cartoon image.');
    }

    return { cartoonDataUri: media.url };
  }
);
