import { create } from 'zustand';
import { projects, columns, tasks, users, taskLabels, workspaces } from '../lib/mockData';

export const useProjectStore = create((set, get) => ({
  projects: [...projects],
  columns: [...columns],
  tasks: [...tasks],
  users: [...users],
  labels: [...taskLabels],
  comments: [],
  activityLog: [],
  notifications: [],
  
  // Tasks actions
  setTasks: (newTasks) => set({ tasks: newTasks }),
  
  addTask: (newTask) => set((state) => {
    const id = `t${Date.now()}`;
    const task = {
      id,
      created_at: new Date().toISOString(),
      archived: false,
      assignees: [],
      labels: [],
      ...newTask,
    };
    return { tasks: [...state.tasks, task] };
  }),
  
  updateTask: (taskId, updates) => set((state) => ({ 
    tasks: state.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t) 
  })),

  addSubtask: (taskId, title) => set((state) => ({
    tasks: state.tasks.map(t => {
      if (t.id === taskId) {
        const subtasks = t.subtasks || [];
        return {
          ...t,
          subtasks: [...subtasks, { id: `st${Date.now()}`, title, is_complete: false }]
        };
      }
      return t;
    })
  })),

  toggleSubtask: (taskId, subtaskId) => set((state) => ({
    tasks: state.tasks.map(t => {
      if (t.id === taskId && t.subtasks) {
        return {
          ...t,
          subtasks: t.subtasks.map(st => st.id === subtaskId ? { ...st, is_complete: !st.is_complete } : st)
        };
      }
      return t;
    })
  })),

  deleteSubtask: (taskId, subtaskId) => set((state) => ({
    tasks: state.tasks.map(t => {
      if (t.id === taskId && t.subtasks) {
        return {
          ...t,
          subtasks: t.subtasks.filter(st => st.id !== subtaskId)
        };
      }
      return t;
    })
  })),

  reorderSubtask: (taskId, subtaskId, direction) => set((state) => ({
    tasks: state.tasks.map(t => {
      if (t.id === taskId && t.subtasks) {
        const idx = t.subtasks.findIndex(st => st.id === subtaskId);
        if (idx === -1) return t;
        if (direction === 'up' && idx > 0) {
          const newSt = [...t.subtasks];
          [newSt[idx - 1], newSt[idx]] = [newSt[idx], newSt[idx - 1]];
          return { ...t, subtasks: newSt };
        }
        if (direction === 'down' && idx < t.subtasks.length - 1) {
          const newSt = [...t.subtasks];
          [newSt[idx], newSt[idx + 1]] = [newSt[idx + 1], newSt[idx]];
          return { ...t, subtasks: newSt };
        }
      }
      return t;
    })
  })),

  addComment: (taskId, userId, body, mentions = []) => set((state) => {
    const newComment = {
      id: `cm${Date.now()}`,
      task_id: taskId,
      user_id: userId,
      body,
      mentions,
      created_at: new Date().toISOString()
    };
    return { comments: [...state.comments, newComment] };
  }),

  logActivity: (taskId, projectId, userId, actionType, description) => set((state) => {
    const entry = {
      id: `act${Date.now()}`,
      task_id: taskId,
      project_id: projectId,
      user_id: userId,
      action_type: actionType,
      description,
      created_at: new Date().toISOString()
    };
    return { activityLog: [...state.activityLog, entry] };
  }),

  addNotification: (userId, type, body, relatedTaskId) => set((state) => {
    const notif = {
      id: `notif${Date.now()}`,
      user_id: userId,
      type,
      body,
      read: false,
      related_task_id: relatedTaskId,
      created_at: new Date().toISOString()
    };
    return { notifications: [...state.notifications, notif] };
  }),

  moveTask: (activeId, overId, sourceColumnId, destColumnId) => set((state) => {
    // If moving within the same column
    if (sourceColumnId === destColumnId) {
      const columnTasks = state.tasks.filter(t => t.column_id === sourceColumnId).sort((a, b) => a.order - b.order);
      const oldIndex = columnTasks.findIndex(t => t.id === activeId);
      const newIndex = columnTasks.findIndex(t => t.id === overId);
      
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return {};
      
      const newTasksOrder = [...columnTasks];
      const [removed] = newTasksOrder.splice(oldIndex, 1);
      newTasksOrder.splice(newIndex, 0, removed);
      
      const updatedTasks = newTasksOrder.map((task, index) => ({
        ...task,
        order: index + 1
      }));
      
      return {
        tasks: state.tasks.map(t => {
          if (t.column_id === sourceColumnId) {
            return updatedTasks.find(ut => ut.id === t.id) || t;
          }
          return t;
        })
      };
    } else {
      // Moving between different columns
      const taskToMove = state.tasks.find(t => t.id === activeId);
      if (!taskToMove) return {};

      // If dropped over a column directly (empty column or at the end), overId might be the columnId
      const isOverColumn = state.columns.some(c => c.id === overId);
      
      let newTasks = state.tasks.map(t => {
        if (t.id === activeId) {
          return { ...t, column_id: destColumnId };
        }
        return t;
      });
      
      const destColumnTasks = newTasks.filter(t => t.column_id === destColumnId).sort((a, b) => a.order - b.order);
      
      // Calculate order
      if (isOverColumn) {
        // Just append to the end
        const lastOrder = destColumnTasks.length > 0 ? Math.max(...destColumnTasks.map(t => t.order)) : 0;
        newTasks = newTasks.map(t => t.id === activeId ? { ...t, order: lastOrder + 1 } : t);
      } else {
        // Insert at specific index
        const overIndex = destColumnTasks.findIndex(t => t.id === overId);
        if (overIndex !== -1) {
          const newTasksOrder = [...destColumnTasks];
          const movedTaskIndex = newTasksOrder.findIndex(t => t.id === activeId);
          if (movedTaskIndex !== -1) {
             const [removed] = newTasksOrder.splice(movedTaskIndex, 1);
             const targetIndex = newTasksOrder.findIndex(t => t.id === overId);
             newTasksOrder.splice(targetIndex !== -1 ? targetIndex : overIndex, 0, removed);
             
             const updatedTasks = newTasksOrder.map((task, index) => ({
                ...task,
                order: index + 1
             }));
             
             newTasks = newTasks.map(t => {
                if (t.column_id === destColumnId) {
                   return updatedTasks.find(ut => ut.id === t.id) || t;
                }
                return t;
             });
          }
        }
      }
      return { tasks: newTasks };
    }
  }),

  // Columns actions
  setColumns: (newColumns) => set({ columns: newColumns }),
  
  addColumn: (projectId, name) => set((state) => {
    const id = `c${Date.now()}`;
    const projectColumns = state.columns.filter(c => c.project_id === projectId);
    const order = projectColumns.length > 0 ? Math.max(...projectColumns.map(c => c.order)) + 1 : 1;
    
    return { 
      columns: [...state.columns, { id, project_id: projectId, name, order, color: 'gray' }] 
    };
  }),
  
  renameColumn: (columnId, newName) => set((state) => ({
    columns: state.columns.map(c => c.id === columnId ? { ...c, name: newName } : c)
  })),
  
  reorderColumn: (projectId, activeId, overId) => set((state) => {
    const projectColumns = state.columns.filter(c => c.project_id === projectId).sort((a, b) => a.order - b.order);
    const oldIndex = projectColumns.findIndex(c => c.id === activeId);
    const newIndex = projectColumns.findIndex(c => c.id === overId);
    
    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return {};
    
    const newColumnsOrder = [...projectColumns];
    const [removed] = newColumnsOrder.splice(oldIndex, 1);
    newColumnsOrder.splice(newIndex, 0, removed);
    
    const updatedColumns = newColumnsOrder.map((col, index) => ({
      ...col,
      order: index + 1
    }));
    
    return {
      columns: state.columns.map(c => {
        if (c.project_id === projectId) {
          return updatedColumns.find(uc => uc.id === c.id) || c;
        }
        return c;
      })
    };
  }),
  
  deleteColumn: (columnId) => set((state) => ({
    columns: state.columns.filter(c => c.id !== columnId),
    // Move tasks to a "deleted" state, or actually just delete them for this mock
    tasks: state.tasks.filter(t => t.column_id !== columnId)
  })),
}));
