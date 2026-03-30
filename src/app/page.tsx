import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge, PriorityBadge } from "@/components/shared/StatusBadge";
import { formatDate, formatDateRelative, STATUS_CONFIG, PRIORITY_CONFIG } from "@/lib/utils";
import { Briefcase, TrendingUp, Calendar, Clock, Plus, ChevronRight, Target, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

async function getDashboardData() {
  const [jobs, statusCounts, upcomingInterviews, recentUpdates] = await Promise.all([
    prisma.jobApplication.count(),
    prisma.jobApplication.groupBy({
      by: ["status"],
      _count: { status: true },
      orderBy: { _count: { status: "desc" } },
    }),
    prisma.jobApplication.findMany({
      where: {
        status: { in: ["interview", "technical", "final_round", "phone_screen"] },
        nextActionDate: { gte: new Date() },
      },
      include: { company: { select: { name: true } } },
      orderBy: { nextActionDate: "asc" },
      take: 5,
    }),
    prisma.jobApplication.findMany({
      include: { company: { select: { name: true } } },
      orderBy: { updatedAt: "desc" },
      take: 8,
    }),
  ]);

  const priorityJobs = await prisma.jobApplication.findMany({
    where: {
      priority: { in: ["high", "urgent"] },
      status: { notIn: ["rejected", "withdrawn", "ghosted", "accepted"] },
    },
    include: { company: { select: { name: true } } },
    orderBy: [{ priority: "asc" }, { updatedAt: "desc" }],
    take: 5,
  });

  return { totalJobs: jobs, statusCounts, upcomingInterviews, recentUpdates, priorityJobs };
}

export default async function DashboardPage() {
  const { totalJobs, statusCounts, upcomingInterviews, recentUpdates, priorityJobs } = await getDashboardData();

  const activeCount = statusCounts
    .filter((s) => !["wishlist", "rejected", "withdrawn", "ghosted", "accepted"].includes(s.status))
    .reduce((sum, s) => sum + s._count.status, 0);

  const inInterviewCount = statusCounts
    .filter((s) => ["interview", "technical", "final_round", "phone_screen"].includes(s.status))
    .reduce((sum, s) => sum + s._count.status, 0);

  const offerCount = statusCounts.find((s) => s.status === "offer")?._count.status ?? 0;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <Link href="/jobs">
          <Button>
            <Plus className="h-4 w-4" /> Add Application
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <Briefcase className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div className="text-2xl font-bold">{totalJobs}</div>
            <div className="text-xs text-muted-foreground mt-1">Total applications</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
            </div>
            <div className="text-2xl font-bold">{activeCount}</div>
            <div className="text-xs text-muted-foreground mt-1">Active applications</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-8 w-8 rounded-lg bg-violet-100 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-violet-600" />
              </div>
            </div>
            <div className="text-2xl font-bold">{inInterviewCount}</div>
            <div className="text-xs text-muted-foreground mt-1">In interview process</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <Target className="h-4 w-4 text-amber-600" />
              </div>
            </div>
            <div className="text-2xl font-bold">{offerCount}</div>
            <div className="text-xs text-muted-foreground mt-1">Offers received</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status breakdown */}
        <Card className="col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">By Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {statusCounts.filter((s) => s._count.status > 0).map((s) => {
              const config = STATUS_CONFIG[s.status] ?? { label: s.status, color: "bg-gray-100 text-gray-600" };
              const pct = totalJobs > 0 ? Math.round((s._count.status / totalJobs) * 100) : 0;
              return (
                <div key={s.status} className="flex items-center gap-2">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium w-28 ${config.color}`}>
                    {config.label}
                  </span>
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary/40 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground w-4 text-right">{s._count.status}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Priority jobs */}
        <Card className="col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Priority Jobs</CardTitle>
              <Link href="/jobs?priority=high" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-0.5">
                View all <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {priorityJobs.length === 0 && (
              <p className="text-sm text-muted-foreground">No high-priority jobs.</p>
            )}
            {priorityJobs.map((job) => (
              <Link key={job.id} href={`/jobs/${job.id}`} className="flex items-start gap-2 group">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{job.company.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{job.role}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <StatusBadge status={job.status} />
                  <PriorityBadge priority={job.priority} />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming actions */}
        <Card className="col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
              <Clock className="h-4 w-4" /> Upcoming Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingInterviews.length === 0 && (
              <p className="text-sm text-muted-foreground">No upcoming actions with dates.</p>
            )}
            {upcomingInterviews.map((job) => (
              <Link key={job.id} href={`/jobs/${job.id}`} className="flex items-start gap-2 group">
                <div className="h-2 w-2 rounded-full bg-violet-400 mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{job.company.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{job.nextAction ?? "Interview"}</p>
                </div>
                {job.nextActionDate && (
                  <span className="text-xs text-muted-foreground shrink-0">{formatDate(job.nextActionDate)}</span>
                )}
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent activity */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
            <Link href="/jobs" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-0.5">
              All applications <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {recentUpdates.map((job) => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="flex items-center gap-4 rounded-lg px-3 py-2.5 hover:bg-muted/50 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{job.company.name}</span>
                    <span className="text-muted-foreground text-sm hidden md:inline">·</span>
                    <span className="text-sm text-muted-foreground truncate hidden md:inline">{job.role}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge status={job.status} />
                  <span className="text-xs text-muted-foreground hidden lg:inline">{formatDateRelative(job.updatedAt)}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
