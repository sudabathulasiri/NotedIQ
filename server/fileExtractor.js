const Groq = require("groq-sdk");
const { PDFParse } = require("pdf-parse");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Extracts raw text from an uploaded file (TXT, PDF, or JPG/PNG image).
 * @param {Buffer} buffer The raw file buffer.
 * @param {string} mimeType The file's MIME type.
 * @param {string} filename The original filename.
 * @returns {Promise<string>} The extracted text.
 */
async function extractTextFromFile(buffer, mimeType, filename) {
  const ext = filename.split(".").pop().toLowerCase();

  // 1. Text file
  if (mimeType.startsWith("text/") || ext === "txt") {
    return buffer.toString("utf-8");
  }

  // 2. PDF file
  if (mimeType === "application/pdf" || ext === "pdf") {
    try {
      const parser = new PDFParse({ data: buffer });
      const data = await parser.getText();
      return data.text || "";
    } catch (err) {
      console.error("PDF Parsing failed:", err);
      throw new Error(`Failed to parse PDF: ${err.message}`);
    }
  }

  // 3. Image OCR (JPG, JPEG, PNG, WEBP)
  if (mimeType.startsWith("image/") || ["jpg", "jpeg", "png", "webp"].includes(ext)) {
    try {
      const base64Data = buffer.toString("base64");
      const resolvedMime = mimeType.startsWith("image/") ? mimeType : `image/${ext === "jpg" ? "jpeg" : ext}`;

      console.log(`🤖 Invoking Groq Vision model for OCR on image: ${filename}`);
      const completion = await groq.chat.completions.create({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Please perform optical character recognition (OCR) on this image. Extract and transcribe all visible text. Preserve paragraphs, tables, and spacing where appropriate. Output ONLY the transcribed text. Do NOT wrap your output in conversational filler, markdown code fences, or explanations. If no text is readable, output '(No readable text found)'."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${resolvedMime};base64,${base64Data}`
                }
              }
            ]
          }
        ],
        temperature: 0.1,
        max_tokens: 1500,
      });

      const resultText = completion.choices[0]?.message?.content?.trim() || "";
      return resultText;
    } catch (err) {
      console.error("Image OCR via Groq failed:", err);
      throw new Error(`Failed to perform OCR on image: ${err.message}`);
    }
  }

  throw new Error(`Unsupported file type: ${mimeType || ext}`);
}

module.exports = { extractTextFromFile };
