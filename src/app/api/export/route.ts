import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [jobs, companies, cv] = await Promise.all([
    prisma.jobApplication.findMany({
      include: {
        company: { include: { insights: true } },
        content: true,
        statusHistory: { orderBy: { createdAt: "asc" } },
        interviewRounds: { include: { questions: true } },
        contacts: true,
        insights: true,
        matchSummary: true,
      },
    }),
    prisma.company.findMany({ include: { insights: true, contacts: true } }),
    prisma.cVProfile.findFirst({ include: { experiences: true } }),
  ]);

  const data = {
    exportedAt: new Date().toISOString(),
    version: "1.0",
    jobs,
    companies,
    cv,
  };

  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="job-tracker-export-${new Date().toISOString().split("T")[0]}.json"`,
    },
  });
}
