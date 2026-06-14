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
      "type": "banner-title",
      "content": "The main topic title (brief and academic)"
    },
    {
      "type": "bullet-list",
      "heading": "Brief topic of this list",
      "items": [
        { "term": "Term/Concept Name 1", "note": "brief summary description" },
        { "term": "Term/Concept Name 2", "note": "brief summary description" }
      ]
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
      "type": "mindmap",
      "center": "Core central concept of the breakdown",
      "branches": [
        "Branch/Category 1",
        "Branch/Category 2",
        "Branch/Category 3",
        "Branch/Category 4",
        "Branch/Category 5",
        "Branch/Category 6"
      ]
    },
    {
      "type": "flowchart",
      "style": "cycle",
      "nodes": [
        { "id": "node1", "label": "First phase/state" },
        { "id": "node2", "label": "Second phase/state" },
        { "id": "node3", "label": "Third phase/state" },
        { "id": "node4", "label": "Fourth phase/state" }
      ],
      "edges": [
        { "from": "node1", "to": "node2", "label": "transition 1 label" },
        { "from": "node2", "to": "node3", "label": "transition 2 label" },
        { "from": "node3", "to": "node4", "label": "transition 3 label" },
        { "from": "node4", "to": "node1", "label": "transition 4 label" }
      ]
    },
    {
      "type": "highlight-box",
      "term": "Important Warning / Key Mathematical Formula",
      "content": "Description of the critical academic fact or exam warning"
    },
    {
      "type": "structure-grid",
      "heading": "Comparison Grid Title",
      "items": [
        { "label": "Item 1 Name", "points": ["Brief structural point 1"] },
        { "label": "Item 2 Name", "points": ["Brief structural point 2"] },
        { "label": "Item 3 Name", "points": ["Brief structural point 3"] },
        { "label": "Item 4 Name", "points": ["Brief structural point 4"] }
      ]
    },
    {
      "type": "riddle",
      "content": "A fun logic-based riddle or quiz question to test understanding of the topic. Include the answer at the end in brackets like [Answer: ...]"
    }
  ]
}

Rules:
- The first block must always be a "banner-title" block.
- For longer transcripts (such as 1 to 3-hour classes), you must generate a highly detailed and exhaustive study guide. Create as many "definition", "example", "bullet-list", and "note" blocks as necessary (typically 15 to 30 blocks in total) to cover all key topics, terms, and details thoroughly.
- Include exactly one "mindmap", exactly one "flowchart", exactly one "highlight-box", exactly one "structure-grid", and exactly one "riddle" block as high-level summary resources.
- Keep the mindmap branches list to exactly 6 items.
- Keep the flowchart nodes to exactly 4 items, forming a logical cycle.
- Keep the structure-grid items to exactly 4 items.
- Return ONLY the JSON object, nothing else.`;

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