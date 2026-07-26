import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useProjectStore } from '../store/projectStore';
import { ChevronUp, ChevronDown, Filter, Calendar as CalendarIcon, Tag, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import { TaskDetailPanel } from './TaskDetailPanel';

export function ProjectList({ projectId }) {
  const { tasks, columns, users, labels } = useProjectStore();
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  
  const [sortConfig, setSortConfig] = useState({ key: 'title', direction: 'asc' });
  const [filters, setFilters] = useState({ assignee: '', priority: '', label: '' });
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const tableRef = useRef(null);

  const projectTasks = tasks;
  
  const filteredTasks = useMemo(() => {
    return projectTasks.filter(task => {
      if (filters.assignee && !task.assignees?.includes(filters.assignee)) return false;
      if (filters.priority && task.priority !== filters.priority) return false;
      if (filters.label && !task.labels?.includes(filters.label)) return false;
      return true;
    });
  }, [projectTasks, filters]);

  const sortedTasks = useMemo(() => {
    let sortable = [...filteredTasks];
    sortable.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      
      if (sortConfig.key === 'column') {
        aVal = columns.find(c => c.id === a.column)?.name || '';
        bVal = columns.find(c => c.id === b.column)?.name || '';
      }
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sortable;
  }, [filteredTasks, sortConfig, columns]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedTaskId) return; // if modal is open, don't navigate list
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, sortedTasks.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        if (selectedIndex >= 0 && selectedIndex < sortedTasks.length) {
          e.preventDefault();
          setSelectedTaskId(sortedTasks[selectedIndex].id);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sortedTasks, selectedIndex, selectedTaskId]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <div className="w-4 h-4" />;
    return sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  return (
    <>
      <div className="flex-1 overflow-hidden flex flex-col bg-background">
        
        {/* Filters Bar */}
        <div className="p-4 border-b border-border flex items-center gap-4 text-sm bg-card shrink-0">
          <div className="flex items-center gap-2 text-muted-foreground font-medium">
            <Filter className="w-4 h-4" /> Filters:
          </div>
          
          <select 
            className="bg-muted border border-border rounded px-2 py-1 outline-none focus:ring-1 focus:ring-primary text-foreground"
            value={filters.assignee}
            onChange={e => setFilters({ ...filters, assignee: e.target.value })}
          >
            <option value="">Any Assignee</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          
          <select 
            className="bg-muted border border-border rounded px-2 py-1 outline-none focus:ring-1 focus:ring-primary text-foreground"
            value={filters.priority}
            onChange={e => setFilters({ ...filters, priority: e.target.value })}
          >
            <option value="">Any Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <select 
            className="bg-muted border border-border rounded px-2 py-1 outline-none focus:ring-1 focus:ring-primary text-foreground"
            value={filters.label}
            onChange={e => setFilters({ ...filters, label: e.target.value })}
          >
            <option value="">Any Label</option>
            {labels.map(l => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
          
          {(filters.assignee || filters.priority || filters.label) && (
            <button 
              onClick={() => setFilters({ assignee: '', priority: '', label: '' })}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors ml-auto"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto bg-background" ref={tableRef}>
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-background sticky top-0 z-10 border-b border-border/60">
              <tr>
                <th className="font-medium text-[11px] uppercase tracking-wider text-muted-foreground p-3 cursor-pointer hover:bg-muted/30 transition-colors group" onClick={() => handleSort('title')}>
                  <div className="flex items-center gap-1 group-hover:text-foreground">Title <SortIcon columnKey="title" /></div>
                </th>
                <th className="font-medium text-[11px] uppercase tracking-wider text-muted-foreground p-3 cursor-pointer hover:bg-muted/30 transition-colors group" onClick={() => handleSort('column')}>
                  <div className="flex items-center gap-1 group-hover:text-foreground">Status <SortIcon columnKey="column" /></div>
                </th>
                <th className="font-medium text-[11px] uppercase tracking-wider text-muted-foreground p-3 cursor-pointer hover:bg-muted/30 transition-colors group">Assignee</th>
                <th className="font-medium text-[11px] uppercase tracking-wider text-muted-foreground p-3 cursor-pointer hover:bg-muted/30 transition-colors group" onClick={() => handleSort('due_date')}>
                  <div className="flex items-center gap-1 group-hover:text-foreground">Due Date <SortIcon columnKey="due_date" /></div>
                </th>
                <th className="font-medium text-[11px] uppercase tracking-wider text-muted-foreground p-3 cursor-pointer hover:bg-muted/30 transition-colors group" onClick={() => handleSort('priority')}>
                  <div className="flex items-center gap-1 group-hover:text-foreground">Priority <SortIcon columnKey="priority" /></div>
                </th>
                <th className="font-medium text-[11px] uppercase tracking-wider text-muted-foreground p-3 cursor-pointer hover:bg-muted/30 transition-colors group">Labels</th>
              </tr>
            </thead>
            <tbody>
              {sortedTasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground text-sm">No tasks found matching criteria.</td>
                </tr>
              ) : (
                sortedTasks.map((task, index) => {
                  const col = columns.find(c => c.id === task.column);
                  const isSelected = index === selectedIndex;
                  return (
                    <tr 
                      key={task.id} 
                      className={cn(
                        "border-b border-border hover:bg-accent/50 cursor-pointer transition-colors group",
                        isSelected ? "bg-accent/80" : ""
                      )}
                      onClick={() => {
                        setSelectedIndex(index);
                        setSelectedTaskId(task.id);
                      }}
                    >
                      <td className="py-2.5 px-3 align-middle text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        {task.title}
                      </td>
                      <td className="py-2.5 px-3 align-middle">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold bg-muted/50 border border-border/50 text-muted-foreground">
                          {col?.name}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 align-middle">
                        <div className="flex -space-x-1">
                          {task.assignees?.map(uid => {
                            const u = users.find(user => user.id === uid);
                            return u ? <img key={uid} src={u.avatar_url || `https://ui-avatars.com/api/?name=${u.name}`} alt="" className="w-5 h-5 rounded-full border border-background ring-1 ring-border relative" title={u.name} /> : null;
                          })}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 align-middle">
                        {task.due_date ? (
                          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            {format(new Date(task.due_date), 'MMM d')}
                          </span>
                        ) : <span className="text-muted-foreground opacity-30">-</span>}
                      </td>
                      <td className="py-2.5 px-3 align-middle text-sm capitalize">
                        <span className={cn(
                          "flex items-center gap-1.5 text-xs font-medium",
                          task.priority === 'high' ? "text-red-500" :
                          task.priority === 'medium' ? "text-yellow-500" :
                          "text-blue-500"
                        )}>
                          <AlertCircle className="w-3.5 h-3.5" />
                          {task.priority || 'low'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 align-middle">
                        <div className="flex flex-wrap gap-1.5">
                          {task.labels?.map(lid => {
                            const l = labels.find(label => label.id === lid);
                            if (!l) return null;
                            return (
                              <span 
                                key={lid} 
                                className={cn(
                                  "w-2 h-2 rounded-full shrink-0 shadow-sm border border-black/10 dark:border-white/10",
                                  l.color === 'pink' ? "bg-pink-500" :
                                  l.color === 'blue' ? "bg-blue-500" :
                                  l.color === 'green' ? "bg-green-500" :
                                  l.color === 'red' ? "bg-red-500" :
                                  l.color === 'purple' ? "bg-purple-500" : "bg-gray-500"
                                )} 
                                title={l.name}
                              />
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedTaskId && (
        <TaskDetailPanel 
          taskId={selectedTaskId} 
          onClose={() => setSelectedTaskId(null)} 
        />
      )}
    </>
  );
}
