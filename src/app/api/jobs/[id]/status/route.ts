import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { toStatus, note } = await req.json();

  const job = await prisma.jobApplication.findUnique({ where: { id } });
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [updated] = await prisma.$transaction([
    prisma.jobApplication.update({
      where: { id },
      data: { status: toStatus },
      include: { company: true },
    }),
    prisma.statusUpdate.create({
      data: {
        jobId: id,
        fromStatus: job.status,
        toStatus,
        note: note ?? null,
      },
    }),
  ]);

  return NextResponse.json(updated);
}
