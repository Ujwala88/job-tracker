export interface JDInsights {
  responsibilities: string[];
  requiredSkills: string[];
  preferredSkills: string[];
  tools: string[];
  keywords: string[];
  leadershipSignals: string;
  stakeholderExpected: string;
  teamClues: string;
  interviewFocus: string;
  accessibilityMentions: string;
  researchMentions: string;
  strategyMentions: string;
  designSystemsMentions: string;
  peopleManagement: string;
}

const LEADERSHIP_KEYWORDS = ["lead", "mentor", "manage", "director", "strategy", "vision", "roadmap", "drive", "influence", "principal", "staff", "senior staff", "cross-functional", "stakeholder"];
const ACCESSIBILITY_KEYWORDS = ["accessibility", "wcag", "a11y", "aria", "screen reader", "inclusive", "508"];
const RESEARCH_KEYWORDS = ["user research", "research", "usability", "interviews", "survey", "discovery", "generative research", "evaluative"];
const STRATEGY_KEYWORDS = ["strategy", "strategic", "vision", "roadmap", "direction", "prioritization", "business goals", "product strategy", "north star"];
const DESIGN_SYSTEMS_KEYWORDS = ["design system", "design systems", "component library", "tokens", "storybook", "style guide", "component", "pattern library"];
const PEOPLE_MANAGEMENT_KEYWORDS = ["manage", "manage designer", "manage a team", "direct report", "mentoring", "developing designers", "people management", "hire"];
const STAKEHOLDER_KEYWORDS = ["stakeholder", "partner with", "collaborate with", "work with", "cross-functional", "engineering", "product", "pm", "research", "data science", "marketing"];

function extractSection(text: string, headers: string[]): string {
  const lines = text.split("\n");
  let inSection = false;
  const sectionLines: string[] = [];

  for (const line of lines) {
    const lower = line.toLowerCase().trim();
    const isHeader = headers.some((h) => lower.includes(h));

    if (isHeader) {
      inSection = true;
      continue;
    }

    // Stop if we hit another major header (all caps, ends with :, or short line followed by list)
    if (inSection && /^[A-Z][^a-z]{3,}[:?]?\s*$/.test(line.trim()) && line.trim().length > 0) {
      break;
    }

    if (inSection && line.trim()) {
      sectionLines.push(line.trim().replace(/^[•\-\*]\s*/, ""));
    }
  }

  return sectionLines;
}

function extractBulletPoints(section: string): string[] {
  return section
    .split("\n")
    .map((l) => l.trim().replace(/^[•\-\*]\s*/, ""))
    .filter((l) => l.length > 5);
}

function countKeywordMentions(text: string, keywords: string[]): { count: number; mentions: string[] } {
  const lower = text.toLowerCase();
  const found: string[] = [];
  for (const kw of keywords) {
    if (lower.includes(kw.toLowerCase())) found.push(kw);
  }
  return { count: found.length, mentions: found };
}

function extractTools(text: string): string[] {
  const toolPatterns = [
    /figma/i, /sketch/i, /adobe xd/i, /storybook/i, /github/i, /gitlab/i,
    /notion/i, /confluence/i, /jira/i, /linear/i, /asana/i, /slack/i,
    /miro/i, /figjam/i, /framer/i, /principle/i, /protopie/i,
    /react/i, /typescript/i, /javascript/i, /python/i, /sql/i,
    /amplitude/i, /mixpanel/i, /fullstory/i, /hotjar/i, /looker/i,
    /contentful/i, /zeplin/i, /invision/i, /marvel/i,
  ];
  const found: string[] = [];
  for (const pattern of toolPatterns) {
    const match = text.match(pattern);
    if (match) found.push(match[0]);
  }
  return [...new Set(found)];
}

function extractKeywords(text: string): string[] {
  const lower = text.toLowerCase();
  const wordFreq: Record<string, number> = {};

  // Extract meaningful multi-word phrases and single words
  const phrases = lower.match(/\b(?:design system|user research|cross-functional|product design|design thinking|interaction design|visual design|information architecture|content strategy|design strategy|systems thinking|accessibility|developer experience|developer tools|b2b|saas|enterprise|api|data-informed|stakeholder management|product strategy|design leadership)\b/g) ?? [];

  for (const phrase of phrases) {
    wordFreq[phrase] = (wordFreq[phrase] ?? 0) + 1;
  }

  return Object.entries(wordFreq)
    .filter(([, count]) => count >= 1)
    .sort(([, a], [, b]) => b - a)
    .map(([word]) => word)
    .slice(0, 20);
}

export function parseJD(text: string): JDInsights {
  if (!text || text.trim().length < 50) {
    return {
      responsibilities: [],
      requiredSkills: [],
      preferredSkills: [],
      tools: [],
      keywords: [],
      leadershipSignals: "",
      stakeholderExpected: "",
      teamClues: "",
      interviewFocus: "",
      accessibilityMentions: "",
      researchMentions: "",
      strategyMentions: "",
      designSystemsMentions: "",
      peopleManagement: "",
    };
  }

  const responsibilities = extractSection(text, ["responsibilit", "what you'll do", "what you will do", "the role", "your role", "duties", "you will"]);
  const required = extractSection(text, ["required", "requirements", "must have", "qualifications", "what we're looking for", "minimum"]);
  const preferred = extractSection(text, ["preferred", "nice to have", "bonus", "plus", "ideal candidate"]);

  const { mentions: leadershipMentions } = countKeywordMentions(text, LEADERSHIP_KEYWORDS);
  const { mentions: accessibilityMentions } = countKeywordMentions(text, ACCESSIBILITY_KEYWORDS);
  const { mentions: researchMentions } = countKeywordMentions(text, RESEARCH_KEYWORDS);
  const { mentions: strategyMentions } = countKeywordMentions(text, STRATEGY_KEYWORDS);
  const { mentions: dsMentions } = countKeywordMentions(text, DESIGN_SYSTEMS_KEYWORDS);
  const { mentions: peopleMentions } = countKeywordMentions(text, PEOPLE_MANAGEMENT_KEYWORDS);
  const { mentions: stakeholderMentions } = countKeywordMentions(text, STAKEHOLDER_KEYWORDS);

  // Team clues — look for numbers near team/designer mentions
  const teamMatch = text.match(/team of (\d+)|(\d+)[- ]person team|(\d+) designers?/i);
  const teamClue = teamMatch ? teamMatch[0] : "";

  // Interview focus — infer from content
  const focusHints: string[] = [];
  if (dsMentions.length > 0) focusHints.push("Design systems portfolio and process");
  if (strategyMentions.length >= 2) focusHints.push("Strategic thinking and vision-setting");
  if (researchMentions.length > 0) focusHints.push("Research methodology and synthesis");
  if (leadershipMentions.length >= 2) focusHints.push("Cross-functional leadership examples");
  if (accessibilityMentions.length > 0) focusHints.push("Accessibility approach and experience");
  if (peopleMentions.length > 0) focusHints.push("People management and mentorship");

  return {
    responsibilities: extractBulletPoints(responsibilities.join("\n")),
    requiredSkills: extractBulletPoints(required.join("\n")),
    preferredSkills: extractBulletPoints(preferred.join("\n")),
    tools: extractTools(text),
    keywords: extractKeywords(text),
    leadershipSignals: leadershipMentions.length > 0 ? `Signals: ${leadershipMentions.join(", ")}` : "No strong leadership signals detected",
    stakeholderExpected: stakeholderMentions.length > 0 ? stakeholderMentions.join(", ") : "Not explicitly stated",
    teamClues: teamClue || "Team size not mentioned",
    interviewFocus: focusHints.length > 0 ? focusHints.join(" · ") : "Infer from responsibilities section",
    accessibilityMentions: accessibilityMentions.length > 0 ? `Mentioned: ${accessibilityMentions.join(", ")}` : "Not mentioned",
    researchMentions: researchMentions.length > 0 ? `Mentioned: ${researchMentions.join(", ")}` : "Not mentioned",
    strategyMentions: strategyMentions.length > 0 ? `Mentioned ${strategyMentions.length}x: ${strategyMentions.join(", ")}` : "Not prominent",
    designSystemsMentions: dsMentions.length > 0 ? `Mentioned: ${dsMentions.join(", ")}` : "Not mentioned",
    peopleManagement: peopleMentions.length > 0 ? `Signals: ${peopleMentions.join(", ")}` : "No people management signals",
  };
}
