import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseJD } from "@/lib/parsers/jd-parser";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const insights = await prisma.jobInsight.findUnique({ where: { jobId: id } });
  return NextResponse.json(insights ?? {});
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { rawJD } = await req.json();

  if (!rawJD) return NextResponse.json({ error: "rawJD required" }, { status: 400 });

  const parsed = parseJD(rawJD);

  const insights = await prisma.jobInsight.upsert({
    where: { jobId: id },
    create: {
      jobId: id,
      responsibilities: JSON.stringify(parsed.responsibilities),
      requiredSkills: JSON.stringify(parsed.requiredSkills),
      preferredSkills: JSON.stringify(parsed.preferredSkills),
      tools: JSON.stringify(parsed.tools),
      keywords: JSON.stringify(parsed.keywords),
      leadershipSignals: parsed.leadershipSignals,
      stakeholderExpected: parsed.stakeholderExpected,
      teamClues: parsed.teamClues,
      interviewFocus: parsed.interviewFocus,
      accessibilityMentions: parsed.accessibilityMentions,
      researchMentions: parsed.researchMentions,
      strategyMentions: parsed.strategyMentions,
      designSystemsMentions: parsed.designSystemsMentions,
      peopleManagement: parsed.peopleManagement,
    },
    update: {
      responsibilities: JSON.stringify(parsed.responsibilities),
      requiredSkills: JSON.stringify(parsed.requiredSkills),
      preferredSkills: JSON.stringify(parsed.preferredSkills),
      tools: JSON.stringify(parsed.tools),
      keywords: JSON.stringify(parsed.keywords),
      leadershipSignals: parsed.leadershipSignals,
      stakeholderExpected: parsed.stakeholderExpected,
      teamClues: parsed.teamClues,
      interviewFocus: parsed.interviewFocus,
      accessibilityMentions: parsed.accessibilityMentions,
      researchMentions: parsed.researchMentions,
      strategyMentions: parsed.strategyMentions,
      designSystemsMentions: parsed.designSystemsMentions,
      peopleManagement: parsed.peopleManagement,
    },
  });

  return NextResponse.json(insights);
}
