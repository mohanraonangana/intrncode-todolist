'use client';

import { useState, useEffect, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Trash2 } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Label } from './ui/label';
import { Todo, getTodos, addTodo, updateTodoStatus, deleteTodo } from '@/services/todo';
import { Skeleton } from './ui/skeleton';


function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
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
      const newTodoData: Omit<Todo, 'id' | 'createdAt'> = {
        description: newTodo.trim(),
        completed: false
      };
      const newId = await addTodo(newTodoData);
      setTodos([...todos, { ...newTodoData, id: newId, createdAt: new Date() }]);
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
      setTodos(todos.map(todo => todo.id === id ? { ...todo, completed } : todo));
      await updateTodoStatus(id, completed);
    } catch(error) {
      setTodos(todos.map(todo => todo.id === id ? { ...todo, completed: !completed } : todo));
      toast({
          variant: 'destructive',
          title: 'Error updating todo',
          description: 'Could not update your task. Please try again later.',
        });
    }
  };

  const handleDeleteTodo = async (id: string) => {
    const originalTodos = [...todos];
    try {
      setTodos(todos.filter(todo => todo.id !== id));
      await deleteTodo(id);
    } catch(error) {
       setTodos(originalTodos);
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
  
  if (isLoading || !isClient) {
    return (
       <div className="space-y-4">
        <div className="flex justify-between mb-2 items-center">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-2 w-full" />
        <div className="flex gap-2 mb-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-20" />
        </div>
        <div className="space-y-4">
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
          <div key={todo.id} className="flex items-center gap-3 transition-all duration-300 animate-in fade-in-0 slide-in-from-top-2">
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
            <Button variant="ghost" size="icon" onClick={() => handleDeleteTodo(todo.id)} className="group" disabled={!todo.completed}>
              <Trash2 className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}


export function TodoListCard() {
  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
          <div>
            <CardTitle className="font-headline text-3xl">To-DoZen</CardTitle>
            <CardDescription className="mt-2">
              A journey of a thousand miles begins with a single step.
            </CardDescription>
          </div>
      </CardHeader>
      <CardContent>
        <TodoList />
      </CardContent>
    </Card>
  );
}
