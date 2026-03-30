import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const rounds = await prisma.interviewRound.findMany({
    where: { jobId: id },
    include: { questions: { orderBy: { createdAt: "asc" } } },
    orderBy: { roundNumber: "asc" },
  });

  return NextResponse.json(rounds);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const lastRound = await prisma.interviewRound.findFirst({
    where: { jobId: id },
    orderBy: { roundNumber: "desc" },
  });

  const round = await prisma.interviewRound.create({
    data: {
      jobId: id,
      roundNumber: (lastRound?.roundNumber ?? 0) + 1,
      roundType: body.roundType,
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
      interviewer: body.interviewer,
      notes: body.notes,
      feedback: body.feedback,
      outcome: body.outcome,
    },
    include: { questions: true },
  });

  return NextResponse.json(round, { status: 201 });
}
