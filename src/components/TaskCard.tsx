import type { CSSProperties } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "../types";
import { useStore } from "../store";

export default function TaskCard({ task }: { task: Task }) {
  const editTask = useStore((s) => s.editTask);
  const deleteTask = useStore((s) => s.deleteTask);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: "task" },
  });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div ref={setNodeRef} {...attributes} {...listeners} className="task-card" style={style}>
      <div className="task-title">{task.title}</div>
      {task.description && <div className="task-desc">{task.description}</div>}
      <div className="task-actions">
        <button
          onClick={() => {
            const title = prompt("Edit title", task.title) || task.title;
            const description = prompt("Edit description", task.description || "") || task.description;
            editTask({ id: task.id, title, description });
          }}
        >
          Edit
        </button>
        <button onClick={() => deleteTask(task.id)}>Delete</button>
      </div>
    </div>
  );
}
