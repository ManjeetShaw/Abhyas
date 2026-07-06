// AI question generation + answer evaluation service.
// Uses Groq (free tier, no billing required) as the sole AI provider.
// Falls back to safe static responses if the Groq call fails for any
// reason — so the app never breaks even without a working key.

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

function extractJson(text) {
  const cleaned = text.replace(/```json|```/g, "").trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON object found in AI response");
  return JSON.parse(match[0]);
}

const PERSONA_STYLES = {
  "Friendly HR": "warm, encouraging, and conversational — you put candidates at ease, focus on culture fit and soft skills, and phrase feedback gently",
  "Strict FAANG Interviewer": "rigorous, terse, and exacting — you push hard on depth, correctness, and edge cases, and don't sugarcoat weak answers",
  "Startup Founder": "fast-paced, pragmatic, and scrappy — you care about ownership, resourcefulness, and getting things done over textbook perfection",
  "Senior Engineer": "calm, technically precise, and mentor-like — you probe for genuine understanding and give constructive, detailed feedback",
};

function personaStyle(personality) {
  return PERSONA_STYLES[personality] || PERSONA_STYLES["Senior Engineer"];
}

async function callGroq(prompt) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY not configured");

  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 400,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("Groq returned no text content");
  return text;
}

// ---------- Opening question (Phase 4) ----------

function buildOpeningPrompt({ role, type, difficulty, resumeText, personality, codingRound }) {
  const resumeContext = resumeText
    ? `Candidate's resume excerpt (use this to personalize the question):\n"""${resumeText.slice(
        0,
        2000
      )}"""`
    : "No resume was provided — ask a general opening question for this role.";

  const style = personaStyle(personality);
  const codingInstruction = codingRound
    ? " This is a CODING ROUND — ask a specific coding/algorithm problem the candidate should solve by writing code, not a conversational question."
    : "";

  return `You are a ${personality || "Senior Engineer"} interviewer — your style is ${style}. You are conducting a ${difficulty}-difficulty ${type} mock interview for the role of "${role}".${codingInstruction}

${resumeContext}

Generate ONE strong opening interview question${codingRound ? " (a coding problem)" : ""}. ${
    codingRound
      ? "State the problem clearly, including any input/output expectations."
      : "It should be specific and, if resume context is available, reference something concrete from it (a real project, technology, or experience)."
  }

Respond with ONLY valid JSON in this exact shape, no markdown fences, no extra text:
{"question": "the interview question text"}`;
}

async function generateOpeningQuestion({ role, type, difficulty, resumeText, personality, codingRound }) {
  const prompt = buildOpeningPrompt({ role, type, difficulty, resumeText, personality, codingRound });
  try {
    const rawText = await callGroq(prompt);
    return extractJson(rawText).question;
  } catch (err) {
    console.warn("Opening question generation failed, using static fallback:", err.message);
    return codingRound
      ? `Write a function that solves a common ${role}-relevant coding problem of your choice, and explain your approach.`
      : `Tell me a bit about yourself and why you're interested in the ${role} role.`;
  }
}

// ---------- Answer evaluation + follow-up (Phase 5 + 6) ----------

function buildEvaluationPrompt({
  role,
  type,
  difficulty,
  resumeText,
  history,
  isFinalRound,
  personality,
  codingRound,
}) {
  const resumeContext = resumeText
    ? `Candidate's resume excerpt:\n"""${resumeText.slice(0, 1500)}"""`
    : "No resume on file.";

  const transcript = history
    .map((h, i) => {
      const answerBlock = h.language
        ? `Candidate's code (${h.language}):\n\`\`\`${h.language}\n${h.answer}\n\`\`\``
        : `Candidate's answer: ${h.answer}`;
      return `Q${i + 1}: ${h.question}\n${answerBlock}`;
    })
    .join("\n\n");

  const style = personaStyle(personality);
  const followUpInstruction = isFinalRound
    ? `This is the FINAL question of the interview. Set "followUpQuestion" to null — do not ask another question.`
    : codingRound
    ? `Generate ONE new coding/algorithm problem as the next question (or a variation/extension of the last one). Put it in "followUpQuestion".`
    : `Generate ONE natural, specific follow-up question that digs deeper into the candidate's last answer (or moves to a new relevant angle if their answer was thin). Put it in "followUpQuestion".`;

  const evalNote = codingRound
    ? "Evaluate the code for correctness, efficiency, and style (treat technicalAccuracy as code correctness/efficiency)."
    : "";

  return `You are a ${personality || "Senior Engineer"} interviewer — your style is ${style}. You are running a ${difficulty}-difficulty ${type} mock interview for the role of "${role}".

${resumeContext}

Interview transcript so far:
${transcript}

Evaluate the candidate's MOST RECENT answer (the last one in the transcript above) on four dimensions, each scored 1-10:
- clarity: how clearly they communicated their answer
- technicalAccuracy: correctness/depth of technical content (for non-technical rounds, judge relevance and soundness of reasoning instead)
- completeness: whether they fully addressed the question
- confidence: how confident and decisive the answer sounded
${evalNote}

Then ${followUpInstruction}

Respond with ONLY valid JSON in this exact shape, no markdown fences, no extra text:
{"feedback": "1-2 sentences of specific, constructive feedback on the last answer", "clarity": <1-10>, "technicalAccuracy": <1-10>, "completeness": <1-10>, "confidence": <1-10>, "followUpQuestion": "the next question text, or null if this was the final round"}`;
}

async function evaluateAnswer({
  role,
  type,
  difficulty,
  resumeText,
  history,
  isFinalRound,
  personality,
  codingRound,
}) {
  const prompt = buildEvaluationPrompt({
    role,
    type,
    difficulty,
    resumeText,
    history,
    isFinalRound,
    personality,
    codingRound,
  });
  try {
    const rawText = await callGroq(prompt);
    const parsed = extractJson(rawText);
    const dims = [parsed.clarity, parsed.technicalAccuracy, parsed.completeness, parsed.confidence];
    const score = Math.round(dims.reduce((a, b) => a + b, 0) / dims.length);
    return { ...parsed, score };
  } catch (err) {
    console.warn("Answer evaluation failed, using static fallback:", err.message);
    return {
      feedback: "Thanks for your answer — noted. (AI evaluation is temporarily unavailable.)",
      clarity: 6,
      technicalAccuracy: 6,
      completeness: 6,
      confidence: 6,
      score: 6,
      followUpQuestion: isFinalRound
        ? null
        : codingRound
        ? "Write a function to reverse a linked list."
        : "Can you tell me about another project or experience relevant to this role?",
    };
  }
}

// ---------- Session summary (Phase 7) ----------

function buildSummaryPrompt({ role, type, difficulty, history }) {
  const transcript = history
    .map(
      (h, i) =>
        `Q${i + 1}: ${h.question}\nAnswer: ${h.answer}\nScores — clarity:${h.clarity}, technicalAccuracy:${h.technicalAccuracy}, completeness:${h.completeness}, confidence:${h.confidence}`
    )
    .join("\n\n");

  return `You are a senior ${type} interviewer wrapping up a ${difficulty}-difficulty mock interview for the role of "${role}".

Full transcript with per-answer scores:
${transcript}

Write a short overall session summary. Identify 2-4 genuine strengths, 2-4 weak areas to improve, and 2-3 specific topics the candidate should study next.

Respond with ONLY valid JSON in this exact shape, no markdown fences, no extra text:
{"summary": "2-3 sentence overall summary", "strengths": ["...", "..."], "weakAreas": ["...", "..."], "recommendedTopics": ["...", "..."]}`;
}

async function generateSessionSummary({ role, type, difficulty, history }) {
  const prompt = buildSummaryPrompt({ role, type, difficulty, history });
  try {
    const rawText = await callGroq(prompt);
    return extractJson(rawText);
  } catch (err) {
    console.warn("Session summary generation failed, using static fallback:", err.message);
    return {
      summary: `Completed a ${difficulty}-difficulty ${type} interview for ${role} across ${history.length} questions.`,
      strengths: [],
      weakAreas: [],
      recommendedTopics: [],
    };
  }
}

// ---------- ATS Resume Score (Phase 9) ----------

function buildAtsPrompt({ resumeText, jobDescription }) {
  return `You are an ATS (Applicant Tracking System) resume screening engine.

Job description:
"""${jobDescription.slice(0, 3000)}"""

Candidate's resume:
"""${resumeText.slice(0, 3000)}"""

Score how well this resume matches the job description as an ATS would (0-100), list important keywords/skills from the job description that are MISSING from the resume, and give 2-4 concrete, actionable suggestions to improve the match.

Respond with ONLY valid JSON in this exact shape, no markdown fences, no extra text:
{"atsScore": <integer 0-100>, "missingKeywords": ["...", "..."], "suggestions": ["...", "..."]}`;
}

async function scoreResumeAts({ resumeText, jobDescription }) {
  const prompt = buildAtsPrompt({ resumeText, jobDescription });
  try {
    const rawText = await callGroq(prompt);
    return extractJson(rawText);
  } catch (err) {
    console.warn("ATS scoring failed, using static fallback:", err.message);
    return {
      atsScore: null,
      missingKeywords: [],
      suggestions: [
        "AI scoring is temporarily unavailable — try again in a moment.",
      ],
    };
  }
}

module.exports = { generateOpeningQuestion, evaluateAnswer, generateSessionSummary, scoreResumeAts };
