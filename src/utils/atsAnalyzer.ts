import { ResumeData } from "../types";

export interface AuditFeedback {
  id: string;
  text: string;
  severity: "success" | "warning" | "error";
  category: "ats" | "human";
  scoreYield: number;
}

export interface AuditResult {
  atsScore: number;
  humanScore: number;
  feedback: AuditFeedback[];
}

// Typical AI / ChatGPT robotic cliches to flag
const REGULAR_AI_CLICHES = [
  { word: "delve", label: "'delve/delves' (overused ChatGPT signature)" },
  { word: "testament", label: "'testament to' (cliché marketing speak)" },
  { word: "comprehensive ecosystem", label: "'comprehensive ecosystem' (extreme corporate fluff)" },
  { word: "spearheaded synergy", label: "'spearheaded synergy' (redundant buzzwords)" },
  { word: "game-changing", label: "'game-changing' (informal hyperbole)" },
  { word: "disruptive", label: "'disruptive' (vague startup jargon)" },
  { word: "moreover", label: "'moreover' (written content signifier)" },
  { word: "leverage synergy", label: "'leverage synergy' (empty MBA lingo)" },
  { word: "foster collaboration", label: "'foster collaboration' (passive filler phrase)" },
  { word: "highly dynamic environment", label: "'highly dynamic environment' (generic fluff)" },
];

export function analyzeResume(resume: ResumeData): AuditResult {
  const feedback: AuditFeedback[] = [];
  
  // ==========================================
  // 1. ATS COMPLIANCE SCORING (MAX 100)
  // ==========================================
  let atsScore = 0;

  // Contact points details
  if (resume.fullName && resume.fullName.trim().length > 1) {
    atsScore += 5;
    feedback.push({
      id: "ats-fullname",
      text: "Full Name field is configured correctly.",
      severity: "success",
      category: "ats",
      scoreYield: 5
    });
  } else {
    feedback.push({
      id: "ats-fullname",
      text: "Candidate Full Name is missing, making it impossible to index.",
      severity: "error",
      category: "ats",
      scoreYield: 5
    });
  }

  if (resume.email && resume.email.includes("@")) {
    atsScore += 5;
    feedback.push({
      id: "ats-email",
      text: "Valid contact Email is parsed correctly.",
      severity: "success",
      category: "ats",
      scoreYield: 5
    });
  } else {
    feedback.push({
      id: "ats-email",
      text: "Contact email is missing or empty. Parsers reject anonymous resumes.",
      severity: "error",
      category: "ats",
      scoreYield: 5
    });
  }

  if (resume.phone && resume.phone.trim().length > 4) {
    atsScore += 5;
    feedback.push({
      id: "ats-phone",
      text: "Phone number supplied for active callbacks.",
      severity: "success",
      category: "ats",
      scoreYield: 5
    });
  } else {
    feedback.push({
      id: "ats-phone",
      text: "Add a phone number to let recruiters click and call you instantly.",
      severity: "warning",
      category: "ats",
      scoreYield: 5
    });
  }

  if (resume.location && resume.location.trim().length > 3) {
    atsScore += 5;
    feedback.push({
      id: "ats-location",
      text: "Geographic Location is defined (helps with local filter indexing).",
      severity: "success",
      category: "ats",
      scoreYield: 5
    });
  } else {
    feedback.push({
      id: "ats-location",
      text: "Location field is missing. High-paying corporate roles look for local or timezone proximity.",
      severity: "warning",
      category: "ats",
      scoreYield: 5
    });
  }

  if (resume.linkedin && resume.linkedin.trim().length > 5) {
    atsScore += 10;
    feedback.push({
      id: "ats-linkedin",
      text: "LinkedIn URL is integrated. ATS algorithms yield 12% higher placement rank with full social anchors.",
      severity: "success",
      category: "ats",
      scoreYield: 10
    });
  } else {
    feedback.push({
      id: "ats-linkedin",
      text: "LinkedIn profile missing. (+10% ATS score bump upon completion).",
      severity: "error",
      category: "ats",
      scoreYield: 10
    });
  }

  if (resume.jobTitle && resume.jobTitle.trim().length > 2) {
    atsScore += 10;
    feedback.push({
      id: "ats-jobtitle",
      text: `Target Job Title (${resume.jobTitle}) matches structured career taxonomy.`,
      severity: "success",
      category: "ats",
      scoreYield: 10
    });
  } else {
    feedback.push({
      id: "ats-jobtitle",
      text: "No Job Title defined. ATS parses by title density matched against active job postings.",
      severity: "error",
      category: "ats",
      scoreYield: 10
    });
  }

  // Professional Summary Section
  if (resume.summary && resume.summary.trim().length > 50) {
    atsScore += 10;
    feedback.push({
      id: "ats-summary",
      text: "Professional Summary is robust and parsed.",
      severity: "success",
      category: "ats",
      scoreYield: 10
    });
  } else {
    feedback.push({
      id: "ats-summary",
      text: "Add or lengthen your Professional Summary to capture key skills above the fold.",
      severity: "warning",
      category: "ats",
      scoreYield: 10
    });
  }

  // Work experiences validation
  const hasExp = resume.workExperience && resume.workExperience.length > 0;
  if (hasExp) {
    atsScore += 15;
    
    // Check points for metrics / numbers in bullets
    let metricCount = 0;
    let bulletTotal = 0;
    resume.workExperience.forEach(exp => {
      exp.description.forEach(bullet => {
        bulletTotal++;
        // check for digits, %, $, KES, million, etc.
        if (/\d|%|\$|KES|percent|throughput/gi.test(bullet)) {
          metricCount++;
        }
      });
    });

    feedback.push({
      id: "ats-work-exp",
      text: `Parsed ${resume.workExperience.length} professional career experience nodes.`,
      severity: "success",
      category: "ats",
      scoreYield: 15
    });

    if (bulletTotal > 0) {
      const metricRatio = metricCount / bulletTotal;
      if (metricRatio >= 0.4) {
        atsScore += 15;
        feedback.push({
          id: "ats-metrics",
          text: `Quantifiable metrics detected in ${Math.round(metricRatio * 100)}% of your experience bullets. High ATS pass rate validated!`,
          severity: "success",
          category: "ats",
          scoreYield: 15
        });
      } else {
        const bonusYield = Math.round(metricRatio * 15);
        atsScore += bonusYield;
        feedback.push({
          id: "ats-metrics",
          text: `Only ${Math.round(metricRatio * 100)}% of experience statements hold quantifiable results. Boost to 40%+ to easily pass ATS keywords (+${15 - bonusYield} pts leftover).`,
          severity: "warning",
          category: "ats",
          scoreYield: 15
        });
      }
    } else {
      feedback.push({
        id: "ats-bullets",
        text: "Please add bullet point descriptions under your Work Experience timeline.",
        severity: "error",
        category: "ats",
        scoreYield: 15
      });
    }
  } else {
    feedback.push({
      id: "ats-work-exp",
      text: "No professional experience listed. Career node is blank.",
      severity: "error",
      category: "ats",
      scoreYield: 30
    });
  }

  // Core Tech Skills
  const skillsCount = resume.skills?.length || 0;
  if (skillsCount >= 6) {
    atsScore += 15;
    feedback.push({
      id: "ats-skills",
      text: `Included ${skillsCount} core proficiency tags (excellent keyword density for target parsing).`,
      severity: "success",
      category: "ats",
      scoreYield: 15
    });
  } else if (skillsCount > 0) {
    const yieldPts = Math.round((skillsCount / 6) * 15);
    atsScore += yieldPts;
    feedback.push({
      id: "ats-skills",
      text: `Define at least 6 technical/professional skills to satisfy cross-referencing algorithms. Currently have ${skillsCount} (+${15 - yieldPts} pts left).`,
      severity: "warning",
      category: "ats",
      scoreYield: 15
    });
  } else {
    feedback.push({
      id: "ats-skills",
      text: "Technical skills inventory is empty. Add core proficiencies to list keywords.",
      severity: "error",
      category: "ats",
      scoreYield: 15
    });
  }

  // Projects / Portfolio
  const projCount = resume.projects?.length || 0;
  if (projCount > 0) {
    atsScore += 10;
    feedback.push({
      id: "ats-projects",
      text: `Registered ${projCount} portfolio projects. Validates real-world execution.`,
      severity: "success",
      category: "ats",
      scoreYield: 10
    });
  } else {
    feedback.push({
      id: "ats-projects",
      text: "Add at least one technical project / case study to exhibit self-led proof of concept.",
      severity: "warning",
      category: "ats",
      scoreYield: 10
    });
  }

  // Ensure ATS bounds are safe
  atsScore = Math.min(100, Math.max(0, atsScore));


  // ==========================================
  // 2. HUMANIZATION SCORING (MAX 100)
  // ==========================================
  let humanScore = 100;
  let clichesFound: string[] = [];

  // Inspect summary and bullets for generic AI word sequences
  const fullTextToInspect = [
    resume.summary || "",
    ...((resume.workExperience || []).flatMap(e => e.description || [])),
    ...((resume.projects || []).map(p => p.description || ""))
  ].join(" ").toLowerCase();

  REGULAR_AI_CLICHES.forEach(item => {
    if (fullTextToInspect.includes(item.word)) {
      clichesFound.push(item.label);
      humanScore -= 12; // Deduct for each automated robotic cliche
    }
  });

  // Action verbs check
  // Best professional resume bullets start with active verbs
  let nonActiveCount = 0;
  let activeCount = 0;
  const activeVerbsList = [
    "engineer", "engineered", "automate", "automated", "restruct", "restructured",
    "overhaul", "overhauled", "built", "design", "designed", "develop", "developed",
    "scale", "scaled", "launch", "launched", "manag", "managed", "led", "decreased",
    "reduced", "saving", "boosted", "accelerated", "redefined", "authored", "implement", "implemented"
  ];

  if (resume.workExperience && resume.workExperience.length > 0) {
    resume.workExperience.forEach(exp => {
      exp.description.forEach(bullet => {
        const trimmed = bullet.trim().toLowerCase();
        if (trimmed.length > 0) {
          const firstWord = trimmed.split(/\s+/)[0].replace(/[^a-z]/g, "");
          const hasActive = activeVerbsList.some(v => firstWord.startsWith(v) || v.startsWith(firstWord));
          if (hasActive) {
            activeCount++;
          } else {
            nonActiveCount++;
          }
        }
      });
    });
  }

  if (clichesFound.length > 0) {
    feedback.push({
      id: "human-cliches",
      text: `AI Clichés/Boilerplate found: ${clichesFound.join(", ")}. Tap 'Deep Humanize' to rewrite in genuine local/business prose.`,
      severity: "warning",
      category: "human",
      scoreYield: clichesFound.length * 10
    });
  } else {
    feedback.push({
      id: "human-cliches",
      text: "Exceptional! No typical AI template phrases or ChatGPT robotic clichés detected.",
      severity: "success",
      category: "human",
      scoreYield: 25
    });
  }

  const totalVerbs = activeCount + nonActiveCount;
  if (totalVerbs > 0) {
    const activeVerbRatio = activeCount / totalVerbs;
    if (activeVerbRatio >= 0.7) {
      feedback.push({
        id: "human-verbs",
        text: `Superb phrasing: ${Math.round(activeVerbRatio * 100)}% of statements start with active, dynamic business action verbs.`,
        severity: "success",
        category: "human",
        scoreYield: 15
      });
    } else {
      const deduction = Math.round((1 - activeVerbRatio) * 15);
      humanScore -= deduction;
      feedback.push({
        id: "human-verbs",
        text: `Several experience bullets use passive phrasing or label-based formats. Make them start with direct verbs for better reader flow.`,
        severity: "warning",
        category: "human",
        scoreYield: 15
      });
    }
  }

  // Core formatting rhythm and flow
  if (resume.summary && (resume.summary.length < 100 || resume.summary.length > 500)) {
    humanScore -= 5;
    feedback.push({
      id: "human-rhythm",
      text: "Professional Summary is slightly out of focus (ideal length is 2-4 lines/150-400 chars for clean human rhythm).",
      severity: "warning",
      category: "human",
      scoreYield: 5
    });
  } else if (resume.summary) {
    feedback.push({
      id: "human-rhythm",
      text: "The summary captures appropriate reader attention length and professional prose.",
      severity: "success",
      category: "human",
      scoreYield: 5
    });
  }

  // Ensure bounds are safe
  humanScore = Math.min(100, Math.max(45, humanScore));

  return {
    atsScore,
    humanScore,
    feedback
  };
}
