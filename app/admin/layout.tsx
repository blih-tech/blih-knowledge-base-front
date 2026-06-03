"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { signOut } from "next-auth/react";
import { useAuth } from "@/hooks/use-auth";
import { AdminProvider } from "@/lib/admin-context";
import { AdminAIProvider, useAdminAI } from "@/lib/admin-ai-context";
import { AdminChatInterface } from "@/components/AdminChatInterface";
import type { Permission } from "@/lib/permissions";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  FileText,
  Folder,
  LogOut,
  ExternalLink,
  Loader2,
  HelpCircle,
  Users,
  ShieldCheck,
  X,
  MessageSquare,
  UserCheck,
  Building2,
  BarChart3,
  UserCircle,
} from "lucide-react";

// ─── Nav config (permission-gated) ───────────────────────────────────────────

const navItems: {
  href: string;
  label: string;
  icon: React.ElementType;
  permission?: Permission; // undefined = always visible
}[] = [
  { href: "/admin/dashboard",    label: "Dashboard",          icon: LayoutDashboard },
  { href: "/admin/structure",    label: "Manage Structure",   icon: Folder,          permission: "structure:manage" },
  { href: "/admin/content",      label: "Manage Content",     icon: FileText,        permission: "content:manage" },
  { href: "/admin/clients",      label: "Clients",            icon: Users,           permission: "clients:view" },
  { href: "/admin/employees",    label: "Employees",          icon: UserCheck,       permission: "employees:manage" },
  { href: "/admin/departments",  label: "Departments",        icon: Building2,       permission: "departments:manage" },
  { href: "/admin/faq",          label: "FAQs",               icon: HelpCircle,      permission: "faq:manage" },
  { href: "/admin/reports",      label: "Reports",            icon: BarChart3,       permission: "reports:view" },
];

// ─── Admin Sidebar ────────────────────────────────────────────────────────────

function AdminSidebar() {
  const pathname = usePathname();
  const { open } = useAdminAI();
  const { hasPermission } = useAuth();

  const visibleItems = navItems.filter(
    (item) => !item.permission || hasPermission(item.permission),
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/admin/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <FileText className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold text-sm">Blih Brain</span>
                  <span className="text-xs text-muted-foreground">Admin Dashboard</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarMenu>
            {visibleItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || pathname.startsWith(href + "/");
              return (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton asChild isActive={isActive} tooltip={label}>
                    <Link href={href}>
                      <Icon className="size-4" />
                      <span>{label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}

            {/* AI Assistant — only for users with ai:admin permission */}
            {hasPermission('ai:admin') && (
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="AI Assistant" onClick={() => open()}>
                  <ShieldCheck className="size-4 text-violet-600" />
                  <span className="text-violet-700 font-medium">AI Assistant</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="View public site">
              <Link href="/" target="_blank">
                <ExternalLink className="size-4" />
                <span>View Site</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Sign out"
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="size-4" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

// ─── AI Chat Modal ────────────────────────────────────────────────────────────

function AIChatModal() {
  const { isOpen, prefill, close } = useAdminAI();

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, close]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm animate-in fade-in duration-150"
        onClick={close}
      />

      {/* Modal panel */}
      <div className="fixed bottom-6 right-6 z-50 w-[420px] max-w-[calc(100vw-1.5rem)] h-[600px] max-h-[calc(100vh-5rem)] flex flex-col rounded-2xl shadow-2xl border border-border bg-background overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200">
        {/* Close button */}
        <button
          onClick={close}
          className="absolute top-3 right-3 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors"
          aria-label="Close chat"
        >
          <X className="w-3.5 h-3.5 text-muted-foreground" />
        </button>

        <AdminChatInterface key={prefill} initialMessage={prefill} />
      </div>
    </>
  );
}

// ─── Floating action button ───────────────────────────────────────────────────

function AIFloatingButton() {
  const { isOpen, open } = useAdminAI();

  if (isOpen) return null;

  return (
    <button
      onClick={() => open()}
      aria-label="Open AI Assistant"
      className="fixed bottom-6 right-6 z-30 group flex items-center gap-2.5 pl-4 pr-5 py-3 rounded-full shadow-lg bg-violet-600 hover:bg-violet-700 text-white shadow-violet-500/25 hover:scale-105 hover:shadow-xl hover:shadow-violet-500/30 transition-all duration-200 select-none"
    >
      <div className="relative w-5 h-5 transition-transform duration-200 group-hover:rotate-12">
        <MessageSquare className="w-5 h-5" />
      </div>
      <span className="text-sm font-semibold tracking-wide">AI Assistant</span>
      <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
    </button>
  );
}

// ─── Access Denied UI ─────────────────────────────────────────────────────────

function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 animate-in fade-in duration-300">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-5">
        <ShieldCheck className="w-8 h-8 text-red-400" />
      </div>
      <h2 className="text-xl font-bold text-foreground">Access Denied</h2>
      <p className="text-sm text-muted-foreground mt-2 text-center max-w-sm">
        You don&apos;t have permission to access this page. Contact your administrator if you believe this is a mistake.
      </p>
      <Link
        href="/admin/dashboard"
        className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        <LayoutDashboard className="w-4 h-4" />
        Go to Dashboard
      </Link>
    </div>
  );
}

// ─── Route → Permission resolver ──────────────────────────────────────────────

function getRequiredPermission(pathname: string): Permission | null {
  for (const item of navItems) {
    if (pathname === item.href || pathname.startsWith(item.href + "/")) {
      return item.permission ?? null;
    }
  }
  return null; // no match = no restriction (dashboard, profile, etc.)
}

// ─── Guard + shell ────────────────────────────────────────────────────────────

function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, canAccessAdmin, isLoading, hasPermission } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace("/auth/login");
    } else if (!canAccessAdmin) {
      // Logged in but not admin/superAdmin/deptHead → send to knowledge base
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, canAccessAdmin, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !canAccessAdmin) return null;

  // Check if user has permission for the current page
  const requiredPermission = getRequiredPermission(pathname);
  const hasAccess = !requiredPermission || hasPermission(requiredPermission);

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4 sticky top-0 bg-background z-10">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4 mx-2" />
          <span className="text-sm font-medium text-muted-foreground">Admin</span>
          <div className="ml-auto">
            <Link
              href="/admin/profile"
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
              title="My Profile"
            >
              <UserCircle className="w-5 h-5" />
              <span className="hidden sm:inline font-medium">{user?.name?.split(' ')[0] ?? 'Profile'}</span>
            </Link>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-5xl mx-auto w-full">
            {hasAccess ? children : <AccessDenied />}
          </div>
        </main>
      </SidebarInset>

      <AIFloatingButton />
      <AIChatModal />
    </SidebarProvider>
  );
}

// ─── Layout export ────────────────────────────────────────────────────────────

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAIProvider>
      <AdminShell>
        <AdminProvider>{children}</AdminProvider>
      </AdminShell>
    </AdminAIProvider>
  );
}
