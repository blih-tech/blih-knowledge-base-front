"use client";

import { useState } from "react";
import {
  type Contact, type ContactRole,
} from "@/lib/api/clients.api";
import { useClientMutations } from "@/hooks/queries";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus, Edit2, Trash2, Save, X, Loader2,
  Mail, Phone, Star, User, AlertCircle,
} from "lucide-react";

const ROLE_LABELS: Record<ContactRole, string> = {
  ceo: "CEO", cto: "CTO", cfo: "CFO", coo: "COO",
  manager: "Manager", director: "Director", vp: "VP",
  developer: "Developer", designer: "Designer", analyst: "Analyst",
  sales: "Sales", hr: "HR", legal: "Legal", finance: "Finance", other: "Other",
};

const ROLES = Object.keys(ROLE_LABELS) as ContactRole[];

const AVATAR_COLORS = [
  "bg-violet-100 text-violet-700", "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700", "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700", "bg-sky-100 text-sky-700",
];
function Avatar({ name }: { name: string }) {
  const initials = name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
  const color = AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
  return (
    <div className={`w-9 h-9 ${color} rounded-full flex items-center justify-center font-semibold text-sm shrink-0`}>
      {initials}
    </div>
  );
}

type ContactForm = {
  name: string; role: ContactRole; department: string;
  email: string; phone: string; isPrimary: boolean; notes: string;
};
const EMPTY: ContactForm = { name: "", role: "other", department: "", email: "", phone: "", isPrimary: false, notes: "" };

function ContactForm({
  initial, onSave, onCancel, isSaving, error,
}: {
  initial: ContactForm;
  onSave: (f: ContactForm) => void;
  onCancel: () => void;
  isSaving: boolean;
  error: string | null;
}) {
  const [f, setF] = useState(initial);
  const set = (k: keyof ContactForm, v: unknown) => setF((prev) => ({ ...prev, [k]: v }));

  return (
    <div className="space-y-3 p-4 bg-primary/3 border border-primary/20 rounded-xl">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="text-xs font-medium text-muted-foreground">Name *</label>
          <Input value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Full name" className="mt-1" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Role</label>
          <select value={f.role} onChange={(e) => set("role", e.target.value as ContactRole)}
            className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 text-sm">
            {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Department</label>
          <Input value={f.department} onChange={(e) => set("department", e.target.value)} placeholder="e.g. Engineering" className="mt-1" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Email</label>
          <Input type="email" value={f.email} onChange={(e) => set("email", e.target.value)} placeholder="email@company.com" className="mt-1" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Phone</label>
          <Input value={f.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+251 911 000 000" className="mt-1" />
        </div>
        <div className="col-span-2">
          <label className="text-xs font-medium text-muted-foreground">Notes</label>
          <Input value={f.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Optional notes about this contact" className="mt-1" />
        </div>
        <label className="col-span-2 flex items-center gap-2 text-sm cursor-pointer select-none">
          <input type="checkbox" checked={f.isPrimary} onChange={(e) => set("isPrimary", e.target.checked)} className="rounded" />
          <Star className="w-3.5 h-3.5 text-amber-500" /> Mark as primary contact
        </label>
      </div>
      {error && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
      <div className="flex gap-2">
        <Button size="sm" onClick={() => onSave(f)} disabled={!f.name.trim() || isSaving} className="gap-1.5">
          {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Save
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}><X className="w-3 h-3 mr-1" />Cancel</Button>
      </div>
    </div>
  );
}

export function ContactsPanel({ clientId, initialContacts }: { clientId: string; initialContacts: Contact[] }) {
  const {
    createContact,
    updateContact,
    deleteContact,
  } = useClientMutations(clientId);
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (f: ContactForm) => {
    setIsSaving(true); setError(null);
    try {
      const c = await createContact.mutateAsync({ data: f });
      setContacts((prev) => {
        const updated = f.isPrimary ? prev.map((p) => ({ ...p, isPrimary: false })) : [...prev];
        return [c, ...updated].sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));
      });
      setShowAdd(false);
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to create contact"); }
    finally { setIsSaving(false); }
  };

  const handleUpdate = async (contactId: string, f: ContactForm) => {
    setIsSaving(true); setError(null);
    try {
      const c = await updateContact.mutateAsync({ contactId, data: f });
      setContacts((prev) => {
        const updated = f.isPrimary ? prev.map((p) => ({ ...p, isPrimary: false })) : [...prev];
        return updated.map((p) => p._id === contactId ? c : p)
          .sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));
      });
      setEditingId(null);
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to update contact"); }
    finally { setIsSaving(false); }
  };

  const handleDelete = async (contactId: string, name: string) => {
    if (!confirm(`Remove ${name} from contacts?`)) return;
    try {
      await deleteContact.mutateAsync(contactId);
      setContacts((prev) => prev.filter((c) => c._id !== contactId));
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to delete contact"); }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          <User className="w-4 h-4 text-primary" /> Contacts
          {contacts.length > 0 && <Badge variant="secondary" className="text-xs">{contacts.length}</Badge>}
        </h3>
        {!showAdd && (
          <Button size="sm" variant="outline" onClick={() => setShowAdd(true)} className="gap-1 h-7 text-xs">
            <Plus className="w-3 h-3" /> Add Contact
          </Button>
        )}
      </div>

      {showAdd && (
        <ContactForm
          initial={EMPTY}
          onSave={handleCreate}
          onCancel={() => { setShowAdd(false); setError(null); }}
          isSaving={isSaving}
          error={error}
        />
      )}

      {contacts.length === 0 && !showAdd && (
        <div className="text-center py-8 text-sm text-muted-foreground border border-dashed rounded-xl">
          No contacts yet. Add the key people at this company.
        </div>
      )}

      <div className="space-y-2">
        {contacts.map((c) => (
          <div key={c._id}>
            {editingId === c._id ? (
              <ContactForm
                initial={{ name: c.name, role: c.role, department: c.department, email: c.email, phone: c.phone, isPrimary: c.isPrimary, notes: c.notes }}
                onSave={(f) => handleUpdate(c._id, f)}
                onCancel={() => { setEditingId(null); setError(null); }}
                isSaving={isSaving}
                error={error}
              />
            ) : (
              <div className="group flex items-start gap-3 p-3 rounded-xl border border-border bg-white hover:shadow-sm transition-shadow">
                <Avatar name={c.name} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-medium text-foreground">{c.name}</span>
                    {c.isPrimary && (
                      <span className="inline-flex items-center gap-0.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-1.5 py-0.5">
                        <Star className="w-2.5 h-2.5" /> Primary
                      </span>
                    )}
                    <Badge variant="secondary" className="text-xs">{ROLE_LABELS[c.role]}</Badge>
                    {c.department && <span className="text-xs text-muted-foreground">· {c.department}</span>}
                  </div>
                  <div className="flex flex-wrap gap-3 mt-1">
                    {c.email && (
                      <a href={`mailto:${c.email}`} className="text-xs text-muted-foreground flex items-center gap-1 hover:text-primary">
                        <Mail className="w-3 h-3" />{c.email}
                      </a>
                    )}
                    {c.phone && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Phone className="w-3 h-3" />{c.phone}
                      </span>
                    )}
                  </div>
                  {c.notes && <p className="text-xs text-muted-foreground mt-1 italic">{c.notes}</p>}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <Button variant="ghost" size="icon-sm" onClick={() => setEditingId(c._id)} className="text-muted-foreground hover:text-primary hover:bg-primary/10">
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(c._id, c.name)} className="text-muted-foreground hover:text-red-600 hover:bg-red-50">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
