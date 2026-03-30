import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const job = await prisma.jobApplication.findUnique({
    where: { id },
    include: {
      company: { include: { insights: true } },
      content: true,
      statusHistory: { orderBy: { createdAt: "asc" } },
      interviewRounds: {
        include: { questions: { orderBy: { createdAt: "asc" } } },
        orderBy: { roundNumber: "asc" },
      },
      contacts: true,
      insights: true,
      matchSummary: true,
    },
  });

  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(job);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const job = await prisma.jobApplication.update({
    where: { id },
    data: {
      role: body.role,
      location: body.location,
      workType: body.workType,
      source: body.source,
      appliedDate: body.appliedDate ? new Date(body.appliedDate) : undefined,
      priority: body.priority,
      salaryMin: body.salaryMin !== undefined ? Number(body.salaryMin) || null : undefined,
      salaryMax: body.salaryMax !== undefined ? Number(body.salaryMax) || null : undefined,
      salaryCurrency: body.salaryCurrency,
      nextAction: body.nextAction,
      nextActionDate: body.nextActionDate ? new Date(body.nextActionDate) : undefined,
      jobUrl: body.jobUrl,
      notes: body.notes,
    },
    include: { company: true },
  });

  return NextResponse.json(job);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.jobApplication.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
