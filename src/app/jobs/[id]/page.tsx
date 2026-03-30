"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { OverviewTab } from "@/components/job-detail/OverviewTab";
import { ContentTab } from "@/components/job-detail/ContentTab";
import { JDInsightsPanel } from "@/components/job-detail/JDInsightsPanel";
import { TimelineTab } from "@/components/job-detail/TimelineTab";
import { InterviewRoundsTab } from "@/components/job-detail/InterviewRoundsTab";
import { MatchSummaryTab } from "@/components/job-detail/MatchSummaryTab";
import { CompanyNotesTab } from "@/components/job-detail/CompanyNotesTab";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { toast } from "@/components/ui/use-toast";
import { ChevronLeft, Loader2 } from "lucide-react";

interface JobDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = use(params);
  const [job, setJob] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/jobs/${id}`)
      .then((r) => r.json())
      .then((data) => { setJob(data); setLoading(false); })
      .catch(() => { setLoading(false); });
  }, [id]);

  async function handleParseJD() {
    const content = job?.content as Record<string, string> | null;
    if (!content?.rawJD) return;
    try {
      const res = await fetch(`/api/jobs/${id}/insights`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawJD: content.rawJD }),
      });
      if (!res.ok) throw new Error();
      const insights = await res.json();
      setJob((j) => ({ ...j!, insights }));
      toast({ title: "JD analyzed", description: "Insights extracted from job description." });
    } catch {
      toast({ title: "Parse failed", variant: "destructive" });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Application not found.</p>
        <Link href="/jobs"><Button variant="outline" className="mt-4">Back to jobs</Button></Link>
      </div>
    );
  }

  const company = job.company as Record<string, unknown>;
  const content = (job.content as Record<string, string | null>) ?? {};
  const statusHistory = (job.statusHistory as Record<string, unknown>[]) ?? [];
  const interviewRounds = (job.interviewRounds as Record<string, unknown>[]) ?? [];
  const insights = job.insights as Record<string, string | null> | null;
  const matchSummary = job.matchSummary as Record<string, string | null> | null;
  const companyInsights = (company?.insights as Record<string, string | null>[]) ?? [];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Back nav */}
      <div className="flex items-center gap-3">
        <Link href="/jobs">
          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground -ml-2">
            <ChevronLeft className="h-4 w-4" /> Applications
          </Button>
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm font-medium">{company.name as string}</span>
      </div>

      {/* Title */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{job.role as string}</h1>
          <p className="text-muted-foreground mt-0.5">{company.name as string}</p>
        </div>
        <StatusBadge status={job.status as string} />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <div className="overflow-x-auto -mx-2 px-2">
          <TabsList className="h-auto flex-wrap gap-1 bg-transparent p-0 border-b rounded-none w-full justify-start">
            {[
              { value: "overview", label: "Overview" },
              { value: "jd", label: "Job Description" },
              { value: "insights", label: "JD Insights" },
              { value: "cover", label: "Cover Letter" },
              { value: "company", label: "Company Notes" },
              { value: "prep", label: "Interview Prep" },
              { value: "rounds", label: "Rounds" },
              { value: "match", label: "Match Summary" },
              { value: "timeline", label: "Timeline" },
            ].map(({ value, label }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-sm"
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="overview">
          <OverviewTab job={{
            id: id,
            role: job.role as string,
            location: job.location as string | null,
            workType: job.workType as string | null,
            source: job.source as string | null,
            appliedDate: job.appliedDate as string | null,
            status: job.status as string,
            priority: job.priority as string,
            salaryMin: job.salaryMin as number | null,
            salaryMax: job.salaryMax as number | null,
            salaryCurrency: job.salaryCurrency as string | null,
            nextAction: job.nextAction as string | null,
            nextActionDate: job.nextActionDate as string | null,
            jobUrl: job.jobUrl as string | null,
            notes: job.notes as string | null,
            company: { name: company.name as string },
          }} />
        </TabsContent>

        <TabsContent value="jd">
          <ContentTab
            jobId={id}
            field="rawJD"
            label="Job Description"
            placeholder="Paste the full job description here. Changes save automatically."
            initialContent={content}
            onParseJD={handleParseJD}
          />
        </TabsContent>

        <TabsContent value="insights">
          <div className="space-y-4">
            {!insights && content.rawJD && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-center justify-between">
                <p className="text-sm text-amber-800">JD is ready to analyze.</p>
                <Button size="sm" onClick={handleParseJD} className="gap-1.5">
                  Extract Insights
                </Button>
              </div>
            )}
            <JDInsightsPanel insights={insights} />
          </div>
        </TabsContent>

        <TabsContent value="cover">
          <ContentTab
            jobId={id}
            field="coverLetter"
            label="Cover Letter"
            placeholder="Paste or write your cover letter here..."
            initialContent={content}
          />
        </TabsContent>

        <TabsContent value="company">
          <CompanyNotesTab
            companyId={company.id as string}
            initialInsights={companyInsights[0] ?? null}
          />
        </TabsContent>

        <TabsContent value="prep">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ContentTab
              jobId={id}
              field="whyCompany"
              label="Why this company"
              placeholder="Why do you want to work here specifically? What resonates?"
              initialContent={content}
              rows={10}
            />
            <ContentTab
              jobId={id}
              field="whyRole"
              label="Why this role"
              placeholder="Why this specific role? What makes it the right next step?"
              initialContent={content}
              rows={10}
            />
            <div className="col-span-1 md:col-span-2">
              <ContentTab
                jobId={id}
                field="recruiterNotes"
                label="Recruiter Notes"
                placeholder="Notes from recruiter calls, what they said, timeline, process details..."
                initialContent={content}
                rows={8}
              />
            </div>
            <div className="col-span-1 md:col-span-2">
              <ContentTab
                jobId={id}
                field="prepNotes"
                label="Prep Notes"
                placeholder="Stories to prepare, key themes to hit, things to research, questions to ask..."
                initialContent={content}
                rows={10}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="rounds">
          <InterviewRoundsTab
            jobId={id}
            initialRounds={interviewRounds as Parameters<typeof InterviewRoundsTab>[0]["initialRounds"]}
          />
        </TabsContent>

        <TabsContent value="match">
          <MatchSummaryTab jobId={id} initialSummary={matchSummary} />
        </TabsContent>

        <TabsContent value="timeline">
          <TimelineTab
            jobId={id}
            currentStatus={job.status as string}
            history={statusHistory as Parameters<typeof TimelineTab>[0]["history"]}
            onUpdate={(s) => setJob((j) => ({ ...j!, status: s }))}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
