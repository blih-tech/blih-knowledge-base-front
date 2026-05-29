"use client";

import { useRef, useState } from "react";
import { parseDocumentFile } from "@/lib/api/documents.api";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface FileImportButtonProps {
  /** Called with the parsed HTML (and optional title from file metadata) */
  onImport: (html: string, title?: string) => void;
  /** Whether the editor currently has content — triggers a replace confirmation */
  hasContent?: boolean;
}

type Status = "idle" | "uploading" | "done" | "error";

export function FileImportButton({ onImport, hasContent = false }: FileImportButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleClick = () => {
    if (status === "uploading") return;
    // Reset status before re-opening picker
    setStatus("idle");
    setErrorMsg(null);
    inputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset input so the same file can be re-selected
    e.target.value = "";

    if (!file) return;

    // Warn before replacing existing content
    if (
      hasContent &&
      !confirm(
        "This will replace the current editor content with the imported file. Continue?"
      )
    ) {
      return;
    }

    setStatus("uploading");
    setErrorMsg(null);

    try {
      const { html, title } = await parseDocumentFile(file);
      onImport(html, title);
      setStatus("done");
      // Reset to idle after 2.5 s so the user can re-import
      setTimeout(() => setStatus("idle"), 2500);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to parse file. Try again.";
      setErrorMsg(msg);
      setStatus("error");
      setTimeout(() => { setStatus("idle"); setErrorMsg(null); }, 4000);
    }
  };

  const icon = () => {
    if (status === "uploading") return <Loader2 className="w-4 h-4 animate-spin" />;
    if (status === "done") return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    if (status === "error") return <AlertCircle className="w-4 h-4 text-red-500" />;
    return <Upload className="w-4 h-4" />;
  };

  const label = () => {
    if (status === "uploading") return "Importing…";
    if (status === "done") return "Imported!";
    if (status === "error") return errorMsg ?? "Import failed";
    return "Import File";
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleClick}
        disabled={status === "uploading"}
        className={`gap-1.5 text-xs ${
          status === "error"
            ? "border-red-300 text-red-600 hover:bg-red-50"
            : status === "done"
            ? "border-green-300 text-green-600 hover:bg-green-50"
            : ""
        }`}
        title="Upload a .pdf or .docx file to populate the editor"
      >
        {icon()}
        {label()}
      </Button>
    </>
  );
}
