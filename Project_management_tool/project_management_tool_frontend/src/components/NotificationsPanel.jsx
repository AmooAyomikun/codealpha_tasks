import React, { useEffect } from 'react';
import { X, CheckCircle2, MessageSquare, AtSign, Clock, Layout } from 'lucide-react';
import { useProjectStore } from '../store/projectStore';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

export function NotificationsPanel({ onClose, userId }) {
  const { notifications, markAllNotificationsRead, tasks } = useProjectStore();
  const navigate = useNavigate();

  const userNotifications = notifications.filter(n => n.user_id === userId).sort((a,b) => new Date(b.created_at) - new Date(a.created_at));

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleNotificationClick = (notif) => {
    if (notif.related_task_id) {
      const task = tasks.find(t => t.id === notif.related_task_id);
      if (task) {
        navigate(`/app/projects/${task.project_id}`);
        // To open the specific task, we could use a query param or global state, but for now just navigate to project.
        onClose();
      }
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'mention': return <AtSign className="w-4 h-4 text-blue-500" />;
      case 'assignment': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'comment': return <MessageSquare className="w-4 h-4 text-purple-500" />;
      case 'due_soon': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <Layout className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-background/50 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full md:w-[400px] bg-card border-l border-border shadow-2xl z-50 flex flex-col transform transition-transform duration-200 ease-out">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
          <div className="flex items-center gap-4">
            {userNotifications.some(n => !n.read) && (
              <button 
                onClick={() => markAllNotificationsRead(userId)}
                className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Mark all as read
              </button>
            )}
            <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {userNotifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No notifications.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {userNotifications.map(notif => (
                <div 
                  key={notif.id} 
                  className={cn(
                    "p-4 flex gap-3 hover:bg-muted/50 cursor-pointer transition-colors",
                    !notif.read ? "bg-primary/5" : ""
                  )}
                  onClick={() => handleNotificationClick(notif)}
                >
                  <div className="mt-0.5 shrink-0">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm text-foreground",
                      !notif.read ? "font-semibold" : ""
                    )}>
                      {notif.body}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {!notif.read && (
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
