'use server';

/**
 * @fileOverview Summarizes a learning resource into a concise to-do list.
 *
 * - summarizeLearningResource - A function that summarizes a learning resource.
 * - SummarizeLearningResourceInput - The input type for the summarizeLearningResource function.
 * - SummarizeLearningResourceOutput - The return type for the summarizeLearningResource function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeLearningResourceInputSchema = z.object({
  resourceLink: z.string().describe('A link to the external learning resource.'),
});
export type SummarizeLearningResourceInput = z.infer<
  typeof SummarizeLearningResourceInputSchema
>;

const SummarizeLearningResourceOutputSchema = z.object({
  todoList: z
    .string()
    .describe('A concise to-do list summarizing the key concepts.'),
});
export type SummarizeLearningResourceOutput = z.infer<
  typeof SummarizeLearningResourceOutputSchema
>;

export async function summarizeLearningResource(
  input: SummarizeLearningResourceInput
): Promise<SummarizeLearningResourceOutput> {
  return summarizeLearningResourceFlow(input);
}

const summarizeLearningResourcePrompt = ai.definePrompt({
  name: 'summarizeLearningResourcePrompt',
  input: {schema: SummarizeLearningResourceInputSchema},
  output: {schema: SummarizeLearningResourceOutputSchema},
  prompt: `You are an AI assistant designed to summarize learning resources into actionable to-do lists.

  Summarize the key concepts from the following resource into a concise to-do list:

  Resource Link: {{{resourceLink}}}
  `,
});

const summarizeLearningResourceFlow = ai.defineFlow(
  {
    name: 'summarizeLearningResourceFlow',
    inputSchema: SummarizeLearningResourceInputSchema,
    outputSchema: SummarizeLearningResourceOutputSchema,
  },
  async input => {
    const {output} = await summarizeLearningResourcePrompt(input);
    return output!;
  }
);
