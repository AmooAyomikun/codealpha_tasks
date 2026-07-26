import React, { useState } from 'react';
import { useProjectStore } from '../store/projectStore';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { cn } from '../lib/utils';
import { TaskDetailPanel } from './TaskDetailPanel';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function ProjectCalendar({ projectId }) {
  const { tasks } = useProjectStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const projectTasks = tasks.filter(t => t.due_date);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  return (
    <>
      <div className="flex-1 flex flex-col h-full bg-background overflow-hidden p-6 gap-6">
        
        {/* Header */}
        <div className="flex items-center justify-between shrink-0 bg-card border border-border p-4 rounded-xl shadow-sm">
          <h2 className="text-xl font-bold text-foreground">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="flex items-center gap-2">
            <button 
              onClick={prevMonth}
              className="p-1.5 rounded-md border border-border bg-muted hover:bg-accent text-foreground transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1.5 rounded-md border border-border bg-muted hover:bg-accent text-sm font-medium text-foreground transition-colors"
            >
              Today
            </button>
            <button 
              onClick={nextMonth}
              className="p-1.5 rounded-md border border-border bg-muted hover:bg-accent text-foreground transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 border border-border rounded-xl shadow-sm overflow-hidden flex flex-col bg-card">
          {/* Days Header */}
          <div className="grid grid-cols-7 border-b border-border bg-muted/30">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>
          
          {/* Days Grid */}
          <div className="flex-1 grid grid-cols-7 auto-rows-[minmax(100px,1fr)] bg-border gap-[1px] overflow-y-auto custom-scrollbar">
            {calendarDays.map((day, idx) => {
              const dayTasks = projectTasks.filter(t => isSameDay(new Date(t.due_date), day));
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isToday = isSameDay(day, new Date());
              
              return (
                <div 
                  key={day.toISOString() + idx}
                  className={cn(
                    "bg-card p-2 flex flex-col gap-1 overflow-hidden transition-colors",
                    !isCurrentMonth ? "bg-muted/30 opacity-60" : "hover:bg-accent/10"
                  )}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={cn(
                      "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full",
                      isToday ? "bg-primary text-primary-foreground font-bold" : "text-foreground"
                    )}>
                      {format(day, 'd')}
                    </span>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                    {dayTasks.map(task => (
                      <div 
                        key={task.id}
                        onClick={() => setSelectedTaskId(task.id)}
                        className={cn(
                          "text-xs px-2 py-1 rounded truncate cursor-pointer transition-transform hover:scale-[1.02]",
                          task.priority === 'high' ? "bg-red-500/10 text-red-500 border border-red-500/20" :
                          task.priority === 'medium' ? "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20" :
                          "bg-green-500/10 text-green-500 border border-green-500/20"
                        )}
                        title={task.title}
                      >
                        {task.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
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
