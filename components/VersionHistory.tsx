"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";
import { History, Eye, RotateCcw, Loader2 } from "lucide-react";
import {
  adminGetDocumentVersions,
  adminGetDocumentVersion,
  type DocumentVersion,
  type DocumentVersionDetail,
} from "@/lib/api/documents.api";
import { useAdmin } from "@/lib/admin-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { UserChip } from "@/components/UserChip";

interface VersionHistoryProps {
  documentId: string;
  /** Whether the current user may restore (mirrors the doc's edit permission). */
  canRestore: boolean;
  /** Called after a successful restore so the editor can reload its content. */
  onRestored: () => void;
}

export function VersionHistory({ documentId, canRestore, onRestored }: VersionHistoryProps) {
  const { restoreDocumentVersion } = useAdmin();

  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Preview dialog
  const [preview, setPreview] = useState<DocumentVersionDetail | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Restore confirmation
  const [restoreTarget, setRestoreTarget] = useState<DocumentVersion | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  const loadVersions = () => {
    setIsLoading(true);
    setError(null);
    adminGetDocumentVersions(documentId)
      .then(setVersions)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load version history"))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadVersions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId]);

  const openPreview = (version: DocumentVersion) => {
    setPreviewOpen(true);
    setPreview(null);
    setPreviewLoading(true);
    adminGetDocumentVersion(documentId, version._id)
      .then(setPreview)
      .catch((err) => {
        toast.error(err instanceof Error ? err.message : "Failed to load version");
        setPreviewOpen(false);
      })
      .finally(() => setPreviewLoading(false));
  };

  const confirmRestore = async () => {
    if (!restoreTarget) return;
    setIsRestoring(true);
    try {
      await restoreDocumentVersion(documentId, restoreTarget._id);
      toast.success(`Restored version v${restoreTarget.version}`);
      setRestoreTarget(null);
      onRestored();
      loadVersions();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Restore failed");
    } finally {
      setIsRestoring(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <History className="w-8 h-8 text-muted-foreground/40 mb-3" />
        <p className="text-sm text-muted-foreground">No previous versions yet.</p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          A snapshot is saved each time this document is edited.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {versions.map((v, idx) => (
        <div
          key={v._id}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white border border-border shadow-xs"
        >
          <Badge variant="secondary" className="shrink-0 font-mono text-xs">
            v{v.version}
          </Badge>
          {idx === 0 && (
            <Badge variant="outline" className="shrink-0 text-[10px] text-teal-700 border-teal-300 bg-teal-50">
              Latest
            </Badge>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground truncate">{v.title || "Untitled"}</p>
            {v.changeNote && (
              <p className="text-xs text-muted-foreground truncate">{v.changeNote}</p>
            )}
          </div>
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <UserChip compact user={v.changedBy} />
            <span
              className="text-xs text-muted-foreground"
              title={format(new Date(v.changedAt), "PPpp")}
            >
              {formatDistanceToNow(new Date(v.changedAt), { addSuffix: true })}
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground hover:text-foreground"
              onClick={() => openPreview(v)}
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Preview</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              disabled={!canRestore}
              title={canRestore ? "Restore this version" : "You do not have permission to restore this document"}
              onClick={() => setRestoreTarget(v)}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Restore</span>
            </Button>
          </div>
        </div>
      ))}

      {/* ── Preview dialog ── */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {preview ? `Version v${preview.version}` : "Loading version…"}
              {preview?.docId && (
                <span className="text-xs font-mono text-muted-foreground">{preview.docId}</span>
              )}
            </DialogTitle>
            <DialogDescription>
              {preview
                ? `${preview.title} · saved ${format(new Date(preview.changedAt), "PPpp")}`
                : "Fetching version content."}
            </DialogDescription>
          </DialogHeader>
          {previewLoading || !preview ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ScrollArea className="max-h-[60vh] pr-4">
              <div
                className="prose prose-slate max-w-none"
                dangerouslySetInnerHTML={{ __html: preview.contentHtml || "<p><em>No content.</em></p>" }}
              />
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Restore confirmation ── */}
      <AlertDialog open={!!restoreTarget} onOpenChange={(open) => !open && setRestoreTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore version v{restoreTarget?.version}?</AlertDialogTitle>
            <AlertDialogDescription>
              This replaces the document&rsquo;s current content with this version. The current
              content is first saved as a new version, so nothing is lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRestoring}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); confirmRestore(); }} disabled={isRestoring}>
              {isRestoring ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                  Restoring…
                </>
              ) : (
                "Restore"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
