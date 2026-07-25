import { useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { useProjectStore } from '../store/projectStore';

export function useWebSocket(projectId) {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  
  const rawAddTask = useProjectStore((state) => state.rawAddTask);
  const rawUpdateTask = useProjectStore((state) => state.rawUpdateTask);
  const rawDeleteTask = useProjectStore((state) => state.rawDeleteTask);
  const rawAddComment = useProjectStore((state) => state.rawAddComment);
  const rawAddNotification = useProjectStore((state) => state.rawAddNotification);
  const setPresence = useProjectStore((state) => state.setPresence);
  const addActiveUser = useProjectStore((state) => state.addActiveUser);
  const removeActiveUser = useProjectStore((state) => state.removeActiveUser);

  const projectWs = useRef(null);
  const notifWs = useRef(null);

  useEffect(() => {
    if (!token) return;

    // 1. Connect User Notifications WebSocket
    if (user?.id) {
      notifWs.current = new WebSocket(`ws://127.0.0.1:8000/ws/notifications/${user.id}/?token=${token}`);
      
      notifWs.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'notification.new') {
          rawAddNotification(data.data);
        }
      };

      notifWs.current.onclose = () => {
        console.log('Notifications WS disconnected');
      };
    }

    return () => {
      if (notifWs.current) {
        notifWs.current.close();
      }
    };
  }, [token, user?.id]);

  useEffect(() => {
    if (!token || !projectId) return;

    // 2. Connect Project WebSocket
    projectWs.current = new WebSocket(`ws://127.0.0.1:8000/ws/project/${projectId}/?token=${token}`);
    
    projectWs.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      switch (data.type) {
        case 'task.created':
          rawAddTask(data.data);
          break;
        case 'task.updated':
        case 'task.moved':
          rawUpdateTask(data.data);
          break;
        case 'task.deleted':
          rawDeleteTask(data.data.id);
          break;
        case 'comment.created':
          rawAddComment(data.data);
          break;
        case 'presence.joined':
          addActiveUser(projectId, data.data);
          break;
        case 'presence.left':
          removeActiveUser(projectId, data.data.id);
          break;
        default:
          break;
      }
    };

    projectWs.current.onclose = () => {
      console.log(`Project WS ${projectId} disconnected`);
    };

    return () => {
      if (projectWs.current) {
        projectWs.current.close();
      }
    };
  }, [token, projectId]);
}
