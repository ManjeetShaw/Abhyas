// AI question generation + answer evaluation service.
// Tries Gemini first (primary), falls back to Groq if Gemini fails or isn't
// configured, and falls back to safe static responses if both fail — so the
// app never breaks even without an AI key.

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

function extractJson(text) {
  const cleaned = text.replace(/```json|```/g, "").trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON object found in AI response");
  return JSON.parse(match[0]);
}

async function callGeminiRaw(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

  const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.8, maxOutputTokens: 350 },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned no text content");
  return text;
}

async function callGroqRaw(prompt) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY not configured");

  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 350,
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

// Runs a prompt through Gemini, falling back to Groq on failure. Returns the
// raw text response — caller is responsible for parsing it.
async function runWithFallback(prompt) {
  try {
    return await callGeminiRaw(prompt);
  } catch (geminiErr) {
    console.warn("Gemini call failed, falling back to Groq:", geminiErr.message);
    return await callGroqRaw(prompt);
  }
}

// ---------- Opening question (Phase 4) ----------

function buildOpeningPrompt({ role, type, difficulty, resumeText }) {
  const resumeContext = resumeText
    ? `Candidate's resume excerpt (use this to personalize the question):\n"""${resumeText.slice(
        0,
        2000
      )}"""`
    : "No resume was provided — ask a general opening question for this role.";

  return `You are a senior ${type} interviewer conducting a ${difficulty}-difficulty mock interview for the role of "${role}".

${resumeContext}

Generate ONE strong opening interview question. It should be specific and, if resume context is available, reference something concrete from it (a real project, technology, or experience).

Respond with ONLY valid JSON in this exact shape, no markdown fences, no extra text:
{"question": "the interview question text"}`;
}

async function generateOpeningQuestion({ role, type, difficulty, resumeText }) {
  const prompt = buildOpeningPrompt({ role, type, difficulty, resumeText });
  try {
    const rawText = await runWithFallback(prompt);
    return extractJson(rawText).question;
  } catch (err) {
    console.warn("Opening question generation failed entirely, using static fallback:", err.message);
    return `Tell me a bit about yourself and why you're interested in the ${role} role.`;
  }
}

// ---------- Answer evaluation + follow-up (Phase 5) ----------

function buildEvaluationPrompt({ role, type, difficulty, resumeText, history, isFinalRound }) {
  const resumeContext = resumeText
    ? `Candidate's resume excerpt:\n"""${resumeText.slice(0, 1500)}"""`
    : "No resume on file.";

  const transcript = history
    .map((h, i) => `Q${i + 1}: ${h.question}\nCandidate's answer: ${h.answer}`)
    .join("\n\n");

  const followUpInstruction = isFinalRound
    ? `This is the FINAL question of the interview. Set "followUpQuestion" to null — do not ask another question.`
    : `Generate ONE natural, specific follow-up question that digs deeper into the candidate's last answer (or moves to a new relevant angle if their answer was thin). Put it in "followUpQuestion".`;

  return `You are a senior ${type} interviewer running a ${difficulty}-difficulty mock interview for the role of "${role}".

${resumeContext}

Interview transcript so far:
${transcript}

Evaluate the candidate's MOST RECENT answer (the last one in the transcript above). Then ${followUpInstruction}

Respond with ONLY valid JSON in this exact shape, no markdown fences, no extra text:
{"feedback": "1-2 sentences of specific, constructive feedback on the last answer", "score": <integer 1-10>, "followUpQuestion": "the next question text, or null if this was the final round"}`;
}

async function evaluateAnswer({ role, type, difficulty, resumeText, history, isFinalRound }) {
  const prompt = buildEvaluationPrompt({ role, type, difficulty, resumeText, history, isFinalRound });
  try {
    const rawText = await runWithFallback(prompt);
    return extractJson(rawText);
  } catch (err) {
    console.warn("Answer evaluation failed entirely, using static fallback:", err.message);
    return {
      feedback: "Thanks for your answer — noted. (AI evaluation is temporarily unavailable.)",
      score: 6,
      followUpQuestion: isFinalRound
        ? null
        : "Can you walk me through a challenge you faced in a recent project and how you solved it?",
    };
  }
}

module.exports = { generateOpeningQuestion, evaluateAnswer };
