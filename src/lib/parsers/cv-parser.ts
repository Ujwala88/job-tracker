export interface CVExperienceData {
  company: string;
  role: string;
  startDate?: string;
  endDate?: string;
  responsibilities?: string;
  achievements?: string;
  tools?: string;
  domains?: string;
  leadership?: string;
  stakeholders?: string;
  impact?: string;
  stories?: string;
}

export interface CVData {
  name?: string;
  email?: string;
  phone?: string;
  summary?: string;
  skills: string[];
  domains: string[];
  experiences: CVExperienceData[];
}

const SKILL_PATTERNS = [
  /figma/i, /sketch/i, /adobe xd/i, /invision/i, /framer/i,
  /storybook/i, /github/i, /jira/i, /confluence/i, /notion/i,
  /html/i, /css/i, /javascript/i, /typescript/i, /react/i,
  /user research/i, /usability testing/i, /accessibility/i, /wcag/i,
  /design system/i, /design systems/i, /component library/i,
  /prototyping/i, /wireframing/i, /information architecture/i,
  /motion design/i, /interaction design/i, /visual design/i,
  /product strategy/i, /roadmap/i, /data analysis/i, /sql/i,
  /a\/b testing/i, /quantitative research/i, /qualitative research/i,
];

const DOMAIN_PATTERNS = [
  /\bb2b\b/i, /\bsaas\b/i, /enterprise/i, /e-?commerce/i,
  /fintech/i, /healthtech/i, /edtech/i, /developer tools/i,
  /payments/i, /mobile/i, /platform/i, /consumer/i,
  /design infrastructure/i, /design ops/i, /brand/i,
  /data visualization/i, /dashboard/i, /analytics/i,
];

const LEADERSHIP_PATTERNS = [
  /led /i, /lead /i, /managed /i, /mentored /i, /coached /i,
  /drove /i, /defined /i, /established /i, /founded /i, /built and led/i,
  /cross-functional/i, /stakeholder/i, /presented to/i,
];

const IMPACT_PATTERNS = [
  /\d+%/,
  /\$\d+/,
  /increased?/i, /decreased?/i, /improved?/i, /reduced?/i,
  /\d+ (users|customers|teams|designers|engineers)/i,
  /saved/i, /generated/i, /revenue/i,
];

function extractEmail(text: string): string | undefined {
  const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return match?.[0];
}

function extractPhone(text: string): string | undefined {
  const match = text.match(/[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}/);
  return match?.[0];
}

function extractName(text: string): string | undefined {
  // First non-empty line is usually the name
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const first = lines[0];
  // Simple heuristic: if first line has 2-4 words and no @, likely a name
  if (first && first.split(" ").length >= 2 && first.split(" ").length <= 5 && !first.includes("@")) {
    return first;
  }
  return undefined;
}

function extractSkills(text: string): string[] {
  const found: string[] = [];
  for (const pattern of SKILL_PATTERNS) {
    const match = text.match(pattern);
    if (match) found.push(match[0]);
  }
  return [...new Set(found)];
}

function extractDomains(text: string): string[] {
  const found: string[] = [];
  for (const pattern of DOMAIN_PATTERNS) {
    const match = text.match(pattern);
    if (match) found.push(match[0]);
  }
  return [...new Set(found)];
}

function extractLeadership(text: string): string {
  const sentences = text.split(/[.!?]/);
  const leadership = sentences.filter((s) =>
    LEADERSHIP_PATTERNS.some((p) => p.test(s))
  );
  return leadership.slice(0, 3).join(". ").trim();
}

function extractImpact(text: string): string {
  const sentences = text.split(/[.!?]/);
  const impact = sentences.filter((s) =>
    IMPACT_PATTERNS.some((p) => p.test(s))
  );
  return impact.slice(0, 3).join(". ").trim();
}

function parseExperiences(text: string): CVExperienceData[] {
  const experiences: CVExperienceData[] = [];

  // Split by likely job headers (patterns like company name + date range)
  const jobBlocks = text.split(
    /\n(?=[A-Z][^a-z\n]{0,40}\n|.+\|\s*\d{4}|.+\s+\d{4}\s*[-–]\s*(?:\d{4}|present|current))/i
  );

  for (const block of jobBlocks) {
    if (block.trim().length < 50) continue;

    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) continue;

    // Try to extract company, role, dates from first few lines
    const dateMatch = block.match(/(\w+ \d{4}|\d{4})\s*[-–]\s*(\w+ \d{4}|\d{4}|present|current)/i);
    const startDate = dateMatch?.[1];
    const endDate = dateMatch?.[2];

    // First line or two usually has role and company
    const firstLine = lines[0];
    const secondLine = lines[1];

    let company = "";
    let role = "";

    if (firstLine && secondLine) {
      // Heuristic: if first line looks like a job title, second is company
      if (/designer|engineer|manager|lead|director|head of|vp|product/i.test(firstLine)) {
        role = firstLine;
        company = secondLine.replace(/\s*\|.*/, "").replace(/\s*[-–].*\d{4}.*/, "").trim();
      } else {
        company = firstLine.replace(/\s*\|.*/, "").trim();
        role = secondLine.replace(/\s*[-–].*\d{4}.*/, "").trim();
      }
    }

    if (!company && !role) continue;

    const bodyText = lines.slice(2).join(" ");
    const bullets = lines.slice(2).filter((l) => l.startsWith("•") || l.startsWith("-") || l.startsWith("*")).map((l) => l.replace(/^[•\-\*]\s*/, ""));

    experiences.push({
      company: company || "Unknown Company",
      role: role || "Unknown Role",
      startDate,
      endDate,
      responsibilities: bullets.slice(0, Math.ceil(bullets.length / 2)).join("\n") || bodyText.slice(0, 500),
      achievements: bullets.slice(Math.ceil(bullets.length / 2)).join("\n"),
      tools: extractSkills(bodyText).join(", "),
      domains: extractDomains(bodyText).join(", "),
      leadership: extractLeadership(bodyText),
      impact: extractImpact(bodyText),
    });
  }

  return experiences.filter((e) => e.company !== "Unknown Company" || e.role !== "Unknown Role");
}

export function parseCV(text: string): CVData {
  if (!text || text.trim().length < 100) {
    return { skills: [], domains: [], experiences: [] };
  }

  return {
    name: extractName(text),
    email: extractEmail(text),
    phone: extractPhone(text),
    summary: extractSummary(text),
    skills: extractSkills(text),
    domains: extractDomains(text),
    experiences: parseExperiences(text),
  };
}

function extractSummary(text: string): string | undefined {
  const lines = text.split("\n").map((l) => l.trim());
  const summaryIdx = lines.findIndex((l) =>
    /^(summary|about|profile|objective|overview)/i.test(l)
  );
  if (summaryIdx !== -1) {
    return lines.slice(summaryIdx + 1, summaryIdx + 5).join(" ").trim().slice(0, 500);
  }
  // Fall back to first paragraph-length block
  const paragraphs = text.split(/\n\n+/);
  const firstPara = paragraphs.find((p) => p.trim().length > 80 && p.trim().length < 600);
  return firstPara?.trim().slice(0, 500);
}
