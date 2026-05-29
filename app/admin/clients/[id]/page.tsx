"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getClient,
  listObservations,
  createObservation,
  updateObservation,
  deleteObservation,
  updateClient,
  type Client,
  type Observation,
  type ObservationType,
  type SentimentType,
} from "@/lib/api/clients.api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ThumbsUp, ThumbsDown, Star, Activity, MessageSquare,
  FileText, ArrowLeft, Plus, Edit2, Trash2, Save, X,
  Lock, Loader2, AlertCircle, Sparkles,
} from "lucide-react";

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

function AddObservationForm({ clientId, onAdded }: { clientId: string; onAdded: (o: Observation) => void }) {
  const [type, setType] = useState<ObservationType>("general");
  const [content, setContent] = useState("");
  const [sentiment, setSentiment] = useState<SentimentType>("neutral");
  const [isPrivate, setIsPrivate] = useState(false);
  const [tags, setTags] = useState("");
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
        tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      });
      onAdded(obs);
      setContent("");
      setTags("");
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
  onUpdated,
  onDeleted,
}: {
  obs: Observation;
  clientId: string;
  onUpdated: (o: Observation) => void;
  onDeleted: (id: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(obs.content);
  const [isBusy, setIsBusy] = useState(false);

  const handleUpdate = async () => {
    setIsBusy(true);
    try {
      const updated = await updateObservation(clientId, obs._id, { content });
      onUpdated(updated);
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
      onDeleted(obs._id);
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
  const [client, setClient] = useState<Client | null>(null);
  const [typeCounts, setTypeCounts] = useState<Record<string, number>>({});
  const [observations, setObservations] = useState<Observation[]>([]);
  const [filterType, setFilterType] = useState<ObservationType | "all">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [detail, obs] = await Promise.all([
          getClient(id),
          listObservations(id),
        ]);
        setClient(detail.client);
        setTypeCounts(detail.typeCounts);
        setObservations(obs);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load client");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  const filtered = filterType === "all" ? observations : observations.filter((o) => o.type === filterType);
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

  if (error || !client) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="w-8 h-8 text-red-400 mb-3" />
        <p className="text-sm text-muted-foreground">{error || "Client not found"}</p>
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
            <h1 className="text-xl font-bold text-foreground">{client.name}</h1>
            {client.company && <p className="text-sm text-muted-foreground">{client.company} {client.industry && `· ${client.industry}`}</p>}
            <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
              {client.email && <span>{client.email}</span>}
              {client.phone && <span>{client.phone}</span>}
            </div>
            {client.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {client.tags.map((tag) => <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>)}
              </div>
            )}
            {client.summary && <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{client.summary}</p>}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 shrink-0"
            onClick={() => {
              const msg = `Tell me about ${client.name}'s behavior and preferences.`;
              window.open(`/ask-ai?q=${encodeURIComponent(msg)}`, "_blank");
            }}
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" /> Ask AI
          </Button>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-5 pt-5 border-t border-border">
          {(Object.keys(TYPE_CONFIG) as ObservationType[]).map((t) => {
            const cfg = TYPE_CONFIG[t];
            const count = typeCounts[t] ?? 0;
            return (
              <div key={t} className={`text-center rounded-lg p-2 cursor-pointer transition-colors ${filterType === t ? cfg.color : "bg-secondary/50 hover:bg-secondary"}`}
                onClick={() => setFilterType(filterType === t ? "all" : t)}>
                <div className="text-lg font-bold">{count}</div>
                <div className="text-xs text-muted-foreground">{cfg.label}</div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Add observation */}
      <AddObservationForm
        clientId={id}
        onAdded={(obs) => {
          setObservations((prev) => [obs, ...prev]);
          setTypeCounts((tc) => ({ ...tc, [obs.type]: (tc[obs.type] ?? 0) + 1 }));
        }}
      />

      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-muted-foreground">{filtered.length} observation{filtered.length !== 1 ? "s" : ""}</span>
        {filterType !== "all" && (
          <button onClick={() => setFilterType("all")} className="text-xs text-primary underline underline-offset-2">
            Clear filter
          </button>
        )}
      </div>

      {/* Observations feed */}
      {filtered.length === 0 ? (
        <Card className="p-10 text-center border-dashed">
          <p className="text-sm text-muted-foreground">No observations yet. Add one above.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((obs) => (
            <ObservationCard
              key={obs._id}
              obs={obs}
              clientId={id}
              onUpdated={(updated) => setObservations((prev) => prev.map((o) => o._id === updated._id ? updated : o))}
              onDeleted={(obsId) => {
                setObservations((prev) => {
                  const removed = prev.find((o) => o._id === obsId);
                  if (removed) setTypeCounts((tc) => ({ ...tc, [removed.type]: Math.max(0, (tc[removed.type] ?? 1) - 1) }));
                  return prev.filter((o) => o._id !== obsId);
                });
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
