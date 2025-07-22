"use server"

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';

export interface Todo {
  id: string;
  description: string;
  completed: boolean;
  createdAt: Date;
}

const todoConverter = {
  toFirestore(todo: Omit<Todo, 'id' | 'createdAt'>): DocumentData {
    return { 
      description: todo.description, 
      completed: todo.completed,
      createdAt: new Date(),
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot<DocumentData>): Todo {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      description: data.description,
      completed: data.completed,
      createdAt: data.createdAt.toDate(),
    };
  },
};

const todosCollection = collection(db, 'todos').withConverter(todoConverter);

export async function getTodos(): Promise<Todo[]> {
  const snapshot = await getDocs(todosCollection);
  return snapshot.docs.map(doc => doc.data()).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}

export async function addTodo(todo: Omit<Todo, 'id' | 'createdAt'>): Promise<string> {
    const newTodo: Omit<Todo, 'id'> = {
        ...todo,
        createdAt: new Date(),
    };
    const docRef = await addDoc(collection(db, 'todos'), newTodo);
    return docRef.id;
}

export async function updateTodoStatus(id: string, completed: boolean): Promise<void> {
    const todoRef = doc(db, 'todos', id);
    await updateDoc(todoRef, { completed });
}

export async function deleteTodo(id: string): Promise<void> {
    const todoRef = doc(db, 'todos', id);
    await deleteDoc(todoRef);
}
