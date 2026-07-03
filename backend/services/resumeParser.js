const fs = require("fs");
const pdfParse = require("pdf-parse");

// A reasonably broad keyword bank for tech resumes. This is intentionally
// simple (no AI call) so Phase 2 works without any API key. Phase 4 can
// layer an AI pass on top of this extracted text for deeper analysis.
const SKILL_KEYWORDS = [
  "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Rust",
  "React", "Next.js", "Vue", "Angular", "Node.js", "Express", "Django",
  "Flask", "Spring Boot", "MongoDB", "MySQL", "PostgreSQL", "Redis",
  "GraphQL", "REST API", "Docker", "Kubernetes", "AWS", "Azure", "GCP",
  "CI/CD", "Git", "GitHub", "Jenkins", "Tailwind", "Bootstrap", "HTML",
  "CSS", "Sass", "Webpack", "Vite", "Jest", "Mocha", "Cypress",
  "Machine Learning", "TensorFlow", "PyTorch", "Pandas", "NumPy",
  "Firebase", "Supabase", "Prisma", "Mongoose", "Socket.io", "JWT",
  "OAuth", "Microservices", "Linux", "Bash", "System Design",
  "Data Structures", "Algorithms", "OOP", "Agile", "Scrum",
];

const SECTION_HEADERS = {
  experience: /(work experience|professional experience|experience)/i,
  education: /(education|academic background)/i,
  projects: /(projects|personal projects)/i,
};

function extractSkills(text) {
  const found = new Set();
  for (const skill of SKILL_KEYWORDS) {
    const pattern = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (pattern.test(text)) found.add(skill);
  }
  return Array.from(found);
}

// Naively splits the resume into labeled sections based on common headers,
// then returns non-empty trimmed lines for each — good enough for a first
// pass without calling an AI model.
function extractSection(text, regex) {
  const lines = text.split("\n").map((l) => l.trim());
  const startIdx = lines.findIndex((l) => regex.test(l));
  if (startIdx === -1) return [];

  const rest = lines.slice(startIdx + 1);
  const nextHeaderIdx = rest.findIndex((l) =>
    Object.values(SECTION_HEADERS).some((r) => r.test(l) && l.length < 40)
  );
  const sectionLines = nextHeaderIdx === -1 ? rest : rest.slice(0, nextHeaderIdx);

  return sectionLines.filter((l) => l.length > 3).slice(0, 15);
}

async function parseResumeFile(filePath) {
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  const text = data.text || "";

  return {
    extractedText: text,
    skills: extractSkills(text),
    experience: extractSection(text, SECTION_HEADERS.experience),
    education: extractSection(text, SECTION_HEADERS.education),
    projects: extractSection(text, SECTION_HEADERS.projects),
  };
}

module.exports = { parseResumeFile, extractSkills };
