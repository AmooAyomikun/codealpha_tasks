import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Command, Layout, Bell, Settings, Moon, Sun, Search, Hash } from 'lucide-react';
import { useUIStore } from '../store/uiStore';
import { workspaces, projects, users } from '../lib/mockData';
import { cn } from '../lib/utils';
import { CommandPalette } from '../components/CommandPalette';

export function AppShell() {
  const { isDarkMode, toggleDarkMode, openCommandPalette } = useUIStore();
  const location = useLocation();
  const currentUser = users[0]; // Mock logged in user
  const currentWorkspace = workspaces[0];
  const workspaceProjects = projects.filter(p => p.workspace_id === currentWorkspace.id);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col shrink-0 transition-all duration-300 relative z-20 hidden md:flex">
        {/* Workspace Header */}
        <div className="h-14 flex items-center px-4 border-b border-border gap-2 cursor-pointer hover:bg-muted/50 transition-colors">
          <div className="w-6 h-6 rounded bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
            {currentWorkspace.name.charAt(0)}
          </div>
          <span className="font-semibold text-sm truncate flex-1">{currentWorkspace.name}</span>
          <Command className="w-4 h-4 text-muted-foreground" />
        </div>

        {/* Global Search / Command Palette Trigger */}
        <div className="p-3">
          <button 
            onClick={openCommandPalette}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-muted/30 text-muted-foreground text-sm hover:bg-muted/80 hover:text-foreground transition-colors"
          >
            <Search className="w-4 h-4" />
            <span className="flex-1 text-left">Search...</span>
            <kbd className="font-sans text-[10px] bg-background border border-border px-1.5 rounded shadow-sm opacity-70">Cmd K</kbd>
          </button>
        </div>

        {/* Sidebar Nav */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
          
          <div>
            <div className="flex items-center justify-between px-2 py-1 mb-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Work</span>
            </div>
            <div className="space-y-0.5">
              <Link to="/app" className={cn("flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors", location.pathname === '/app' ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
                <Layout className="w-4 h-4" />
                Dashboard
              </Link>
              <Link to="/app/notifications" className="flex items-center justify-between px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  Notifications
                </div>
                <span className="w-4 h-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">3</span>
              </Link>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between px-2 py-1 mb-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Projects</span>
            </div>
            <div className="space-y-0.5">
              {workspaceProjects.map(project => (
                <Link 
                  key={project.id} 
                  to={`/app/projects/${project.id}`} 
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors", 
                    location.pathname.includes(`/projects/${project.id}`) ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Hash className="w-4 h-4 shrink-0 opacity-60" />
                  <span className="truncate">{project.name}</span>
                </Link>
              ))}
            </div>
          </div>

        </div>

        {/* User Profile Footer */}
        <div className="p-3 border-t border-border mt-auto">
          <div className="flex items-center gap-3">
            <img src={currentUser.avatar_url} alt={currentUser.name} className="w-8 h-8 rounded-full bg-muted border border-border" />
            <div className="flex-1 min-w-0 flex flex-col">
              <span className="text-sm font-medium truncate text-foreground">{currentUser.name}</span>
              <span className="text-xs text-muted-foreground truncate">{currentUser.email}</span>
            </div>
            <button onClick={toggleDarkMode} className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" title="Toggle theme">
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" title="Settings">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-background relative z-10">
        <Routes>
          <Route path="/" element={<DashboardView user={currentUser} />} />
          <Route path="/projects/:id" element={<ProjectPlaceholderView />} />
          <Route path="/notifications" element={<div className="p-8"><h1 className="text-2xl font-bold">Notifications</h1><p className="text-muted-foreground mt-2">No new notifications.</p></div>} />
        </Routes>
      </main>

      <CommandPalette />
    </div>
  );
}

function DashboardView({ user }) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-foreground">Good morning, {user.name.split(' ')[0]}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2 bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-foreground">My Tasks</h2>
          <div className="space-y-3">
            {/* Mock Tasks for dashboard */}
            <div className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors">
              <div className="w-4 h-4 rounded-full border border-primary shrink-0"></div>
              <span className="text-sm font-medium text-foreground">Create wireframes</span>
              <span className="text-xs text-muted-foreground ml-auto">Website Redesign</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors">
              <div className="w-4 h-4 rounded-full border border-primary shrink-0"></div>
              <span className="text-sm font-medium text-foreground">Design System</span>
              <span className="text-xs text-muted-foreground ml-auto">Website Redesign</span>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-foreground">Recent Activity</h2>
          <p className="text-sm text-muted-foreground">No recent activity.</p>
        </div>
      </div>
    </div>
  );
}

function ProjectPlaceholderView() {
  return (
    <div className="flex-1 flex items-center justify-center bg-muted/10">
      <div className="text-center">
        <Layout className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h2 className="text-xl font-medium text-foreground mb-2">Project Board</h2>
        <p className="text-muted-foreground text-sm max-w-sm">The full kanban board, list view, and calendar view will be implemented in the next phase.</p>
      </div>
    </div>
  );
}
