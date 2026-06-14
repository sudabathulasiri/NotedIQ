/**
 * corporateProcessor.js
 * AI-powered meeting notes processor using Groq (llama3-70b)
 * Features: name grounding, MoM generation, action item extraction
 */

const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Mock internal org graph — simulates Microsoft Work IQ employee directory
const ORG_GRAPH = {
  srinivas:  { full: "Srinivas Sudabathula", role: "Lead Systems Architect" },
  srini:     { full: "Srinivas Sudabathula", role: "Lead Systems Architect" },
  priya:     { full: "Priya Nair",           role: "Senior Product Manager" },
  raj:       { full: "Raj Mehta",            role: "DevOps Engineer" },
  alice:     { full: "Alice Chen",           role: "Frontend Lead" },
  bob:       { full: "Bob Martinez",         role: "QA Engineer" },
  john:      { full: "John Williams",        role: "Backend Developer" },
  sarah:     { full: "Sarah Thompson",       role: "Scrum Master" },
  mike:      { full: "Mike Johnson",         role: "Data Engineer" },
  ananya:    { full: "Ananya Krishnan",      role: "UI/UX Designer" },
  vikram:    { full: "Vikram Patel",         role: "CTO" },
};

// Pre-resolve short names in raw text before sending to AI
function groundNames(text) {
  let grounded = text;
  Object.entries(ORG_GRAPH).forEach(([shortName, info]) => {
    const regex = new RegExp(`\\b${shortName}\\b`, "gi");
    grounded = grounded.replace(regex, `${info.full} (${info.role})`);
  });
  return grounded;
}

async function processCorporate(rawText) {
  const groundedText = groundNames(rawText);

  const prompt = `
You are an elite corporate AI assistant (Microsoft Work IQ). An employee has given you raw, messy meeting notes or minutes. Your job is to transform this into a professional enterprise document.

Raw meeting notes (with resolved employee names):
"${groundedText}"

You must respond with a valid JSON object only — no markdown, no explanation, just raw JSON.

The JSON must follow this exact structure:
{
  "corrected": "A professionally written, cleaned-up version of the meeting notes",
  "blocks": [
    {
      "type": "banner-title",
      "content": "The meeting topic or subject (brief, e.g. Q3 Planning Sync)"
    },
    {
      "type": "decision",
      "content": "A formal decision or conclusion reached in the meeting"
    },
    {
      "type": "task-item",
      "content": "A specific action item with owner and deadline",
      "assignee": "Full Name (Role)",
      "priority": "high | medium | low",
      "deadline": "Specific date or relative deadline like 'by next Friday'"
    }
  ]
}

Rules:
- The first block must always be a "banner-title" block summarizing the meeting topic/subject
- Extract ALL decisions made in the meeting as "decision" blocks
- Extract ALL action items / follow-ups as "task-item" blocks
- For task-items, always include assignee (use full name + role from the notes), priority, and deadline
- If no deadline is mentioned, infer a reasonable one (e.g. "by end of week")
- If no assignee is clear, use "Team"
- Priority: "high" if urgent/critical/blocker, "medium" if normal, "low" if nice-to-have
- Be professional and concise — this is an official MoM document
- Return ONLY the JSON object, nothing else
`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 2000,
    });

    const raw = completion.choices[0]?.message?.content?.trim() || "{}";
    const cleaned = raw.replace(/^```json|^```|```$/gm, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      corrected: parsed.corrected || groundedText,
      blocks: parsed.blocks || [],
    };
  } catch (err) {
    console.error("Groq corporateProcessor error:", err.message);
    return {
      corrected: groundedText,
      blocks: [
        { type: "decision", content: `Could not process meeting notes: ${err.message}` },
      ],
    };
  }
}

module.exports = { processCorporate };