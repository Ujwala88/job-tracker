"use client";

import { safeParseJSON } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Code, Star, AlertCircle, Users, Target } from "lucide-react";

interface JobInsight {
  responsibilities?: string | null;
  requiredSkills?: string | null;
  preferredSkills?: string | null;
  tools?: string | null;
  keywords?: string | null;
  leadershipSignals?: string | null;
  stakeholderExpected?: string | null;
  teamClues?: string | null;
  interviewFocus?: string | null;
  accessibilityMentions?: string | null;
  researchMentions?: string | null;
  strategyMentions?: string | null;
  designSystemsMentions?: string | null;
  peopleManagement?: string | null;
}

export function JDInsightsPanel({ insights }: { insights: JobInsight | null }) {
  if (!insights) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground text-sm">
        Paste a job description and click <strong>Extract Insights</strong> to see analysis here.
      </div>
    );
  }

  const responsibilities = safeParseJSON<string[]>(insights.responsibilities, []);
  const required = safeParseJSON<string[]>(insights.requiredSkills, []);
  const preferred = safeParseJSON<string[]>(insights.preferredSkills, []);
  const tools = safeParseJSON<string[]>(insights.tools, []);
  const keywords = safeParseJSON<string[]>(insights.keywords, []);

  const signals = [
    { label: "Accessibility", value: insights.accessibilityMentions, color: "text-blue-600" },
    { label: "Research", value: insights.researchMentions, color: "text-violet-600" },
    { label: "Strategy", value: insights.strategyMentions, color: "text-amber-600" },
    { label: "Design Systems", value: insights.designSystemsMentions, color: "text-emerald-600" },
    { label: "People Management", value: insights.peopleManagement, color: "text-rose-600" },
  ].filter((s) => s.value && !s.value.includes("Not mentioned") && !s.value.includes("No "));

  return (
    <div className="space-y-4">
      {/* Interview focus */}
      {insights.interviewFocus && (
        <Card className="border-violet-200 bg-violet-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-violet-700 text-xs font-semibold mb-2">
              <Target className="h-3.5 w-3.5" /> LIKELY INTERVIEW FOCUS
            </div>
            <p className="text-sm text-violet-800">{insights.interviewFocus}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Responsibilities */}
        {responsibilities.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5" /> RESPONSIBILITIES
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-1">
                {responsibilities.slice(0, 8).map((r, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex gap-2">
                    <span className="text-primary mt-0.5 shrink-0">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Required + Preferred skills */}
        <div className="space-y-4">
          {required.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Star className="h-3.5 w-3.5 text-amber-500" /> REQUIRED SKILLS
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-1.5">
                  {required.slice(0, 10).map((s, i) => (
                    <Badge key={i} variant="secondary" className="text-xs font-normal">{s}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {preferred.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 text-sky-500" /> PREFERRED SKILLS
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-1.5">
                  {preferred.slice(0, 8).map((s, i) => (
                    <Badge key={i} variant="outline" className="text-xs font-normal">{s}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Tools + Keywords */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tools.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Code className="h-3.5 w-3.5" /> TOOLS MENTIONED
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-1.5">
                {tools.map((t, i) => (
                  <Badge key={i} className="text-xs font-normal bg-slate-100 text-slate-700 hover:bg-slate-100">{t}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {keywords.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground">KEY THEMES</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-1.5">
                {keywords.map((k, i) => (
                  <span key={i} className="inline-flex items-center rounded px-2 py-0.5 text-xs bg-primary/5 text-primary font-medium">{k}</span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Signals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {insights.leadershipSignals && !insights.leadershipSignals.includes("No strong") && (
          <Card className="bg-amber-50/50">
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-amber-700 mb-1">LEADERSHIP SIGNALS</p>
              <p className="text-sm text-amber-800">{insights.leadershipSignals}</p>
            </CardContent>
          </Card>
        )}
        {insights.stakeholderExpected && insights.stakeholderExpected !== "Not explicitly stated" && (
          <Card className="bg-sky-50/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-700 mb-1">
                <Users className="h-3.5 w-3.5" /> STAKEHOLDERS EXPECTED
              </div>
              <p className="text-sm text-sky-800">{insights.stakeholderExpected}</p>
            </CardContent>
          </Card>
        )}
        {insights.teamClues && insights.teamClues !== "Team size not mentioned" && (
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-muted-foreground mb-1">TEAM CLUES</p>
              <p className="text-sm">{insights.teamClues}</p>
            </CardContent>
          </Card>
        )}
        {signals.map((s, i) => (
          <Card key={i} className="bg-muted/30">
            <CardContent className="p-4">
              <p className={`text-xs font-semibold mb-1 ${s.color}`}>{s.label.toUpperCase()}</p>
              <p className="text-sm">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
