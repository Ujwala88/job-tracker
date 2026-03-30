"use client";

import { useState } from "react";
import { AutoSaveTextarea } from "@/components/shared/AutoSaveTextarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Sparkles } from "lucide-react";

interface Content {
  rawJD?: string | null;
  coverLetter?: string | null;
  recruiterNotes?: string | null;
  prepNotes?: string | null;
  whyCompany?: string | null;
  whyRole?: string | null;
}

interface ContentTabProps {
  jobId: string;
  field: keyof Content;
  label: string;
  placeholder: string;
  initialContent: Content;
  onParseJD?: () => Promise<void>;
  rows?: number;
}

export function ContentTab({ jobId, field, label, placeholder, initialContent, onParseJD, rows = 16 }: ContentTabProps) {
  const [value, setValue] = useState<string>(initialContent[field] ?? "");

  async function handleSave(val: string) {
    const res = await fetch(`/api/jobs/${jobId}/content`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: val }),
    });
    if (!res.ok) throw new Error("Save failed");
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{label}</h3>
        {field === "rawJD" && onParseJD && value.length > 100 && (
          <Button size="sm" variant="outline" onClick={onParseJD} className="gap-1.5 text-xs h-7">
            <Sparkles className="h-3.5 w-3.5" /> Extract Insights
          </Button>
        )}
      </div>
      <AutoSaveTextarea
        value={value}
        onChange={setValue}
        onSave={handleSave}
        placeholder={placeholder}
        rows={rows}
        className="min-h-[300px]"
      />
      <p className="text-xs text-muted-foreground">
        {value.length > 0 ? `${value.length} characters` : "Start typing or paste content here. Changes save automatically."}
      </p>
    </div>
  );
}
