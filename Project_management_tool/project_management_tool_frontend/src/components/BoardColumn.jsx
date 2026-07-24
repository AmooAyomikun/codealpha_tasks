import React, { useMemo, useState } from 'react';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TaskCard } from './TaskCard';
import { useProjectStore } from '../store/projectStore';
import { MoreHorizontal, Plus } from 'lucide-react';
import { cn } from '../lib/utils';

export function BoardColumn({ column, tasks, isOverlay, onTaskClick }) {
  const { renameColumn, deleteColumn, addTask } = useProjectStore();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(column.name);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: column.id,
    data: {
      type: 'Column',
      column,
    }
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const taskIds = useMemo(() => tasks.map(t => t.id), [tasks]);

  const handleRename = () => {
    if (name.trim() && name !== column.name) {
      renameColumn(column.id, name.trim());
    } else {
      setName(column.name); // revert if empty
    }
    setIsEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex flex-col bg-muted/40 rounded-xl w-80 shrink-0 max-h-full",
        isDragging && "opacity-50",
        isOverlay && "ring-2 ring-primary shadow-xl rotate-2"
      )}
    >
      {/* Column Header */}
      <div 
        {...attributes} 
        {...listeners}
        className="p-3 flex items-center justify-between cursor-grab active:cursor-grabbing group"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className={cn(
            "w-2 h-2 rounded-full",
            column.color === 'gray' ? "bg-slate-400" :
            column.color === 'blue' ? "bg-blue-500" :
            column.color === 'yellow' ? "bg-yellow-500" :
            column.color === 'green' ? "bg-green-500" : "bg-primary"
          )} />
          {isEditing ? (
            <input
              autoFocus
              className="text-sm font-semibold bg-background border border-border rounded px-1.5 py-0.5 outline-none focus:ring-1 focus:ring-primary w-full text-foreground"
              value={name}
              onChange={e => setName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={e => {
                if (e.key === 'Enter') handleRename();
                if (e.key === 'Escape') { setName(column.name); setIsEditing(false); }
              }}
            />
          ) : (
            <h3 
              className="text-sm font-semibold text-foreground truncate cursor-pointer hover:bg-muted/60 px-1.5 py-0.5 rounded -ml-1.5"
              onClick={(e) => {
                e.stopPropagation(); // prevent drag
                setIsEditing(true);
              }}
            >
              {column.name}
            </h3>
          )}
          <span className="text-xs text-muted-foreground font-medium bg-muted px-1.5 py-0.5 rounded-full ml-1">
            {tasks.length}
          </span>
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            if(window.confirm('Delete column?')) deleteColumn(column.id);
          }}
          className="text-muted-foreground hover:text-foreground p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Add Button */}
      <div className="px-2 mb-2">
        <button 
          onClick={() => {
            addTask({
              column_id: column.id,
              title: 'New Task',
              description: ''
            });
          }}
          className="w-full flex items-center gap-1.5 px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground rounded-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-2 flex flex-col min-h-[100px]">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} onClick={() => onTaskClick && onTaskClick(task.id)} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
