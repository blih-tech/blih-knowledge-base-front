"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { usePolicyDetail, usePolicyAcceptances, usePolicyVersions, usePolicyVersion, usePolicyMutations } from "@/hooks/queries";
import { POLICY_TYPE_LABELS } from "@/lib/api/policies.api";
import { RichTextEditor } from "@/components/RichTextEditor";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, Save, Loader2, History, Users, AlertTriangle, ArrowUpCircle, Eye, RotateCcw } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface Props { params: Promise<{ id: string }>; }

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-amber-50 text-amber-700 border-amber-200",
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  archived: "bg-slate-100 text-slate-500 border-slate-200",
};

export default function PolicyDetailPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const { data: policy, isLoading } = usePolicyDetail(id);
  const { data: acceptancesData } = usePolicyAcceptances(id);
  const { data: versions } = usePolicyVersions(id);
  const { updatePolicy, restoreVersion } = usePolicyMutations();

  const [title, setTitle] = useState("");
  const [isRequired, setIsRequired] = useState(true);
  const [status, setStatus] = useState<string>("draft");
  const [contentHtml, setContentHtml] = useState("");
  const [contentJson, setContentJson] = useState<object>({ type: "doc", content: [] });
  const [contentVersion, setContentVersion] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [createVersionFlag, setCreateVersionFlag] = useState(false);
  const [versionLabel, setVersionLabel] = useState("");
  const [versionNote, setVersionNote] = useState("");
  const [bumpVersion, setBumpVersion] = useState(false);
  const [previewVersionId, setPreviewVersionId] = useState<string | null>(null);
  const { data: previewVersion } = usePolicyVersion(id, previewVersionId);

  useEffect(() => {
    if (!policy) return;
    setTitle(policy.title);
    setIsRequired(policy.isRequired);
    setStatus(policy.status);
    setContentHtml(policy.contentHtml ?? "");
    if (policy.contentJson && Object.keys(policy.contentJson).length > 0) setContentJson(policy.contentJson);
    setContentVersion((v) => v + 1);
  }, [policy]);

  const extractText = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Title is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSaveClick = () => {
    if (!validate()) return;
    setCreateVersionFlag(false); setVersionLabel(""); setVersionNote(""); setBumpVersion(false); setSaveError(null);
    setShowSaveDialog(true);
  };

  const confirmSave = async () => {
    if (createVersionFlag && !versionLabel.trim()) return;
    setSaveError(null);
    try {
      await updatePolicy.mutateAsync({
        id, data: { title: title.trim(), contentHtml, contentJson, contentText: extractText(contentHtml), isRequired, status, createVersion: createVersionFlag, versionLabel: versionLabel.trim(), changeNote: versionNote.trim(), bumpVersion },
      });
      setShowSaveDialog(false);
    } catch (err) { setSaveError(err instanceof Error ? err.message : "Save failed"); }
  };

  const handleRestore = async (versionId: string) => {
    if (!confirm("Restore this version? Current content will be overwritten.")) return;
    try {
      await restoreVersion.mutateAsync({ policyId: id, versionId, changeNote: "Restored from version history" });
      setPreviewVersionId(null);
    } catch (err) { setSaveError(err instanceof Error ? err.message : "Restore failed"); }
  };

  if (isLoading) return <div className="space-y-4"><div className="h-12 rounded-xl bg-muted animate-pulse" /><div className="h-48 rounded-xl bg-muted animate-pulse" /><div className="h-80 rounded-xl bg-muted animate-pulse" /></div>;
  if (!policy) return <div className="text-center py-20"><p className="text-muted-foreground">Policy not found.</p><Button variant="outline" className="mt-4" onClick={() => router.push("/admin/policies")}>Back</Button></div>;

  const acceptances = acceptancesData?.acceptances ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/admin/policies")} className="gap-2"><ChevronLeft className="w-4 h-4" />Back</Button>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Edit Policy</h1>
        <Badge variant="outline" className={`ml-auto text-xs ${STATUS_COLORS[policy.status]}`}>{policy.status}</Badge>
        <Badge variant="secondary" className="text-xs">{POLICY_TYPE_LABELS[policy.policyType] ?? policy.policyType}</Badge>
        <Badge variant="secondary" className="text-xs font-mono">v{policy.version}</Badge>
      </div>

      <Tabs defaultValue="editor">
        <TabsList className="mb-4">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="acceptances" className="gap-1.5"><Users className="w-3.5 h-3.5" />Acceptances ({policy.acceptanceCount})</TabsTrigger>
          <TabsTrigger value="history" className="gap-1.5"><History className="w-3.5 h-3.5" />Versions</TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-base font-semibold text-foreground mb-4">Policy Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1.5">Title *</label><Input value={title} onChange={(e) => { setTitle(e.target.value); setErrors({ ...errors, title: "" }); }} placeholder="Policy title" className={errors.title ? "border-red-500" : ""} />{errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}</div>
              <div><label className="block text-sm font-medium mb-1.5">Status</label><Select value={status} onValueChange={setStatus}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="archived">Archived</SelectItem></SelectContent></Select></div>
            </div>
            <div className="flex items-center gap-3 mt-4 rounded-lg border border-border px-3 py-2.5"><div className="flex-1"><p className="text-sm font-medium">Required Policy</p><p className="text-xs text-muted-foreground">Employees must accept before accessing the platform</p></div><Switch checked={isRequired} onCheckedChange={setIsRequired} /></div>
            {(policy.createdBy || policy.updatedBy) && <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">{policy.createdBy && <span>Created by <strong>{policy.createdBy.name}</strong> {policy.createdAt && format(new Date(policy.createdAt), "PP")}</span>}{policy.updatedBy && policy.updatedAt && <span>Last edited by <strong>{policy.updatedBy.name}</strong> {formatDistanceToNow(new Date(policy.updatedAt), { addSuffix: true })}</span>}</div>}
          </Card>
          <Card className="p-4 2xl:p-6"><h2 className="text-base font-semibold text-foreground mb-3">Policy Content</h2><RichTextEditor value={contentHtml} onChange={setContentHtml} onChangeJson={setContentJson} placeholder="Write your policy content here..." externalContentVersion={contentVersion} /></Card>
          {saveError && <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{saveError}</div>}
          <div className="flex gap-3"><Button onClick={handleSaveClick} disabled={updatePolicy.isPending} className="gap-2"><Save className="w-4 h-4" />Save Changes</Button><Button onClick={() => router.push("/admin/policies")} variant="outline">Cancel</Button></div>
        </TabsContent>

        <TabsContent value="acceptances" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4"><h2 className="text-base font-semibold text-foreground">Who has accepted (v{policy.version})</h2><Badge variant="secondary">{policy.acceptanceCount} accepted</Badge></div>
            {acceptances.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">No employees have accepted this policy version yet.</p> : <div className="space-y-2">{acceptances.map((a) => <div key={a._id} className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-border bg-white"><div><p className="text-sm font-medium text-foreground">{a.user.name}</p><p className="text-xs text-muted-foreground">{a.user.email}{a.user.position && ` · ${a.user.position}`}</p></div><div className="text-right"><p className="text-xs text-muted-foreground">{format(new Date(a.acceptedAt), "PPp")}</p><p className="text-[10px] text-muted-foreground/60 font-mono">{a.ipAddress}</p></div></div>)}</div>}
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-base font-semibold text-foreground mb-4">Version History</h2>
            {!versions || versions.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">No versions recorded yet.</p> : <div className="space-y-2">{versions.map((v) => <div key={v._id} className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-border bg-white hover:bg-secondary/40 transition-colors"><div className="flex items-center gap-3"><Badge variant="secondary" className="text-xs font-mono shrink-0">{v.versionLabel || `v${v.version}`}</Badge><div><p className="text-sm font-medium text-foreground">{v.title}</p><p className="text-xs text-muted-foreground">{v.changedBy?.name ?? "System"} · {formatDistanceToNow(new Date(v.changedAt), { addSuffix: true })}{v.changeNote && ` — ${v.changeNote}`}</p></div></div><div className="flex items-center gap-1.5"><Button variant="ghost" size="icon-sm" onClick={() => setPreviewVersionId(v._id)} title="Preview"><Eye className="w-4 h-4" /></Button><Button variant="ghost" size="icon-sm" onClick={() => handleRestore(v._id)} title="Restore"><RotateCcw className="w-4 h-4" /></Button></div></div>)}</div>}
          </Card>
          <Dialog open={!!previewVersionId} onOpenChange={() => setPreviewVersionId(null)}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto"><DialogHeader><DialogTitle>Version Preview {previewVersion && <Badge variant="secondary" className="text-xs font-mono ml-2">{previewVersion.versionLabel || `v${previewVersion.version}`}</Badge>}</DialogTitle></DialogHeader>{previewVersion ? <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: previewVersion.contentHtml }} /> : <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>}</DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>

      <Dialog open={showSaveDialog} onOpenChange={(open) => !updatePolicy.isPending && setShowSaveDialog(open)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Save changes</DialogTitle><DialogDescription>Configure versioning options for this save.</DialogDescription></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5"><div><p className="text-sm font-medium">Create a new version</p><p className="text-xs text-muted-foreground">Snapshot this content for history.</p></div><Switch checked={createVersionFlag} onCheckedChange={setCreateVersionFlag} /></div>
            {createVersionFlag && <div className="space-y-3 pl-1"><div><label className="block text-xs font-medium mb-1">Version label *</label><Input value={versionLabel} onChange={(e) => setVersionLabel(e.target.value)} placeholder='e.g. "2.0"' className="h-8 text-sm" /></div><div><label className="block text-xs font-medium mb-1">Change note</label><Input value={versionNote} onChange={(e) => setVersionNote(e.target.value)} placeholder="Brief description" className="h-8 text-sm" /></div></div>}
            <div className="flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5"><div><p className="text-sm font-medium text-amber-800 flex items-center gap-1.5"><ArrowUpCircle className="w-4 h-4" />Bump policy version</p><p className="text-xs text-amber-700">Invalidates all prior acceptances. Employees must re-accept.</p></div><Switch checked={bumpVersion} onCheckedChange={setBumpVersion} /></div>
            {bumpVersion && <div className="flex items-start gap-2 rounded-md bg-red-50 border border-red-200 px-3 py-2.5"><AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" /><p className="text-xs text-red-700">All employees will need to re-accept. v{policy.version} → v{policy.version + 1}</p></div>}
            {saveError && <p className="text-xs text-red-600">{saveError}</p>}
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowSaveDialog(false)} disabled={updatePolicy.isPending}>Cancel</Button><Button onClick={confirmSave} disabled={updatePolicy.isPending || (createVersionFlag && !versionLabel.trim())} className="gap-1.5">{updatePolicy.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}{updatePolicy.isPending ? "Saving…" : "Save"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
