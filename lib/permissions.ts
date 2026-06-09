// Shared permission definitions — keep in sync with backend's src/core/permissions.ts

export const PERMISSIONS = [
  'clients:view',
  'clients:observe',
  'content:manage',
  'content:manage-all',
  'structure:manage',
  'faq:manage',
  'employees:manage',
  'departments:manage',
  'reports:view',
  'meetings:manage',
  'surveys:manage',
  'ai:admin',
  'policies:manage',
  'initiatives:manage',
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export const PERMISSION_LABELS: Record<Permission, { label: string; description: string }> = {
  'clients:view':       { label: 'View Clients',        description: 'See client list and profiles in the admin dashboard' },
  'clients:observe':    { label: 'Add Observations',    description: 'Post and edit observations on assigned clients' },
  'content:manage':     { label: 'Manage Content',      description: 'Create, edit, and delete documents' },
  'content:manage-all': { label: 'Manage All Content',  description: 'Edit or delete any document, overriding ownership' },
  'structure:manage':   { label: 'Manage Structure',    description: 'Create, edit, and delete categories and sections' },
  'faq:manage':         { label: 'Manage FAQs',         description: 'Create, edit, and delete FAQ entries' },
  'employees:manage':   { label: 'Manage Employees',    description: 'Manage employee accounts and their permissions' },
  'departments:manage': { label: 'Manage Departments',  description: 'Create, edit, and delete departments' },
  'reports:view':       { label: 'View Reports',        description: 'Access the reports and analytics dashboard' },
  'meetings:manage':    { label: 'Manage Meetings',      description: 'Create, edit, and delete meeting minutes' },
  'surveys:manage':     { label: 'Manage Surveys',       description: 'Create, edit, and delete surveys and view responses' },
  'ai:admin':           { label: 'AI Assistant',        description: 'Access the admin AI chat assistant' },
  'policies:manage':    { label: 'Manage Policies',     description: 'Create, edit, and manage employment policies and compliance' },
  'initiatives:manage': { label: 'Manage Initiatives',  description: 'Manage employee initiatives — status changes, deletion, view all' },
};


