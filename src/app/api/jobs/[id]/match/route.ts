import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateMatchSummary } from "@/lib/parsers/match-summary";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const job = await prisma.jobApplication.findUnique({
    where: { id },
    include: { company: true, insights: true },
  });

  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const cv = await prisma.cVProfile.findFirst({
    include: { experiences: true },
  });

  const generated = generateMatchSummary(
    job.insights,
    cv,
    cv?.experiences ?? [],
    job.role,
    job.company.name
  );

  const matchSummary = await prisma.matchSummary.upsert({
    where: { jobId: id },
    create: {
      jobId: id,
      strongAlignments: JSON.stringify(generated.strongAlignments),
      likelyGaps: JSON.stringify(generated.likelyGaps),
      storiesToEmphasize: JSON.stringify(generated.storiesToEmphasize),
      recruiterPoints: generated.recruiterPoints,
      whyYouBasis: generated.whyYouBasis,
      aboutYourselfBasis: generated.aboutYourselfBasis,
      prepQuestions: JSON.stringify(generated.prepQuestions),
    },
    update: {
      strongAlignments: JSON.stringify(generated.strongAlignments),
      likelyGaps: JSON.stringify(generated.likelyGaps),
      storiesToEmphasize: JSON.stringify(generated.storiesToEmphasize),
      recruiterPoints: generated.recruiterPoints,
      whyYouBasis: generated.whyYouBasis,
      aboutYourselfBasis: generated.aboutYourselfBasis,
      prepQuestions: JSON.stringify(generated.prepQuestions),
    },
  });

  return NextResponse.json(matchSummary);
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const match = await prisma.matchSummary.findUnique({ where: { jobId: id } });
  return NextResponse.json(match ?? {});
}
