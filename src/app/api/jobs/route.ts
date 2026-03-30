import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");
  const search = searchParams.get("search");

  const where: Record<string, unknown> = {};
  if (status && status !== "all") where.status = status;
  if (priority && priority !== "all") where.priority = priority;
  if (search) {
    where.OR = [
      { role: { contains: search } },
      { company: { name: { contains: search } } },
      { location: { contains: search } },
    ];
  }

  const jobs = await prisma.jobApplication.findMany({
    where,
    include: {
      company: { select: { id: true, name: true, industry: true } },
      _count: { select: { interviewRounds: true, statusHistory: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(jobs);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const { companyName, companyId, ...jobData } = body;

  let resolvedCompanyId = companyId;

  if (!resolvedCompanyId && companyName) {
    // Find or create company
    const existing = await prisma.company.findFirst({
      where: { name: { equals: companyName } },
    });
    if (existing) {
      resolvedCompanyId = existing.id;
    } else {
      const created = await prisma.company.create({
        data: { name: companyName },
      });
      resolvedCompanyId = created.id;
    }
  }

  if (!resolvedCompanyId) {
    return NextResponse.json({ error: "Company is required" }, { status: 400 });
  }

  const job = await prisma.jobApplication.create({
    data: {
      companyId: resolvedCompanyId,
      role: jobData.role,
      location: jobData.location,
      workType: jobData.workType,
      source: jobData.source,
      appliedDate: jobData.appliedDate ? new Date(jobData.appliedDate) : null,
      status: jobData.status ?? "wishlist",
      priority: jobData.priority ?? "medium",
      salaryMin: jobData.salaryMin ? Number(jobData.salaryMin) : null,
      salaryMax: jobData.salaryMax ? Number(jobData.salaryMax) : null,
      salaryCurrency: jobData.salaryCurrency ?? "USD",
      nextAction: jobData.nextAction,
      jobUrl: jobData.jobUrl,
      notes: jobData.notes,
    },
    include: {
      company: true,
    },
  });

  // Create initial status history
  await prisma.statusUpdate.create({
    data: {
      jobId: job.id,
      fromStatus: null,
      toStatus: job.status,
      note: "Application created",
    },
  });

  // Create empty content
  await prisma.jobContent.create({
    data: { jobId: job.id },
  });

  return NextResponse.json(job, { status: 201 });
}
