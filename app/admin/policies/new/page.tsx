"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePolicyMutations } from "@/hooks/queries";
import { POLICY_TYPES, POLICY_TYPE_LABELS, type PolicyType } from "@/lib/api/policies.api";
import { RichTextEditor } from "@/components/RichTextEditor";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, Save, Loader2 } from "lucide-react";

export default function NewPolicyPage() {
  const router = useRouter();
  const { createPolicy } = usePolicyMutations();

  const [policyType, setPolicyType] = useState<PolicyType | "">("");
  const [title, setTitle] = useState("");
  const [isRequired, setIsRequired] = useState(true);
  const [contentHtml, setContentHtml] = useState("");
  const [contentJson, setContentJson] = useState<object>({
    type: "doc",
    content: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState<string | null>(null);

  const extractText = (html: string) =>
    html
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!policyType) e.policyType = "Policy type is required";
    if (!title.trim()) e.title = "Title is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaveError(null);
    try {
      await createPolicy.mutateAsync({
        policyType,
        title: title.trim(),
        contentHtml,
        contentJson,
        contentText: extractText(contentHtml),
        isRequired,
      });
      router.push("/admin/policies");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Save failed");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/admin/policies")}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          New Policy
        </h1>
      </div>

      {/* Info card */}
      <Card className="p-6">
        <h2 className="text-base font-semibold text-foreground mb-4">
          Policy Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Policy Type *</label>
            <Select value={policyType} onValueChange={(v) => { setPolicyType(v as PolicyType); setErrors({ ...errors, policyType: "" }); }}>
              <SelectTrigger className={errors.policyType ? "border-red-500" : ""}>
                <SelectValue placeholder="Select policy type" />
              </SelectTrigger>
              <SelectContent>
                {POLICY_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{POLICY_TYPE_LABELS[t]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.policyType && <p className="text-xs text-red-600 mt-1">{errors.policyType}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Title *</label>
            <Input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setErrors({ ...errors, title: "" });
              }}
              placeholder='e.g., "Terms and Conditions" or "Privacy Policy"'
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && (
              <p className="text-xs text-red-600 mt-1">{errors.title}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 mt-4 rounded-lg border border-border px-3 py-2.5">
          <div className="flex-1">
            <p className="text-sm font-medium">Required Policy</p>
            <p className="text-xs text-muted-foreground">
              Employees must accept this policy before accessing the platform
            </p>
          </div>
          <Switch checked={isRequired} onCheckedChange={setIsRequired} />
        </div>
      </Card>

      {/* Editor card */}
      <Card className="p-4 2xl:p-6">
        <h2 className="text-base font-semibold text-foreground mb-3">
          Policy Content
        </h2>
        <RichTextEditor
          value={contentHtml}
          onChange={setContentHtml}
          onChangeJson={setContentJson}
          placeholder="Write your policy content here..."
        />
      </Card>

      {/* Error banner */}
      {saveError && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {saveError}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={handleSave}
          disabled={createPolicy.isPending}
          className="gap-2"
        >
          {createPolicy.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {createPolicy.isPending ? "Saving…" : "Create Policy"}
        </Button>
        <Button
          onClick={() => router.push("/admin/policies")}
          variant="outline"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
