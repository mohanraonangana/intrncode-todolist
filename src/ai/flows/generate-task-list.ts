'use server';

/**
 * @fileOverview AI agent that generates a personalized, step-by-step task list for learning a new topic.
 *
 * - generateTaskList - A function that handles the task list generation process.
 * - GenerateTaskListInput - The input type for the generateTaskList function.
 * - GenerateTaskListOutput - The return type for the generateTaskList function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTaskListInputSchema = z.string().describe('The topic to learn.');
export type GenerateTaskListInput = z.infer<typeof GenerateTaskListInputSchema>;

const TaskSchema = z.object({
  step: z.number().describe('The step number in the task list.'),
  description: z.string().describe('The description of the task.'),
  estimatedTime: z.string().describe('The estimated time to complete the task (e.g., "30 mins").'),
});

const GenerateTaskListOutputSchema = z.array(TaskSchema).describe('A list of tasks with descriptions and estimated times.');
export type GenerateTaskListOutput = z.infer<typeof GenerateTaskListOutputSchema>;

export async function generateTaskList(topic: GenerateTaskListInput): Promise<GenerateTaskListOutput> {
  return generateTaskListFlow(topic);
}

const prompt = ai.definePrompt({
  name: 'generateTaskListPrompt',
  input: {schema: GenerateTaskListInputSchema},
  output: {schema: GenerateTaskListOutputSchema},
  prompt: `You are an expert in creating learning plans for software development.

  Given the topic "{{input}}", create a step-by-step task list with estimated times for each task.
  The task list should be personalized and optimized for skill acquisition.
  The user wants to build a RESTful API for managing todos.
  
  Focus on these learning objectives:
  - Understand REST API principles and HTTP methods
  - Learn database operations (CRUD) with SQL/NoSQL
  - Master Express.js routing and middleware (or Next.js API Routes)
  - Practice API testing and documentation
  - Implement proper error handling

  Here is a suggested structure, but you can adapt it.
  Step 1: Understanding Basics
  Step 2: Project Setup
  Step 3: Database Integration (with Firebase/Firestore)
  Step 4: API Endpoints (CRUD for todos)
  Step 5: Error Handling & Validation
  
  Generate a JSON array of tasks based on this.
  `,
});

const generateTaskListFlow = ai.defineFlow(
  {
    name: 'generateTaskListFlow',
    inputSchema: GenerateTaskListInputSchema,
    outputSchema: GenerateTaskListOutputSchema,
  },
  async topic => {
    const {output} = await prompt(topic);
    return output!;
  }
);
