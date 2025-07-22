import type { ComponentType } from 'react';
import { BookOpen, FolderCog, Database, CodeXml, ShieldAlert, Lightbulb } from 'lucide-react';

export interface Task {
  description: string;
  estimatedTime?: string;
}

export interface PathStep {
  step: number;
  title: string;
  time?: string;
  Icon: ComponentType<{ className?: string }>;
  tasks: Task[];
}

export const INITIAL_LEARNING_PATH: PathStep[] = [
  {
    step: 1,
    title: 'Understanding Basics',
    time: '30 mins',
    Icon: BookOpen,
    tasks: [
      { description: 'Learn about HTTP methods (GET, POST, PUT, DELETE)' },
      { description: 'Understand RESTful API principles' },
      { description: 'Study basic database concepts' },
      { description: 'Review JSON data format' },
    ],
  },
  {
    step: 2,
    title: 'Project Setup',
    time: '30 mins',
    Icon: FolderCog,
    tasks: [
      { description: 'Set up Node.js and npm' },
      { description: 'Install Express.js and required packages' },
      { description: 'Create project structure' },
      { description: 'Set up a basic Express server' },
    ],
  },
  {
    step: 3,
    title: 'Database Integration',
    time: '45 mins',
    Icon: Database,
    tasks: [
      { description: 'Choose and install database (SQLite recommended for beginners)' },
      { description: 'Create todo table schema' },
      { description: 'Write database connection code' },
      { description: 'Test database connection' },
    ],
  },
  {
    step: 4,
    title: 'API Endpoints',
    time: '1.5 hours',
    Icon: CodeXml,
    tasks: [
      { description: 'Create GET /todos endpoint (List todos)' },
      { description: 'Add POST /todos endpoint (Create todo)' },
      { description: 'Implement PUT /todos/:id (Update todo)' },
      { description: 'Add DELETE /todos/:id (Remove todo)' },
      { description: 'Test each endpoint with Postman' },
    ],
  },
  {
    step: 5,
    title: 'Error Handling & Validation',
    time: '1 hour',
    Icon: ShieldAlert,
    tasks: [
      { description: 'Add input validation' },
      { description: 'Implement error middleware' },
      { description: 'Add try-catch blocks' },
      { description: 'Test error scenarios' },
    ],
  },
];
