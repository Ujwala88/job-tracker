import { prisma } from "@/lib/prisma";
import { JobsTable } from "@/components/jobs/JobsTable";

export const dynamic = "force-dynamic";

export default async function JobsPage() {
  const jobs = await prisma.jobApplication.findMany({
    include: {
      company: { select: { id: true, name: true, industry: true } },
      _count: { select: { interviewRounds: true, statusHistory: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const serialized = jobs.map((j) => ({
    ...j,
    appliedDate: j.appliedDate?.toISOString() ?? null,
    nextActionDate: j.nextActionDate?.toISOString() ?? null,
    createdAt: j.createdAt.toISOString(),
    updatedAt: j.updatedAt.toISOString(),
  }));

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Applications</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          {jobs.length} total · Click any row to open details
        </p>
      </div>
      <JobsTable initialJobs={serialized} />
    </div>
  );
}
