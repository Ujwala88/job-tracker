"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QuickStatusUpdate } from "@/components/jobs/QuickStatusUpdate";
import { PriorityBadge } from "@/components/shared/StatusBadge";
import { formatDate, formatSalary, ALL_STATUSES, STATUS_CONFIG, PRIORITY_CONFIG } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { Edit2, Save, ExternalLink, MapPin, Briefcase, Calendar, DollarSign, Target } from "lucide-react";

interface Job {
  id: string;
  role: string;
  location: string | null;
  workType: string | null;
  source: string | null;
  appliedDate: string | null;
  status: string;
  priority: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  nextAction: string | null;
  nextActionDate: string | null;
  jobUrl: string | null;
  notes: string | null;
  company: { name: string };
}

interface OverviewTabProps {
  job: Job;
}

export function OverviewTab({ job: initialJob }: OverviewTabProps) {
  const [job, setJob] = useState(initialJob);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    role: job.role,
    location: job.location ?? "",
    workType: job.workType ?? "remote",
    source: job.source ?? "",
    appliedDate: job.appliedDate ? job.appliedDate.split("T")[0] : "",
    priority: job.priority,
    salaryMin: job.salaryMin?.toString() ?? "",
    salaryMax: job.salaryMax?.toString() ?? "",
    nextAction: job.nextAction ?? "",
    jobUrl: job.jobUrl ?? "",
    notes: job.notes ?? "",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          salaryMin: form.salaryMin ? Number(form.salaryMin) : null,
          salaryMax: form.salaryMax ? Number(form.salaryMax) : null,
          appliedDate: form.appliedDate || null,
        }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setJob({ ...job, ...updated });
      setEditing(false);
      toast({ title: "Saved" });
    } catch {
      toast({ title: "Save failed", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-start justify-between gap-4">
        <div>
          {editing ? (
            <Input value={form.role} onChange={(e) => set("role", e.target.value)} className="text-xl font-semibold h-auto py-1 text-lg w-80" />
          ) : (
            <h2 className="text-xl font-semibold">{job.role}</h2>
          )}
          <p className="text-muted-foreground mt-0.5">{job.company.name}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <QuickStatusUpdate
            jobId={job.id}
            currentStatus={job.status}
            onUpdate={(s) => setJob((j) => ({ ...j, status: s }))}
          />
          {editing ? (
            <Button size="sm" onClick={handleSave} disabled={saving}>
              <Save className="h-3.5 w-3.5" /> {saving ? "Saving..." : "Save"}
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
              <Edit2 className="h-3.5 w-3.5" /> Edit
            </Button>
          )}
        </div>
      </div>

      {/* Detail grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1.5">
              <MapPin className="h-3.5 w-3.5" /> Location
            </div>
            {editing ? (
              <Input value={form.location} onChange={(e) => set("location", e.target.value)} className="h-7 text-sm" placeholder="City / Remote" />
            ) : (
              <p className="text-sm font-medium">{job.location ?? "—"}</p>
            )}
            {!editing && job.workType && (
              <p className="text-xs text-muted-foreground capitalize mt-0.5">{job.workType}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1.5">
              <Target className="h-3.5 w-3.5" /> Priority
            </div>
            {editing ? (
              <Select value={form.priority} onValueChange={(v) => set("priority", v)}>
                <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["low", "medium", "high", "urgent"].map((p) => (
                    <SelectItem key={p} value={p}>{PRIORITY_CONFIG[p].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <PriorityBadge priority={job.priority} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1.5">
              <DollarSign className="h-3.5 w-3.5" /> Salary
            </div>
            {editing ? (
              <div className="flex gap-1.5">
                <Input value={form.salaryMin} onChange={(e) => set("salaryMin", e.target.value)} className="h-7 text-sm" placeholder="Min" type="number" />
                <Input value={form.salaryMax} onChange={(e) => set("salaryMax", e.target.value)} className="h-7 text-sm" placeholder="Max" type="number" />
              </div>
            ) : (
              <p className="text-sm font-medium">{formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1.5">
              <Calendar className="h-3.5 w-3.5" /> Applied
            </div>
            {editing ? (
              <Input type="date" value={form.appliedDate} onChange={(e) => set("appliedDate", e.target.value)} className="h-7 text-sm" />
            ) : (
              <p className="text-sm font-medium">{formatDate(job.appliedDate)}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1.5">
              <Briefcase className="h-3.5 w-3.5" /> Source
            </div>
            {editing ? (
              <Input value={form.source} onChange={(e) => set("source", e.target.value)} className="h-7 text-sm" placeholder="LinkedIn, Referral..." />
            ) : (
              <p className="text-sm font-medium">{job.source ?? "—"}</p>
            )}
          </CardContent>
        </Card>

        {(job.jobUrl || editing) && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1.5">
                <ExternalLink className="h-3.5 w-3.5" /> Job URL
              </div>
              {editing ? (
                <Input value={form.jobUrl} onChange={(e) => set("jobUrl", e.target.value)} className="h-7 text-sm" placeholder="https://..." />
              ) : (
                <a href={job.jobUrl!} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate block">
                  View posting
                </a>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Next action */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Next Action</CardTitle>
        </CardHeader>
        <CardContent>
          {editing ? (
            <Input value={form.nextAction} onChange={(e) => set("nextAction", e.target.value)} placeholder="What needs to happen next?" />
          ) : (
            <p className="text-sm">{job.nextAction ?? <span className="text-muted-foreground">No next action set</span>}</p>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Notes</CardTitle>
        </CardHeader>
        <CardContent>
          {editing ? (
            <textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={4}
              className="w-full text-sm rounded-md border border-input bg-transparent px-3 py-2 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
              placeholder="General notes about this application..."
            />
          ) : (
            <p className="text-sm whitespace-pre-wrap">{job.notes ?? <span className="text-muted-foreground">No notes yet</span>}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
