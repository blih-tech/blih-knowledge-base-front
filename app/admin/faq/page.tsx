"use client";

import { useState, useEffect } from "react";
import {
  adminGetAllFaqs,
  adminCreateFaq,
  adminUpdateFaq,
  adminDeleteFaq,
  type Faq,
} from "@/lib/api/faq.api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Loader2,
  AlertCircle,
  HelpCircle,
  GripVertical,
} from "lucide-react";

// ─── Inline editor sub-component ──────────────────────────────────────────────

function FaqForm({
  initial,
  onSave,
  onCancel,
  isSaving,
}: {
  initial?: Faq;
  onSave: (q: string, a: string, order: number) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [question, setQuestion] = useState(initial?.question ?? "");
  const [answer, setAnswer] = useState(initial?.answer ?? "");
  const [order, setOrder] = useState(initial?.order ?? 0);

  return (
    <div className="space-y-3 p-4 bg-secondary/30 rounded-lg border border-border">
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">Question *</label>
        <Input
          autoFocus
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g., How do I reset my password?"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">Answer *</label>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Write a clear, concise answer..."
          rows={4}
          className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm shadow-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">Order</label>
        <Input
          type="number"
          value={order}
          onChange={(e) => setOrder(Number(e.target.value))}
          className="w-28"
        />
      </div>
      <div className="flex gap-2 pt-1">
        <Button
          size="sm"
          disabled={!question.trim() || !answer.trim() || isSaving}
          onClick={() => onSave(question.trim(), answer.trim(), order)}
          className="gap-1.5"
        >
          {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          {initial ? "Update" : "Add FAQ"}
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>
          <X className="w-3.5 h-3.5 mr-1" />
          Cancel
        </Button>
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function AdminFaqPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  // ─── Load ──────────────────────────────────────────────────────────────────

  const reload = async () => {
    try {
      setIsLoading(true);
      const data = await adminGetAllFaqs();
      setFaqs(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load FAQs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { reload(); }, []);

  // ─── CRUD helpers ──────────────────────────────────────────────────────────

  const handleCreate = async (question: string, answer: string, order: number) => {
    setBusyId("new");
    setError(null);
    try {
      await adminCreateFaq({ question, answer, order });
      setShowAddForm(false);
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create FAQ");
    } finally {
      setBusyId(null);
    }
  };

  const handleUpdate = async (id: string, question: string, answer: string, order: number) => {
    setBusyId(id);
    setError(null);
    try {
      await adminUpdateFaq(id, { question, answer, order });
      setEditingId(null);
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update FAQ");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id: string, question: string) => {
    if (!confirm(`Delete "${question}"?`)) return;
    setBusyId(id);
    setError(null);
    try {
      await adminDeleteFaq(id);
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete FAQ");
    } finally {
      setBusyId(null);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">FAQs</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage frequently asked questions shown on the public FAQ page
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{faqs.length} question{faqs.length !== 1 ? "s" : ""}</Badge>
          {!showAddForm && (
            <Button size="sm" onClick={() => setShowAddForm(true)} className="gap-1.5">
              <Plus className="w-4 h-4" />
              Add FAQ
            </Button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Add form */}
      {showAddForm && (
        <Card className="p-4">
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary" /> New FAQ
          </h2>
          <FaqForm
            onSave={handleCreate}
            onCancel={() => setShowAddForm(false)}
            isSaving={busyId === "new"}
          />
        </Card>
      )}

      {/* FAQ list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : faqs.length === 0 ? (
        <Card className="p-10 text-center border-dashed">
          <HelpCircle className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No FAQs yet. Add your first question above.</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {faqs.map((faq) => {
            const isEditing = editingId === faq._id;
            const isBusy = busyId === faq._id;

            return (
              <Card key={faq._id} className="p-4 border shadow-sm">
                {isEditing ? (
                  <FaqForm
                    initial={faq}
                    onSave={(q, a, o) => handleUpdate(faq._id, q, a, o)}
                    onCancel={() => setEditingId(null)}
                    isSaving={isBusy}
                  />
                ) : (
                  <div className="flex items-start gap-3">
                    <GripVertical className="w-4 h-4 text-muted-foreground/30 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground mb-1">
                        {faq.question}
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {faq.answer}
                      </p>
                      <span className="text-xs text-muted-foreground/50 mt-1 inline-block">
                        Order: {faq.order}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setEditingId(faq._id)}
                        className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        disabled={isBusy}
                        onClick={() => handleDelete(faq._id, faq.question)}
                        className="text-muted-foreground hover:text-red-600 hover:bg-red-50"
                        title="Delete"
                      >
                        {isBusy ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
