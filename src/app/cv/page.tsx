"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AutoSaveTextarea } from "@/components/shared/AutoSaveTextarea";
import { toast } from "@/components/ui/use-toast";
import { safeParseJSON } from "@/lib/utils";
import { Sparkles, User, Briefcase, CheckCircle, Globe, Plus, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CVProfile {
  id: string;
  rawText: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  summary: string | null;
  skills: string | null;
  domains: string | null;
  experiences: CVExperience[];
}

interface CVExperience {
  id: string;
  company: string;
  role: string;
  startDate: string | null;
  endDate: string | null;
  responsibilities: string | null;
  achievements: string | null;
  tools: string | null;
  domains: string | null;
  leadership: string | null;
  impact: string | null;
}

export default function CVPage() {
  const [cv, setCV] = useState<CVProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [rawText, setRawText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [view, setView] = useState<"paste" | "profile">("paste");

  useEffect(() => {
    fetch("/api/cv")
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          setCV(data);
          setRawText(data.rawText ?? "");
          if (data.name) setView("profile");
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleParse() {
    if (!rawText.trim()) return;
    setParsing(true);
    try {
      const res = await fetch("/api/cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCV(data);
      setView("profile");
      toast({ title: "CV parsed", description: "Profile and experience extracted. Review and edit below." });
    } catch {
      toast({ title: "Parse failed", variant: "destructive" });
    } finally {
      setParsing(false);
    }
  }

  async function updateCV(updates: Partial<CVProfile>) {
    const res = await fetch("/api/cv", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...cv, ...updates }),
    });
    if (!res.ok) throw new Error("Save failed");
    const data = await res.json();
    setCV(data);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const skills = safeParseJSON<string[]>(cv?.skills, []);
  const domains = safeParseJSON<string[]>(cv?.domains, []);

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">CV Knowledge Base</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Your reusable profile. Used to generate match summaries for each job.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant={view === "paste" ? "default" : "outline"} size="sm" onClick={() => setView("paste")}>
            Paste CV
          </Button>
          {cv && (
            <Button variant={view === "profile" ? "default" : "outline"} size="sm" onClick={() => setView("profile")}>
              View Profile
            </Button>
          )}
        </div>
      </div>

      {view === "paste" && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Paste Your CV / Resume</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Copy and paste the text from your CV. We&apos;ll extract your experience, skills, domains, and impact statements.
                These become your reusable knowledge base for generating match summaries.
              </p>
              <AutoSaveTextarea
                value={rawText}
                onChange={setRawText}
                onSave={async (v) => {
                  if (cv) await updateCV({ rawText: v });
                }}
                placeholder="Paste your CV text here...

Name
email@example.com | +1 234 567 890

SUMMARY
Senior Product Designer with 7 years of experience...

EXPERIENCE

Senior Product Designer | Company Name | 2021–Present
• Led redesign of core checkout flow, increasing conversion by 12%
• Managed and mentored 2 junior designers..."
                rows={20}
              />
              <Button onClick={handleParse} disabled={parsing || rawText.length < 100}>
                {parsing ? <><Loader2 className="h-4 w-4 animate-spin" /> Parsing...</> : <><Sparkles className="h-4 w-4" /> Parse & Extract Profile</>}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {view === "profile" && cv && (
        <div className="space-y-6">
          {/* Profile header */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <h2 className="text-lg font-semibold">{cv.name ?? "Your Name"}</h2>
                  {cv.email && <p className="text-sm text-muted-foreground">{cv.email}</p>}
                  {cv.phone && <p className="text-sm text-muted-foreground">{cv.phone}</p>}
                </div>
              </div>
              {cv.summary && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">{cv.summary}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Skills */}
          {skills.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-emerald-500" /> Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {skills.map((s, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Domains */}
          {domains.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-1.5">
                  <Globe className="h-4 w-4 text-blue-500" /> Domain Experience
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {domains.map((d, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{d}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Experiences */}
          {cv.experiences.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium flex items-center gap-1.5 text-muted-foreground">
                <Briefcase className="h-4 w-4" /> Work Experience
              </h3>
              {cv.experiences.map((exp) => (
                <Card key={exp.id}>
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{exp.role}</p>
                        <p className="text-sm text-muted-foreground">
                          {exp.company}
                          {(exp.startDate || exp.endDate) && (
                            <span> · {exp.startDate}{exp.endDate ? ` – ${exp.endDate}` : ""}</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {exp.responsibilities && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-1">RESPONSIBILITIES</p>
                        <p className="text-sm whitespace-pre-wrap">{exp.responsibilities}</p>
                      </div>
                    )}

                    {exp.achievements && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-1">ACHIEVEMENTS</p>
                        <p className="text-sm whitespace-pre-wrap text-emerald-700">{exp.achievements}</p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3">
                      {exp.impact && (
                        <div className="flex-1 min-w-40">
                          <p className="text-xs font-semibold text-muted-foreground mb-1">IMPACT</p>
                          <p className="text-sm">{exp.impact}</p>
                        </div>
                      )}
                      {exp.leadership && (
                        <div className="flex-1 min-w-40">
                          <p className="text-xs font-semibold text-muted-foreground mb-1">LEADERSHIP</p>
                          <p className="text-sm">{exp.leadership}</p>
                        </div>
                      )}
                    </div>

                    {exp.tools && (
                      <div className="flex flex-wrap gap-1.5">
                        {exp.tools.split(",").map((t, i) => (
                          <span key={i} className="text-xs bg-muted px-2 py-0.5 rounded">{t.trim()}</span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {cv.experiences.length === 0 && (
            <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground text-sm">
              <Briefcase className="h-8 w-8 mx-auto mb-3 opacity-30" />
              <p>No experience entries extracted yet.</p>
              <p className="text-xs mt-1">Your CV format may need clearer section headers. Try the paste view and re-parse.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
