import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProjectStore } from '../store/projectStore';
import { Kanban, List as ListIcon, Calendar, Users, Filter, Plus } from 'lucide-react';
import { cn } from '../lib/utils';
import { ProjectBoard } from '../components/ProjectBoard';
import { ProjectList } from '../components/ProjectList';
import { ProjectCalendar } from '../components/ProjectCalendar';
import { useWebSocket } from '../hooks/useWebSocket';
import { useEffect } from 'react';

const EMPTY_ARRAY = [];

export function ProjectView() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('board');
  const project = useProjectStore(state => state.projects.find(p => String(p.id) === id));
  const activeUsers = useProjectStore(state => state.activeUsers[id] || EMPTY_ARRAY);
  
  const fetchProjectBoard = useProjectStore(state => state.fetchProjectBoard);
  
  // Initialize WebSocket connection
  useWebSocket(id);
  
  useEffect(() => {
    fetchProjectBoard(id);
  }, [id, fetchProjectBoard]);
  
  if (!project) {
    return <div className="flex-1 p-8">Project not found</div>;
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden">
      {/* Project Header */}
      <header className="shrink-0 px-8 pt-8 pb-4 border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg border border-primary/20 shadow-sm">
              {project.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground tracking-tight">{project.name}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">{project.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            
            {/* Live Presence Avatars */}
            {activeUsers.length > 0 && (
              <div className="flex -space-x-2 mr-2">
                {activeUsers.map(u => (
                  <img 
                    key={u.id} 
                    src={u.avatar_url || `https://ui-avatars.com/api/?name=${u.name}`} 
                    alt={u.name} 
                    title={`${u.name} (Active)`}
                    className="w-8 h-8 rounded-full border-2 border-background relative z-10 hover:z-20 transition-transform hover:scale-110 cursor-help shadow-sm"
                  />
                ))}
              </div>
            )}

            <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium border border-border/50 bg-card rounded-lg hover:bg-muted text-foreground transition-all shadow-sm">
              <Users className="w-4 h-4" />
              Share
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all shadow-sm">
              <Plus className="w-4 h-4" />
              Add Task
            </button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setActiveTab('board')}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all",
              activeTab === 'board' ? "bg-muted text-foreground shadow-sm" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            <Kanban className="w-4 h-4" />
            Board
          </button>
          <button 
            onClick={() => setActiveTab('list')}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all",
              activeTab === 'list' ? "bg-muted text-foreground shadow-sm" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            <ListIcon className="w-4 h-4" />
            List
          </button>
          <button 
            onClick={() => setActiveTab('calendar')}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all",
              activeTab === 'calendar' ? "bg-muted text-foreground shadow-sm" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            <Calendar className="w-4 h-4" />
            Calendar
          </button>
          
          <div className="ml-auto flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded transition-colors">
              <Filter className="w-3.5 h-3.5" />
              Filter
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden flex flex-col bg-muted/10">
        {activeTab === 'board' && <ProjectBoard projectId={project.id} />}
        {activeTab === 'list' && <ProjectList projectId={project.id} />}
        {activeTab === 'calendar' && <ProjectCalendar projectId={project.id} />}
      </main>
    </div>
  );
}
