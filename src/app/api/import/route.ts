import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    if (!data.version || !data.jobs) {
      return NextResponse.json({ error: "Invalid export file format" }, { status: 400 });
    }

    let imported = 0;
    let skipped = 0;

    for (const job of data.jobs) {
      // Check if company exists
      let company = await prisma.company.findFirst({
        where: { name: job.company.name },
      });

      if (!company) {
        company = await prisma.company.create({
          data: {
            name: job.company.name,
            website: job.company.website,
            industry: job.company.industry,
            size: job.company.size,
            notes: job.company.notes,
          },
        });
      }

      // Check if job already exists (by role + company)
      const existing = await prisma.jobApplication.findFirst({
        where: {
          companyId: company.id,
          role: job.role,
        },
      });

      if (existing) {
        skipped++;
        continue;
      }

      await prisma.jobApplication.create({
        data: {
          companyId: company.id,
          role: job.role,
          location: job.location,
          workType: job.workType,
          source: job.source,
          appliedDate: job.appliedDate ? new Date(job.appliedDate) : null,
          status: job.status,
          priority: job.priority,
          salaryMin: job.salaryMin,
          salaryMax: job.salaryMax,
          salaryCurrency: job.salaryCurrency,
          nextAction: job.nextAction,
          jobUrl: job.jobUrl,
          notes: job.notes,
          content: job.content
            ? {
                create: {
                  rawJD: job.content.rawJD,
                  coverLetter: job.content.coverLetter,
                  recruiterNotes: job.content.recruiterNotes,
                  prepNotes: job.content.prepNotes,
                  whyCompany: job.content.whyCompany,
                  whyRole: job.content.whyRole,
                },
              }
            : undefined,
        },
      });

      imported++;
    }

    return NextResponse.json({ imported, skipped, total: data.jobs.length });
  } catch {
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}
