'use client';

import { AdminProvider, useAdmin } from '@/lib/admin-context';
import { AdminLayout } from '@/components/AdminLayout';
import { Card } from '@/components/ui/card';
import { FileText, Folder, BookOpen } from 'lucide-react';

function DashboardContent() {
  const { categories } = useAdmin();

  const totalDocuments = categories.reduce(
    (acc, category) => acc + category.sections.reduce((sec, s) => sec + s.items.length, 0),
    0
  );

  const totalCategories = categories.length;
  const totalSections = categories.reduce((acc, cat) => acc + cat.sections.length, 0);

  const stats = [
    {
      label: 'Categories',
      value: totalCategories,
      icon: <Folder className="w-8 h-8" />,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Sections',
      value: totalSections,
      icon: <BookOpen className="w-8 h-8" />,
      color: 'bg-green-50 text-green-600',
    },
    {
      label: 'Documents',
      value: totalDocuments,
      icon: <FileText className="w-8 h-8" />,
      color: 'bg-purple-50 text-purple-600',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your knowledge base content and structure</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">Quick Info</h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>✓ Use "Manage Content" to create, edit, or delete documents</li>
          <li>✓ Use "Manage Structure" to organize categories and sections</li>
          <li>✓ Changes are automatically saved to localStorage</li>
          <li>✓ Published content appears immediately on the public site</li>
        </ul>
      </Card>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <AdminProvider>
      <AdminLayout>
        <DashboardContent />
      </AdminLayout>
    </AdminProvider>
  );
}
