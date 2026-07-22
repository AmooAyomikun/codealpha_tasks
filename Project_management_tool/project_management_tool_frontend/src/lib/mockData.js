export const users = [
  { id: 'u1', name: 'Alice Cooper', email: 'alice@example.com', avatar_url: 'https://i.pravatar.cc/150?u=u1', created_at: '2026-01-10T10:00:00Z' },
  { id: 'u2', name: 'Bob Smith', email: 'bob@example.com', avatar_url: 'https://i.pravatar.cc/150?u=u2', created_at: '2026-01-11T11:00:00Z' },
  { id: 'u3', name: 'Charlie Davis', email: 'charlie@example.com', avatar_url: 'https://i.pravatar.cc/150?u=u3', created_at: '2026-01-12T12:00:00Z' },
];

export const workspaces = [
  { id: 'w1', name: 'Acme Corp', owner_id: 'u1' },
  { id: 'w2', name: 'Personal Projects', owner_id: 'u1' },
];

export const projects = [
  { id: 'p1', workspace_id: 'w1', name: 'Website Redesign', description: 'Overhauling the main marketing site', created_at: '2026-02-01T10:00:00Z', archived: false },
  { id: 'p2', workspace_id: 'w1', name: 'Mobile App V2', description: 'Building the next generation mobile app', created_at: '2026-03-01T10:00:00Z', archived: false },
  { id: 'p3', workspace_id: 'w1', name: 'Q3 Marketing', description: 'Marketing campaigns for Q3', created_at: '2026-06-01T10:00:00Z', archived: false },
  { id: 'p4', workspace_id: 'w2', name: 'Home Renovation', description: 'Planning kitchen remodel', created_at: '2026-04-01T10:00:00Z', archived: false },
];

export const columns = [
  // p1 columns
  { id: 'c1', project_id: 'p1', name: 'To Do', order: 1, color: 'gray' },
  { id: 'c2', project_id: 'p1', name: 'In Progress', order: 2, color: 'blue' },
  { id: 'c3', project_id: 'p1', name: 'In Review', order: 3, color: 'yellow' },
  { id: 'c4', project_id: 'p1', name: 'Done', order: 4, color: 'green' },
  // p2 columns
  { id: 'c5', project_id: 'p2', name: 'Backlog', order: 1, color: 'gray' },
  { id: 'c6', project_id: 'p2', name: 'Developing', order: 2, color: 'blue' },
  { id: 'c7', project_id: 'p2', name: 'Released', order: 3, color: 'green' },
];

export const taskLabels = [
  { id: 'l1', project_id: 'p1', name: 'Design', color: 'pink' },
  { id: 'l2', project_id: 'p1', name: 'Frontend', color: 'blue' },
  { id: 'l3', project_id: 'p1', name: 'Backend', color: 'green' },
  { id: 'l4', project_id: 'p2', name: 'Bug', color: 'red' },
  { id: 'l5', project_id: 'p2', name: 'Feature', color: 'purple' },
];

export const tasks = [
  // p1 tasks
  { id: 't1', column_id: 'c1', title: 'Create wireframes', description: 'Draft initial wireframes for landing page.', order: 1, due_date: '2026-07-25T00:00:00Z', priority: 'high', created_by: 'u1', created_at: '2026-07-01T10:00:00Z', archived: false, assignees: ['u1', 'u2'], labels: ['l1'] },
  { id: 't2', column_id: 'c1', title: 'Review competitor sites', description: 'Analyze top 5 competitors.', order: 2, due_date: '2026-07-26T00:00:00Z', priority: 'medium', created_by: 'u1', created_at: '2026-07-02T10:00:00Z', archived: false, assignees: ['u1'], labels: [] },
  { id: 't3', column_id: 'c2', title: 'Setup React Project', description: 'Initialize Vite + React + Tailwind.', order: 1, due_date: '2026-07-24T00:00:00Z', priority: 'high', created_by: 'u2', created_at: '2026-07-03T10:00:00Z', archived: false, assignees: ['u2'], labels: ['l2'] },
  { id: 't4', column_id: 'c2', title: 'Implement Auth', description: 'Login and Register pages.', order: 2, due_date: '2026-07-28T00:00:00Z', priority: 'high', created_by: 'u2', created_at: '2026-07-04T10:00:00Z', archived: false, assignees: ['u2', 'u3'], labels: ['l2', 'l3'] },
  { id: 't5', column_id: 'c3', title: 'Design System', description: 'Define typography and colors.', order: 1, due_date: '2026-07-23T00:00:00Z', priority: 'medium', created_by: 'u1', created_at: '2026-07-05T10:00:00Z', archived: false, assignees: ['u1'], labels: ['l1'] },
  { id: 't6', column_id: 'c4', title: 'Project Kickoff', description: 'Initial sync with stakeholders.', order: 1, due_date: '2026-07-15T00:00:00Z', priority: 'high', created_by: 'u1', created_at: '2026-07-01T10:00:00Z', archived: false, assignees: ['u1', 'u2', 'u3'], labels: [] },
  { id: 't7', column_id: 'c1', title: 'SEO Optimization', description: 'Improve meta tags and performance.', order: 3, due_date: '2026-08-01T00:00:00Z', priority: 'low', created_by: 'u3', created_at: '2026-07-10T10:00:00Z', archived: false, assignees: ['u3'], labels: ['l2'] },
  { id: 't8', column_id: 'c1', title: 'Analytics Setup', description: 'Integrate Google Analytics.', order: 4, due_date: '2026-08-02T00:00:00Z', priority: 'medium', created_by: 'u3', created_at: '2026-07-11T10:00:00Z', archived: false, assignees: [], labels: [] },
  { id: 't9', column_id: 'c2', title: 'Hero Section Component', description: 'Build the hero section according to Figma.', order: 3, due_date: '2026-07-27T00:00:00Z', priority: 'medium', created_by: 'u2', created_at: '2026-07-12T10:00:00Z', archived: false, assignees: ['u2'], labels: ['l2'] },
  { id: 't10', column_id: 'c3', title: 'Footer Component', description: 'Build standard footer.', order: 2, due_date: '2026-07-26T00:00:00Z', priority: 'low', created_by: 'u2', created_at: '2026-07-13T10:00:00Z', archived: false, assignees: ['u2'], labels: ['l2'] },

  // p2 tasks (Mobile App V2)
  { id: 't11', column_id: 'c5', title: 'Fix crash on launch', description: 'App crashes on Android 12.', order: 1, due_date: '2026-07-22T00:00:00Z', priority: 'high', created_by: 'u3', created_at: '2026-07-15T10:00:00Z', archived: false, assignees: ['u3'], labels: ['l4'] },
  { id: 't12', column_id: 'c5', title: 'Push Notifications', description: 'Integrate Firebase.', order: 2, due_date: '2026-08-05T00:00:00Z', priority: 'medium', created_by: 'u3', created_at: '2026-07-16T10:00:00Z', archived: false, assignees: ['u3'], labels: ['l5'] },
  { id: 't13', column_id: 'c6', title: 'Dark Mode Support', description: 'Add dark mode toggle.', order: 1, due_date: '2026-07-30T00:00:00Z', priority: 'medium', created_by: 'u1', created_at: '2026-07-17T10:00:00Z', archived: false, assignees: ['u1', 'u2'], labels: ['l5'] },
  { id: 't14', column_id: 'c6', title: 'Profile Screen Redesign', description: 'Update profile screen layout.', order: 2, due_date: '2026-08-01T00:00:00Z', priority: 'medium', created_by: 'u1', created_at: '2026-07-18T10:00:00Z', archived: false, assignees: ['u1'], labels: ['l5'] },
  { id: 't15', column_id: 'c7', title: 'Version 2.0 Alpha', description: 'Internal testing release.', order: 1, due_date: '2026-07-20T00:00:00Z', priority: 'high', created_by: 'u3', created_at: '2026-07-19T10:00:00Z', archived: false, assignees: ['u1', 'u2', 'u3'], labels: [] },
  { id: 't16', column_id: 'c5', title: 'Offline Mode', description: 'Cache data for offline viewing.', order: 3, due_date: '2026-08-10T00:00:00Z', priority: 'medium', created_by: 'u3', created_at: '2026-07-20T10:00:00Z', archived: false, assignees: ['u3'], labels: ['l5'] },
  { id: 't17', column_id: 'c5', title: 'Memory Leak Investigation', description: 'Scroll performance degrades over time.', order: 4, due_date: '2026-07-25T00:00:00Z', priority: 'high', created_by: 'u2', created_at: '2026-07-21T10:00:00Z', archived: false, assignees: ['u2'], labels: ['l4'] },
  { id: 't18', column_id: 'c6', title: 'Tablet Layouts', description: 'Optimize for iPad.', order: 3, due_date: '2026-08-15T00:00:00Z', priority: 'low', created_by: 'u1', created_at: '2026-07-22T10:00:00Z', archived: false, assignees: ['u1'], labels: ['l5'] },

  // Add more tasks to reach 25
  { id: 't19', column_id: 'c1', title: 'Copywriting', description: 'Draft landing page copy.', order: 5, due_date: '2026-07-28T00:00:00Z', priority: 'medium', created_by: 'u1', created_at: '2026-07-22T10:00:00Z', archived: false, assignees: ['u1'], labels: [] },
  { id: 't20', column_id: 'c1', title: 'Accessibility Audit', description: 'Check WCAG compliance.', order: 6, due_date: '2026-08-05T00:00:00Z', priority: 'medium', created_by: 'u2', created_at: '2026-07-22T11:00:00Z', archived: false, assignees: [], labels: ['l2'] },
  { id: 't21', column_id: 'c1', title: 'User Testing', description: 'Test prototype with 5 users.', order: 7, due_date: '2026-08-10T00:00:00Z', priority: 'high', created_by: 'u1', created_at: '2026-07-22T12:00:00Z', archived: false, assignees: ['u1'], labels: [] },
  { id: 't22', column_id: 'c5', title: 'App Store Screenshots', description: 'Design new screenshots for iOS/Android.', order: 5, due_date: '2026-08-01T00:00:00Z', priority: 'medium', created_by: 'u1', created_at: '2026-07-22T13:00:00Z', archived: false, assignees: ['u1'], labels: ['l1'] },
  { id: 't23', column_id: 'c5', title: 'Localization Prep', description: 'Extract strings for translation.', order: 6, due_date: '2026-08-12T00:00:00Z', priority: 'low', created_by: 'u2', created_at: '2026-07-22T14:00:00Z', archived: false, assignees: ['u2'], labels: [] },
  { id: 't24', column_id: 'c5', title: 'Biometric Auth', description: 'Add FaceID/TouchID support.', order: 7, due_date: '2026-08-20T00:00:00Z', priority: 'high', created_by: 'u3', created_at: '2026-07-22T15:00:00Z', archived: false, assignees: ['u3'], labels: ['l5'] },
  { id: 't25', column_id: 'c1', title: 'Performance Budget', description: 'Establish bundle size limits.', order: 8, due_date: '2026-07-30T00:00:00Z', priority: 'medium', created_by: 'u2', created_at: '2026-07-22T16:00:00Z', archived: false, assignees: ['u2'], labels: ['l2'] }
];