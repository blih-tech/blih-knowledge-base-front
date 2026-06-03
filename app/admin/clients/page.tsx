"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  listClients, createClient, deleteClient,
  type Client, type ClientStatus, type ClientTier,
} from "@/lib/api/clients.api";
import { queryKeys } from "@/lib/query-keys";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus, Search, Trash2, ChevronRight, Loader2, Users,
  AlertCircle, X, Building2, Mail, Globe, UserCheck,
} from "lucide-react";

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ClientStatus, { label: string; color: string }> = {
  prospect:  { label: "Prospect",  color: "bg-sky-100 text-sky-700 border-sky-200" },
  active:    { label: "Active",    color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  "at-risk": { label: "At Risk",   color: "bg-amber-100 text-amber-700 border-amber-200" },
  paused:    { label: "Paused",    color: "bg-gray-100 text-gray-600 border-gray-200" },
  churned:   { label: "Churned",   color: "bg-red-100 text-red-700 border-red-200" },
};

const TIER_CONFIG: Record<string, { label: string; color: string }> = {
  enterprise:  { label: "Enterprise",  color: "bg-violet-100 text-violet-700 border-violet-200" },
  "mid-market":{ label: "Mid-Market",  color: "bg-blue-100 text-blue-700 border-blue-200" },
  smb:         { label: "SMB",         color: "bg-teal-100 text-teal-700 border-teal-200" },
  startup:     { label: "Startup",     color: "bg-orange-100 text-orange-700 border-orange-200" },
};

// ─── Avatar ───────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "bg-violet-100 text-violet-700", "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700", "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700", "bg-sky-100 text-sky-700",
];

function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const initials = name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
  const colorClass = AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
  const sizeClass = size === "lg" ? "w-14 h-14 text-xl" : size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";
  return (
    <div className={`${sizeClass} ${colorClass} rounded-full flex items-center justify-center font-semibold shrink-0`}>
      {initials}
    </div>
  );
}

// ─── Create modal ─────────────────────────────────────────────────────────────

function CreateClientModal({ onClose, onCreate }: { onClose: () => void; onCreate: (c: Client) => void }) {
  const [form, setForm] = useState({
    name: "", company: "", industry: "", website: "",
    email: "", phone: "", status: "active" as ClientStatus, tier: "" as ClientTier,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setIsSaving(true); setError(null);
    try { onCreate(await createClient(form)); }
    catch (err) { setError(err instanceof Error ? err.message : "Failed to create client"); }
    finally { setIsSaving(false); }
  };

  const field = (key: keyof typeof form, label: string, placeholder: string, type = "text") => (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
      <Input type={type} value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} placeholder={placeholder} />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-white">
          <h2 className="text-base font-semibold">New Client (Company)</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {field("name", "Company / Client Name *", "e.g. Catalyst Startup Studio")}
          {field("industry", "Industry", "e.g. Finance, Retail, Tech")}
          {field("website", "Website", "https://example.com", "url")}
          {field("email", "Primary Email", "info@example.com", "email")}
          {field("phone", "Phone", "+251 911 000 000")}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as ClientStatus }))}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                {Object.entries(STATUS_CONFIG).map(([v, { label }]) => <option key={v} value={v}>{label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Tier</label>
              <select
                value={form.tier}
                onChange={(e) => setForm((f) => ({ ...f, tier: e.target.value as ClientTier }))}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">— None —</option>
                {Object.entries(TIER_CONFIG).map(([v, { label }]) => <option key={v} value={v}>{label}</option>)}
              </select>
            </div>
          </div>

          {error && <p className="text-sm text-red-600 flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" /> {error}</p>}
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={!form.name.trim() || isSaving} className="flex-1 gap-2">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Create Client
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminClientsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ClientStatus | "">("");
  const [showCreate, setShowCreate] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);

  // ── Query ────────────────────────────────────────────────────────────────
  const clientParams = {
    search: search || undefined,
    status: (statusFilter || undefined) as ClientStatus | undefined,
    limit: 50,
  };

  const {
    data,
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: queryKeys.clients.list(clientParams as Record<string, unknown>),
    queryFn: () => listClients(clientParams),
  });

  const invalidateClients = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.clients.all });

  const error =
    mutationError ?? (queryError instanceof Error ? queryError.message : queryError ? String(queryError) : null);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}" and all their data? This cannot be undone.`)) return;
    setDeletingId(id);
    setMutationError(null);
    try {
      await deleteClient(id);
      invalidateClients();
    } catch (err) {
      setMutationError(err instanceof Error ? err.message : "Failed to delete client");
    } finally { setDeletingId(null); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Clients</h1>
          <p className="text-sm text-muted-foreground mt-1">Company profiles, contacts & behavioral intelligence</p>
        </div>
        <div className="flex items-center gap-2">
          {data && <Badge variant="secondary">{data.total} client{data.total !== 1 ? "s" : ""}</Badge>}
          <Button size="sm" onClick={() => setShowCreate(true)} className="gap-1.5">
            <Plus className="w-4 h-4" /> Add Client
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, company…" className="pl-9" />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ClientStatus | "")}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">All Statuses</option>
          {Object.entries(STATUS_CONFIG).map(([v, { label }]) => <option key={v} value={v}>{label}</option>)}
        </select>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : !data?.clients.length ? (
        <Card className="p-12 text-center border-dashed">
          <Users className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">{search ? "No clients match your search." : "No clients yet."}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {data.clients.map((client) => {
            const statusCfg = STATUS_CONFIG[client.status] ?? STATUS_CONFIG.active;
            const tierCfg = client.tier ? TIER_CONFIG[client.tier] : null;
            return (
              <Card
                key={client._id}
                className="p-4 flex items-start gap-3 hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => router.push(`/admin/clients/${client._id}`)}
              >
                <Avatar name={client.name} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm text-foreground truncate">{client.name}</p>
                      {client.industry && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3" /> {client.industry}
                        </p>
                      )}
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        <span className={`inline-flex items-center text-xs font-medium px-1.5 py-0.5 rounded-full border ${statusCfg.color}`}>
                          {statusCfg.label}
                        </span>
                        {tierCfg && (
                          <span className={`inline-flex items-center text-xs font-medium px-1.5 py-0.5 rounded-full border ${tierCfg.color}`}>
                            {tierCfg.label}
                          </span>
                        )}
                        {(client.contactCount ?? 0) > 0 && (
                          <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
                            <UserCheck className="w-3 h-3" /> {client.contactCount} contact{client.contactCount !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0 mt-0.5" />
                  </div>
                  {client.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {client.tags.slice(0, 3).map((tag) => <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>)}
                      {client.tags.length > 3 && <Badge variant="outline" className="text-xs">+{client.tags.length - 3}</Badge>}
                    </div>
                  )}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(client._id, client.name); }}
                  disabled={deletingId === client._id}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                >
                  {deletingId === client._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                </button>
              </Card>
            );
          })}
        </div>
      )}

      {showCreate && (
        <CreateClientModal
          onClose={() => setShowCreate(false)}
          onCreate={(c) => {
            invalidateClients();
            setShowCreate(false);
            router.push(`/admin/clients/${c._id}`);
          }}
        />
      )}
    </div>
  );
}
