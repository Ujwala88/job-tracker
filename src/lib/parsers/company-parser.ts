export interface CompanyInsightData {
  mission?: string;
  values?: string;
  culture?: string;
  positioning?: string;
  priorities?: string;
  language?: string;
}

const MISSION_HEADERS = ["mission", "our mission", "why we exist", "purpose", "what we do"];
const VALUES_HEADERS = ["values", "our values", "principles", "core beliefs", "what we believe"];
const CULTURE_HEADERS = ["culture", "our culture", "how we work", "team", "people", "life at"];
const POSITIONING_HEADERS = ["about", "who we are", "what we build", "product", "what is", "overview"];
const PRIORITIES_HEADERS = ["priorities", "focus", "2024", "2025", "this year", "goals", "strategy", "roadmap", "what we're building"];

function extractSection(text: string, keywords: string[]): string {
  const lines = text.split("\n");
  let inSection = false;
  const result: string[] = [];
  let depth = 0;

  for (const line of lines) {
    const lower = line.toLowerCase().trim();
    const isHeader = keywords.some((k) => lower.includes(k));

    if (isHeader && !inSection) {
      inSection = true;
      depth = 0;
      continue;
    }

    if (inSection) {
      // Stop after 8 lines or at next section header
      if (depth > 8 || (depth > 2 && /^[A-Z][^a-z]{4,}/.test(line.trim()))) break;
      if (line.trim()) {
        result.push(line.trim().replace(/^[•\-\*]\s*/, ""));
        depth++;
      }
    }
  }

  return result.join(" ").trim();
}

function extractLanguage(text: string): string {
  // Find repeated distinctive phrases and brand language
  const lower = text.toLowerCase();
  const phrases: string[] = [];

  // Extract quoted phrases
  const quoted = text.match(/"([^"]{5,60})"/g) ?? [];
  phrases.push(...quoted.map((q) => q.replace(/"/g, "")));

  // Extract capitalized brand terms (likely key concepts)
  const brandTerms = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b/g) ?? [];
  const filtered = brandTerms.filter((t) => t.length > 5 && !/^The |^Our |^We /.test(t));
  phrases.push(...filtered.slice(0, 5));

  // Look for mission-adjacent words
  const languageWords = lower.match(/\b(infrastructure|ecosystem|platform|network|community|engine|foundation|operating system|unlock|enable|empower|transform|scale|velocity|craft|taste|quality)\b/g) ?? [];
  phrases.push(...[...new Set(languageWords)]);

  return [...new Set(phrases)].slice(0, 10).join(", ");
}

export function parseCompanyInfo(text: string): CompanyInsightData {
  if (!text || text.trim().length < 50) return {};

  return {
    mission: extractSection(text, MISSION_HEADERS) || undefined,
    values: extractSection(text, VALUES_HEADERS) || undefined,
    culture: extractSection(text, CULTURE_HEADERS) || undefined,
    positioning: extractSection(text, POSITIONING_HEADERS) || undefined,
    priorities: extractSection(text, PRIORITIES_HEADERS) || undefined,
    language: extractLanguage(text) || undefined,
  };
}
