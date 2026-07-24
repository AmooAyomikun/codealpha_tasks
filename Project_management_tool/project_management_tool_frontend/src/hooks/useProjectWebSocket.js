import { useEffect, useRef } from 'react';
import { useProjectStore } from '../store/projectStore';

export function useProjectWebSocket(projectId) {
  const wsRef = useRef(null);

  useEffect(() => {
    if (!projectId) return;

    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';
    const socket = new WebSocket(`${wsUrl}/project/${projectId}/`);
    wsRef.current = socket;

    socket.onopen = () => {
      console.log(`[WebSocket] Connected to project ${projectId}`);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const { type, payload } = data;
        
        // Use getState to avoid stale closures and unnecessary re-renders
        const state = useProjectStore.getState();

        switch (type) {
          case 'task.created':
            state.rawAddTask(payload);
            break;
          case 'task.updated':
          case 'task.moved':
            state.rawUpdateTask(payload);
            break;
          case 'task.deleted':
            state.rawDeleteTask(payload.id);
            break;
          case 'comment.created':
            state.rawAddComment(payload);
            break;
          case 'notification.new':
            state.rawAddNotification(payload);
            break;
          case 'presence.joined':
            state.addActiveUser(projectId, payload.user);
            break;
          case 'presence.left':
            state.removeActiveUser(projectId, payload.userId);
            break;
          default:
            console.warn(`[WebSocket] Unhandled event type: ${type}`);
        }
      } catch (err) {
        console.error('[WebSocket] Error parsing message', err);
      }
    };

    socket.onerror = (error) => {
      console.warn('[WebSocket] Connection error (failing silently to fallback on local state)');
    };

    socket.onclose = () => {
      console.log(`[WebSocket] Disconnected from project ${projectId}`);
    };

    return () => {
      socket.close();
    };
  }, [projectId]);

  return wsRef.current;
}
