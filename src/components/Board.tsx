// src/components/Board.tsx
import {
  DndContext, MouseSensor, TouchSensor,
  useSensor, useSensors
} from "@dnd-kit/core";
import type { DragEndEvent, DragOverEvent } from "@dnd-kit/core";
import { useStore } from "../store";
import Column from "./Column";

export default function Board() {
  const columns = useStore(s => s.columns);
  const tasks = useStore(s => s.tasks);
  const moveTask = useStore(s => s.moveTask);
  const reorderTaskWithinColumn = useStore(s => s.reorderTaskWithinColumn);
  const reorderColumns = useStore(s => s.reorderColumns);
  const addColumn = useStore(s => s.addColumn);
  const resetDemo = useStore(s => s.resetDemo);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  function onDragOver(_e: DragOverEvent) {
    // visual feedback handled by Column via isOver
  }

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over) return;

    if (active.data.current?.type === "column" && over.data.current?.type === "column") {
      const from = columns.findIndex(c => c.id === active.id);
      const to = columns.findIndex(c => c.id === over.id);
      if (from !== -1 && to !== -1 && from !== to) reorderColumns(from, to);
      return;
    }

    if (active.data.current?.type === "task") {
      const taskId = String(active.id);
      const sourceCol = columns.find(c => c.taskIds.includes(taskId));
      if (!sourceCol) return;

      if (over.data.current?.type === "column") {
        const toColumnId = String(over.id);
        if (toColumnId === sourceCol.id) return;
        const toIndex = columns.find(c => c.id === toColumnId)?.taskIds.length ?? 0;
        moveTask(taskId, toColumnId, toIndex);
        return;
      }

      if (over.data.current?.type === "task") {
        const targetTaskId = String(over.id);
        const targetCol = columns.find(c => c.taskIds.includes(targetTaskId));
        if (!targetCol) return;

        const fromIndex = sourceCol.taskIds.indexOf(taskId);
        const toIndexInTarget = targetCol.taskIds.indexOf(targetTaskId);

        if (targetCol.id === sourceCol.id) {
          if (fromIndex !== -1 && toIndexInTarget !== -1 && fromIndex !== toIndexInTarget) {
            reorderTaskWithinColumn(sourceCol.id, fromIndex, toIndexInTarget);
          }
        } else {
          moveTask(taskId, targetCol.id, toIndexInTarget);
        }
      }
    }
  }

  return (
    <div className="board-wrap">
      <div className="board-toolbar">
        <button onClick={()=>{
          const title = prompt("New column title");
          if (title) addColumn(title);
        }}>Add Column</button>
        <button onClick={resetDemo}>Reset</button>
      </div>

      <DndContext sensors={sensors} onDragOver={onDragOver} onDragEnd={onDragEnd}>
        <div className="board">
          {columns.map(c => (
            <div key={c.id} data-id={c.id} data-type="column-wrapper">
              <Column columnId={c.id} />
            </div>
          ))}
        </div>
      </DndContext>

      <div className="board-meta">
        <span>{Object.keys(tasks).length} tasks</span>
        <span>{columns.length} columns</span>
      </div>
    </div>
  );
}
