import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseCompanyInfo } from "@/lib/parsers/company-parser";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const insights = await prisma.companyInsight.findUnique({ where: { companyId: id } });
  return NextResponse.json(insights ?? {});
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  let parsed: Record<string, string | undefined> = {};
  if (body.rawText) {
    parsed = parseCompanyInfo(body.rawText);
  }

  const insights = await prisma.companyInsight.upsert({
    where: { companyId: id },
    create: {
      companyId: id,
      rawText: body.rawText,
      mission: body.mission ?? parsed.mission,
      values: body.values ?? parsed.values,
      culture: body.culture ?? parsed.culture,
      positioning: body.positioning ?? parsed.positioning,
      priorities: body.priorities ?? parsed.priorities,
      language: body.language ?? parsed.language,
    },
    update: {
      rawText: body.rawText ?? undefined,
      mission: body.mission ?? parsed.mission ?? undefined,
      values: body.values ?? parsed.values ?? undefined,
      culture: body.culture ?? parsed.culture ?? undefined,
      positioning: body.positioning ?? parsed.positioning ?? undefined,
      priorities: body.priorities ?? parsed.priorities ?? undefined,
      language: body.language ?? parsed.language ?? undefined,
    },
  });

  return NextResponse.json(insights);
}
