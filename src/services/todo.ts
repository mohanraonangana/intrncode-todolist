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
  toFirestore(todo: Omit<Todo, 'id'>): DocumentData {
    return { 
      description: todo.description, 
      completed: todo.completed,
      createdAt: todo.createdAt,
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

export async function addTodo(description: string): Promise<string> {
    const newTodo: Omit<Todo, 'id'> = {
        description,
        completed: false,
        createdAt: new Date(),
    };
    const docRef = await addDoc(todosCollection, newTodo);
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
