import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProjectStore } from '../store/projectStore';
import { Kanban, List as ListIcon, Calendar, Users, Filter, Plus } from 'lucide-react';
import { cn } from '../lib/utils';
import { ProjectBoard } from '../components/ProjectBoard';

export function ProjectView() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('board');
  const project = useProjectStore(state => state.projects.find(p => p.id === id));
  
  if (!project) {
    return <div className="flex-1 p-8">Project not found</div>;
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden">
      {/* Project Header */}
      <header className="shrink-0 px-6 pt-6 pb-2 border-b border-border bg-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium border border-border rounded-md hover:bg-muted text-foreground transition-colors">
              <Users className="w-4 h-4" />
              Share
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors shadow-sm">
              <Plus className="w-4 h-4" />
              Add Task
            </button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setActiveTab('board')}
            className={cn(
              "flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors",
              activeTab === 'board' ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Kanban className="w-4 h-4" />
            Board
          </button>
          <button 
            onClick={() => setActiveTab('list')}
            className={cn(
              "flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors",
              activeTab === 'list' ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <ListIcon className="w-4 h-4" />
            List
          </button>
          <button 
            onClick={() => setActiveTab('calendar')}
            className={cn(
              "flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors",
              activeTab === 'calendar' ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Calendar className="w-4 h-4" />
            Calendar
          </button>
          
          <div className="ml-auto flex items-center gap-2 pb-3">
            <button className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
              <Filter className="w-3.5 h-3.5" />
              Filter
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden bg-muted/20">
        {activeTab === 'board' && <ProjectBoard projectId={project.id} />}
        {activeTab === 'list' && (
          <div className="p-8 text-center text-muted-foreground">List view coming soon...</div>
        )}
        {activeTab === 'calendar' && (
          <div className="p-8 text-center text-muted-foreground">Calendar view coming soon...</div>
        )}
      </main>
    </div>
  );
}
