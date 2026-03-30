import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await prisma.matchSummary.deleteMany();
  await prisma.jobInsight.deleteMany();
  await prisma.interviewQuestion.deleteMany();
  await prisma.interviewRound.deleteMany();
  await prisma.statusUpdate.deleteMany();
  await prisma.jobContent.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.companyInsight.deleteMany();
  await prisma.jobApplication.deleteMany();
  await prisma.company.deleteMany();
  await prisma.cVExperience.deleteMany();
  await prisma.cVProfile.deleteMany();

  // --- Companies ---
  const figma = await prisma.company.create({
    data: {
      name: "Figma",
      website: "https://figma.com",
      industry: "Design Software / SaaS",
      size: "1000–5000",
      notes: "Leading design collaboration platform. Known for strong eng culture and thoughtful product work.",
    },
  });

  const stripe = await prisma.company.create({
    data: {
      name: "Stripe",
      website: "https://stripe.com",
      industry: "Fintech / Payments",
      size: "5000–10000",
      notes: "Global payments infrastructure. Very writing-heavy culture. High bar for systems thinking.",
    },
  });

  const linear = await prisma.company.create({
    data: {
      name: "Linear",
      website: "https://linear.app",
      industry: "Productivity / Dev Tools",
      size: "50–200",
      notes: "Small, opinionated team. Obsessed with craft and speed. Strong design-eng partnership.",
    },
  });

  // --- Company Insights ---
  await prisma.companyInsight.create({
    data: {
      companyId: figma.id,
      mission: "Make design accessible to everyone.",
      values: "Craft, collaboration, inclusion, transparency",
      culture: "Design-forward, collaborative, async-friendly, values deep work",
      positioning: "The operating system for design teams. Moving beyond static files to multiplayer product development.",
      priorities: "Enterprise expansion, AI-assisted design, developer handoff, accessibility tooling",
      language: "multiplayer, collaborative, pixels to code, design system, components, handoff, inclusive design",
    },
  });

  await prisma.companyInsight.create({
    data: {
      companyId: stripe.id,
      mission: "Increase the GDP of the internet.",
      values: "Rigor, curiosity, service, integrity",
      culture: "High-ownership, writing-first (memos over decks), data-driven, globally distributed",
      positioning: "The economic infrastructure layer for the internet. Developer-first payments and financial tools.",
      priorities: "Global expansion, financial services stack, AI-powered fraud detection, developer experience",
      language: "infrastructure, economic growth, developer experience, payment flows, trust and safety, global scale",
    },
  });

  await prisma.companyInsight.create({
    data: {
      companyId: linear.id,
      mission: "Build tools for the people building the future.",
      values: "Speed, quality, simplicity, taste",
      culture: "Small team, high trust, minimal process. Everyone ships. Design and eng deeply intertwined.",
      positioning: "The issue tracker that doesn't slow you down. Built for high-performing software teams.",
      priorities: "Core product excellence, API and integrations, enterprise features, design system fidelity",
      language: "speed, taste, craft, minimal, opinionated, keyboard-first, beautiful, high performance",
    },
  });

  // --- Job Applications ---
  const figmaJob = await prisma.jobApplication.create({
    data: {
      companyId: figma.id,
      role: "Senior Product Designer – Design Systems",
      location: "San Francisco, CA / Remote",
      workType: "hybrid",
      source: "LinkedIn",
      appliedDate: new Date("2024-11-15"),
      status: "interview",
      priority: "high",
      salaryMin: 160000,
      salaryMax: 210000,
      salaryCurrency: "USD",
      nextAction: "Prepare portfolio presentation for panel interview",
      nextActionDate: new Date("2024-12-10"),
      jobUrl: "https://figma.com/careers/design-systems",
    },
  });

  const stripeJob = await prisma.jobApplication.create({
    data: {
      companyId: stripe.id,
      role: "Staff Product Designer – Payments UX",
      location: "Remote (US)",
      workType: "remote",
      source: "Referral",
      appliedDate: new Date("2024-11-20"),
      status: "phone_screen",
      priority: "high",
      salaryMin: 195000,
      salaryMax: 260000,
      salaryCurrency: "USD",
      nextAction: "Follow up with recruiter after phone screen",
      nextActionDate: new Date("2024-12-05"),
      jobUrl: "https://stripe.com/jobs/listing/staff-product-designer",
    },
  });

  const linearJob = await prisma.jobApplication.create({
    data: {
      companyId: linear.id,
      role: "Product Designer",
      location: "Remote",
      workType: "remote",
      source: "Company Website",
      appliedDate: new Date("2024-11-28"),
      status: "applied",
      priority: "medium",
      salaryMin: 140000,
      salaryMax: 180000,
      salaryCurrency: "USD",
      nextAction: "Research Linear's design system and recent product updates",
      nextActionDate: new Date("2024-12-08"),
      jobUrl: "https://linear.app/careers/product-designer",
    },
  });

  // --- Status Histories ---
  await prisma.statusUpdate.createMany({
    data: [
      { jobId: figmaJob.id, fromStatus: null, toStatus: "wishlist", note: "Found on LinkedIn, looks like a strong match" },
      { jobId: figmaJob.id, fromStatus: "wishlist", toStatus: "applied", note: "Submitted application with portfolio", createdAt: new Date("2024-11-15") },
      { jobId: figmaJob.id, fromStatus: "applied", toStatus: "screening", note: "Got confirmation email from ATS", createdAt: new Date("2024-11-22") },
      { jobId: figmaJob.id, fromStatus: "screening", toStatus: "phone_screen", note: "Recruiter called — moving to next stage", createdAt: new Date("2024-11-28") },
      { jobId: figmaJob.id, fromStatus: "phone_screen", toStatus: "interview", note: "Passed phone screen. Panel interview scheduled for Dec 10.", createdAt: new Date("2024-12-01") },
    ],
  });

  await prisma.statusUpdate.createMany({
    data: [
      { jobId: stripeJob.id, fromStatus: null, toStatus: "wishlist", note: "Referred by ex-colleague Priya" },
      { jobId: stripeJob.id, fromStatus: "wishlist", toStatus: "applied", note: "Applied via referral link", createdAt: new Date("2024-11-20") },
      { jobId: stripeJob.id, fromStatus: "applied", toStatus: "phone_screen", note: "Recruiter reached out 2 days after applying — fast process", createdAt: new Date("2024-11-29") },
    ],
  });

  await prisma.statusUpdate.createMany({
    data: [
      { jobId: linearJob.id, fromStatus: null, toStatus: "wishlist", note: "Admire their product a lot — worth exploring" },
      { jobId: linearJob.id, fromStatus: "wishlist", toStatus: "applied", note: "Applied with custom cover letter emphasizing craft/speed values", createdAt: new Date("2024-11-28") },
    ],
  });

  // --- Job Content ---
  await prisma.jobContent.create({
    data: {
      jobId: figmaJob.id,
      rawJD: `Senior Product Designer – Design Systems

We're looking for a Senior Product Designer to join our Design Systems team. You'll work at the intersection of tooling, documentation, and real product workflows — helping thousands of design teams work faster and more consistently.

Responsibilities:
• Own end-to-end design for components across our design system
• Partner with engineering to define and maintain token architecture
• Work with research to understand how teams use design systems in the wild
• Drive adoption and documentation strategy across Figma's own product teams
• Define accessibility standards and implementation guidelines
• Collaborate with cross-functional stakeholders including design leads, PMs, and engineering managers

Required:
• 5+ years of product design experience
• Deep expertise in design systems and component libraries
• Experience shipping complex, interconnected UI systems at scale
• Strong systems thinking and ability to define patterns, not just components
• Excellent cross-functional communication skills
• Proficiency in Figma (naturally)

Preferred:
• Experience contributing to open-source design systems
• Familiarity with design token standards (W3C, Style Dictionary)
• Prior work in B2B or developer-facing products
• Accessibility expertise (WCAG 2.1, ARIA patterns)

Tools: Figma, GitHub, Storybook, Notion, Slack`,

      coverLetter: `Dear Figma Design Systems Team,

Design systems are where I do my best work. Over the past 6 years, I've shipped and maintained component libraries across B2B SaaS platforms — from initial token architecture through to adoption strategies that actually stuck.

What draws me to this role is the scale of impact. When you get a design system decision right at Figma, it shapes how thousands of teams think about their own systems. That's a lever I want to pull.

My background includes leading a full redesign of a design system at [Company], moving from an ad hoc pattern library to a fully tokenized, documented, and accessible system used across 4 product lines. I drove accessibility compliance to WCAG 2.1 AA, set up Storybook integration, and ran quarterly adoption reviews with design leads across each team.

I'd love to bring that same depth of systems thinking to Figma.

Ujwala`,

      recruiterNotes: `Spoke with Jess (recruiter) on Nov 28. She mentioned:
- Team has 6 designers, 3 focused on Design Systems
- Looking for someone who can "own the roadmap" not just execute
- Panel interview is 3 hours: portfolio review + systems thinking exercise + cross-functional working session
- Timeline: decision by end of December`,

      prepNotes: `Key themes to hit:
- Token architecture decisions and tradeoffs I've made
- How I handle adoption — not just shipping but actually getting teams to use it
- Accessibility at systems level (not just checking boxes)
- Cross-functional collaboration with eng

Stories to prepare:
- Component library rebuild at [Company]
- The token refactor that unblocked the mobile team
- Accessibility audit that caught 40+ violations and how I fixed them systematically`,

      whyCompany: `Figma is the tool I've spent more time in than any other. Being on the team that shapes how Figma's own design system works — and how that influences the whole ecosystem — is genuinely exciting. Plus the culture of craft and the transparent, design-led approach to product is exactly what I want to be part of.`,

      whyRole: `Design Systems is where design and engineering most directly need each other, and I think I'm unusually good at bridging that. I love the constraint-driven nature of systems work — every decision has downstream effects and you have to think architecturally. This is exactly the kind of work I want to be doing at this stage.`,
    },
  });

  await prisma.jobContent.create({
    data: {
      jobId: stripeJob.id,
      rawJD: `Staff Product Designer – Payments UX

Stripe's mission is to increase the GDP of the internet. We're looking for a Staff Product Designer to lead design for our core payments flows — checkout, invoicing, and payment links — used by millions of businesses globally.

This is a high-ownership, high-impact role. You'll define strategy, mentor junior designers, and work directly with engineering and product leadership to shape how businesses collect money.

Responsibilities:
• Set design direction and strategy for payments UX across multiple surfaces
• Mentor and develop mid-level designers on the team
• Partner with PMs and engineering to define quarterly roadmaps
• Work closely with research to develop a deep understanding of merchant and buyer journeys
• Drive design quality standards and review across the payments organization
• Influence cross-functional decisions at VP/director level

Required:
• 8+ years of product design experience
• Staff-level ownership: comfortable setting strategy and influencing without authority
• Strong track record of shipping complex, multi-surface products
• Experience in B2B or merchant-facing products
• Excellent written communication (memos, design proposals, async collaboration)
• Data-informed design practice

Preferred:
• Experience designing for payments, financial services, or developer tools
• Familiarity with API-driven products and developer experience
• Accessibility expertise
• Experience managing or mentoring designers

Tools: Figma, Notion, Statsig, SQL (basic)`,

      recruiterNotes: `Initial recruiter call with Marcus (Nov 29):
- Role open for 3 months, previous designer left for a startup
- Team is 12 designers across payments
- Stripe does written loop interviews — expect a design proposal exercise
- Process: recruiter call → hiring manager call → written exercise → 4-person loop
- Strong emphasis on writing skills — "write a design proposal" is a core part of the process
- Comp: $195-260k base + equity

Marcus's framing: "We want someone who can define the 2-year payments UX vision, not just make nice screens."`,

      prepNotes: `CRITICAL: Practice writing design proposals. Stripe values writing over decks.

For the written exercise, expect something like:
- "How would you improve the Stripe Checkout experience for SMBs?"
- "Design a system for helping merchants understand payment failure patterns"

Key signals they want:
- Strategic thinking at a VP level
- Data-fluency
- Cross-functional leadership
- Clarity of communication`,

      whyCompany: `Stripe has built the kind of infrastructure product I've always been most drawn to — something that enables entire businesses, not just improves a workflow. The writing-first culture resonates with how I naturally think. And payments UX is genuinely unsolved in interesting ways.`,

      whyRole: `Staff level means setting direction, not just executing. That's where I am in my career and what I want to be doing. The scale — millions of merchants, billions in payments — means every improvement compounds. I want to work at that scale.`,
    },
  });

  await prisma.jobContent.create({
    data: {
      jobId: linearJob.id,
      rawJD: `Product Designer

Linear is looking for a Product Designer who cares deeply about craft and wants to shape how software teams work. You'll work on core product experiences — from issue tracking to roadmaps to integrations — alongside a small, high-trust team.

We move fast. We care about quality. You'll own your work end-to-end.

Responsibilities:
• Design features across Linear's core product
• Work closely with engineering — we expect designers to understand technical constraints and opportunities
• Contribute to and evolve our design system
• Drive UX quality reviews and maintain design standards
• Help define product direction through design exploration

Required:
• 4+ years of product design experience
• Exceptional craft and attention to detail
• Strong systems thinking
• Ability to work autonomously and drive your own projects
• Comfort with fast iteration cycles

Preferred:
• Experience with developer tools or productivity software
• Prior work in a small, high-trust team environment
• Strong keyboard-first / power-user perspective
• Familiarity with Linear as a user

Tools: Figma, Linear (obviously)`,

      recruiterNotes: `No recruiter contact yet. Applied directly through their website.`,

      prepNotes: `Research to do before any contact:
- Deep dive on Linear's recent changelog and design decisions
- Understand their design system (look at their Figma community file)
- Prepare thoughts on what I'd improve about the product

Linear is small enough that any designer they hire has outsized influence. Need to show: strong opinions, technical fluency, taste.`,

      whyCompany: `Linear is one of the best-designed products I use. The attention to detail — from keyboard shortcuts to animation to the data model — shows a team that thinks deeply about craft. I want to work somewhere where design quality is non-negotiable.`,

      whyRole: `Small team means real ownership. At this stage in my career I want to feel the direct impact of my design decisions. And working on tooling for software teams means I'm designing for people who have high expectations.`,
    },
  });

  // --- Interview Rounds ---
  const figmaRound1 = await prisma.interviewRound.create({
    data: {
      jobId: figmaJob.id,
      roundNumber: 1,
      roundType: "recruiter_screen",
      scheduledAt: new Date("2024-11-28"),
      interviewer: "Jess (Recruiter)",
      notes: "30 min call. Went well. She said I was a strong match on background.",
      outcome: "passed",
    },
  });

  await prisma.interviewQuestion.createMany({
    data: [
      {
        roundId: figmaRound1.id,
        question: "Walk me through your experience with design systems.",
        myAnswer: "Covered the [Company] design system rebuild — from audit to token architecture to adoption.",
        category: "background",
      },
      {
        roundId: figmaRound1.id,
        question: "Why Figma, why now?",
        myAnswer: "Spoke about the ecosystem impact and wanting to work on tooling that shapes how the industry thinks.",
        category: "motivation",
      },
    ],
  });

  const stripeRound1 = await prisma.interviewRound.create({
    data: {
      jobId: stripeJob.id,
      roundNumber: 1,
      roundType: "recruiter_screen",
      scheduledAt: new Date("2024-11-29"),
      interviewer: "Marcus (Recruiter)",
      notes: "45 min call. He emphasized the writing-heavy process.",
      outcome: "passed",
    },
  });

  await prisma.interviewQuestion.create({
    data: {
      roundId: stripeRound1.id,
      question: "Tell me about a time you drove design direction at a strategic level.",
      myAnswer: "Talked about leading the mobile checkout redesign — how I built the case, got buy-in, and executed.",
      improvements: "Should have quantified impact more clearly — what was the conversion improvement?",
      category: "behavioral",
    },
  });

  // --- Job Insights ---
  await prisma.jobInsight.create({
    data: {
      jobId: figmaJob.id,
      responsibilities: JSON.stringify([
        "Own end-to-end design for components",
        "Partner with engineering on token architecture",
        "Work with research on design system usage",
        "Drive adoption and documentation strategy",
        "Define accessibility standards",
        "Collaborate with cross-functional stakeholders",
      ]),
      requiredSkills: JSON.stringify([
        "Product design (5+ years)",
        "Design systems and component libraries",
        "UI systems at scale",
        "Systems thinking",
        "Cross-functional communication",
        "Figma proficiency",
      ]),
      preferredSkills: JSON.stringify([
        "Open-source design system contributions",
        "Design token standards (W3C, Style Dictionary)",
        "B2B or developer-facing product experience",
        "Accessibility expertise (WCAG 2.1, ARIA)",
      ]),
      tools: JSON.stringify(["Figma", "GitHub", "Storybook", "Notion", "Slack"]),
      keywords: JSON.stringify(["design systems", "components", "tokens", "accessibility", "documentation", "adoption", "cross-functional", "patterns"]),
      leadershipSignals: "Cross-functional stakeholder collaboration, defining standards across teams, driving strategy not just execution",
      stakeholderExpected: "Design leads, PMs, engineering managers across Figma product teams",
      teamClues: "6 designers on the team, 3 focused on Design Systems",
      interviewFocus: "Portfolio of design system work, systems thinking exercise, cross-functional working session",
      accessibilityMentions: "Accessibility standards, WCAG 2.1, ARIA patterns mentioned explicitly",
      designSystemsMentions: "Core focus — tokens, components, documentation, adoption are all mentioned",
    },
  });

  await prisma.jobInsight.create({
    data: {
      jobId: stripeJob.id,
      responsibilities: JSON.stringify([
        "Set design direction and strategy for payments UX",
        "Mentor and develop mid-level designers",
        "Partner with PMs and engineering on roadmaps",
        "Work with research on merchant/buyer journeys",
        "Drive design quality standards",
        "Influence cross-functional decisions at VP/director level",
      ]),
      requiredSkills: JSON.stringify([
        "Product design (8+ years)",
        "Staff-level strategy and influence",
        "Multi-surface product shipping",
        "B2B/merchant-facing product experience",
        "Excellent written communication",
        "Data-informed design",
      ]),
      preferredSkills: JSON.stringify([
        "Payments/financial services/developer tools experience",
        "API-driven product familiarity",
        "Accessibility expertise",
        "Designer management/mentorship",
      ]),
      tools: JSON.stringify(["Figma", "Notion", "Statsig", "SQL (basic)"]),
      keywords: JSON.stringify(["strategy", "staff", "payments", "merchant", "multi-surface", "roadmap", "writing", "mentorship", "data-informed"]),
      leadershipSignals: "Staff-level means defining 2-year vision, mentoring junior designers, influencing without authority at VP level",
      stakeholderExpected: "PMs, engineering, VP/director level, research",
      teamClues: "12 designers across payments, looking for someone to set direction",
      interviewFocus: "Written design proposal exercise, design strategy case studies, cross-functional leadership examples",
      strategyMentions: "Strategy mentioned 3+ times — this is a strategy-first role",
      researchMentions: "Deep merchant/buyer journey research expected",
    },
  });

  // --- Match Summaries ---
  await prisma.matchSummary.create({
    data: {
      jobId: figmaJob.id,
      strongAlignments: JSON.stringify([
        "Design systems expertise — direct match to core requirement",
        "Accessibility depth — explicitly listed as preferred",
        "Cross-functional collaboration — strong track record with eng and PMs",
        "Figma proficiency — native to the tool",
        "Token architecture experience — highly specific match",
      ]),
      likelyGaps: JSON.stringify([
        "No open-source design system contributions listed",
        "May need to show Storybook experience more explicitly",
      ]),
      storiesToEmphasize: JSON.stringify([
        "Component library rebuild — show ownership and systems thinking",
        "Token refactor that unblocked mobile team — shows cross-functional impact",
        "Accessibility audit and remediation — 40+ violations resolved systematically",
        "Adoption strategy — show you think beyond shipping",
      ]),
      recruiterPoints: "Lead with the rebuild story. Show token expertise and cross-team adoption. Emphasize accessibility as a system concern, not a checklist.",
      whyYouBasis: "I've done this exact work at scale. I've shipped systems that other teams actually use. I care about adoption as much as craft.",
      aboutYourselfBasis: "Designer who specializes in the systems layer. 6 years shipping products, last 3 deeply focused on design systems and the infrastructure that makes design scale.",
      prepQuestions: JSON.stringify([
        "What does success look like for this role in the first 90 days?",
        "How does the design systems team influence the direction of Figma's own product?",
        "What's the current state of the token architecture, and where do you want to take it?",
        "How do you handle adoption — what's worked and what hasn't?",
      ]),
    },
  });

  await prisma.matchSummary.create({
    data: {
      jobId: stripeJob.id,
      strongAlignments: JSON.stringify([
        "B2B product experience — directly applicable to merchant UX",
        "Staff-level experience — can demonstrate strategy ownership",
        "Data-informed design practice — matches Stripe's culture",
        "Cross-functional leadership at VP level",
      ]),
      likelyGaps: JSON.stringify([
        "No payments-specific experience to cite",
        "Writing sample / design proposal not yet prepared",
        "SQL comfort — may need to address this directly",
      ]),
      storiesToEmphasize: JSON.stringify([
        "Mobile checkout redesign — shows payments-adjacent thinking",
        "Design proposal example — needs to be written fresh for Stripe format",
        "Mentoring junior designer — shows leadership beyond IC contribution",
      ]),
      recruiterPoints: "Position as someone who can both define the vision and earn credibility with eng. Stripe values rigor — show your thinking process, not just outcomes.",
      whyYouBasis: "I think in systems and strategy, not just screens. I've shipped work that changed how teams operate. That's what a staff role needs.",
      aboutYourselfBasis: "Senior designer with staff-level ownership across complex B2B products. I lead through artifacts — proposals, principles, frameworks — not just pixels.",
      prepQuestions: JSON.stringify([
        "What does the payments UX vision look like today, and where is it headed?",
        "What's the relationship between the design org and product/eng leadership?",
        "How does Stripe approach the tension between developer-first tooling and end-buyer experience?",
        "What would a great design proposal look like for this role?",
      ]),
    },
  });

  // --- CV Profile ---
  await prisma.cVProfile.create({
    data: {
      name: "Ujwala Rao",
      summary: "Senior Product Designer with 7 years of experience in B2B SaaS. Deep expertise in design systems, accessibility, and cross-functional collaboration. Track record of shipping complex, high-impact products at scale.",
      skills: JSON.stringify(["Product Design", "Design Systems", "Accessibility (WCAG 2.1)", "Component Architecture", "Design Tokens", "User Research", "Figma", "Storybook", "Cross-functional Leadership", "Mentorship"]),
      domains: JSON.stringify(["B2B SaaS", "Developer Tools", "E-commerce", "Enterprise Software", "Design Infrastructure"]),
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
