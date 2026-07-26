import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Command, Layout, Bell, Settings, Moon, Sun, Search, Hash } from 'lucide-react';
import { useUIStore } from '../store/uiStore';
import { cn } from '../lib/utils';
import { CommandPalette } from '../components/CommandPalette';
import { ProjectView } from './ProjectView';
import { NotificationsPanel } from '../components/NotificationsPanel';
import { useProjectStore } from '../store/projectStore';
import { useAuthStore } from '../store/authStore';
import { useWebSocket } from '../hooks/useWebSocket';

export function AppShell() {
  const { isDarkMode, toggleDarkMode, openCommandPalette } = useUIStore();
  const location = useLocation();
  const currentUser = useAuthStore((state) => state.user) || { id: 1, name: 'User', email: '' }; 
  const fetchInitialData = useProjectStore((state) => state.fetchInitialData);
  const workspaces = useProjectStore((state) => state.workspaces);
  const projects = useProjectStore((state) => state.projects);
  const users = useProjectStore((state) => state.users);
  
  const fetchUser = useAuthStore((state) => state.fetchUser);

  // Connect global user notification socket
  useWebSocket(null);

  useEffect(() => {
    fetchInitialData();
    fetchUser();
  }, [fetchInitialData, fetchUser]);

  const currentWorkspace = workspaces[0] || { id: 1, name: 'Loading Workspace...' };
  const workspaceProjects = projects; // Projects returned by API are already filtered by workspace per user
  
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { notifications } = useProjectStore();
  const unreadCount = notifications.filter(n => n.user_id === currentUser.id && !n.read).length;

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col shrink-0 transition-all duration-300 relative z-20 hidden md:flex">
        {/* Workspace Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-border hover:bg-muted/30 transition-colors cursor-pointer">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0 border border-primary/20">
              {currentWorkspace.name.charAt(0).toUpperCase()}
            </div>
            <span className="font-semibold text-sm truncate flex-1 text-foreground">{currentWorkspace.name}</span>
          </div>
          <Settings className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Global Search / Command Palette Trigger */}
        <div className="p-4 pb-2">
          <button 
            onClick={openCommandPalette}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background text-muted-foreground text-sm hover:border-primary/50 hover:text-foreground transition-all shadow-sm"
          >
            <Search className="w-4 h-4" />
            <span className="flex-1 text-left">Search issues...</span>
            <kbd className="font-sans text-[10px] bg-muted border border-border px-1.5 py-0.5 rounded shadow-sm opacity-70">⌘K</kbd>
          </button>
        </div>

        {/* Sidebar Nav */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 no-scrollbar">
          
          <div className="space-y-1">
            <Link to="/app" className={cn("flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors font-medium", location.pathname === '/app' ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground")}>
              <Layout className="w-4 h-4" />
              Overview
            </Link>
            <button 
              onClick={() => setIsNotificationsOpen(true)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
            >
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Inbox
              </div>
              {unreadCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-primary text-xs font-bold text-primary-foreground flex items-center justify-center shadow-sm">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between px-3 py-2 group cursor-pointer">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider group-hover:text-foreground transition-colors">Projects</span>
              <button className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                <Hash className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-0.5 mt-1">
              {workspaceProjects.map(project => (
                <Link 
                  key={project.id} 
                  to={`/app/projects/${project.id}`} 
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors", 
                    location.pathname.includes(`/projects/${project.id}`) ? "bg-primary/5 text-foreground font-medium border border-primary/10" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground border border-transparent"
                  )}
                >
                  <div className={cn("w-2 h-2 rounded-full", location.pathname.includes(`/projects/${project.id}`) ? "bg-primary" : "bg-border group-hover:bg-primary/50")} />
                  <span className="truncate">{project.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-border mt-auto bg-muted/10">
          <div className="flex items-center gap-3">
            <img src={currentUser.avatar_url || `https://ui-avatars.com/api/?name=${currentUser.name}`} alt={currentUser.name} className="w-9 h-9 rounded-full bg-background border border-border shadow-sm" />
            <div className="flex-1 min-w-0 flex flex-col">
              <span className="text-sm font-medium truncate text-foreground">{currentUser.name || currentUser.username}</span>
              <span className="text-xs text-muted-foreground truncate">{currentUser.email}</span>
            </div>
            <div className="flex flex-col gap-1">
              <button onClick={toggleDarkMode} className="p-1.5 rounded-md text-muted-foreground hover:bg-background hover:text-foreground hover:shadow-sm border border-transparent hover:border-border transition-all" title="Toggle theme">
                {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-background relative z-10">
        <Routes>
          <Route path="/" element={<DashboardView user={currentUser} />} />
          <Route path="/projects/:id" element={<ProjectView />} />
          <Route path="/notifications" element={<div className="p-8"><h1 className="text-2xl font-bold">Notifications</h1><p className="text-muted-foreground mt-2">No new notifications.</p></div>} />
        </Routes>
      </main>

      {isNotificationsOpen && (
        <NotificationsPanel 
          userId={currentUser.id} 
          onClose={() => setIsNotificationsOpen(false)} 
        />
      )}
      <CommandPalette />
    </div>
  );
}

function DashboardView({ user }) {
  const { tasks, users, columns } = useProjectStore();
  
  // Calculate workload: open tasks per user (not in 'done' column)
  // Assuming 'done' column name or just looking at tasks.
  // Actually we need to check if the column is "Done" or just count all for now.
  const doneColumnIds = columns.filter(c => c.name.toLowerCase().includes('done')).map(c => c.id);
  const activeTasks = tasks.filter(t => !doneColumnIds.includes(t.column_id));
  
  const workload = users.map(u => {
    const count = activeTasks.filter(t => t.assignees?.includes(u.id)).length;
    return { ...u, count };
  }).sort((a, b) => b.count - a.count);

  const maxWorkload = Math.max(...workload.map(w => w.count), 1);

  return (
    <div className="p-8 overflow-y-auto h-full">
      <h1 className="text-2xl font-bold mb-6 text-foreground">Good morning, {user?.first_name || user?.name?.split(' ')[0] || user?.username || 'User'}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-foreground">My Tasks</h2>
            <div className="space-y-3">
              {activeTasks.filter(t => t.assignees?.includes(user.id)).length === 0 ? (
                <p className="text-sm text-muted-foreground">No active tasks assigned to you.</p>
              ) : (
                activeTasks.filter(t => t.assignees?.includes(user.id)).slice(0, 5).map(t => (
                  <div key={t.id} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors">
                    <div className="w-4 h-4 rounded-full border border-primary shrink-0"></div>
                    <span className="text-sm font-medium text-foreground">{t.title}</span>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-foreground">Team Workload</h2>
            <div className="space-y-4 mt-6">
              {workload.map(member => (
                <div key={member.id} className="flex items-center gap-4">
                  <img src={member.avatar_url} alt="" className="w-8 h-8 rounded-full shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-foreground">{member.name}</span>
                      <span className="text-muted-foreground">{member.count} open tasks</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${(member.count / maxWorkload) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm h-fit">
          <h2 className="text-lg font-semibold mb-4 text-foreground">Recent Activity</h2>
          <p className="text-sm text-muted-foreground">No recent activity.</p>
        </div>
      </div>
    </div>
  );
}

