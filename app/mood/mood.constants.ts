export const MOODS = [
  "great",
  "good",
  "neutral",
  "bad",
  "terrible",
] as const;

export const MOOD_COLORS: Record<(typeof MOODS)[number], string> = {
  great: "#9487b9",
  good: "#87b987",
  neutral: "#adadad",
  bad: "#87adb9",
  terrible: "#b98787",
};

export const EMOTIONS = [
  { name: "annoyed", color: "#e74c3c" },
  { name: "angry", color: "#c0392b" },
  { name: "furious", color: "#922b21" },

  { name: "bored", color: "#95a5a6" },
  { name: "apathetic", color: "#7f8c8d" },
  { name: "tired", color: "#6c7a7a" },
  { name: "exhausted", color: "#5d6d6d" },

  { name: "sad", color: "#3498db" },
  { name: "lonely", color: "#2e86c1" },
  { name: "hurt", color: "#2874a6" },
  { name: "disappointed", color: "#21618c" },
  { name: "depressed", color: "#1b4f72" },

  { name: "confused", color: "#af7ac5" },
  { name: "overwhelmed", color: "#9b59b6" },
  { name: "helpless", color: "#884ea0" },
  { name: "fragile", color: "#76448a" },

  { name: "anxious", color: "#f4d03f" },
  { name: "scared", color: "#f1c40f" },
  { name: "terrified", color: "#d4ac0d" },

  { name: "amused", color: "#58d68d" },
  { name: "happy", color: "#2ecc71" },
  { name: "excited", color: "#28b463" },
  { name: "energetic", color: "#239b56" },
  { name: "powerful", color: "#1d8348" },

  { name: "calm", color: "#82e0aa" },
  { name: "blessed", color: "#abebc6" },

  { name: "disgusted", color: "#eb984e" },
  { name: "surprised", color: "#e67e22" },
  { name: "shocked", color: "#ca6f1e" },
  { name: "derealized", color: "#af601a" },

  { name: "guilty", color: "#566573" },
  { name: "ashamed", color: "#34495e" },
  { name: "abandoned", color: "#414e5c" },
];