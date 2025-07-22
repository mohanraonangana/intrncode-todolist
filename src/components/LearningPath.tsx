'use client';

import { useState, useEffect, useMemo, useTransition } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Lightbulb, Loader2, RotateCcw, Sparkles } from 'lucide-react';

import { INITIAL_LEARNING_PATH, type PathStep } from '@/lib/data';
import { generateNewPath } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Label } from './ui/label';

type CompletionStatus = {
  [key: string]: boolean;
};

const formSchema = z.object({
  topic: z.string().min(3, 'Please enter a topic with at least 3 characters.'),
});

function GeneratePathForm({ setPathData, setOpen }: { setPathData: (data: PathStep[]) => void; setOpen: (open: boolean) => void }) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('topic', values.topic);
      const result = await generateNewPath(null, formData);

      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error Generating Path',
          description: result.message,
        });
      } else if (result.data) {
        const aiPath = result.data.map(step => ({ ...step, Icon: Lightbulb }));
        setPathData(aiPath);
        toast({
          title: 'Path Generated!',
          description: 'Your new learning path is ready.',
        });
        setOpen(false);
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="topic"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Learning Topic</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 'React Hooks' or 'Quantum Physics'" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="submit" disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Generate Path
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

export function LearningPath() {
  const [pathData, setPathData] = useState<PathStep[]>(INITIAL_LEARNING_PATH);
  const [completion, setCompletion] = useState<CompletionStatus>({});
  const [progress, setProgress] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [isGenerateDialogOpen, setGenerateDialogOpen] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    const savedCompletion = localStorage.getItem('taskCompletion');
    if (savedCompletion) {
      setCompletion(JSON.parse(savedCompletion));
    }
  }, []);

  const { totalTasks, completedTasks } = useMemo(() => {
    const total = pathData.reduce((acc, step) => acc + step.tasks.length, 0);
    const completed = Object.values(completion).filter(Boolean).length;
    return { totalTasks: total, completedTasks: completed };
  }, [pathData, completion]);

  useEffect(() => {
    if (totalTasks > 0) {
      setProgress((completedTasks / totalTasks) * 100);
    } else {
      setProgress(0);
    }
    if(isClient) {
      localStorage.setItem('taskCompletion', JSON.stringify(completion));
    }
  }, [completedTasks, totalTasks, completion, isClient]);

  const handleTaskToggle = (stepIndex: number, taskIndex: number) => {
    const key = `${stepIndex}-${taskIndex}`;
    setCompletion(prev => ({ ...prev, [key]: !prev[key] }));
  };
  
  const resetPath = () => {
    setPathData(INITIAL_LEARNING_PATH);
    setCompletion({});
  }

  const getTaskKey = (stepIndex: number, taskIndex: number) => `${stepIndex}-${taskIndex}`;

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="font-headline text-3xl">Your Learning Journey</CardTitle>
            <CardDescription className="mt-2">
              Follow these steps to master your new skill. Your progress is saved automatically.
            </CardDescription>
          </div>
          <div className="flex gap-2">
             <Dialog open={isGenerateDialogOpen} onOpenChange={setGenerateDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Sparkles className="mr-2 h-4 w-4" /> AI Path
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create a New Learning Path</DialogTitle>
                  <DialogDescription>
                    Let our AI generate a personalized, step-by-step guide for any topic you want to learn.
                  </DialogDescription>
                </DialogHeader>
                <GeneratePathForm setPathData={setPathData} setOpen={setGenerateDialogOpen}/>
              </DialogContent>
            </Dialog>
            <Button variant="ghost" size="icon" onClick={resetPath}>
              <RotateCcw className="h-4 w-4" />
              <span className="sr-only">Reset Path</span>
            </Button>
          </div>
        </div>
        <div className="mt-6">
          <div className="flex justify-between mb-1">
            <Label className="text-sm text-muted-foreground">Overall Progress</Label>
            <span className="text-sm font-medium text-muted-foreground">{completedTasks} / {totalTasks} tasks</span>
          </div>
          <Progress value={progress} className="w-full h-3" />
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible defaultValue="item-0" className="w-full">
          {pathData.map((step, stepIndex) => (
            <AccordionItem value={`item-${stepIndex}`} key={`step-${stepIndex}`}>
              <AccordionTrigger className="text-lg hover:no-underline font-semibold">
                <div className="flex items-center gap-4">
                  <step.Icon className="h-6 w-6 text-accent" />
                  <div className="flex flex-col items-start">
                    <span className="font-headline">{step.title}</span>
                    {step.time && <span className="text-xs font-normal text-muted-foreground">{step.time}</span>}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pl-6 border-l-2 border-primary/20 ml-[11px]">
                <div className="flex flex-col gap-3 py-4">
                  {step.tasks.map((task, taskIndex) => (
                     <div key={`task-${taskIndex}`} className="flex items-start gap-3 transition-all duration-300">
                      <Checkbox
                        id={getTaskKey(stepIndex, taskIndex)}
                        checked={!!completion[getTaskKey(stepIndex, taskIndex)]}
                        onCheckedChange={() => handleTaskToggle(stepIndex, taskIndex)}
                        className="mt-1"
                        aria-labelledby={`label-${getTaskKey(stepIndex, taskIndex)}`}
                      />
                      <label
                        htmlFor={getTaskKey(stepIndex, taskIndex)}
                        id={`label-${getTaskKey(stepIndex, taskIndex)}`}
                        className={`flex-1 text-sm transition-all duration-300 cursor-pointer ${
                          completion[getTaskKey(stepIndex, taskIndex)]
                            ? 'text-muted-foreground line-through'
                            : 'text-foreground'
                        }`}
                      >
                        {task.description}
                         {task.estimatedTime && <span className="text-xs text-muted-foreground/80 ml-2">({task.estimatedTime})</span>}
                      </label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
