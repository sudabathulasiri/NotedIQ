/**
 * studentProcessor.js
 * AI-powered lecture note processor using Groq (llama3-70b)
 */

const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function processStudent(rawText) {
  const prompt = `
You are an expert academic tutor AI (Microsoft Foundry IQ). A student has given you raw, messy lecture notes or shorthand text. Your job is to transform this into a structured study document.

Raw student input:
"${rawText}"

You must respond with a valid JSON object only — no markdown, no explanation, just raw JSON.

The JSON must follow this exact structure:
{
  "corrected": "A cleaned-up, grammatically correct version of the input",
  "blocks": [
    {
      "type": "heading",
      "content": "The main topic title"
    },
    {
      "type": "definition",
      "content": "Term: clear academic definition of a key concept from the notes"
    },
    {
      "type": "example",
      "content": "A concrete real-world or code example illustrating the concept"
    },
    {
      "type": "exam-alert",
      "content": "A critical fact or common exam trap related to this topic"
    },
    {
      "type": "riddle",
      "content": "A fun logic-based riddle or quiz question to test understanding of the topic. Include the answer at the end in brackets like [Answer: ...]"
    },
    {
      "type": "note",
      "content": "Any additional context or insight worth remembering"
    }
  ]
}

Rules:
- Always start blocks with a "heading" block for the main topic
- Include at least 1 definition, 1 example, 1 exam-alert, 1 riddle, and 1 note
- Base all content on real, accurate academic knowledge about the topic
- If the input mentions multiple concepts, cover each one
- Keep content concise but informative
- Return ONLY the JSON object, nothing else
`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const raw = completion.choices[0]?.message?.content?.trim() || "{}";
    console.log("🤖 Groq raw response:", raw); // ✅ ADD THIS LINE
    // Strip any accidental markdown fences
    const cleaned = raw.replace(/^```json|^```|```$/gm, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      corrected: parsed.corrected || rawText,
      blocks: parsed.blocks || [],
    };
  } catch (err) {
    console.error("Groq studentProcessor error:", err.message);
    // Fallback block on error
    return {
      corrected: rawText,
      blocks: [
        { type: "heading", content: "Note Processing Error" },
        { type: "note", content: `Could not process notes: ${err.message}` },
      ],
    };
  }
}

module.exports = { processStudent };