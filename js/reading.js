import { DECK } from "./cards.js";

const TONE_KEYWORDS = {
  love: ["love", "heart", "relationship", "partner", "romance", "marriage", "crush", "dating", "feelings"],
  career: ["career", "job", "work", "business", "money", "finance", "promotion", "boss", "interview", "success"],
  conflict: ["conflict", "fight", "enemy", "betray", "anger", "break", "divorce", "problem", "fear", "anxiety"],
  growth: ["growth", "purpose", "path", "spiritual", "heal", "change", "future", "destiny", "guidance", "life"],
};

const TONE_OPENERS = {
  love: "In matters of the heart",
  career: "Regarding your path of work and ambition",
  conflict: "Through the tension you are facing",
  growth: "On this journey of becoming",
  general: "Regarding the question you carry",
};

export function shuffleDeck(source = DECK) {
  const arr = [...source];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function detectTone(question = "") {
  const q = question.toLowerCase();
  let best = "general";
  let score = 0;
  for (const [tone, words] of Object.entries(TONE_KEYWORDS)) {
    const hits = words.reduce((n, w) => n + (q.includes(w) ? 1 : 0), 0);
    if (hits > score) {
      score = hits;
      best = tone;
    }
  }
  return best;
}

function synthesis(cards, tone, question) {
  const names = cards.map((c) => c.name).join(", ");
  const keywords = cards.flatMap((c) => c.keywords).slice(0, 6).join(", ");
  const opener = TONE_OPENERS[tone] || TONE_OPENERS.general;
  const majorCount = cards.filter((c) => c.arcana === "Major").length;

  let weight = "The draw leans practical and everyday.";
  if (majorCount >= 2) {
    weight = "Major Arcana dominate — this question touches a pivotal chapter of your life.";
  } else if (majorCount === 1) {
    weight = "One Major Arcana anchors the reading, marking a meaningful turning point.";
  }

  return `${opener}, ${names} speak together. Themes of ${keywords} rise around your question — “${question.trim()}”. ${weight} Take the message as guidance, then choose your next step with clear intention.`;
}

export function composeReading({ name, question, cards }) {
  const tone = detectTone(question);
  const greeting = `Dear ${name || "seeker"}, here is your result.`;
  const cardLines = cards.map(
    (card, i) =>
      `Card ${i + 1} — ${card.name}: ${card.meaning}`
  );
  const paragraphs = [greeting, ...cardLines, synthesis(cards, tone, question)];

  return {
    title: `${name ? `${name}'s` : "Your"} reading`,
    tone,
    paragraphs,
    prompt: buildAiPrompt({ question, cards }),
  };
}

/** Compact Google AI query: question + drawn cards only. */
export function buildAiPrompt({ question, cards }) {
  const cardList = cards
    .map((card, i) => `${i + 1}. ${card.name}`)
    .join("; ");

  return [
    "Tarot reading",
    `Question: ${question.trim()}`,
    `Cards: ${cardList}`,
  ].join("\n");
}

/** Opens Google AI Mode with the reading query. */
export function buildGoogleAiUrl(prompt) {
  const q = encodeURIComponent(prompt);
  return `https://www.google.com/search?udm=50&q=${q}`;
}
