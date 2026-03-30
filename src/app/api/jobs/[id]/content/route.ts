import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const content = await prisma.jobContent.findUnique({ where: { jobId: id } });
  if (!content) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(content);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const content = await prisma.jobContent.upsert({
    where: { jobId: id },
    create: {
      jobId: id,
      rawJD: body.rawJD,
      coverLetter: body.coverLetter,
      recruiterNotes: body.recruiterNotes,
      prepNotes: body.prepNotes,
      whyCompany: body.whyCompany,
      whyRole: body.whyRole,
    },
    update: {
      rawJD: body.rawJD,
      coverLetter: body.coverLetter,
      recruiterNotes: body.recruiterNotes,
      prepNotes: body.prepNotes,
      whyCompany: body.whyCompany,
      whyRole: body.whyRole,
    },
  });

  return NextResponse.json(content);
}
