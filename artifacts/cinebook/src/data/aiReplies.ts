export const aiReplies: Record<string, string> = {
  "hello": "Welcome to Movi Kova. How can I assist you with your cinema experience today?",
  "hi": "Welcome to Movi Kova. How can I assist you with your cinema experience today?",
  "action": "If you're looking for adrenaline, I highly recommend 'MISSION: IMPOSSIBLE — The Final Reckoning' or the historical battles of 'IRONCLAD'.",
  "sci-fi": "'DUNE: PART THREE' in IMAX is an absolute must-see. We also have 'ANDROMEDA PROTOCOL' for a darker mystery.",
  "drama": "'SOLSTICE' is receiving incredible reviews. It's a beautiful, quiet film perfect for a contemplative evening.",
  "best seats": "For the optimal acoustic experience, I recommend rows E and F, right in the center. The sound calibration is perfectly tuned to those coordinates.",
  "family": "Currently, our lineup is more tailored to mature audiences. However, 'DUNE: PART THREE' is PG-13 and visually spectacular.",
  "food": "We offer a curated selection of F&B. The Premium Bucket comes with truffle butter popcorn and two drinks.",
  "imax": "IMAX format is currently available for 'DUNE: PART THREE' and 'IRONCLAD'. The expanded aspect ratio is breathtaking.",
  "default": "I'm your cinematic concierge. I can suggest films, help you find the best seats, or provide details about our formats."
};

export const getAiReply = (input: string): string => {
  const lower = input.toLowerCase();
  for (const [key, reply] of Object.entries(aiReplies)) {
    if (key !== "default" && lower.includes(key)) {
      return reply;
    }
  }
  return aiReplies.default;
};
