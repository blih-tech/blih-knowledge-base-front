"use client";

import { useAdmin } from "@/lib/admin-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Folder, BookOpen, ArrowRight } from "lucide-react";
import Link from "next/link";

function DashboardContent() {
  const { categories, isLoading } = useAdmin();

  const totalDocuments = categories.reduce(
    (acc, cat) => acc + cat.sections.reduce((s, sec) => s + sec.documents.length, 0),
    0
  );
  const totalSections = categories.reduce((acc, cat) => acc + cat.sections.length, 0);

  const stats = [
    {
      label: "Categories",
      value: categories.length,
      icon: Folder,
      bg: "bg-teal-50",
      iconColor: "text-teal-700",
      border: "border-teal-100",
    },
    {
      label: "Sections",
      value: totalSections,
      icon: BookOpen,
      bg: "bg-blue-50",
      iconColor: "text-blue-700",
      border: "border-blue-100",
    },
    {
      label: "Documents",
      value: totalDocuments,
      icon: FileText,
      bg: "bg-violet-50",
      iconColor: "text-violet-700",
      border: "border-violet-100",
    },
  ];

  const quickLinks = [
    {
      href: "/admin/content",
      label: "Manage Content",
      description: "Create, edit, or delete documents",
      icon: FileText,
    },
    {
      href: "/admin/structure",
      label: "Manage Structure",
      description: "Organize categories and sections",
      icon: Folder,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Overview of your knowledge base
        </p>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map(({ label, value, icon: Icon, bg, iconColor, border }) => (
            <Card
              key={label}
              className={`p-6 border ${border} shadow-sm hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
                  <p className="text-4xl font-bold text-foreground">{value}</p>
                </div>
                <div className={`p-2.5 rounded-lg ${bg}`}>
                  <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickLinks.map(({ href, label, description, icon: Icon }) => (
            <Link key={href} href={href}>
              <Card className="p-5 group cursor-pointer hover:shadow-md transition-all hover:border-primary/30 border shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-teal-50 group-hover:bg-teal-100 transition-colors">
                      <Icon className="w-4 h-4 text-teal-700" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Tips */}
      <Card className="p-5 border border-teal-100 bg-teal-50/30">
        <h2 className="text-sm font-semibold text-teal-800 mb-3">Getting started</h2>
        <ol className="space-y-2 text-sm text-teal-900/80 list-decimal list-inside">
          <li>Create a <strong>Category</strong> (e.g. "HR Policies") in Manage Structure</li>
          <li>Add <strong>Sections</strong> inside the category (e.g. "Leave Policy")</li>
          <li>Go to Manage Content and create <strong>Documents</strong> inside sections</li>
          <li>Content appears live on the public site immediately after saving</li>
        </ol>
      </Card>
    </div>
  );
}

export default function AdminDashboardPage() {
  return <DashboardContent />;
}
