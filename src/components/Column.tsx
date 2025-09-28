// src/components/Column.tsx
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useStore } from "../store";
import type { Store } from "../store";
import type { Task } from "../types";
import TaskCard from "./TaskCard";
import { useShallow } from "zustand/react/shallow";

const selectColumn =
  (columnId: string) =>
  (s: Store): { title: string; taskIds: string[] } => {
    const c = s.columns.find((c) => c.id === columnId);
    return { title: c?.title ?? "", taskIds: (c?.taskIds ?? []) as string[] };
  };

const selectTasks =
  (ids: string[]) =>
  (s: Store): Task[] =>
    ids.map((id) => s.tasks[id]).filter(Boolean) as Task[];

export default function Column({ columnId }: { columnId: string }) {
  // Stable, shallow-compared slices (v5 pattern)
  const { title, taskIds } = useStore(useShallow(selectColumn(columnId)));
  const tasks = useStore(useShallow(selectTasks(taskIds)));

  const addTask = useStore((s) => s.addTask);
  const renameColumn = useStore((s) => s.renameColumn);
  const deleteColumn = useStore((s) => s.deleteColumn);

  const { setNodeRef, isOver } = useDroppable({
    id: columnId,
    data: { type: "column" },
  });

  return (
    <div className="column">
      <div className="column-header">
        <input
          className="column-title-input"
          name={`col-title-${columnId}`}
          autoComplete="off"
          spellCheck={false}
          value={title}
          onChange={(e) => {
            const next = e.target.value;
            if (next !== title) renameColumn(columnId, next);
          }}
        />
        <div className="column-actions">
          <button
            onClick={() => {
              const t = prompt("New task title");
              if (!t) return;
              const description = prompt("Description") || undefined;
              addTask(columnId, { title: t, description });
            }}
          >
            New
          </button>
          <button onClick={() => deleteColumn(columnId)}>Remove</button>
        </div>
      </div>

      <div ref={setNodeRef} className={`column-body ${isOver ? "dropping" : ""}`}>
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((t) => (t ? <TaskCard key={t.id} task={t} /> : null))}
        </SortableContext>
      </div>
    </div>
  );
}
