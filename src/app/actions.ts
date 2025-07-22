"use server";

import { generateTaskList, GenerateTaskListOutput } from "@/ai/flows/generate-task-list";
import { PathStep } from '@/lib/data';
import { Lightbulb } from "lucide-react";
import { z } from "zod";

const generatePathSchema = z.object({
  topic: z.string().min(3, "Topic must be at least 3 characters long."),
});

type ActionState = {
  message: string;
  error: { [key: string]: string[] } | null;
  data: PathStep[] | null;
}

function groupTasksIntoSteps(tasks: GenerateTaskListOutput, topic: string): PathStep[] {
  if (!tasks || tasks.length === 0) return [];

  const stepsMap: Map<number, { tasks: { description: string, estimatedTime: string }[] }> = new Map();

  tasks.forEach(task => {
    if (!stepsMap.has(task.step)) {
      stepsMap.set(task.step, { tasks: [] });
    }
    stepsMap.get(task.step)!.tasks.push({
      description: task.description,
      estimatedTime: task.estimatedTime,
    });
  });

  const sortedSteps = Array.from(stepsMap.entries()).sort((a, b) => a[0] - b[0]);
  
  const pathSteps: PathStep[] = sortedSteps.map(([stepNumber, stepData], index) => {
    // Attempt to create a meaningful title from the first task.
    const firstTaskDesc = stepData.tasks[0]?.description || '';
    const stepTitle = firstTaskDesc.split(' ').slice(0, 4).join(' ').replace(/,$/, '') || `Part ${index + 1}`;

    return {
      step: stepNumber,
      title: stepTitle,
      Icon: Lightbulb,
      tasks: stepData.tasks
    };
  });

  if (pathSteps.length === 1) {
    pathSteps[0].title = topic;
  }
  
  return pathSteps;
}

export async function generateNewPath(prevState: ActionState | null, formData: FormData): Promise<ActionState> {
  const validatedFields = generatePathSchema.safeParse({
    topic: formData.get("topic"),
  });

  if (!validatedFields.success) {
    return {
      message: "Please enter a valid topic.",
      error: validatedFields.error.flatten().fieldErrors,
      data: null,
    };
  }

  try {
    const topic = validatedFields.data.topic;
    const taskList = await generateTaskList(topic);
    
    const steps = groupTasksIntoSteps(taskList, topic);

    if (steps.length === 0) {
      return {
        message: "The AI couldn't generate a path for this topic. Please try another one.",
        error: { _errors: ["No tasks returned from AI."] },
        data: null,
      };
    }

    return {
      message: "Successfully generated a new learning path.",
      error: null,
      data: steps,
    };
  } catch (error) {
    console.error("Error generating new path:", error);
    return {
      message: "An unexpected error occurred while generating the path. Please try again later.",
      error: { _errors: ["AI service failure."] },
      data: null,
    };
  }
}
