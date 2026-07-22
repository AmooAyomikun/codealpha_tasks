import React, { useState, useEffect, useRef } from 'react';
import { Search, Folder, CheckSquare } from 'lucide-react';
import { useUIStore } from '../store/uiStore';
import { projects, tasks } from '../lib/mockData';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

export function CommandPalette() {
  const { isCommandPaletteOpen, closeCommandPalette, toggleCommandPalette } = useUIStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Handle Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleCommandPalette();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleCommandPalette]);

  // Focus input on open
  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

  // Filter results
  const q = query.toLowerCase().trim();
  const filteredProjects = q ? projects.filter(p => p.name.toLowerCase().includes(q)) : projects.slice(0, 3);
  const filteredTasks = q ? tasks.filter(t => t.title.toLowerCase().includes(q)) : tasks.slice(0, 5);

  const results = [
    ...filteredProjects.map(p => ({ ...p, type: 'project' })),
    ...filteredTasks.map(t => ({ ...t, type: 'task' }))
  ];

  // Handle keyboard navigation inside palette
  useEffect(() => {
    if (!isCommandPaletteOpen) return;
    
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === 'Enter' && results.length > 0) {
        e.preventDefault();
        handleSelect(results[selectedIndex]);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeCommandPalette();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, results, selectedIndex, closeCommandPalette]);

  const handleSelect = (item) => {
    closeCommandPalette();
    if (item.type === 'project') {
      navigate(`/app/projects/${item.id}`);
    } else {
      // In a real app, open task modal
      console.log('Selected task:', item.id);
      alert(`Selected Task: ${item.title}`);
    }
  };

  if (!isCommandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] sm:pt-[25vh]">
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity" 
        onClick={closeCommandPalette}
      />
      
      <div className="relative w-full max-w-lg overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-2xl ring-1 ring-black/5">
        <div className="flex items-center border-b border-border px-3">
          <Search className="mr-2 h-5 w-5 shrink-0 opacity-50" />
          <input
            ref={inputRef}
            className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
          />
        </div>
        
        <div className="max-h-[300px] overflow-y-auto p-2">
          {results.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </div>
          ) : (
            results.map((item, index) => (
              <div
                key={`${item.type}-${item.id}`}
                onMouseEnter={() => setSelectedIndex(index)}
                onClick={() => handleSelect(item)}
                className={cn(
                  "relative flex cursor-default select-none items-center rounded-sm px-2 py-2.5 text-sm outline-none",
                  index === selectedIndex ? "bg-accent text-accent-foreground" : "text-foreground"
                )}
              >
                {item.type === 'project' ? (
                  <Folder className="mr-2 h-4 w-4 text-primary" />
                ) : (
                  <CheckSquare className="mr-2 h-4 w-4 text-muted-foreground" />
                )}
                <span className="truncate">{item.type === 'project' ? item.name : item.title}</span>
                <span className="ml-auto text-xs text-muted-foreground uppercase tracking-wider">{item.type}</span>
              </div>
            ))
          )}
        </div>
        <div className="border-t border-border px-4 py-2 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Use <kbd className="font-sans px-1 rounded bg-accent border border-border">↑</kbd> <kbd className="font-sans px-1 rounded bg-accent border border-border">↓</kbd> to navigate
          </span>
          <span className="text-xs text-muted-foreground">
            <kbd className="font-sans px-1 rounded bg-accent border border-border">Enter</kbd> to select
          </span>
        </div>
      </div>
    </div>
  );
}
