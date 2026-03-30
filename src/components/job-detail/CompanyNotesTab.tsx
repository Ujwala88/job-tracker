"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AutoSaveTextarea } from "@/components/shared/AutoSaveTextarea";
import { toast } from "@/components/ui/use-toast";
import { Sparkles } from "lucide-react";

interface CompanyInsight {
  mission?: string | null;
  values?: string | null;
  culture?: string | null;
  positioning?: string | null;
  priorities?: string | null;
  language?: string | null;
  rawText?: string | null;
}

interface CompanyNotesTabProps {
  companyId: string;
  initialInsights: CompanyInsight | null;
}

export function CompanyNotesTab({ companyId, initialInsights }: CompanyNotesTabProps) {
  const [insights, setInsights] = useState<CompanyInsight>(initialInsights ?? {});
  const [rawText, setRawText] = useState(initialInsights?.rawText ?? "");
  const [parsing, setParsing] = useState(false);
  const [view, setView] = useState<"paste" | "structured">(initialInsights?.mission ? "structured" : "paste");

  async function saveInsights(updates: Partial<CompanyInsight>) {
    const res = await fetch(`/api/companies/${companyId}/insights`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Save failed");
    const updated = await res.json();
    setInsights(updated);
  }

  async function handleParse() {
    setParsing(true);
    try {
      const res = await fetch(`/api/companies/${companyId}/insights`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setInsights(updated);
      setView("structured");
      toast({ title: "Company info parsed", description: "Review and edit each section below." });
    } catch {
      toast({ title: "Parse failed", variant: "destructive" });
    } finally {
      setParsing(false);
    }
  }

  const fields: Array<{ key: keyof CompanyInsight; label: string; placeholder: string; rows?: number }> = [
    { key: "mission", label: "Mission", placeholder: "What is their stated mission?", rows: 3 },
    { key: "values", label: "Values", placeholder: "What values do they talk about?", rows: 3 },
    { key: "culture", label: "Culture", placeholder: "How do they describe their culture?", rows: 4 },
    { key: "positioning", label: "Product positioning", placeholder: "How do they describe their product?", rows: 4 },
    { key: "priorities", label: "Current priorities / roadmap", placeholder: "What are they focused on right now?", rows: 4 },
    { key: "language", label: "Language / phrases to use", placeholder: "What phrases should you use to sound like them?", rows: 3 },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant={view === "paste" ? "default" : "outline"} size="sm" onClick={() => setView("paste")}>Paste Raw Text</Button>
        <Button variant={view === "structured" ? "default" : "outline"} size="sm" onClick={() => setView("structured")}>Structured Notes</Button>
      </div>

      {view === "paste" && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Paste anything from the company website — About page, Values page, Careers page, press release. Then click Parse to extract structured notes.
          </p>
          <AutoSaveTextarea
            value={rawText}
            onChange={setRawText}
            onSave={async (v) => { await saveInsights({ rawText: v }); }}
            placeholder="Paste company website text here..."
            rows={14}
          />
          {rawText.length > 100 && (
            <Button onClick={handleParse} disabled={parsing} size="sm">
              <Sparkles className="h-4 w-4" /> {parsing ? "Parsing..." : "Parse & Structure"}
            </Button>
          )}
        </div>
      )}

      {view === "structured" && (
        <div className="space-y-4">
          {fields.map(({ key, label, placeholder, rows }) => (
            <Card key={key}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{label}</CardTitle>
              </CardHeader>
              <CardContent>
                <AutoSaveTextarea
                  value={insights[key] ?? ""}
                  onChange={(v) => setInsights((i) => ({ ...i, [key]: v }))}
                  onSave={async (v) => { await saveInsights({ [key]: v }); }}
                  placeholder={placeholder}
                  rows={rows ?? 4}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
