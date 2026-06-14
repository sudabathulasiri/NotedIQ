/**
 * youtubeProcessor.js
 * Extracts transcript from a YouTube URL
 */

const { YoutubeTranscript } = require("youtube-transcript");

function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&\s]+)/,
    /(?:youtu\.be\/)([^?\s]+)/,
    /(?:youtube\.com\/embed\/)([^?\s]+)/,
    /(?:youtube\.com\/shorts\/)([^?\s]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

async function getTranscript(youtubeUrl) {
  const videoId = extractVideoId(youtubeUrl);

  if (!videoId) {
    throw new Error("Could not extract video ID from URL. Please check the URL.");
  }

  try {
    const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);

    // Join all transcript pieces into one clean string
    const fullText = transcriptItems
      .map(item => item.text)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    if (!fullText) {
      throw new Error("Transcript is empty. The video may not have captions enabled.");
    }

    // Limit to ~40000 words to avoid token overflow (easily fits llama 128k context)
    const words = fullText.split(" ");
    const truncated = words.slice(0, 40000).join(" ");
    const wasTruncated = words.length > 40000;

    return {
      videoId,
      transcript: truncated,
      truncated: wasTruncated,
      wordCount: words.length,
    };
  } catch (err) {
    if (err.message.includes("Could not get transcripts")) {
      throw new Error("This video has no captions/transcript available. Try a different video or use text input instead.");
    }
    throw err;
  }
}

module.exports = { getTranscript, extractVideoId };