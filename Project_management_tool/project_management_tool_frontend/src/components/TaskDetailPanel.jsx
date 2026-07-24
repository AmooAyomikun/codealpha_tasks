import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Calendar as CalendarIcon, UserPlus, Tag, AlertCircle, AlertOctagon, CheckSquare, Plus, MessageSquare, Activity, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import { useProjectStore } from '../store/projectStore';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

export function TaskDetailPanel({ taskId, onClose }) {
  const { 
    tasks, users, labels, comments, activityLog, 
    updateTask, addSubtask, toggleSubtask, deleteSubtask, reorderSubtask,
    addComment, logActivity, addNotification 
  } = useProjectStore();

  const task = tasks.find(t => t.id === taskId);
  const currentUser = users[0]; // mock current logged in user
  
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [newSubtask, setNewSubtask] = useState('');
  const [commentBody, setCommentBody] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');

  // Update local state if task changes externally
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
    }
  }, [task?.title, task?.description]);

  // Esc key to close
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!task) return null;

  const handleTitleBlur = () => {
    if (title.trim() !== task.title) {
      updateTask(task.id, { title: title.trim() });
      logActivity(task.id, task.project_id, currentUser.id, 'updated', `Changed title to "${title.trim()}"`);
    }
  };

  const handleDescriptionBlur = () => {
    if (description.trim() !== task.description) {
      updateTask(task.id, { description: description.trim() });
      logActivity(task.id, task.project_id, currentUser.id, 'updated', 'Updated description');
    }
  };

  const handlePropertyChange = (field, value, logMessage) => {
    updateTask(task.id, { [field]: value });
    if (logMessage) {
      logActivity(task.id, task.project_id, currentUser.id, 'updated', logMessage);
    }
  };

  // Comments & Activity combined feed
  const feed = useMemo(() => {
    const taskComments = comments.filter(c => c.task_id === task.id).map(c => ({ ...c, type: 'comment' }));
    const taskActivity = activityLog.filter(a => a.task_id === task.id).map(a => ({ ...a, type: 'activity' }));
    return [...taskComments, ...taskActivity].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }, [comments, activityLog, task.id]);

  const handleCommentSubmit = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (commentBody.trim()) {
        // Find mentions in text (very naive check for @username)
        const mentions = [];
        users.forEach(u => {
          if (commentBody.includes(`@${u.name.split(' ')[0]}`)) {
            mentions.push(u.id);
            addNotification(u.id, 'mention', `${currentUser.name} mentioned you in a comment.`, task.id);
          }
        });
        
        addComment(task.id, currentUser.id, commentBody.trim(), mentions);
        setCommentBody('');
        setShowMentions(false);
      }
    }
  };

  const handleCommentChange = (e) => {
    const val = e.target.value;
    setCommentBody(val);
    
    // Naive mention trigger
    const lastWord = val.split(/\s+/).pop();
    if (lastWord.startsWith('@')) {
      setShowMentions(true);
      setMentionQuery(lastWord.slice(1).toLowerCase());
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (user) => {
    const words = commentBody.split(/\s+/);
    words.pop(); // remove the @query
    const newBody = [...words, `@${user.name.split(' ')[0]} `].join(' ');
    setCommentBody(newBody);
    setShowMentions(false);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-background/50 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Slide-in Panel */}
      <div className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-card border-l border-border shadow-2xl z-50 flex flex-col transform transition-transform duration-200 ease-out">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
              {task.id.toUpperCase()}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Title & Description */}
          <div>
            <textarea
              className="w-full text-2xl font-bold bg-transparent border-none outline-none resize-none placeholder:text-muted-foreground text-foreground mb-4"
              rows={2}
              placeholder="Task Title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={e => { if (e.key === 'Enter') e.preventDefault(); }}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-6">
              {/* Assignees */}
              <div className="flex flex-col gap-1.5">
                <span className="text-muted-foreground font-medium flex items-center gap-2">
                  <UserPlus className="w-4 h-4" /> Assignees
                </span>
                <select 
                  className="bg-muted/50 border border-border rounded-md px-2 py-1.5 text-foreground outline-none focus:ring-1 focus:ring-primary"
                  value=""
                  onChange={(e) => {
                    const uid = e.target.value;
                    if (uid && !task.assignees?.includes(uid)) {
                      handlePropertyChange('assignees', [...(task.assignees || []), uid], `Assigned to ${users.find(u=>u.id===uid)?.name}`);
                    }
                  }}
                >
                  <option value="">+ Add Assignee</option>
                  {users.filter(u => !task.assignees?.includes(u.id)).map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
                <div className="flex flex-wrap gap-2 mt-1">
                  {task.assignees?.map(uid => {
                    const u = users.find(user => user.id === uid);
                    if (!u) return null;
                    return (
                      <div key={uid} className="flex items-center gap-1.5 bg-muted px-2 py-1 rounded-full text-xs">
                        <img src={u.avatar_url} alt="" className="w-4 h-4 rounded-full" />
                        <span>{u.name.split(' ')[0]}</span>
                        <X 
                          className="w-3 h-3 cursor-pointer hover:text-red-500" 
                          onClick={() => handlePropertyChange('assignees', task.assignees.filter(id => id !== uid), `Removed ${u.name} from assignees`)}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Due Date */}
              <div className="flex flex-col gap-1.5">
                <span className="text-muted-foreground font-medium flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" /> Due Date
                </span>
                <input 
                  type="date" 
                  className="bg-muted/50 border border-border rounded-md px-2 py-1.5 text-foreground outline-none focus:ring-1 focus:ring-primary h-[34px]" // force height to match selects
                  value={task.due_date ? task.due_date.split('T')[0] : ''}
                  onChange={(e) => {
                    const val = e.target.value ? new Date(e.target.value).toISOString() : null;
                    handlePropertyChange('due_date', val, val ? `Set due date to ${format(new Date(val), 'MMM d, yyyy')}` : 'Removed due date');
                  }}
                />
              </div>

              {/* Priority */}
              <div className="flex flex-col gap-1.5">
                <span className="text-muted-foreground font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> Priority
                </span>
                <select 
                  className="bg-muted/50 border border-border rounded-md px-2 py-1.5 text-foreground outline-none focus:ring-1 focus:ring-primary h-[34px]"
                  value={task.priority || 'medium'}
                  onChange={(e) => handlePropertyChange('priority', e.target.value, `Changed priority to ${e.target.value}`)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              {/* Blocked By */}
              <div className="flex flex-col gap-1.5">
                <span className="text-muted-foreground font-medium flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4" /> Blocked By
                </span>
                <select 
                  className="bg-muted/50 border border-border rounded-md px-2 py-1.5 text-foreground outline-none focus:ring-1 focus:ring-primary h-[34px]"
                  value={task.blocked_by_task_id || ''}
                  onChange={(e) => handlePropertyChange('blocked_by_task_id', e.target.value || null, e.target.value ? 'Marked task as blocked' : 'Removed blocker')}
                >
                  <option value="">None</option>
                  {tasks.filter(t => t.project_id === task.project_id && t.id !== task.id).map(t => (
                    <option key={t.id} value={t.id}>{t.title.substring(0, 30)}{t.title.length > 30 ? '...' : ''}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Labels */}
            <div className="flex flex-col gap-1.5 mb-6">
              <span className="text-muted-foreground font-medium flex items-center gap-2 text-sm">
                <Tag className="w-4 h-4" /> Labels
              </span>
              <div className="flex flex-wrap gap-2 items-center">
                {task.labels?.map(lid => {
                  const l = labels.find(label => label.id === lid);
                  if (!l) return null;
                  return (
                    <span 
                      key={lid}
                      className="text-xs px-2 py-1 rounded font-medium flex items-center gap-1 bg-muted text-foreground border border-border"
                    >
                      <span className={cn(
                        "w-2 h-2 rounded-full",
                        l.color === 'pink' ? "bg-pink-500" :
                        l.color === 'blue' ? "bg-blue-500" :
                        l.color === 'green' ? "bg-green-500" :
                        l.color === 'red' ? "bg-red-500" :
                        l.color === 'purple' ? "bg-purple-500" : "bg-gray-500"
                      )} />
                      {l.name}
                      <X className="w-3 h-3 cursor-pointer ml-1 hover:opacity-70" onClick={() => handlePropertyChange('labels', task.labels.filter(id => id !== lid), `Removed label ${l.name}`)} />
                    </span>
                  );
                })}
                <select 
                  className="text-xs bg-muted/50 border border-dashed border-border rounded px-2 py-1 text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                  value=""
                  onChange={(e) => {
                    const lid = e.target.value;
                    if (lid && !task.labels?.includes(lid)) {
                      handlePropertyChange('labels', [...(task.labels || []), lid], `Added label`);
                    }
                  }}
                >
                  <option value="">+ Add</option>
                  {labels.filter(l => l.project_id === task.project_id && !task.labels?.includes(l.id)).map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <textarea
              className="w-full min-h-[100px] p-3 text-sm bg-muted/30 border border-border rounded-lg outline-none focus:ring-1 focus:ring-primary resize-y placeholder:text-muted-foreground text-foreground mb-8"
              placeholder="Add a more detailed description..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              onBlur={handleDescriptionBlur}
            />
          </div>

          {/* Subtasks */}
          <div className="border-t border-border pt-6">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-4 text-foreground">
              <CheckSquare className="w-4 h-4" /> Subtasks
            </h3>
            
            <div className="space-y-2 mb-3">
              {task.subtasks?.map(st => (
                <div key={st.id} className="flex items-center gap-2 group p-1 hover:bg-muted/50 rounded-md">
                  <input 
                    type="checkbox" 
                    checked={st.is_complete}
                    onChange={() => {
                      toggleSubtask(task.id, st.id);
                      logActivity(task.id, task.project_id, currentUser.id, 'updated', `Marked subtask "${st.title}" as ${st.is_complete ? 'incomplete' : 'complete'}`);
                    }}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary/50"
                  />
                  <span className={cn("text-sm flex-1", st.is_complete ? "line-through text-muted-foreground" : "text-foreground")}>
                    {st.title}
                  </span>
                  
                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                    <button onClick={() => reorderSubtask(task.id, st.id, 'up')} className="p-1 text-muted-foreground hover:bg-muted rounded"><ChevronUp className="w-3.5 h-3.5" /></button>
                    <button onClick={() => reorderSubtask(task.id, st.id, 'down')} className="p-1 text-muted-foreground hover:bg-muted rounded"><ChevronDown className="w-3.5 h-3.5" /></button>
                    <button 
                      onClick={() => {
                        deleteSubtask(task.id, st.id);
                        logActivity(task.id, task.project_id, currentUser.id, 'updated', `Deleted subtask "${st.title}"`);
                      }} 
                      className="p-1 text-red-400 hover:bg-red-500/10 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Add an item"
                className="flex-1 text-sm bg-transparent border-none outline-none placeholder:text-muted-foreground text-foreground"
                value={newSubtask}
                onChange={e => setNewSubtask(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && newSubtask.trim()) {
                    addSubtask(task.id, newSubtask.trim());
                    logActivity(task.id, task.project_id, currentUser.id, 'updated', `Added subtask "${newSubtask.trim()}"`);
                    setNewSubtask('');
                  }
                }}
              />
            </div>
          </div>

          {/* Activity & Comments */}
          <div className="border-t border-border pt-6 pb-20">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-6 text-foreground">
              <Activity className="w-4 h-4" /> Activity
            </h3>
            
            <div className="space-y-6 mb-8">
              {feed.map(item => {
                const u = users.find(user => user.id === item.user_id);
                if (item.type === 'activity') {
                  return (
                    <div key={item.id} className="flex gap-3 text-sm">
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                        <img src={u?.avatar_url} alt="" className="w-6 h-6 rounded-full" />
                      </div>
                      <div>
                        <p className="text-muted-foreground">
                          <span className="font-medium text-foreground">{u?.name}</span> {item.description}
                        </p>
                        <span className="text-xs text-muted-foreground/70">{format(new Date(item.created_at), 'MMM d, h:mm a')}</span>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div key={item.id} className="flex gap-3 text-sm">
                      <img src={u?.avatar_url} alt="" className="w-8 h-8 rounded-full shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="font-medium text-foreground">{u?.name}</span>
                          <span className="text-xs text-muted-foreground">{format(new Date(item.created_at), 'MMM d, h:mm a')}</span>
                        </div>
                        <div className="bg-muted/40 p-3 rounded-lg text-foreground border border-border whitespace-pre-wrap">
                          {/* Very simple @mention highlighting rendering */}
                          {item.body.split(/(@\w+)/g).map((part, i) => 
                            part.startsWith('@') ? <span key={i} className="text-primary font-medium bg-primary/10 px-1 rounded">{part}</span> : part
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          </div>
        </div>
        
        {/* Comment Input Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-card border-t border-border">
          <div className="relative flex gap-3">
            <img src={currentUser.avatar_url} alt="" className="w-8 h-8 rounded-full shrink-0" />
            <div className="flex-1 relative">
              <textarea 
                className="w-full text-sm p-3 bg-background border border-border rounded-lg outline-none focus:ring-1 focus:ring-primary resize-none placeholder:text-muted-foreground text-foreground"
                rows={1}
                placeholder="Ask a question or post an update (press Enter to send)... Type @ to mention"
                value={commentBody}
                onChange={handleCommentChange}
                onKeyDown={handleCommentSubmit}
              />
              
              {showMentions && (
                <div className="absolute bottom-full left-0 mb-2 w-48 bg-card border border-border rounded-md shadow-lg overflow-hidden z-10">
                  {users
                    .filter(u => u.name.toLowerCase().includes(mentionQuery))
                    .map(u => (
                    <button 
                      key={u.id}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-muted text-foreground flex items-center gap-2"
                      onClick={() => insertMention(u)}
                    >
                      <img src={u.avatar_url} alt="" className="w-5 h-5 rounded-full" />
                      {u.name}
                    </button>
                  ))}
                  {users.filter(u => u.name.toLowerCase().includes(mentionQuery)).length === 0 && (
                    <div className="px-3 py-2 text-sm text-muted-foreground">No users found</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
