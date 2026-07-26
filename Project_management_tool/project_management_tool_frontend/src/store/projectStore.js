import { create } from 'zustand';
import { api } from '../lib/api';

export const useProjectStore = create((set, get) => ({
  workspaces: [],
  projects: [],
  columns: [],
  tasks: [],
  users: [],
  labels: [],
  comments: [],
  activityLog: [],
  notifications: [],
  activeUsers: {}, 
  
  fetchInitialData: async () => {
    try {
      const [wsRes, projRes, notifRes] = await Promise.all([
        api.get('/workspaces/'),
        api.get('/projects/'),
        api.get('/notifications/')
      ]);
      set({ 
        workspaces: wsRes.data, 
        projects: projRes.data,
        notifications: notifRes.data
      });
    } catch (e) {
      console.error('Failed to fetch initial data', e);
    }
  },

  fetchProjectBoard: async (projectId) => {
    try {
      const [colRes, taskRes, labelRes] = await Promise.all([
        api.get(`/columns/?project=${projectId}`),
        api.get(`/tasks/?project=${projectId}`),
        api.get(`/labels/?project=${projectId}`)
      ]);
      set({ 
        columns: colRes.data, 
        tasks: taskRes.data,
        labels: labelRes.data
      });
    } catch (e) {
      console.error('Failed to fetch project board', e);
    }
  },

  fetchTaskDetails: async (taskId) => {
    try {
       const [subRes, comRes] = await Promise.all([
         api.get(`/subtasks/?task=${taskId}`),
         api.get(`/comments/?task=${taskId}`)
       ]);
       set(state => {
         const newTasks = state.tasks.map(t => 
           t.id === taskId ? { ...t, subtasks: subRes.data } : t
         );
         const existingIds = new Set(state.comments.map(c => c.id));
         const newComments = comRes.data.filter(c => !existingIds.has(c.id));
         return { tasks: newTasks, comments: [...state.comments, ...newComments] };
       });
    } catch (e) {
       console.error('Failed to fetch task details', e);
    }
  },

  setTasks: (newTasks) => set({ tasks: newTasks }),
  
  addTask: async (newTask) => {
    try {
      const res = await api.post('/tasks/', newTask);
      get().rawAddTask(res.data);
    } catch (e) { console.error('Failed to add task', e); }
  },
  
  updateTask: async (taskId, updates) => {
    set((state) => ({ 
      tasks: state.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t) 
    }));
    try {
      await api.patch(`/tasks/${taskId}/`, updates);
    } catch (e) { console.error('Failed to update task', e); }
  },

  moveTask: async (activeId, overId, sourceColumnId, destColumnId) => {
    const state = get();
    // If moving within the same column
    if (sourceColumnId === destColumnId) {
      const columnTasks = state.tasks.filter(t => t.column === sourceColumnId).sort((a, b) => a.order - b.order);
      const oldIndex = columnTasks.findIndex(t => t.id === activeId);
      const newIndex = columnTasks.findIndex(t => t.id === overId);
      
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;
      
      const newTasksOrder = [...columnTasks];
      const [removed] = newTasksOrder.splice(oldIndex, 1);
      newTasksOrder.splice(newIndex, 0, removed);
      
      const updatedTasks = newTasksOrder.map((task, index) => ({
        ...task,
        order: index + 1
      }));
      
      const activeNewOrder = updatedTasks.find(t => t.id === activeId)?.order || 1;

      set({
        tasks: state.tasks.map(t => {
          if (t.column === sourceColumnId) {
            return updatedTasks.find(ut => ut.id === t.id) || t;
          }
          return t;
        })
      });

      try {
        await api.patch(`/tasks/${activeId}/`, { order: activeNewOrder });
      } catch (e) { console.error('Failed to move task', e); }

    } else {
      // Moving between different columns
      const taskToMove = state.tasks.find(t => t.id === activeId);
      if (!taskToMove) return;

      const isOverColumn = state.columns.some(c => c.id === overId);
      
      let newTasks = state.tasks.map(t => {
        if (t.id === activeId) {
          return { ...t, column: destColumnId };
        }
        return t;
      });
      
      const destColumnTasks = newTasks.filter(t => t.column === destColumnId).sort((a, b) => a.order - b.order);
      let activeNewOrder = 1;

      // Calculate order
      if (isOverColumn) {
        activeNewOrder = destColumnTasks.length > 0 ? Math.max(...destColumnTasks.map(t => t.order)) + 1 : 1;
        newTasks = newTasks.map(t => t.id === activeId ? { ...t, order: activeNewOrder } : t);
      } else {
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
             
             activeNewOrder = updatedTasks.find(t => t.id === activeId)?.order || 1;

             newTasks = newTasks.map(t => {
                if (t.column === destColumnId) {
                   return updatedTasks.find(ut => ut.id === t.id) || t;
                }
                return t;
             });
          }
        }
      }

      set({ tasks: newTasks });

      try {
        await api.patch(`/tasks/${activeId}/`, { column: destColumnId, order: activeNewOrder });
      } catch (e) { console.error('Failed to move task between columns', e); }
    }
  },

  addSubtask: async (taskId, title) => {
    try {
       const res = await api.post('/subtasks/', { task: taskId, title });
       set((state) => ({
         tasks: state.tasks.map(t => {
           if (t.id === taskId) {
             return { ...t, subtasks: [...(t.subtasks || []), res.data] };
           }
           return t;
         })
       }));
    } catch(e) { console.error('Failed to add subtask', e); }
  },

  toggleSubtask: async (taskId, subtaskId) => {
    const task = get().tasks.find(t => t.id === taskId);
    const subtask = task?.subtasks?.find(s => s.id === subtaskId);
    if (!subtask) return;
    
    set((state) => ({
      tasks: state.tasks.map(t => {
        if (t.id === taskId && t.subtasks) {
          return {
            ...t,
            subtasks: t.subtasks.map(st => st.id === subtaskId ? { ...st, is_complete: !st.is_complete } : st)
          };
        }
        return t;
      })
    }));
    try {
       await api.patch(`/subtasks/${subtaskId}/`, { is_complete: !subtask.is_complete });
    } catch(e) { console.error('Failed to toggle subtask', e); }
  },

  deleteSubtask: async (taskId, subtaskId) => {
    set((state) => ({
      tasks: state.tasks.map(t => {
        if (t.id === taskId && t.subtasks) {
          return {
            ...t,
            subtasks: t.subtasks.filter(st => st.id !== subtaskId)
          };
        }
        return t;
      })
    }));
    try {
       await api.delete(`/subtasks/${subtaskId}/`);
    } catch(e) { console.error('Failed to delete subtask', e); }
  },

  addComment: async (taskId, body, mentions = []) => {
    try {
       const res = await api.post('/comments/', { task: taskId, body });
       get().rawAddComment(res.data);
    } catch(e) { console.error('Failed to add comment', e); }
  },

  markAllNotificationsRead: async () => {
    try {
      await api.post('/notifications/mark_all_read/');
      set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true }))
      }));
    } catch (e) { console.error('Failed to mark notifications', e); }
  },

  // Columns actions
  setColumns: (newColumns) => set({ columns: newColumns }),
  
  createProject: async (workspaceId, name, description) => {
    try {
      const res = await api.post('/projects/', { workspace: workspaceId, name, description });
      set(state => ({ projects: [...state.projects, res.data] }));
      return res.data;
    } catch(e) { console.error('Failed to create project', e); throw e; }
  },
  
  addColumn: async (projectId, name) => {
    const order = get().columns.filter(c => c.project === projectId).length + 1;
    try {
      const res = await api.post('/columns/', { project: projectId, name, order, color: 'gray' });
      set(state => ({ columns: [...state.columns, res.data] }));
    } catch(e) { console.error('Failed to add column', e); }
  },
  
  renameColumn: async (columnId, newName) => {
    set((state) => ({
      columns: state.columns.map(c => c.id === columnId ? { ...c, name: newName } : c)
    }));
    try {
      await api.patch(`/columns/${columnId}/`, { name: newName });
    } catch(e) { console.error('Failed to rename column', e); }
  },
  
  reorderColumn: async (projectId, activeId, overId) => {
    const state = get();
    const projectColumns = state.columns.filter(c => c.project === projectId).sort((a, b) => a.order - b.order);
    const oldIndex = projectColumns.findIndex(c => c.id === activeId);
    const newIndex = projectColumns.findIndex(c => c.id === overId);
    
    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;
    
    const newColumnsOrder = [...projectColumns];
    const [removed] = newColumnsOrder.splice(oldIndex, 1);
    newColumnsOrder.splice(newIndex, 0, removed);
    
    const updatedColumns = newColumnsOrder.map((col, index) => ({
      ...col,
      order: index + 1
    }));
    
    set({
      columns: state.columns.map(c => {
        if (c.project === projectId) {
          return updatedColumns.find(uc => uc.id === c.id) || c;
        }
        return c;
      })
    });

    const activeNewOrder = updatedColumns.find(c => c.id === activeId)?.order || 1;
    try {
      await api.patch(`/columns/${activeId}/`, { order: activeNewOrder });
    } catch(e) { console.error('Failed to reorder column', e); }
  },
  
  deleteColumn: async (columnId) => {
    set((state) => ({
      columns: state.columns.filter(c => c.id !== columnId),
      tasks: state.tasks.filter(t => t.column !== columnId)
    }));
    try {
      await api.delete(`/columns/${columnId}/`);
    } catch(e) { console.error('Failed to delete column', e); }
  },

  // --- RAW ACTIONS FOR WEBSOCKET EVENTS ---
  rawAddTask: (task) => set((state) => {
    if (state.tasks.some(t => t.id === task.id)) return state;
    return { tasks: [...state.tasks, task] };
  }),
  
  rawUpdateTask: (task) => set((state) => ({
    tasks: state.tasks.map(t => t.id === task.id ? { ...t, ...task } : t)
  })),
  
  rawDeleteTask: (taskId) => set((state) => ({
    tasks: state.tasks.filter(t => t.id !== taskId)
  })),
  
  rawAddComment: (comment) => set((state) => {
    if (state.comments.some(c => c.id === comment.id)) return state;
    return { comments: [...state.comments, comment] };
  }),
  
  rawAddNotification: (notification) => set((state) => {
    if (state.notifications.some(n => n.id === notification.id)) return state;
    return { notifications: [notification, ...state.notifications] };
  }),
  
  setPresence: (projectId, users) => set((state) => ({
    activeUsers: { ...state.activeUsers, [projectId]: users }
  })),
  
  addActiveUser: (projectId, user) => set((state) => {
    const projectUsers = state.activeUsers[projectId] || [];
    if (projectUsers.some(u => u.id === user.id)) return state;
    return {
      activeUsers: { ...state.activeUsers, [projectId]: [...projectUsers, user] }
    };
  }),
  
  removeActiveUser: (projectId, userId) => set((state) => {
    const projectUsers = state.activeUsers[projectId] || [];
    return {
      activeUsers: { ...state.activeUsers, [projectId]: projectUsers.filter(u => u.id !== userId) }
    };
  }),
}));
