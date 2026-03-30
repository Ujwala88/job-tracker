"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { formatDate, formatSalary, STATUS_CONFIG, PRIORITY_CONFIG, ALL_STATUSES } from "@/lib/utils";
import { QuickStatusUpdate } from "./QuickStatusUpdate";
import { AddJobDialog } from "./AddJobDialog";
import { PriorityBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, ArrowUpDown, ExternalLink, ChevronRight } from "lucide-react";

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
  updatedAt: string;
  company: { id: string; name: string; industry: string | null };
  _count: { interviewRounds: number };
}

interface JobsTableProps {
  initialJobs: Job[];
}

type SortKey = "company" | "role" | "status" | "priority" | "appliedDate" | "updatedAt" | "salary";

export function JobsTable({ initialJobs }: JobsTableProps) {
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("updatedAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [addOpen, setAddOpen] = useState(false);

  const handleStatusUpdate = useCallback((jobId: string, newStatus: string) => {
    setJobs((prev) => prev.map((j) => j.id === jobId ? { ...j, status: newStatus } : j));
  }, []);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const filtered = useMemo(() => {
    let result = jobs;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (j) =>
          j.company.name.toLowerCase().includes(q) ||
          j.role.toLowerCase().includes(q) ||
          j.location?.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all") result = result.filter((j) => j.status === statusFilter);
    if (priorityFilter !== "all") result = result.filter((j) => j.priority === priorityFilter);

    result = [...result].sort((a, b) => {
      let av: string | number = "";
      let bv: string | number = "";

      if (sortKey === "company") { av = a.company.name; bv = b.company.name; }
      else if (sortKey === "role") { av = a.role; bv = b.role; }
      else if (sortKey === "status") { av = a.status; bv = b.status; }
      else if (sortKey === "priority") {
        const order = { urgent: 0, high: 1, medium: 2, low: 3 };
        av = order[a.priority as keyof typeof order] ?? 9;
        bv = order[b.priority as keyof typeof order] ?? 9;
      }
      else if (sortKey === "appliedDate") { av = a.appliedDate ?? ""; bv = b.appliedDate ?? ""; }
      else if (sortKey === "updatedAt") { av = a.updatedAt; bv = b.updatedAt; }
      else if (sortKey === "salary") { av = a.salaryMin ?? 0; bv = b.salaryMin ?? 0; }

      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [jobs, search, statusFilter, priorityFilter, sortKey, sortDir]);

  const SortHeader = ({ k, label }: { k: SortKey; label: string }) => (
    <button
      onClick={() => toggleSort(k)}
      className="flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground text-xs uppercase tracking-wide"
    >
      {label}
      <ArrowUpDown className="h-3 w-3" />
    </button>
  );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search company, role, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="All statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {ALL_STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_CONFIG[s].label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-32"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            {["urgent", "high", "medium", "low"].map((p) => (
              <SelectItem key={p} value={p}>{PRIORITY_CONFIG[p].label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={() => setAddOpen(true)} size="sm">
          <Plus className="h-4 w-4" /> Add Application
        </Button>
      </div>

      {/* Stats row */}
      <div className="text-xs text-muted-foreground">
        Showing {filtered.length} of {jobs.length} applications
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 border-b">
            <tr>
              <th className="px-4 py-3 text-left"><SortHeader k="company" label="Company" /></th>
              <th className="px-4 py-3 text-left"><SortHeader k="role" label="Role" /></th>
              <th className="px-4 py-3 text-left hidden md:table-cell"><SortHeader k="status" label="Status" /></th>
              <th className="px-4 py-3 text-left hidden lg:table-cell"><SortHeader k="priority" label="Priority" /></th>
              <th className="px-4 py-3 text-left hidden lg:table-cell text-xs uppercase tracking-wide font-medium text-muted-foreground">Salary</th>
              <th className="px-4 py-3 text-left hidden xl:table-cell"><SortHeader k="appliedDate" label="Applied" /></th>
              <th className="px-4 py-3 text-left hidden xl:table-cell"><SortHeader k="updatedAt" label="Updated" /></th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                  No applications found. Add your first one!
                </td>
              </tr>
            )}
            {filtered.map((job) => (
              <tr
                key={job.id}
                className="hover:bg-muted/30 transition-colors group cursor-pointer"
              >
                <td className="px-4 py-3">
                  <Link href={`/jobs/${job.id}`} className="block">
                    <div className="font-medium">{job.company.name}</div>
                    {job.location && (
                      <div className="text-xs text-muted-foreground mt-0.5">{job.location}</div>
                    )}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/jobs/${job.id}`} className="block">
                    <div className="font-medium text-sm">{job.role}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 flex gap-2">
                      {job.source && <span>{job.source}</span>}
                      {job._count.interviewRounds > 0 && (
                        <span className="text-violet-600">{job._count.interviewRounds} round{job._count.interviewRounds !== 1 ? "s" : ""}</span>
                      )}
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-3 hidden md:table-cell" onClick={(e) => e.stopPropagation()}>
                  <QuickStatusUpdate
                    jobId={job.id}
                    currentStatus={job.status}
                    onUpdate={(s) => handleStatusUpdate(job.id, s)}
                  />
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <Link href={`/jobs/${job.id}`} className="block">
                    <PriorityBadge priority={job.priority} />
                  </Link>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <Link href={`/jobs/${job.id}`} className="block text-sm text-muted-foreground">
                    {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                  </Link>
                </td>
                <td className="px-4 py-3 hidden xl:table-cell">
                  <Link href={`/jobs/${job.id}`} className="block text-sm text-muted-foreground">
                    {formatDate(job.appliedDate)}
                  </Link>
                </td>
                <td className="px-4 py-3 hidden xl:table-cell">
                  <Link href={`/jobs/${job.id}`} className="block text-sm text-muted-foreground">
                    {formatDate(job.updatedAt)}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {job.jobUrl && (
                      <a href={job.jobUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                      </a>
                    )}
                    <Link href={`/jobs/${job.id}`}>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddJobDialog open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
