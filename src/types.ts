// src/types.ts
export type Task = {
  id: string;
  title: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
};

export type Column = {
  id: string;
  title: string;
  taskIds: string[];
};

export type BoardState = {
  columns: Column[];
  tasks: Record<string, Task>;
};

export type NewTaskInput = { title: string; description?: string };
export type EditTaskInput = { id: string; title: string; description?: string };
