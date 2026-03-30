import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; roundId: string }> }) {
  const { roundId } = await params;
  const body = await req.json();

  const round = await prisma.interviewRound.update({
    where: { id: roundId },
    data: {
      roundType: body.roundType,
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
      interviewer: body.interviewer,
      notes: body.notes,
      feedback: body.feedback,
      outcome: body.outcome,
    },
    include: { questions: true },
  });

  return NextResponse.json(round);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; roundId: string }> }) {
  const { roundId } = await params;
  await prisma.interviewRound.delete({ where: { id: roundId } });
  return NextResponse.json({ success: true });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string; roundId: string }> }) {
  const { roundId } = await params;
  const body = await req.json();

  // Add a question to the round
  const question = await prisma.interviewQuestion.create({
    data: {
      roundId,
      question: body.question,
      myAnswer: body.myAnswer,
      improvements: body.improvements,
      category: body.category,
    },
  });

  return NextResponse.json(question, { status: 201 });
}
