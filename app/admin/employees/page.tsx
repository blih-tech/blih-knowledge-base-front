"use client";

import { useState, useEffect, useCallback } from "react";
import {
  listEmployees, createEmployee, updateEmployee, assignClients, deactivateEmployee,
  type Employee,
} from "@/lib/api/employees.api";
import { listClients, type Client } from "@/lib/api/clients.api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus, Search, Edit2, Trash2, Save, X, Loader2,
  Users, AlertCircle, Building2, Briefcase, CheckCircle2,
  XCircle, UserCheck, Mail, ChevronDown, ChevronUp,
} from "lucide-react";

// ─── Avatar ───────────────────────────────────────────────────────────────────

const COLORS = [
  "bg-violet-100 text-violet-700", "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700", "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
];
function Avatar({ name }: { name: string }) {
  const initials = name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
  const color = COLORS[name.charCodeAt(0) % COLORS.length];
  return (
    <div className={`w-10 h-10 ${color} rounded-full flex items-center justify-center font-semibold text-sm shrink-0`}>
      {initials}
    </div>
  );
}

// ─── Create Employee Modal ────────────────────────────────────────────────────

function CreateEmployeeModal({
  allClients, onClose, onCreate,
}: {
  allClients: Client[];
  onClose: () => void;
  onCreate: (e: Employee) => void;
}) {
  const [form, setForm] = useState({
    name: "", email: "", password: "", department: "", position: "",
  });
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleClient = (id: string) =>
    setSelectedClients((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) return;
    setIsSaving(true); setError(null);
    try {
      onCreate(await createEmployee({ ...form, assignedClients: selectedClients }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create employee");
    } finally { setIsSaving(false); }
  };

  const field = (key: keyof typeof form, label: string, placeholder: string, type = "text", required = false) => (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1">{label}{required && " *"}</label>
      <Input type={type} value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} placeholder={placeholder} />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-white">
          <h2 className="text-base font-semibold">Add Employee</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">{field("name", "Full Name", "e.g. Amanuel Tadesse", "text", true)}</div>
            <div className="col-span-2">{field("email", "Work Email", "amanuel@company.com", "email", true)}</div>
            <div className="col-span-2">{field("password", "Temporary Password", "Min 8 characters", "password", true)}</div>
            <div>{field("department", "Department", "e.g. Sales, Tech")}</div>
            <div>{field("position", "Position", "e.g. Account Manager")}</div>
          </div>

          {/* Assign clients */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">
              Assign Clients ({selectedClients.length} selected)
            </label>
            <div className="border border-border rounded-lg max-h-40 overflow-y-auto divide-y divide-border">
              {allClients.length === 0 && (
                <p className="text-xs text-muted-foreground p-3">No clients available</p>
              )}
              {allClients.map((c) => (
                <label key={c._id} className="flex items-center gap-2 px-3 py-2 hover:bg-secondary/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedClients.includes(c._id)}
                    onChange={() => toggleClient(c._id)}
                    className="rounded"
                  />
                  <span className="text-sm font-medium truncate">{c.name}</span>
                  {c.industry && <span className="text-xs text-muted-foreground ml-auto shrink-0">{c.industry}</span>}
                </label>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-600 flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" />{error}</p>}
          <div className="flex gap-2 pt-1">
            <Button type="submit" disabled={!form.name.trim() || !form.email.trim() || !form.password.trim() || isSaving} className="flex-1 gap-1.5">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Create Employee
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Assign Clients Modal ─────────────────────────────────────────────────────

function AssignClientsModal({
  employee, allClients, onClose, onSaved,
}: {
  employee: Employee;
  allClients: Client[];
  onClose: () => void;
  onSaved: (e: Employee) => void;
}) {
  const [selected, setSelected] = useState<string[]>(employee.assignedClients.map((c) => c._id));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (id: string) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);

  const handleSave = async () => {
    setIsSaving(true); setError(null);
    try { onSaved(await assignClients(employee._id, selected)); }
    catch (err) { setError(err instanceof Error ? err.message : "Failed to save"); }
    finally { setIsSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-base font-semibold">Assign Clients</h2>
            <p className="text-xs text-muted-foreground">{employee.name}</p>
          </div>
          <button onClick={onClose}><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="border border-border rounded-lg max-h-64 overflow-y-auto divide-y divide-border">
            {allClients.map((c) => (
              <label key={c._id} className="flex items-center gap-3 px-3 py-2.5 hover:bg-secondary/50 cursor-pointer">
                <input type="checkbox" checked={selected.includes(c._id)} onChange={() => toggle(c._id)} className="rounded" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{c.name}</p>
                  {c.industry && <p className="text-xs text-muted-foreground">{c.industry}</p>}
                </div>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${c.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
                  {c.status}
                </span>
              </label>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">{selected.length} client{selected.length !== 1 ? "s" : ""} selected</p>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={isSaving} className="flex-1 gap-1.5">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Assignments
            </Button>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Employee Card ────────────────────────────────────────────────────────────

function EmployeeCard({
  employee, allClients,
  onUpdated, onDeactivated,
}: {
  employee: Employee;
  allClients: Client[];
  onUpdated: (e: Employee) => void;
  onDeactivated: (id: string) => void;
}) {
  const [showAssign, setShowAssign] = useState(false);
  const [showClients, setShowClients] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const handleDeactivate = async () => {
    if (!confirm(`Deactivate ${employee.name}? They will lose access.`)) return;
    setIsDeactivating(true);
    try { await deactivateEmployee(employee._id); onDeactivated(employee._id); }
    finally { setIsDeactivating(false); }
  };

  return (
    <>
      <Card className={`p-4 ${!employee.isActive ? "opacity-60" : ""}`}>
        <div className="flex items-start gap-3">
          <Avatar name={employee.name} />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="font-medium text-sm text-foreground">{employee.name}</p>
                  {employee.isActive ? (
                    <span className="inline-flex items-center gap-0.5 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-1.5 py-0.5">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-full px-1.5 py-0.5">
                      <XCircle className="w-2.5 h-2.5" /> Inactive
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Mail className="w-3 h-3" />{employee.email}
                </p>
                {(employee.department || employee.position) && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Briefcase className="w-3 h-3" />
                    {[employee.position, employee.department].filter(Boolean).join(" · ")}
                  </p>
                )}
              </div>
              <div className="flex gap-1 shrink-0">
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => setShowAssign(true)}>
                  <UserCheck className="w-3 h-3" /> Assign
                </Button>
                {employee.isActive && (
                  <Button variant="ghost" size="icon-sm" onClick={handleDeactivate} disabled={isDeactivating}
                    className="text-muted-foreground hover:text-red-600 hover:bg-red-50">
                    {isDeactivating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </Button>
                )}
              </div>
            </div>

            {/* Assigned clients summary */}
            <button
              onClick={() => setShowClients((s) => !s)}
              className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Building2 className="w-3 h-3" />
              {employee.assignedClients.length} client{employee.assignedClients.length !== 1 ? "s" : ""} assigned
              {employee.assignedClients.length > 0 && (showClients ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
            </button>

            {showClients && employee.assignedClients.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {employee.assignedClients.map((c) => (
                  <Badge key={c._id} variant="secondary" className="text-xs">{c.name}</Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>

      {showAssign && (
        <AssignClientsModal
          employee={employee}
          allClients={allClients}
          onClose={() => setShowAssign(false)}
          onSaved={(updated) => { onUpdated(updated); setShowAssign(false); }}
        />
      )}
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminEmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [allClients, setAllClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async (q?: string) => {
    setIsLoading(true); setError(null);
    try {
      const [emps, clients] = await Promise.all([
        listEmployees({ search: q }),
        listClients({ limit: 100 }),
      ]);
      setEmployees(emps);
      setAllClients(clients.clients as unknown as Client[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load employees");
    } finally { setIsLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const t = setTimeout(() => load(search || undefined), 300);
    return () => clearTimeout(t);
  }, [search, load]);

  const visible = showInactive ? employees : employees.filter((e) => e.isActive);
  const active = employees.filter((e) => e.isActive).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Employees</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage staff accounts and their client access
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{active} active</Badge>
          <Button size="sm" onClick={() => setShowCreate(true)} className="gap-1.5">
            <Plus className="w-4 h-4" /> Add Employee
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email…" className="pl-9" />
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer px-2">
          <input type="checkbox" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} className="rounded" />
          Show inactive
        </label>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : visible.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <Users className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            {search ? "No employees match your search." : "No employees yet. Add your first team member."}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {visible.map((emp) => (
            <EmployeeCard
              key={emp._id}
              employee={emp}
              allClients={allClients}
              onUpdated={(updated) => setEmployees((prev) => prev.map((e) => e._id === updated._id ? updated : e))}
              onDeactivated={(id) => setEmployees((prev) => prev.map((e) => e._id === id ? { ...e, isActive: false } : e))}
            />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateEmployeeModal
          allClients={allClients}
          onClose={() => setShowCreate(false)}
          onCreate={(emp) => {
            setEmployees((prev) => [emp, ...prev]);
            setShowCreate(false);
          }}
        />
      )}
    </div>
  );
}
