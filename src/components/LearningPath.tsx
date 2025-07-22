'use client';

import { useState, useEffect, useMemo, useTransition } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Lightbulb, Loader2, RotateCcw, Sparkles, Trash2 } from 'lucide-react';

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
import { Todo, getTodos, addTodo, updateTodoStatus, deleteTodo } from '@/services/todo';
import { Skeleton } from './ui/skeleton';

const formSchema = z.object({
  topic: z.string().min(3, 'Please enter a topic with at least 3 characters.'),
});

function GeneratePathForm({ setPathData, setOpen }: { setPathData: (data: PathStep[]) => void; setOpen: (open: boolean) => void }) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "Todo List API",
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

function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchTodos() {
      try {
        const todosFromDb = await getTodos();
        setTodos(todosFromDb);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error fetching todos',
          description: 'Could not load your tasks. Please try again later.',
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchTodos();
  }, [toast]);
  
  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    
    try {
      const newTodoId = await addTodo(newTodo);
      setTodos([...todos, { id: newTodoId, description: newTodo, completed: false, createdAt: new Date() }]);
      setNewTodo('');
    } catch(error) {
       toast({
          variant: 'destructive',
          title: 'Error adding todo',
          description: 'Could not add your task. Please try again later.',
        });
    }
  };

  const handleToggleTodo = async (id: string, completed: boolean) => {
    try {
      await updateTodoStatus(id, completed);
      setTodos(todos.map(todo => todo.id === id ? { ...todo, completed } : todo));
    } catch(error) {
      toast({
          variant: 'destructive',
          title: 'Error updating todo',
          description: 'Could not update your task. Please try again later.',
        });
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      await deleteTodo(id);
      setTodos(todos.filter(todo => todo.id !== id));
    } catch(error) {
       toast({
          variant: 'destructive',
          title: 'Error deleting todo',
          description: 'Could not delete your task. Please try again later.',
        });
    }
  }

  const { total, completed } = useMemo(() => {
    return {
      total: todos.length,
      completed: todos.filter(t => t.completed).length
    }
  }, [todos]);

  const progress = total > 0 ? (completed / total) * 100 : 0;
  
  if (isLoading) {
    return (
       <div className="space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-3/4" />
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between mb-2 items-center">
        <Label className="text-sm text-muted-foreground">Your Todos</Label>
        <span className="text-sm font-medium text-muted-foreground">{completed} / {total} completed</span>
      </div>
      <Progress value={progress} className="w-full h-2 mb-4" />
      <form onSubmit={handleAddTodo} className="flex gap-2 mb-4">
        <Input 
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new task..."
        />
        <Button type="submit">Add</Button>
      </form>
      <div className="flex flex-col gap-3">
        {todos.map(todo => (
          <div key={todo.id} className="flex items-center gap-3 transition-all duration-300">
            <Checkbox
              id={todo.id}
              checked={todo.completed}
              onCheckedChange={(checked) => handleToggleTodo(todo.id, !!checked)}
              aria-labelledby={`label-${todo.id}`}
            />
             <label
              htmlFor={todo.id}
              id={`label-${todo.id}`}
              className={`flex-1 text-sm transition-all duration-300 cursor-pointer ${
                todo.completed
                  ? 'text-muted-foreground line-through'
                  : 'text-foreground'
              }`}
            >
              {todo.description}
            </label>
            <Button variant="ghost" size="icon" onClick={() => handleDeleteTodo(todo.id)}>
              <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}


export function LearningPath() {
  const [pathData, setPathData] = useState<PathStep[]>(INITIAL_LEARNING_PATH);
  const [isGenerateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('todo');

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="font-headline text-3xl">To-DoZen</CardTitle>
            <CardDescription className="mt-2">
              A journey of a thousand miles begins with a single step.
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
            <Button variant="ghost" size="icon" onClick={() => setPathData(INITIAL_LEARNING_PATH)}>
              <RotateCcw className="h-4 w-4" />
              <span className="sr-only">Reset Path</span>
            </Button>
          </div>
        </div>
        <div className="mt-6">
          <div className="border-b">
            <nav className="-mb-px flex space-x-6">
              <button
                onClick={() => setActiveTab('todo')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'todo' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}`}>
                My To-Do List
              </button>
              <button
                onClick={() => setActiveTab('learn')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'learn' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}`}>
                Learning Path
              </button>
            </nav>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {activeTab === 'todo' && <TodoList />}
        {activeTab === 'learn' && (
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
                        <div className="mt-1 w-4 h-4 rounded-full bg-primary/20 flex-shrink-0"></div>
                        <label
                          id={`label-${stepIndex}-${taskIndex}`}
                          className={`flex-1 text-sm text-foreground`}
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
        )}
      </CardContent>
    </Card>
  );
}
