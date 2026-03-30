import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseCV } from "@/lib/parsers/cv-parser";

export async function GET() {
  const cv = await prisma.cVProfile.findFirst({
    include: { experiences: { orderBy: { createdAt: "asc" } } },
  });
  return NextResponse.json(cv ?? null);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const existing = await prisma.cVProfile.findFirst();

  let parsed = { skills: [] as string[], domains: [] as string[], experiences: [] as unknown[], name: undefined as string | undefined, email: undefined as string | undefined, phone: undefined as string | undefined, summary: undefined as string | undefined };
  if (body.rawText) {
    const p = parseCV(body.rawText);
    parsed = p;
  }

  if (existing) {
    // Update existing
    await prisma.cVExperience.deleteMany({ where: { cvId: existing.id } });

    const updated = await prisma.cVProfile.update({
      where: { id: existing.id },
      data: {
        rawText: body.rawText ?? existing.rawText,
        name: body.name ?? parsed.name ?? existing.name,
        email: body.email ?? parsed.email ?? existing.email,
        phone: body.phone ?? parsed.phone ?? existing.phone,
        summary: body.summary ?? parsed.summary ?? existing.summary,
        skills: body.skills ? JSON.stringify(body.skills) : (parsed.skills.length > 0 ? JSON.stringify(parsed.skills) : existing.skills),
        domains: body.domains ? JSON.stringify(body.domains) : (parsed.domains.length > 0 ? JSON.stringify(parsed.domains) : existing.domains),
        experiences: {
          create: (body.experiences ?? parsed.experiences ?? []).map((e: Record<string, string>) => ({
            company: e.company,
            role: e.role,
            startDate: e.startDate,
            endDate: e.endDate,
            responsibilities: e.responsibilities,
            achievements: e.achievements,
            tools: e.tools,
            domains: e.domains,
            leadership: e.leadership,
            stakeholders: e.stakeholders,
            impact: e.impact,
            stories: e.stories,
          })),
        },
      },
      include: { experiences: true },
    });

    return NextResponse.json(updated);
  }

  const created = await prisma.cVProfile.create({
    data: {
      rawText: body.rawText,
      name: body.name ?? parsed.name,
      email: body.email ?? parsed.email,
      phone: body.phone ?? parsed.phone,
      summary: body.summary ?? parsed.summary,
      skills: body.skills ? JSON.stringify(body.skills) : (parsed.skills.length > 0 ? JSON.stringify(parsed.skills) : null),
      domains: body.domains ? JSON.stringify(body.domains) : (parsed.domains.length > 0 ? JSON.stringify(parsed.domains) : null),
      experiences: {
        create: (body.experiences ?? parsed.experiences ?? []).map((e: Record<string, string>) => ({
          company: e.company,
          role: e.role,
          startDate: e.startDate,
          endDate: e.endDate,
          responsibilities: e.responsibilities,
          achievements: e.achievements,
          tools: e.tools,
          domains: e.domains,
          leadership: e.leadership,
          stakeholders: e.stakeholders,
          impact: e.impact,
          stories: e.stories,
        })),
      },
    },
    include: { experiences: true },
  });

  return NextResponse.json(created, { status: 201 });
}
