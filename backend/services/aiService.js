// AI question generation service.
// Tries Gemini first (primary), falls back to Grok if Gemini fails or isn't
// configured, and falls back to a safe static question if both fail —
// so the app never breaks even without an AI key.

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const GROK_URL = "https://api.x.ai/v1/chat/completions";

function buildPrompt({ role, type, difficulty, resumeText }) {
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

function extractJson(text) {
  const cleaned = text.replace(/```json|```/g, "").trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON object found in AI response");
  return JSON.parse(match[0]);
}

async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

  const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.8, maxOutputTokens: 300 },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned no text content");

  return extractJson(text).question;
}

async function callGrok(prompt) {
  const apiKey = process.env.GROK_API_KEY;
  if (!apiKey) throw new Error("GROK_API_KEY not configured");

  const response = await fetch(GROK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "grok-3-latest",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 300,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Grok API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("Grok returned no text content");

  return extractJson(text).question;
}

async function generateOpeningQuestion({ role, type, difficulty, resumeText }) {
  const prompt = buildPrompt({ role, type, difficulty, resumeText });

  try {
    return await callGemini(prompt);
  } catch (geminiErr) {
    console.warn("Gemini question generation failed, falling back to Grok:", geminiErr.message);
    try {
      return await callGrok(prompt);
    } catch (grokErr) {
      console.warn("Grok question generation also failed, using static fallback:", grokErr.message);
      return `Tell me a bit about yourself and why you're interested in the ${role} role.`;
    }
  }
}

module.exports = { generateOpeningQuestion };
