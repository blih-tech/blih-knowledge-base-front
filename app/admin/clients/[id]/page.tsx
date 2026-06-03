"use client";

import { useState, use } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getClient, listObservations, createObservation,
  updateObservation, deleteObservation, updateClient,
  type Client, type Observation, type ObservationType, type SentimentType, type ClientStatus,
} from "@/lib/api/clients.api";
import { useAdminAI } from "@/lib/admin-ai-context";
import { ContactsPanel } from "@/components/ContactsPanel";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ThumbsUp, ThumbsDown, Star, Activity, MessageSquare,
  FileText, ArrowLeft, Plus, Edit2, Trash2, Save, X,
  Lock, Loader2, AlertCircle, Sparkles, Globe, Heart,
} from "lucide-react";

const STATUS_CONFIG: Record<ClientStatus, { label: string; color: string }> = {
  prospect:  { label: "Prospect",  color: "bg-sky-100 text-sky-700 border-sky-200" },
  active:    { label: "Active",    color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  "at-risk": { label: "At Risk",   color: "bg-amber-100 text-amber-700 border-amber-200" },
  paused:    { label: "Paused",    color: "bg-gray-100 text-gray-600 border-gray-200" },
  churned:   { label: "Churned",   color: "bg-red-100 text-red-700 border-red-200" },
};

const TIER_COLORS: Record<string, string> = {
  enterprise: "bg-violet-100 text-violet-700 border-violet-200",
  "mid-market": "bg-blue-100 text-blue-700 border-blue-200",
  smb: "bg-teal-100 text-teal-700 border-teal-200",
  startup: "bg-orange-100 text-orange-700 border-orange-200",
};

// ─── Observation type config ──────────────────────────────────────────────────

const TYPE_CONFIG: Record<ObservationType, { label: string; color: string; icon: React.ReactNode }> = {
  like:          { label: "Like",          color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: <ThumbsUp className="w-3 h-3" /> },
  dislike:       { label: "Dislike",       color: "bg-red-100 text-red-700 border-red-200",             icon: <ThumbsDown className="w-3 h-3" /> },
  preference:    { label: "Preference",    color: "bg-blue-100 text-blue-700 border-blue-200",          icon: <Star className="w-3 h-3" /> },
  behavior:      { label: "Behavior",      color: "bg-violet-100 text-violet-700 border-violet-200",    icon: <Activity className="w-3 h-3" /> },
  communication: { label: "Communication", color: "bg-amber-100 text-amber-700 border-amber-200",       icon: <MessageSquare className="w-3 h-3" /> },
  general:       { label: "General",       color: "bg-gray-100 text-gray-600 border-gray-200",          icon: <FileText className="w-3 h-3" /> },
};

const SENTIMENTS: { value: SentimentType; label: string }[] = [
  { value: "positive", label: "Positive" },
  { value: "neutral",  label: "Neutral"  },
  { value: "negative", label: "Negative" },
];

function TypeBadge({ type }: { type: ObservationType }) {
  const cfg = TYPE_CONFIG[type];
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.color}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "bg-violet-100 text-violet-700",
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-sky-100 text-sky-700",
];
function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const initials = name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
  const colorClass = AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
  const sz = size === "lg" ? "w-16 h-16 text-2xl" : size === "sm" ? "w-7 h-7 text-xs" : "w-10 h-10 text-sm";
  return (
    <div className={`${sz} ${colorClass} rounded-full flex items-center justify-center font-semibold shrink-0`}>
      {initials}
    </div>
  );
}

// ─── Add observation form ─────────────────────────────────────────────────────

function AddObservationForm({
  clientId,
  contacts,
  onAdded,
}: {
  clientId: string;
  contacts: import("@/lib/api/clients.api").Contact[];
  onAdded: (o: Observation) => void;
}) {
  const [type, setType] = useState<ObservationType>("general");
  const [content, setContent] = useState("");
  const [sentiment, setSentiment] = useState<SentimentType>("neutral");
  const [isPrivate, setIsPrivate] = useState(false);
  const [tags, setTags] = useState("");
  const [contactId, setContactId] = useState<string>(""); // "" = company-level
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setIsSaving(true);
    setError(null);
    try {
      const obs = await createObservation(clientId, {
        type,
        content: content.trim(),
        sentiment,
        isPrivate,
        contactId: contactId || null,
        tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      });
      onAdded(obs);
      setContent("");
      setTags("");
      setContactId("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add observation");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="p-4 border-primary/20 bg-primary/3">
      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <Plus className="w-4 h-4 text-primary" /> Add Observation
      </h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* About whom? */}
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1">About whom?</label>
          <select
            value={contactId}
            onChange={(e) => setContactId(e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">🏢 The company (general)</option>
            {contacts.map((c) => (
              <option key={c._id} value={c._id}>
                👤 {c.name} — {c.role}{c.isPrimary ? " ★" : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Type selector */}
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(TYPE_CONFIG) as ObservationType[]).map((t) => {
            const cfg = TYPE_CONFIG[t];
            return (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border font-medium transition-all ${
                  type === t ? cfg.color + " ring-2 ring-offset-1 ring-current/30" : "bg-secondary text-muted-foreground border-border hover:border-primary/40"
                }`}
              >
                {cfg.icon} {cfg.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Describe the observation… (e.g. Prefers email over phone calls)"
          rows={3}
          className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm shadow-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring"
        />

        <div className="flex gap-3 flex-wrap">
          {/* Sentiment */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Sentiment:</span>
            {SENTIMENTS.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setSentiment(s.value)}
                className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                  sentiment === s.value
                    ? s.value === "positive" ? "bg-emerald-100 text-emerald-700 border-emerald-300"
                    : s.value === "negative" ? "bg-red-100 text-red-700 border-red-300"
                    : "bg-gray-100 text-gray-700 border-gray-300"
                    : "border-border text-muted-foreground"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Tags */}
          <div className="flex items-center gap-1.5 flex-1 min-w-[180px]">
            <span className="text-xs text-muted-foreground shrink-0">Tags:</span>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="tag1, tag2"
              className="h-7 text-xs"
            />
          </div>

          {/* Private toggle */}
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="rounded"
            />
            <Lock className="w-3 h-3" /> Private
          </label>
        </div>

        {error && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}

        <Button type="submit" size="sm" disabled={!content.trim() || isSaving} className="gap-1.5 w-full">
          {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Save Observation
        </Button>
      </form>
    </Card>
  );
}

// ─── Observation card ─────────────────────────────────────────────────────────

function ObservationCard({
  obs,
  clientId,
  contacts,
  onRefresh,
}: {
  obs: Observation;
  clientId: string;
  contacts: import("@/lib/api/clients.api").Contact[];
  onRefresh: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(obs.content);
  const [isBusy, setIsBusy] = useState(false);

  const contactName = obs.contactId
    ? contacts.find((c) => c._id === obs.contactId)?.name ?? "a contact"
    : null;

  const handleUpdate = async () => {
    setIsBusy(true);
    try {
      await updateObservation(clientId, obs._id, { content });
      onRefresh();
      setIsEditing(false);
    } finally {
      setIsBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this observation?")) return;
    setIsBusy(true);
    try {
      await deleteObservation(clientId, obs._id);
      onRefresh();
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="group bg-white rounded-xl border border-border p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <Avatar name={obs.authorName} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <TypeBadge type={obs.type} />
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
              obs.sentiment === "positive" ? "bg-emerald-50 text-emerald-600"
              : obs.sentiment === "negative" ? "bg-red-50 text-red-600"
              : "bg-gray-50 text-gray-500"
            }`}>
              {obs.sentiment}
            </span>
            {contactName ? (
              <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-1.5 py-0.5">
                👤 {contactName}
              </span>
            ) : (
              <span className="text-xs bg-gray-50 text-gray-500 border border-gray-200 rounded-full px-1.5 py-0.5">
                🏢 Company
              </span>
            )}
            {obs.isPrivate && (
              <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                <Lock className="w-3 h-3" /> Private
              </span>
            )}
            <span className="text-xs text-muted-foreground ml-auto">
              {obs.authorName} · {new Date(obs.createdAt).toLocaleDateString()}
            </span>
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <textarea
                autoFocus
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleUpdate} disabled={isBusy} className="gap-1">
                  {isBusy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => { setIsEditing(false); setContent(obs.content); }}>
                  <X className="w-3 h-3 mr-1" /> Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-foreground leading-relaxed">{obs.content}</p>
          )}

          {obs.tags.length > 0 && !isEditing && (
            <div className="flex flex-wrap gap-1 mt-2">
              {obs.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
              ))}
            </div>
          )}
        </div>

        {!isEditing && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon-sm" onClick={() => setIsEditing(true)} className="text-muted-foreground hover:text-primary hover:bg-primary/10">
              <Edit2 className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={handleDelete} disabled={isBusy} className="text-muted-foreground hover:text-red-600 hover:bg-red-50">
              {isBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ClientProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { open: openAI } = useAdminAI();
  const [filterType, setFilterType] = useState<ObservationType | "all">("all");
  const [contactFilter, setContactFilter] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"observations" | "contacts">("observations");

  // ── Queries ─────────────────────────────────────────────────────────────
  const {
    data: detail,
    isLoading,
    error: detailError,
  } = useQuery({
    queryKey: queryKeys.clients.detail(id),
    queryFn: () => getClient(id),
  });

  const { data: observations = [] } = useQuery({
    queryKey: queryKeys.clients.observations(id),
    queryFn: () => listObservations(id),
  });

  const invalidateDetail = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.clients.detail(id) });
    queryClient.invalidateQueries({ queryKey: queryKeys.clients.observations(id) });
  };

  const client = detail?.client ?? null;
  const typeCounts = detail?.typeCounts ?? {};
  const contacts = detail?.contacts ?? [];
  const healthScore = detail?.healthScore ?? 50;

  const filtered = (() => {
    let result = filterType === "all" ? observations : observations.filter((o) => o.type === filterType);
    if (contactFilter === "") result = result.filter((o) => !o.contactId);
    else if (contactFilter !== null) result = result.filter((o) => o.contactId === contactFilter);
    return result;
  })();
  const totalObs = observations.length;

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="h-32 bg-muted rounded-xl" />
        <div className="h-64 bg-muted rounded-xl" />
      </div>
    );
  }

  if (detailError || !client) {
    const errorMsg = detailError instanceof Error ? detailError.message : detailError ? String(detailError) : null;
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="w-8 h-8 text-red-400 mb-3" />
        <p className="text-sm text-muted-foreground">{errorMsg || "Client not found"}</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => router.back()}>
          Go back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link href="/admin/clients" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> All Clients
      </Link>

      {/* Profile header */}
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <Avatar name={client.name} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-foreground">{client.name}</h1>
                {client.industry && <p className="text-sm text-muted-foreground">{client.industry}{client.size ? ` · ${client.size} employees` : ""}</p>}
              </div>
              <Button variant="outline" size="sm" className="gap-1.5 shrink-0"
                onClick={() => openAI(`Tell me about ${client.name}'s behavior and preferences.`)}>
                <Sparkles className="w-3.5 h-3.5 text-primary" /> Ask AI
              </Button>
            </div>

            {/* Status + tier badges */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {(() => { const s = STATUS_CONFIG[client.status ?? "active"]; return (
                <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border ${s.color}`}>{s.label}</span>
              ); })()}
              {client.tier && (
                <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border ${TIER_COLORS[client.tier] ?? ""}`}>
                  {client.tier.charAt(0).toUpperCase() + client.tier.slice(1)}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
              {client.email && <span>{client.email}</span>}
              {client.phone && <span>{client.phone}</span>}
              {client.website && (
                <a href={client.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-0.5 hover:text-primary">
                  <Globe className="w-3 h-3" />{client.website.replace(/^https?:\/\//, "")}
                </a>
              )}
            </div>

            {client.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {client.tags.map((tag) => <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>)}
              </div>
            )}
            {client.summary && <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{client.summary}</p>}
          </div>
        </div>

        {/* Health score + obs stats */}
        <div className="mt-5 pt-5 border-t border-border space-y-3">
          <div className="flex items-center gap-3">
            <Heart className="w-4 h-4 text-rose-400 shrink-0" />
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">Relationship health (last 30 days)</span>
                <span className="font-semibold">{healthScore}/100</span>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${healthScore >= 70 ? "bg-emerald-500" : healthScore >= 40 ? "bg-amber-400" : "bg-red-400"}`}
                  style={{ width: `${healthScore}%` }}
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {(Object.keys(TYPE_CONFIG) as ObservationType[]).map((t) => {
              const cfg = TYPE_CONFIG[t];
              const count = typeCounts[t] ?? 0;
              return (
                <div key={t}
                  className={`text-center rounded-lg p-2 cursor-pointer transition-colors ${filterType === t ? cfg.color : "bg-secondary/50 hover:bg-secondary"}`}
                  onClick={() => { setFilterType(filterType === t ? "all" : t); setActiveTab("observations"); }}>
                  <div className="text-lg font-bold">{count}</div>
                  <div className="text-xs text-muted-foreground">{cfg.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {(["observations", "contacts"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}>
            {tab} {tab === "contacts" && contacts.length > 0 && `(${contacts.length})`}
          </button>
        ))}
      </div>

      {activeTab === "contacts" && (
        <ContactsPanel clientId={id} initialContacts={contacts} />
      )}

      {activeTab === "observations" && (
        <>
          <AddObservationForm
            clientId={id}
            contacts={contacts}
            onAdded={() => invalidateDetail()}
          />

          {/* Contact filter chips */}
          {contacts.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-muted-foreground shrink-0">Filter by:</span>
              <button
                onClick={() => setContactFilter(null)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  contactFilter === null ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40"
                }`}
              >All</button>
              <button
                onClick={() => setContactFilter("")}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  contactFilter === "" ? "bg-gray-700 text-white border-gray-700" : "border-border text-muted-foreground hover:border-primary/40"
                }`}
              >🏢 Company</button>
              {contacts.map((c) => (
                <button
                  key={c._id}
                  onClick={() => setContactFilter(contactFilter === c._id ? null : c._id)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    contactFilter === c._id ? "bg-blue-600 text-white border-blue-600" : "border-border text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  👤 {c.name}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">{filtered.length} observation{filtered.length !== 1 ? "s" : ""}</span>
            {filterType !== "all" && (
              <button onClick={() => setFilterType("all")} className="text-xs text-primary underline underline-offset-2">Clear filter</button>
            )}
          </div>
          {filtered.length === 0 ? (
            <Card className="p-10 text-center border-dashed">
              <p className="text-sm text-muted-foreground">No observations yet. Add one above.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filtered.map((obs) => (
                <ObservationCard key={obs._id} obs={obs} clientId={id} contacts={contacts}
                  onRefresh={invalidateDetail}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
