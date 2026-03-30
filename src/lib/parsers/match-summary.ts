import { safeParseJSON } from "@/lib/utils";

interface JobInsightData {
  requiredSkills?: string | null;
  preferredSkills?: string | null;
  tools?: string | null;
  keywords?: string | null;
  leadershipSignals?: string | null;
  strategyMentions?: string | null;
  accessibilityMentions?: string | null;
  designSystemsMentions?: string | null;
  interviewFocus?: string | null;
}

interface CVProfileData {
  skills?: string | null;
  domains?: string | null;
  summary?: string | null;
}

interface CVExperienceData {
  role: string;
  company: string;
  achievements?: string | null;
  leadership?: string | null;
  impact?: string | null;
}

export interface GeneratedMatchSummary {
  strongAlignments: string[];
  likelyGaps: string[];
  storiesToEmphasize: string[];
  recruiterPoints: string;
  whyYouBasis: string;
  aboutYourselfBasis: string;
  prepQuestions: string[];
}

export function generateMatchSummary(
  jobInsight: JobInsightData | null,
  cvProfile: CVProfileData | null,
  cvExperiences: CVExperienceData[],
  jobRole: string,
  companyName: string
): GeneratedMatchSummary {
  const requiredSkills = safeParseJSON<string[]>(jobInsight?.requiredSkills, []);
  const preferredSkills = safeParseJSON<string[]>(jobInsight?.preferredSkills, []);
  const jdKeywords = safeParseJSON<string[]>(jobInsight?.keywords, []);
  const cvSkills = safeParseJSON<string[]>(cvProfile?.skills, []);
  const cvDomains = safeParseJSON<string[]>(cvProfile?.domains, []);

  // Find skill overlaps
  const cvSkillsLower = cvSkills.map((s) => s.toLowerCase());
  const matchedRequired = requiredSkills.filter((s) =>
    cvSkillsLower.some((cs) => cs.includes(s.toLowerCase()) || s.toLowerCase().includes(cs))
  );
  const matchedPreferred = preferredSkills.filter((s) =>
    cvSkillsLower.some((cs) => cs.includes(s.toLowerCase()) || s.toLowerCase().includes(cs))
  );
  const unmatchedRequired = requiredSkills.filter((s) =>
    !cvSkillsLower.some((cs) => cs.includes(s.toLowerCase()) || s.toLowerCase().includes(cs))
  );

  const strongAlignments: string[] = [];
  const likelyGaps: string[] = [];

  // Build alignments
  if (matchedRequired.length > 0) {
    strongAlignments.push(`Required skills match: ${matchedRequired.slice(0, 4).join(", ")}`);
  }
  if (matchedPreferred.length > 0) {
    strongAlignments.push(`Preferred skills match: ${matchedPreferred.slice(0, 3).join(", ")}`);
  }

  // Domain alignment
  const cvDomainsLower = cvDomains.map((d) => d.toLowerCase());
  const jdKeywordsLower = jdKeywords.map((k) => k.toLowerCase());
  const domainOverlap = cvDomainsLower.filter((d) => jdKeywordsLower.some((k) => k.includes(d) || d.includes(k)));
  if (domainOverlap.length > 0) {
    strongAlignments.push(`Domain experience overlap: ${domainOverlap.slice(0, 3).join(", ")}`);
  }

  // Leadership alignment
  if (jobInsight?.leadershipSignals && !jobInsight.leadershipSignals.includes("No strong")) {
    const hasLeadership = cvExperiences.some((e) => e.leadership && e.leadership.length > 20);
    if (hasLeadership) {
      strongAlignments.push("Cross-functional leadership experience present in CV");
    }
  }

  // Gaps
  if (unmatchedRequired.length > 0) {
    likelyGaps.push(...unmatchedRequired.slice(0, 3).map((s) => `Required skill not explicitly listed: "${s}"`));
  }
  if (strongAlignments.length === 0) {
    likelyGaps.push("Skill mapping is limited — add more skills to your CV profile for better analysis");
  }

  // Stories to emphasize
  const stories: string[] = [];
  for (const exp of cvExperiences.slice(0, 3)) {
    if (exp.impact && exp.impact.length > 20) {
      stories.push(`${exp.role} at ${exp.company}: ${exp.impact.slice(0, 120)}`);
    }
    if (exp.leadership && exp.leadership.length > 20) {
      stories.push(`Leadership at ${exp.company}: ${exp.leadership.slice(0, 120)}`);
    }
  }
  if (stories.length === 0) {
    stories.push("Add your CV to the Knowledge Base to generate story suggestions");
  }

  // Prep questions
  const prepQuestions: string[] = [
    `What excites you most about the ${jobRole} role at ${companyName}?`,
    "Tell me about a time you navigated a complex cross-functional project.",
    "Walk me through a project that didn't go as planned and what you learned.",
    `Why ${companyName} over other opportunities?`,
  ];
  if (jobInsight?.interviewFocus) {
    prepQuestions.unshift(`Likely interview theme: ${jobInsight.interviewFocus.split(" · ")[0]}`);
  }
  if (jobInsight?.designSystemsMentions && !jobInsight.designSystemsMentions.includes("Not mentioned")) {
    prepQuestions.push("Walk me through how you approached building or scaling a design system.");
  }
  if (jobInsight?.accessibilityMentions && !jobInsight.accessibilityMentions.includes("Not mentioned")) {
    prepQuestions.push("How do you approach accessibility in your design practice?");
  }
  if (jobInsight?.strategyMentions && !jobInsight.strategyMentions.includes("Not prominent")) {
    prepQuestions.push("Tell me about a time you defined a product design strategy from scratch.");
  }

  const summary = cvProfile?.summary ?? "";
  return {
    strongAlignments: strongAlignments.length > 0 ? strongAlignments : ["Add your CV Knowledge Base and JD for deeper analysis"],
    likelyGaps: likelyGaps.length > 0 ? likelyGaps : ["No significant gaps detected — review manually"],
    storiesToEmphasize: stories.slice(0, 5),
    recruiterPoints: `Emphasize your match on ${matchedRequired.slice(0, 2).join(" and ") || "core requirements"}. Lead with impact — use numbers where possible. Show enthusiasm for ${companyName}'s mission.`,
    whyYouBasis: summary
      ? `${summary.slice(0, 200)}... Align this to ${companyName}'s stated priorities.`
      : `Build your "Why You" answer from your CV profile — add it to the Knowledge Base first.`,
    aboutYourselfBasis: summary
      ? `Professional summary as starting point: "${summary.slice(0, 300)}"`
      : "Add your CV to the Knowledge Base to generate a tailored 'Tell me about yourself' basis.",
    prepQuestions: prepQuestions.slice(0, 8),
  };
}
