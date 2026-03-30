import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const companies = await prisma.company.findMany({
    include: {
      _count: { select: { jobs: true } },
      insights: true,
    },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(companies);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const company = await prisma.company.create({
    data: {
      name: body.name,
      website: body.website,
      industry: body.industry,
      size: body.size,
      notes: body.notes,
    },
  });

  return NextResponse.json(company, { status: 201 });
}
