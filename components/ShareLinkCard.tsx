"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Copy, Check, ExternalLink, Globe } from "lucide-react";

interface ShareLinkCardProps {
  url: string;
  title?: string;
  label?: string;
  description?: string;
}

export function ShareLinkCard({
  url,
  title,
  label = "Share to Client",
  description,
}: ShareLinkCardProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  const share = async () => {
    // Web Share API on supported (mostly mobile) browsers; fall back to copy.
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title: title ?? "Survey", url });
        return;
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return;
      }
    }
    void copy();
  };

  return (
    <div className="rounded-lg border border-border bg-secondary/30 p-4 space-y-3">
      <div className="flex items-start gap-2">
        <Globe className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{label}</p>
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>
      </div>

      <code className="block text-xs bg-background border border-border rounded px-2.5 py-2 truncate">{url}</code>

      <div className="flex items-center gap-2">
        <Button size="sm" className="gap-1.5" onClick={share}>
          <Share2 className="w-3.5 h-3.5" /> {label}
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={copy}>
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied" : "Copy link"}
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => window.open(url, "_blank")}>
          <ExternalLink className="w-3.5 h-3.5" /> Open
        </Button>
      </div>
    </div>
  );
}
