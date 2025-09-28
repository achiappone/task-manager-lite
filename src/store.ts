// src/store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BoardState, NewTaskInput, EditTaskInput } from "./types";
import { uid } from "./utils";

type Actions = {
  addTask: (columnId: string, input: NewTaskInput) => void;
  editTask: (input: EditTaskInput) => void;
  deleteTask: (taskId: string) => void;
  moveTask: (taskId: string, toColumnId: string, toIndex: number) => void;
  reorderTaskWithinColumn: (columnId: string, fromIndex: number, toIndex: number) => void;
  reorderColumns: (fromIndex: number, toIndex: number) => void;
  addColumn: (title: string) => void;
  renameColumn: (columnId: string, title: string) => void;
  deleteColumn: (columnId: string) => void;
  resetDemo: () => void;
};

export type Store = BoardState & Actions;

const initial: BoardState = {
  columns: [
    { id: "col_todo", title: "To Do", taskIds: [] },
    { id: "col_inprogress", title: "In Progress", taskIds: [] },
    { id: "col_done", title: "Done", taskIds: [] }
  ],
  tasks: {}
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...initial,

      addTask: (columnId: string, input: NewTaskInput) => {
        const id = uid("task");
        const now = Date.now();
        const task = {
          id,
          title: input.title.trim(),
          description: input.description?.trim(),
          createdAt: now,
          updatedAt: now
        };
        const s = get();
        const columns = s.columns.map((c) =>
          c.id === columnId ? { ...c, taskIds: [...c.taskIds, id] } : c
        );
        set({ tasks: { ...s.tasks, [id]: task }, columns });
      },

      editTask: ({ id, title, description }: EditTaskInput) => {
        const s = get();
        const t = s.tasks[id];
        if (!t) return;
        const updated = {
          ...t,
          title: title.trim(),
          description: description?.trim(),
          updatedAt: Date.now()
        };
        set({ tasks: { ...s.tasks, [id]: updated } });
      },

      deleteTask: (taskId: string) => {
        const s = get();
        const { [taskId]: _omit, ...rest } = s.tasks;
        const columns = s.columns.map((c) => ({
          ...c,
          taskIds: c.taskIds.filter((id) => id !== taskId)
        }));
        set({ tasks: rest, columns });
      },

      moveTask: (taskId: string, toColumnId: string, toIndex: number) => {
        const s = get();
        const fromColumn = s.columns.find((c) => c.taskIds.includes(taskId));
        const toColumn = s.columns.find((c) => c.id === toColumnId);
        if (!fromColumn || !toColumn) return;

        const fromIds = fromColumn.taskIds.filter((id) => id !== taskId);
        const toIds = [...toColumn.taskIds];
        toIds.splice(toIndex, 0, taskId);

        const columns = s.columns.map((c) => {
          if (c.id === fromColumn.id) return { ...c, taskIds: fromIds };
          if (c.id === toColumn.id) return { ...c, taskIds: toIds };
          return c;
        });
        set({ columns });
      },

      reorderTaskWithinColumn: (columnId: string, fromIndex: number, toIndex: number) => {
        const s = get();
        const col = s.columns.find((c) => c.id === columnId);
        if (!col) return;
        const next = [...col.taskIds];
        const [moved] = next.splice(fromIndex, 1);
        next.splice(toIndex, 0, moved);
        const columns = s.columns.map((c) =>
          c.id === columnId ? { ...c, taskIds: next } : c
        );
        set({ columns });
      },

      reorderColumns: (fromIndex: number, toIndex: number) => {
        const s = get();
        const cols = [...s.columns];
        const [moved] = cols.splice(fromIndex, 1);
        cols.splice(toIndex, 0, moved);
        set({ columns: cols });
      },

      addColumn: (title: string) => {
        const s = get();
        set({
          columns: [
            ...s.columns,
            { id: uid("col"), title: title.trim(), taskIds: [] }
          ]
        });
      },

      // ← Optimized to avoid redundant updates (no-op if the title is unchanged)
      renameColumn: (columnId: string, title: string) => {
        const s = get();
        const next = title.trim();
        const columns = s.columns.map((c) => {
          if (c.id !== columnId) return c;
          if (c.title === next) return c; // no update if unchanged
          return { ...c, title: next };
        });
        set({ columns });
      },

      deleteColumn: (columnId: string) => {
        const s = get();
        const column = s.columns.find((c) => c.id === columnId);
        if (!column) return;
        const tasks = { ...s.tasks };
        for (const id of column.taskIds) delete tasks[id];
        set({
          columns: s.columns.filter((c) => c.id !== columnId),
          tasks
        });
      },

      resetDemo: () => set(initial),
    }),
    { name: "task-manager-lite-state" }
  )
);
