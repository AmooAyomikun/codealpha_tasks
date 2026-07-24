import React, { useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useProjectStore } from '../store/projectStore';
import { Calendar, AlertCircle, CheckCircle2, MoreHorizontal, AlertOctagon, AlignLeft } from 'lucide-react';
import { cn } from '../lib/utils';
import { isPast, parseISO } from 'date-fns';

export function TaskCard({ task, isOverlay, onClick }) {
  const { users, labels, tasks } = useProjectStore();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task
    }
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  // Assignees
  const taskAssignees = useMemo(() => {
    if (!task.assignees) return [];
    return task.assignees.map(uid => users.find(u => u.id === uid)).filter(Boolean);
  }, [task.assignees, users]);

  // Labels
  const taskLabels = useMemo(() => {
    if (!task.labels) return [];
    return task.labels.map(lid => labels.find(l => l.id === lid)).filter(Boolean);
  }, [task.labels, labels]);

  // Due Date Check
  const isOverdue = useMemo(() => {
    if (!task.due_date) return false;
    // Just a simple past check
    return isPast(parseISO(task.due_date));
  }, [task.due_date]);

  // Priority Icon
  const PriorityIcon = useMemo(() => {
    switch (task.priority) {
      case 'high': return <AlertCircle className="w-3.5 h-3.5 text-red-500" />;
      case 'medium': return <AlertCircle className="w-3.5 h-3.5 text-yellow-500" />;
      case 'low': return <AlertCircle className="w-3.5 h-3.5 text-blue-500" />;
      default: return null;
    }
  }, [task.priority]);

  // Mocked Subtask Progress (if data had it, else static for demo or calculate)
  // PRD: "if the task has subtasks (e.g. '3/5')"
  // Since mockData doesn't have subtasks yet, we'll mock it if a certain flag was there, 
  // or we just assume we'd read `task.subtasks`
  const subtaskProgress = task.subtasks ? `${task.subtasks.filter(s => s.is_complete).length}/${task.subtasks.length}` : null;

  // Blocked Indicator
  // PRD: "If a task has an unresolved dependency"
  const isBlocked = task.blocked_by_task_id ? tasks.find(t => t.id === task.blocked_by_task_id && t.column_id !== 'c4') : false; // c4 is 'Done' in mockData, ideally we'd check if status is complete

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        if (!isDragging && onClick) onClick(e);
      }}
      className={cn(
        "bg-card p-3 rounded-lg border border-border shadow-sm cursor-grab active:cursor-grabbing group hover:border-primary/50 transition-colors",
        isDragging && "opacity-50 ring-1 ring-primary",
        isOverlay && "ring-2 ring-primary shadow-xl rotate-3 cursor-grabbing"
      )}
    >
      <div className="flex flex-col gap-2">
        {/* Top row: Labels + Blocked */}
        {(taskLabels.length > 0 || isBlocked) && (
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1">
              {taskLabels.map(label => (
                <span 
                  key={label.id} 
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded font-medium",
                    label.color === 'pink' ? "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400" :
                    label.color === 'blue' ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                    label.color === 'green' ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                    label.color === 'red' ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                    label.color === 'purple' ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" :
                    "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  )}
                >
                  {label.name}
                </span>
              ))}
            </div>
            {isBlocked && (
              <div title="Blocked by another task" className="text-red-500">
                <AlertOctagon className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        )}

        {/* Title */}
        <p className="text-sm font-medium text-foreground leading-snug line-clamp-2">
          {task.title}
        </p>

        {/* Description indicator or subtasks */}
        <div className="flex items-center gap-3 mt-1">
          {task.description && (
            <AlignLeft className="w-3.5 h-3.5 text-muted-foreground opacity-70" />
          )}
          {subtaskProgress && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {subtaskProgress}
            </div>
          )}
        </div>

        {/* Footer: Date, Priority, Avatars */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
          <div className="flex items-center gap-3">
            {task.due_date && (
              <div className={cn(
                "flex items-center gap-1 text-[11px] font-medium",
                isOverdue ? "text-red-600 dark:text-red-400" : "text-muted-foreground"
              )}>
                <Calendar className="w-3.5 h-3.5" />
                {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            )}
            <div title={`Priority: ${task.priority}`}>
              {PriorityIcon}
            </div>
          </div>

          {/* Avatars */}
          {taskAssignees.length > 0 && (
            <div className="flex -space-x-1.5 overflow-hidden">
              {taskAssignees.map(assignee => (
                <img 
                  key={assignee.id} 
                  src={assignee.avatar_url} 
                  alt={assignee.name}
                  title={assignee.name}
                  className="inline-block w-5 h-5 rounded-full ring-2 ring-card bg-muted"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
