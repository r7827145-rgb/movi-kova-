import { Router } from "express";
import Groq, { toFile } from "groq-sdk";

const router = Router();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MOVIES = [
  { id: "dune3", title: "DUNE: PART THREE", genres: ["sci-fi", "epic", "drama"], director: "Denis Villeneuve" },
  { id: "missionx", title: "MISSION: IMPOSSIBLE — THE FINAL RECKONING", genres: ["action", "thriller"], director: "Christopher McQuarrie" },
  { id: "andromeda", title: "ANDROMEDA PROTOCOL", genres: ["sci-fi", "mystery", "thriller"] },
  { id: "phantom", title: "THE PHANTOM HOUR", genres: ["thriller", "mystery", "horror"] },
  { id: "solstice", title: "SOLSTICE", genres: ["drama", "romance"], director: "Celine Song" },
  { id: "ironclad", title: "IRONCLAD", genres: ["action", "history"], director: "Ridley Scott" },
];

const MOVIE_LIST_FOR_PROMPT = MOVIES.map(m => `- id: "${m.id}", title: "${m.title}", genres: [${m.genres.join(", ")}]`).join("\n");
const MOVIE_LIST_FOR_PROMPT_POSTER = MOVIES.map(m => `- id: "${m.id}", title: "${m.title}"`).join("\n");

const MOOD_SYSTEM_PROMPT = `You are a mood-based movie recommendation AI for Movi Kova cinema.

Our catalogue:
${MOVIE_LIST_FOR_PROMPT}

Mood → Genre mapping rules:
- happy → comedy, animation, musical, feel-good drama
- sad → comfort drama, romance, uplifting story
- stressed → slice-of-life, light comedy, calming drama
- bored → action, thriller, adventure, sci-fi
- romantic → romance, dramedy, love story
- adventurous → action, adventure, sci-fi, epic
- nostalgic → classic, drama, history, period piece
- scared → horror, psychological thriller
- excited → action, sci-fi, blockbuster, epic
- relaxed → drama, romance, slice-of-life

For suggested_movies: prefer our catalogue first (use the id field when suggesting one of our movies, leave id empty for external suggestions). Score = 0.6*mood_match + 0.3*genre_fit + 0.1*popularity.

Always return ONLY valid JSON, no other text.`;

const MOOD_OUTPUT_SCHEMA = `Return exactly this JSON schema:
{
  "mood": "<one of: happy|sad|stressed|bored|romantic|adventurous|nostalgic|scared|excited|relaxed>",
  "confidence": <float 0.0-1.0>,
  "emotion_tags": ["<tag1>", "<tag2>", ...],
  "suggested_genres": ["<genre1>", ...],
  "suggested_movies": [
    { "title": "<title>", "id": "<catalog id or empty string>", "reason": "<one sentence connecting movie to mood>", "score": <0-100> }
  ]
}
Max 5 suggested_movies. No links. No extra text outside JSON.`;

async function analyzeTextMood(text: string): Promise<Record<string, unknown>> {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 600,
    messages: [
      { role: "system", content: `${MOOD_SYSTEM_PROMPT}\n\n${MOOD_OUTPUT_SCHEMA}` },
      { role: "user", content: `Analyze this mood description and return the JSON:\n\n"${text}"` },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const cleaned = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
  const parsed = JSON.parse(cleaned);
  parsed._signalType = "text";
  return parsed;
}

async function analyzeImageMood(imageBase64: string, mimeType: string): Promise<Record<string, unknown>> {
  const dataUrl = `data:${mimeType || "image/jpeg"};base64,${imageBase64}`;

  const response = await groq.chat.completions.create({
    model: "llama-3.2-11b-vision-preview",
    max_tokens: 600,
    messages: [
      {
        role: "system",
        content: `${MOOD_SYSTEM_PROMPT}\n\n${MOOD_OUTPUT_SCHEMA}\n\nAnalyze only facial expression. Privacy: image is ephemeral, not stored.`,
      },
      {
        role: "user",
        content: [
          { type: "image_url", image_url: { url: dataUrl } },
          { type: "text", text: "Analyze the facial expression in this selfie and return the mood JSON." },
        ],
      },
    ],
  });

  const raw = response.choices[0]?.message?.content ?? "{}";
  const cleaned = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
  const parsed = JSON.parse(cleaned);
  parsed._signalType = "image";
  return parsed;
}

async function transcribeAudio(audioBase64: string, audioMimeType: string): Promise<string> {
  const buffer = Buffer.from(audioBase64, "base64");
  const ext = audioMimeType?.includes("webm") ? "webm" : audioMimeType?.includes("mp4") ? "mp4" : "wav";
  const audioFile = await toFile(buffer, `recording.${ext}`, { type: audioMimeType || "audio/webm" });

  const transcription = await groq.audio.transcriptions.create({
    file: audioFile,
    model: "whisper-large-v3-turbo",
    response_format: "json",
  });

  return transcription.text || "";
}

function fuseMoodResults(results: Record<string, unknown>[]): Record<string, unknown> {
  if (results.length === 0) return { mood: "relaxed", confidence: 0.5, emotion_tags: [], suggested_genres: [], suggested_movies: [] };
  if (results.length === 1) return results[0];

  // Pick the mood with highest confidence
  const best = results.reduce((a, b) =>
    ((a.confidence as number) ?? 0) >= ((b.confidence as number) ?? 0) ? a : b
  );

  // Average confidence
  const avgConf = results.reduce((s, r) => s + ((r.confidence as number) ?? 0), 0) / results.length;

  // Merge emotion_tags
  const allTags = results.flatMap(r => (r.emotion_tags as string[]) ?? []);
  const uniqueTags = [...new Set(allTags)].slice(0, 6);

  // Merge suggested_genres
  const allGenres = results.flatMap(r => (r.suggested_genres as string[]) ?? []);
  const uniqueGenres = [...new Set(allGenres)].slice(0, 4);

  const textSignal = results.find(r => r._signalType === "text");
  const imageSignal = results.find(r => r._signalType === "image");

  return {
    ...best,
    confidence: Math.round(avgConf * 100) / 100,
    emotion_tags: uniqueTags,
    suggested_genres: uniqueGenres,
    contributing_signals: {
      text: textSignal ? (textSignal.confidence as number) : 0,
      image: imageSignal ? (imageSignal.confidence as number) : 0,
    },
  };
}

// ─── Existing Routes ──────────────────────────────────────────────────────────

router.post("/scan-poster", async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body as { imageBase64?: string; mimeType?: string };

    if (!imageBase64) {
      return res.status(400).json({ error: "imageBase64 is required" });
    }

    const dataUrl = `data:${mimeType || "image/jpeg"};base64,${imageBase64}`;

    const response = await groq.chat.completions.create({
      model: "llama-3.2-11b-vision-preview",
      max_tokens: 256,
      messages: [
        {
          role: "system",
          content: `You are a movie poster recognition AI for a cinema booking app called Movi Kova.
Your job is to look at an image and determine if it matches one of our listed movies.

Available movies:
${MOVIE_LIST_FOR_PROMPT_POSTER}

Rules:
- If you can identify a movie from the image that matches one of our movies, respond with JSON: {"matched": true, "movieId": "<id>", "movieTitle": "<title>", "confidence": "high|medium|low", "reason": "<brief explanation>"}
- If the image is a movie poster but doesn't match any of our movies, respond with JSON: {"matched": false, "detectedTitle": "<what you think the movie is>", "reason": "Not in our catalogue"}
- If the image is not a movie poster at all, respond with JSON: {"matched": false, "detectedTitle": null, "reason": "Not a movie poster"}
- Always respond ONLY with valid JSON, no other text.`,
        },
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: dataUrl } },
            { type: "text", text: "Identify this movie poster and match it to our available movies." },
          ],
        },
      ],
    });

    const content = response.choices[0]?.message?.content ?? "{}";
    const cleaned = content.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();

    let result: Record<string, unknown>;
    try {
      result = JSON.parse(cleaned);
    } catch {
      result = { matched: false, reason: "AI response parse error", raw: content };
    }

    return res.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
});

router.post("/chat", async (req, res) => {
  try {
    const { messages: history, message } = req.body as {
      messages: { role: "user" | "assistant"; content: string }[];
      message: string;
    };

    if (!message) {
      return res.status(400).json({ error: "message is required" });
    }

    const systemPrompt = `You are an expert cinematic concierge AI for Movi Kova, a premium movie ticket booking platform.
You help users discover movies, pick the right format, choose seats, and navigate the booking experience.

Currently showing movies:
${MOVIES.map(m => `- "${m.title}" (id: ${m.id}) — genres: ${m.genres.join(", ")}`).join("\n")}

Personality: Sophisticated, knowledgeable about cinema, enthusiastic but not pushy. Keep responses concise (2-4 sentences max).
When recommending a specific movie we have, always mention its title naturally.
If user asks to book or go to a movie, say: "Tap the poster on the home screen or use the Poster Scanner to jump straight to booking!"`;

    const chatMessages = [
      { role: "system" as const, content: systemPrompt },
      ...(history || []).slice(-10).map(m => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content: message },
    ];

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 300,
      messages: chatMessages,
    });

    const reply = completion.choices[0]?.message?.content ?? "I'm having trouble responding right now. Please try again.";
    return res.json({ reply });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
});

// ─── Mood Analyser Route ──────────────────────────────────────────────────────

router.post("/mood", async (req, res) => {
  try {
    const { type, text, imageBase64, mimeType, audioBase64, audioMimeType, recentWatched } = req.body as {
      type: "text" | "image" | "voice" | "hybrid";
      text?: string;
      imageBase64?: string;
      mimeType?: string;
      audioBase64?: string;
      audioMimeType?: string;
      recentWatched?: string[];
    };

    let moodResult: Record<string, unknown>;

    if (type === "text") {
      if (!text) return res.status(400).json({ error: "text is required for type=text" });
      moodResult = await analyzeTextMood(text);

    } else if (type === "image") {
      if (!imageBase64) return res.status(400).json({ error: "imageBase64 is required for type=image" });
      moodResult = await analyzeImageMood(imageBase64, mimeType ?? "image/jpeg");

    } else if (type === "voice") {
      if (!audioBase64) return res.status(400).json({ error: "audioBase64 is required for type=voice" });
      let transcript = "";
      try {
        transcript = await transcribeAudio(audioBase64, audioMimeType ?? "audio/webm");
      } catch {
        transcript = "Could not transcribe audio clearly.";
      }
      if (!transcript.trim()) {
        transcript = "The person seems quiet or thoughtful.";
      }
      moodResult = await analyzeTextMood(transcript);
      (moodResult as Record<string, unknown>).transcript = transcript;

    } else if (type === "hybrid") {
      const signals: Record<string, unknown>[] = [];
      if (text) signals.push(await analyzeTextMood(text));
      if (imageBase64) signals.push(await analyzeImageMood(imageBase64, mimeType ?? "image/jpeg"));
      moodResult = fuseMoodResults(signals);

    } else {
      return res.status(400).json({ error: `Unknown type: ${type}` });
    }

    // Boost catalog movies if in recentWatched (history boost)
    if (recentWatched?.length && Array.isArray((moodResult as Record<string, unknown>).suggested_movies)) {
      const movies = (moodResult as Record<string, unknown>).suggested_movies as Record<string, unknown>[];
      movies.forEach(m => {
        if (recentWatched.includes(m.id as string)) {
          m.score = Math.min(100, ((m.score as number) ?? 0) + 10);
        }
      });
      movies.sort((a, b) => ((b.score as number) ?? 0) - ((a.score as number) ?? 0));
    }

    return res.json(moodResult);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
});

export default router;
