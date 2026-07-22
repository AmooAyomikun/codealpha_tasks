# Cadence — Project Management Tool — PRD & Antigravity Build Prompts

**Project:** Task 2 — Collaborative Project Management Tool (Trello/Asana-style)
**Frontend:** React (built via Antigravity)
**Backend:** Django + Django Channels for WebSockets (built by you)

---

## 1. Competitive Positioning (why this won't look like a generic clone)

Research into the current top tools reveals a clear pattern: **Trello wins on simplicity but has no cross-project visibility or dependencies. Asana wins on structure (multiple views, dependencies, workload tracking) but can feel heavy. Linear wins on raw speed and a keyboard-first, opinionated workflow that removes decision fatigue.**

Cadence's positioning: **Trello's visual simplicity, Asana's structural depth, Linear's speed and polish.** Concretely, that means: a clean kanban board as the default view (Trello), but with task dependencies, multiple views, and a workload indicator (Asana), built with a command palette and keyboard shortcuts throughout (Linear). This combination is genuinely rare in intern-level clones, which almost always stop at "kanban board with drag and drop."

## 2. Goals

- Fully working core loop: auth → create workspace/project → build a board → create/assign/comment on tasks
- At least 3-4 differentiators a reviewer won't have seen in other submissions (see Section 5)
- Real-time collaboration via WebSockets (the task's bonus requirement) — live board updates, presence indicators, live notifications
- Clean, fast, keyboard-friendly UI that doesn't look like a stock component library demo

## 3. Information Architecture

| Page/View | Purpose |
|---|---|
| **Landing Page (public, pre-login)** | Marketing homepage — explains what Cadence is before anyone signs up. See Section 3a. |
| Login / Register | Auth |
| Workspace Dashboard | List of projects the user belongs to, quick stats |
| Project — Board View | Kanban board, drag-and-drop columns and cards (default view) |
| Project — List View | Flat sortable/filterable task list (spreadsheet-style) |
| Project — Calendar View | Tasks plotted by due date |
| Task Detail (modal or side panel) | Full task info: description, assignees, labels, due date, subtasks, dependencies, comments, activity log, attachments |
| Notifications Center | Real-time notification feed (@mentions, assignments, due-date reminders, comments) |
| Command Palette (Cmd/Ctrl+K) | Global search + quick actions (create task, jump to project, assign, etc.) — accessible from anywhere |
| Settings / Profile | User profile, workspace members, invite flow |

### 3a. Landing Page (public, pre-login)

You're right to flag this — every real tool in this category (Linear, Asana, Trello, Notion) has a public marketing homepage before the app itself, and skipping it is one of the tells that a project never left "internal tool" territory. Someone landing on Cadence for the first time should understand what it does and why it's worth signing up for, before ever seeing a login form.

Sections:
- **Nav**: logo, a couple of anchor links (Features, maybe Pricing if you want one), "Log In" and a primary "Get Started" / "Sign Up Free" button
- **Hero**: headline + subtext making the Trello-simplicity/Asana-structure/Linear-speed positioning concrete in plain language (not literally naming competitors), a "Get Started" CTA, and a product screenshot or mockup of the board view — this is the single most important visual on the page, it should actually look like the real board UI, not generic illustration
- **Feature highlights**: 3-4 sections walking through the standout features from Section 5 (command palette, multiple views, real-time collaboration, workload view) — each with a short description and a supporting visual/screenshot
- **Social proof placeholder**: a simple "built for teams who move fast" section — real testimonials aren't needed for a portfolio project, but the section signals product maturity; keep it honest (don't fabricate fake company logos)
- **Final CTA + footer**: repeat the sign-up CTA, footer with basic links (About, Privacy, Terms — can be simple placeholder pages)

This page uses the same design system as the app, but can be a little more visually expressive than the dense in-app UI (marketing pages typically allow more whitespace/hero treatment than the working dashboard).

## 4. Core Features (base requirement — must all work)

- **Auth system**: register, login, logout, session persistence
- **Projects**: create, edit, archive; each project has a board with customizable columns (not hardcoded "To Do/In Progress/Done" — users can rename/add/reorder columns, matching how real tools work)
- **Task cards**: create, edit, delete, drag-and-drop between columns and reorder within a column
- **Assignment**: assign one or more team members to a task, with avatar display on the card
- **Comments**: threaded comments within each task, with @mention support
- **Team/workspace membership**: invite users to a project, role distinction (owner/member at minimum)

## 5. Standout Features (the differentiators — this is what should make you stand out)

1. **Command Palette (Cmd/Ctrl+K)** — global fuzzy search across projects/tasks/people, plus quick actions ("create task in...", "assign to...", "go to project..."). This single feature signals more engineering maturity than almost anything else on this list, and most interns will not build it.
2. **Multiple board views** — Board (kanban), List (sortable/filterable table), and Calendar (tasks by due date) — same underlying data, three lenses, matching Asana's actual differentiator over Trello.
3. **Task dependencies** — mark a task as "blocked by" another task; visually flag blocked tasks on the board (subtle icon/badge, not intrusive).
4. **Live presence + real-time updates via WebSockets** — show small avatars of who else is currently viewing the board, and reflect card moves/edits from other users instantly without a page refresh. This is the task's bonus requirement, but doing it well (not just "a toast appeared") is what separates a real implementation from a checkbox.
5. **Workload view** — a simple visualization (per project or per workspace) showing task count per assignee, so managers can spot overload at a glance — Asana's stated differentiator over Trello, cheap to build once task/assignee data exists.
6. **Activity log per task and per project** — an audit trail ("Jane moved this to In Progress," "Tunde commented," "Due date changed to..."), builds trust and is expected in any tool beyond toy-level.
7. **Keyboard shortcuts throughout** — at minimum: `C` to create a task, `/` or `Cmd+K` for the command palette, `Esc` to close modals, arrow keys to navigate a focused board. Signals the Linear-style speed-first philosophy explicitly.
8. **Subtasks/checklists within a task** — simple nested checklist inside the task detail view, progress shown as a fraction on the card (e.g., "3/5").

Do NOT attempt: AI features, Gantt/timeline charts, time tracking, or third-party integrations (Slack/Drive) — these are real differentiators at scale but disproportionate effort for this project and risk leaving the core loop unfinished. The 8 features above are enough to stand out without scope creep.

## 6. Design System

- **Visual direction**: Clean, minimal, professional SaaS aesthetic — closer to Linear's restraint than Trello's colorful playfulness. Off-white/near-white base, near-black text, ONE confident accent color (avoid purple/indigo — the most overused "AI tool" default; consider a deep blue, teal, or violet-adjacent-but-not-purple tone).
- **Dark mode**: include a light/dark toggle — dashboards and PM tools are very commonly used in dark mode by real users (developers, night-shift workers), and it's a meaningfully differentiating polish touch if done properly (not just inverted colors — actually tuned contrast).
- **Typography**: one grotesk/sans family (Inter, Geist, or similar), strong hierarchy via weight/size, not multiple fonts.
- **Density**: keyboard-first tools favor slightly denser UI than consumer apps — avoid excessive whitespace that Linear/Asana would never ship; prioritize information density balanced with clarity.
- **Motion**: subtle, fast transitions (150-200ms) on drag-and-drop, modal open/close, and command palette — speed is part of the differentiation, sluggish animations undercut it.

## 7. Data Model (for you to mirror in Django, and for Antigravity's mock data to match)

```
User: id, name, email, avatar_url, created_at
Workspace: id, name, owner_id
WorkspaceMember: workspace_id, user_id, role (owner/member)
Project: id, workspace_id, name, description, created_at, archived (bool)
Column: id, project_id, name, order (int), color
Task: id, column_id, title, description, order (int), due_date, priority (low/medium/high),
      created_by, created_at, archived (bool)
TaskAssignee: task_id, user_id
TaskLabel: id, project_id, name, color
TaskLabelAssignment: task_id, label_id
Subtask: id, task_id, title, is_complete, order (int)
TaskDependency: task_id, blocked_by_task_id
Comment: id, task_id, user_id, body, created_at, mentions (array of user_ids)
Attachment: id, task_id, filename, url, uploaded_by, uploaded_at
ActivityLogEntry: id, task_id (nullable), project_id, user_id, action_type, description, created_at
Notification: id, user_id, type (mention/assignment/comment/due_soon), body, read (bool),
              related_task_id, created_at
```

## 8. WebSocket Events (for your Django Channels backend)

Frontend should listen for and emit these event types over a project-scoped WebSocket connection (e.g. `/ws/project/{project_id}/`):

- `task.created`, `task.updated`, `task.moved`, `task.deleted`
- `comment.created`
- `presence.joined`, `presence.left` (who's currently viewing the board)
- `notification.new` (pushed to a user-scoped channel, e.g. `/ws/notifications/{user_id}/`)

## 9. Tech Stack

- React (Vite), functional components + hooks
- Tailwind CSS for styling (utility-first, fast to build consistent spacing/color system)
- `react-beautiful-dnd` or `@dnd-kit/core` for drag-and-drop (dnd-kit is more actively maintained, prefer it)
- Zustand or React Context for client state; React Query (TanStack Query) for server state/caching once wired to the real API
- `socket.io-client` or native WebSocket API for real-time

