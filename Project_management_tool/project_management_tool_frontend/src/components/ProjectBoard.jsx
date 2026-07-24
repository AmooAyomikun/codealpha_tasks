import React, { useState, useMemo, useEffect } from 'react';
import { 
  DndContext, 
  DragOverlay,
  closestCorners, 
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import { 
  SortableContext, 
  horizontalListSortingStrategy 
} from '@dnd-kit/sortable';
import { useProjectStore } from '../store/projectStore';
import { BoardColumn } from './BoardColumn';
import { TaskCard } from './TaskCard';

export function ProjectBoard({ projectId }) {
  const { columns, tasks, moveTask, reorderColumn, addTask, addColumn } = useProjectStore();
  const projectColumns = useMemo(() => columns.filter(c => c.project_id === projectId).sort((a,b) => a.order - b.order), [columns, projectId]);
  const columnIds = useMemo(() => projectColumns.map(c => c.id), [projectColumns]);
  
  const [activeColumn, setActiveColumn] = useState(null);
  const [activeTask, setActiveTask] = useState(null);
  const [isCreatingColumn, setIsCreatingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        if (projectColumns.length > 0) {
          const firstCol = projectColumns[0];
          addTask({
            column_id: firstCol.id,
            title: 'New Task',
            description: ''
          });
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [projectColumns, addTask]);

  const handleDragStart = (event) => {
    const { active } = event;
    
    if (active.data.current?.type === 'Column') {
      setActiveColumn(active.data.current.column);
      return;
    }
    
    if (active.data.current?.type === 'Task') {
      setActiveTask(active.data.current.task);
      return;
    }
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === 'Task';
    const isOverTask = over.data.current?.type === 'Task';
    const isOverColumn = over.data.current?.type === 'Column';

    if (!isActiveTask) return;

    if (isActiveTask && isOverTask) {
      const activeTaskData = active.data.current.task;
      const overTaskData = over.data.current.task;
      moveTask(activeId, overId, activeTaskData.column_id, overTaskData.column_id);
    }
    
    if (isActiveTask && isOverColumn) {
      const activeTaskData = active.data.current.task;
      moveTask(activeId, overId, activeTaskData.column_id, over.id);
    }
  };

  const handleDragEnd = (event) => {
    setActiveColumn(null);
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveColumn = active.data.current?.type === 'Column';
    if (isActiveColumn) {
      reorderColumn(projectId, activeId, overId);
      return;
    }
  };

  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.5' } } }),
  };

  return (
    <div className="h-full flex overflow-x-auto p-6 gap-6 items-start">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
          {projectColumns.map((col) => (
            <BoardColumn 
              key={col.id} 
              column={col} 
              tasks={tasks.filter(t => t.column_id === col.id).sort((a,b) => a.order - b.order)} 
            />
          ))}
        </SortableContext>

        <div className="shrink-0 w-80">
          {!isCreatingColumn ? (
            <button 
              onClick={() => setIsCreatingColumn(true)}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              + Add Column
            </button>
          ) : (
            <div className="p-3 bg-card rounded-lg border border-border shadow-sm">
              <input 
                autoFocus
                className="w-full p-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                placeholder="Column title..."
                value={newColumnName}
                onChange={e => setNewColumnName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && newColumnName.trim()) {
                    addColumn(projectId, newColumnName.trim());
                    setNewColumnName('');
                    setIsCreatingColumn(false);
                  } else if (e.key === 'Escape') {
                    setIsCreatingColumn(false);
                    setNewColumnName('');
                  }
                }}
              />
              <div className="flex gap-2 mt-2">
                <button 
                  onClick={() => {
                    if (newColumnName.trim()) {
                      addColumn(projectId, newColumnName.trim());
                    }
                    setNewColumnName('');
                    setIsCreatingColumn(false);
                  }}
                  className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Add
                </button>
                <button 
                  onClick={() => { setIsCreatingColumn(false); setNewColumnName(''); }}
                  className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted rounded-md"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <DragOverlay dropAnimation={dropAnimation}>
          {activeColumn ? (
            <BoardColumn 
              column={activeColumn} 
              tasks={tasks.filter(t => t.column_id === activeColumn.id).sort((a,b) => a.order - b.order)} 
              isOverlay
            />
          ) : null}
          {activeTask ? (
            <TaskCard task={activeTask} isOverlay />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
