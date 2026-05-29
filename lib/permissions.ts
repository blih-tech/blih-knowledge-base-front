// Shared permission definitions — keep in sync with backend's src/core/permissions.ts

export const PERMISSIONS = [
  'clients:view',
  'clients:observe',
  'content:manage',
  'structure:manage',
  'faq:manage',
  'employees:manage',
  'ai:admin',
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export const PERMISSION_LABELS: Record<Permission, { label: string; description: string }> = {
  'clients:view':     { label: 'View Clients',      description: 'See client list and profiles in the admin dashboard' },
  'clients:observe':  { label: 'Add Observations',  description: 'Post and edit observations on assigned clients' },
  'content:manage':   { label: 'Manage Content',    description: 'Create, edit, and delete documents' },
  'structure:manage': { label: 'Manage Structure',  description: 'Create, edit, and delete categories and sections' },
  'faq:manage':       { label: 'Manage FAQs',       description: 'Create, edit, and delete FAQ entries' },
  'employees:manage': { label: 'Manage Employees',  description: 'Manage employee accounts and their permissions' },
  'ai:admin':         { label: 'AI Assistant',      description: 'Access the admin AI chat assistant' },
};
