"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { safeParseJSON } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { Sparkles, CheckCircle, AlertTriangle, BookOpen, Mic, User, HelpCircle, RefreshCw } from "lucide-react";

interface MatchSummary {
  strongAlignments?: string | null;
  likelyGaps?: string | null;
  storiesToEmphasize?: string | null;
  recruiterPoints?: string | null;
  whyYouBasis?: string | null;
  aboutYourselfBasis?: string | null;
  prepQuestions?: string | null;
}

interface MatchSummaryTabProps {
  jobId: string;
  initialSummary: MatchSummary | null;
}

export function MatchSummaryTab({ jobId, initialSummary }: MatchSummaryTabProps) {
  const [summary, setSummary] = useState<MatchSummary | null>(initialSummary);
  const [loading, setLoading] = useState(false);

  async function regenerate() {
    setLoading(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}/match`, { method: "POST" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSummary(data);
      toast({ title: "Match summary updated" });
    } catch {
      toast({ title: "Failed to generate summary", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  if (!summary) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="font-medium mb-1">No match summary yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Add a job description and your CV Knowledge Base, then generate a structured match summary.
          </p>
        </div>
        <Button onClick={regenerate} disabled={loading}>
          {loading ? <><RefreshCw className="h-4 w-4 animate-spin" /> Generating...</> : <><Sparkles className="h-4 w-4" /> Generate Match Summary</>}
        </Button>
      </div>
    );
  }

  const alignments = safeParseJSON<string[]>(summary.strongAlignments, []);
  const gaps = safeParseJSON<string[]>(summary.likelyGaps, []);
  const stories = safeParseJSON<string[]>(summary.storiesToEmphasize, []);
  const questions = safeParseJSON<string[]>(summary.prepQuestions, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">AI-assisted match analysis (rules-based)</h3>
        <Button variant="outline" size="sm" onClick={regenerate} disabled={loading} className="gap-1.5 text-xs h-7">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strong alignments */}
        <Card className="border-emerald-200 bg-emerald-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
              <CheckCircle className="h-3.5 w-3.5" /> STRONG ALIGNMENTS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {alignments.map((a, i) => (
                <li key={i} className="text-sm flex gap-2">
                  <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Likely gaps */}
        <Card className="border-amber-200 bg-amber-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-amber-700 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" /> LIKELY GAPS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {gaps.map((g, i) => (
                <li key={i} className="text-sm flex gap-2">
                  <span className="text-amber-400 mt-0.5 shrink-0">△</span>
                  <span>{g}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Stories */}
      {stories.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" /> STORIES TO PREPARE
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {stories.map((s, i) => (
                <li key={i} className="text-sm flex gap-2">
                  <span className="text-primary mt-0.5 shrink-0 font-medium">{i + 1}.</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Recruiter points */}
        {summary.recruiterPoints && (
          <Card className="bg-sky-50/30 border-sky-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-sky-700 flex items-center gap-1.5">
                <Mic className="h-3.5 w-3.5" /> RECRUITER CALL FRAMING
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{summary.recruiterPoints}</p>
            </CardContent>
          </Card>
        )}

        {/* Why you */}
        {summary.whyYouBasis && (
          <Card className="bg-violet-50/30 border-violet-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-violet-700 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" /> "WHY YOU" BASIS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{summary.whyYouBasis}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tell me about yourself */}
      {summary.aboutYourselfBasis && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">"TELL ME ABOUT YOURSELF" BASIS</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{summary.aboutYourselfBasis}</p>
          </CardContent>
        </Card>
      )}

      {/* Prep questions */}
      {questions.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <HelpCircle className="h-3.5 w-3.5" /> LIKELY QUESTIONS TO PREPARE
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {questions.map((q, i) => (
                <li key={i} className="text-sm flex gap-2 pb-2 border-b last:border-0">
                  <span className="font-medium text-primary shrink-0">Q{i + 1}.</span>
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
