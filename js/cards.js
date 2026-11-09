const IMG_BASE = "https://raw.githubusercontent.com/metabismuth/tarot-json/master/cards";

function card(id, name, arcana, suit, keywords, meaning) {
  return {
    id,
    name,
    arcana,
    suit,
    keywords,
    meaning,
    image: `${IMG_BASE}/${id}.jpg`,
  };
}

export const CARD_BACK = "assets/card-back.svg";

export const DECK = [
  // Major Arcana
  card("m00", "The Fool", "Major", null, ["beginnings", "leap", "trust"], "A leap of faith opens a path that logic alone cannot see. Fresh energy asks you to trust the unknown."),
  card("m01", "The Magician", "Major", null, ["will", "skill", "manifest"], "You already hold the tools you need. Focus your will and turn intention into form."),
  card("m02", "The High Priestess", "Major", null, ["intuition", "mystery", "silence"], "Quiet knowing rises beneath the noise. Listen inward before you act outwardly."),
  card("m03", "The Empress", "Major", null, ["nurture", "abundance", "creation"], "Growth thrives through care. Creativity, comfort, and abundance want room to bloom."),
  card("m04", "The Emperor", "Major", null, ["structure", "authority", "stability"], "Order and firm boundaries create safety. Leadership means building what endures."),
  card("m05", "The Hierophant", "Major", null, ["tradition", "guidance", "belief"], "Wisdom arrives through mentors, ritual, or shared values. Seek counsel that grounds you."),
  card("m06", "The Lovers", "Major", null, ["union", "choice", "harmony"], "A meaningful choice of heart aligns values with desire. Harmony asks for honest commitment."),
  card("m07", "The Chariot", "Major", null, ["drive", "victory", "control"], "Directed willpower carries you forward. Hold the reins firmly and keep moving."),
  card("m08", "Strength", "Major", null, ["courage", "compassion", "resilience"], "Gentle courage tames what once felt wild. Soft power outlasts force."),
  card("m09", "The Hermit", "Major", null, ["solitude", "insight", "guidance"], "Withdrawal clarifies. Your inner lantern lights the next true step."),
  card("m10", "Wheel of Fortune", "Major", null, ["change", "cycles", "destiny"], "A turn of fate rearranges the board. Ride the shift rather than resist it."),
  card("m11", "Justice", "Major", null, ["truth", "balance", "accountability"], "Fair measure returns. Choices meet consequences; clarity restores balance."),
  card("m12", "The Hanged Man", "Major", null, ["pause", "surrender", "perspective"], "Suspension invites a new viewpoint. Release control to see what was hidden."),
  card("m13", "Death", "Major", null, ["ending", "renewal", "transformation"], "Something completes so renewal can begin. Transformation asks you to let go cleanly."),
  card("m14", "Temperance", "Major", null, ["balance", "healing", "integration"], "Blend opposites patiently. Healing arrives through measured, steady alchemy."),
  card("m15", "The Devil", "Major", null, ["bondage", "desire", "shadow"], "Attachment or habit may bind you. Naming the chain is the first step to freedom."),
  card("m16", "The Tower", "Major", null, ["upheaval", "revelation", "breakthrough"], "A sudden shake clears false foundations. Truth breaks through for a stronger rebuild."),
  card("m17", "The Star", "Major", null, ["hope", "healing", "inspiration"], "Hope returns after storm. Trust renewal and follow the quiet light ahead."),
  card("m18", "The Moon", "Major", null, ["illusion", "dreams", "uncertainty"], "Fog and feeling cloud the path. Move carefully; not all shadows are threats."),
  card("m19", "The Sun", "Major", null, ["joy", "clarity", "vitality"], "Warmth and clarity illuminate success. Celebrate the simple truth of what works."),
  card("m20", "Judgement", "Major", null, ["awakening", "reckoning", "calling"], "A call to rise and answer your higher purpose. Review the past, then step forward."),
  card("m21", "The World", "Major", null, ["completion", "wholeness", "arrival"], "A cycle completes with fulfillment. You stand ready for the next horizon."),

  // Wands
  card("w01", "Ace of Wands", "Minor", "Wands", ["spark", "inspiration", "initiative"], "A creative spark ignites. Seize the opening while energy is fresh."),
  card("w02", "Two of Wands", "Minor", "Wands", ["planning", "vision", "choice"], "You stand at a threshold of possibility. Look farther and choose a bold direction."),
  card("w03", "Three of Wands", "Minor", "Wands", ["expansion", "foresight", "progress"], "Early efforts begin to return. Expand your horizon and wait for ships to arrive."),
  card("w04", "Four of Wands", "Minor", "Wands", ["celebration", "home", "harmony"], "A milestone deserves joy. Stability and shared celebration restore belonging."),
  card("w05", "Five of Wands", "Minor", "Wands", ["conflict", "competition", "friction"], "Scattered tensions test patience. Channel rivalry into sharper skill."),
  card("w06", "Six of Wands", "Minor", "Wands", ["victory", "recognition", "confidence"], "Public success and recognition arrive. Own your achievement without apology."),
  card("w07", "Seven of Wands", "Minor", "Wands", ["defense", "courage", "stance"], "Hold your ground. Courage under pressure protects what you have built."),
  card("w08", "Eight of Wands", "Minor", "Wands", ["swiftness", "messages", "momentum"], "Events accelerate. Messages fly; stay ready to move with the current."),
  card("w09", "Nine of Wands", "Minor", "Wands", ["resilience", "guard", "persistence"], "You are battle-worn but not beaten. One more stand may secure the win."),
  card("w10", "Ten of Wands", "Minor", "Wands", ["burden", "responsibility", "overload"], "Too much weight slows progress. Delegate or set down what is not yours."),
  card("w11", "Page of Wands", "Minor", "Wands", ["curiosity", "news", "exploration"], "A messenger of adventure appears. Explore with playful courage."),
  card("w12", "Knight of Wands", "Minor", "Wands", ["passion", "action", "haste"], "Bold pursuit charges ahead. Temper haste with aim so fire becomes progress."),
  card("w13", "Queen of Wands", "Minor", "Wands", ["charisma", "warmth", "confidence"], "Magnetic confidence lights the room. Lead with warmth and creative certainty."),
  card("w14", "King of Wands", "Minor", "Wands", ["vision", "leadership", "enterprise"], "Visionary leadership steers the fire. Act from purpose, not impulse."),

  // Cups
  card("c01", "Ace of Cups", "Minor", "Cups", ["emotion", "love", "overflow"], "A new emotional current opens. Love, healing, or intuition overflows."),
  card("c02", "Two of Cups", "Minor", "Cups", ["partnership", "attraction", "bond"], "A mutual bond forms or deepens. Reciprocity is the heart of the exchange."),
  card("c03", "Three of Cups", "Minor", "Cups", ["friendship", "joy", "community"], "Celebration with kindred spirits lifts the spirit. Shared joy multiplies."),
  card("c04", "Four of Cups", "Minor", "Cups", ["apathy", "reassessment", "withdrawal"], "Disinterest cloaks an overlooked offer. Reassess before you turn away."),
  card("c05", "Five of Cups", "Minor", "Cups", ["grief", "loss", "regret"], "Sorrow focuses on what spilled. Turn to notice what still stands."),
  card("c06", "Six of Cups", "Minor", "Cups", ["nostalgia", "innocence", "memory"], "The past returns with sweetness. Innocent exchange restores trust."),
  card("c07", "Seven of Cups", "Minor", "Cups", ["illusion", "options", "fantasy"], "Many dreams cloud judgment. Choose the real cup, not the mirage."),
  card("c08", "Eight of Cups", "Minor", "Cups", ["departure", "seeking", "discontent"], "You walk away from what no longer fulfills. The deeper quest begins."),
  card("c09", "Nine of Cups", "Minor", "Cups", ["satisfaction", "wish", "contentment"], "A wish fulfilled and quiet pride. Enjoy the sweetness you earned."),
  card("c10", "Ten of Cups", "Minor", "Cups", ["harmony", "family", "fulfillment"], "Emotional fulfillment ripples through connection. Home feels whole."),
  card("c11", "Page of Cups", "Minor", "Cups", ["sensitivity", "message", "imagination"], "A tender message or creative impulse arrives. Stay open to wonder."),
  card("c12", "Knight of Cups", "Minor", "Cups", ["romance", "offer", "idealism"], "An offer of the heart approaches. Idealism seeks a worthy vessel."),
  card("c13", "Queen of Cups", "Minor", "Cups", ["empathy", "intuition", "care"], "Deep empathy and emotional wisdom guide you. Care without losing yourself."),
  card("c14", "King of Cups", "Minor", "Cups", ["composure", "maturity", "support"], "Emotional mastery steadies the waters. Offer calm support in the storm."),

  // Swords
  card("s01", "Ace of Swords", "Minor", "Swords", ["clarity", "truth", "breakthrough"], "A blade of clarity cuts through confusion. Truth empowers a decisive start."),
  card("s02", "Two of Swords", "Minor", "Swords", ["stalemate", "decision", "block"], "A blocked choice asks for inner honesty. Remove the blindfold to move."),
  card("s03", "Three of Swords", "Minor", "Swords", ["heartbreak", "sorrow", "truth"], "Painful truth pierces the heart. Grief clears space for honest healing."),
  card("s04", "Four of Swords", "Minor", "Swords", ["rest", "recovery", "retreat"], "Rest is strategy, not defeat. Recover before the next campaign."),
  card("s05", "Five of Swords", "Minor", "Swords", ["conflict", "ego", "defeat"], "A hollow victory or sharp dispute. Ask whether winning is worth the cost."),
  card("s06", "Six of Swords", "Minor", "Swords", ["transition", "passage", "healing"], "You leave troubled waters for calmer shores. Transition itself is the medicine."),
  card("s07", "Seven of Swords", "Minor", "Swords", ["strategy", "secrecy", "cunning"], "Stealth or strategy is at play. Guard what matters; question what is hidden."),
  card("s08", "Eight of Swords", "Minor", "Swords", ["restriction", "fear", "mindtrap"], "Mental binds feel absolute, yet many are self-made. Reframe to find the exit."),
  card("s09", "Nine of Swords", "Minor", "Swords", ["anxiety", "worry", "nightmares"], "Anxious thoughts amplify at night. Speak the fear to shrink its shadow."),
  card("s10", "Ten of Swords", "Minor", "Swords", ["ending", "betrayal", "rock-bottom"], "A painful ending reaches completion. Dawn follows the darkest hour."),
  card("s11", "Page of Swords", "Minor", "Swords", ["curiosity", "vigilance", "ideas"], "A sharp mind seeks answers. Stay curious, but verify before you spar."),
  card("s12", "Knight of Swords", "Minor", "Swords", ["haste", "intellect", "charge"], "Swift intellect charges the field. Aim carefully so speed serves truth."),
  card("s13", "Queen of Swords", "Minor", "Swords", ["clarity", "boundaries", "honesty"], "Clear perception cuts through sentiment. Honesty with grace is your edge."),
  card("s14", "King of Swords", "Minor", "Swords", ["authority", "reason", "judgment"], "Fair intellect rules. Decide with principle, not personal weather."),

  // Pentacles
  card("p01", "Ace of Pentacles", "Minor", "Pentacles", ["opportunity", "seed", "prosperity"], "A tangible opportunity takes root. Plant carefully for lasting yield."),
  card("p02", "Two of Pentacles", "Minor", "Pentacles", ["balance", "juggling", "adapt"], "Life asks you to juggle with grace. Stay flexible as priorities shift."),
  card("p03", "Three of Pentacles", "Minor", "Pentacles", ["craft", "collaboration", "skill"], "Skilled teamwork builds quality. Respect the craft and the collaborators."),
  card("p04", "Four of Pentacles", "Minor", "Pentacles", ["security", "control", "holding"], "Clinging protects, yet may also restrict. Security needs breath as well as walls."),
  card("p05", "Five of Pentacles", "Minor", "Pentacles", ["hardship", "exclusion", "need"], "Lean times or feeling left out. Help is nearer than pride admits."),
  card("p06", "Six of Pentacles", "Minor", "Pentacles", ["generosity", "exchange", "fairness"], "Give and receive in fair measure. Generosity restores balance."),
  card("p07", "Seven of Pentacles", "Minor", "Pentacles", ["patience", "assessment", "investment"], "Pause to assess the harvest so far. Patience ripens long work."),
  card("p08", "Eight of Pentacles", "Minor", "Pentacles", ["diligence", "mastery", "practice"], "Devoted practice refines mastery. Small repetitions build excellence."),
  card("p09", "Nine of Pentacles", "Minor", "Pentacles", ["independence", "luxury", "self-reliance"], "Self-made comfort and refined independence. Enjoy what your discipline earned."),
  card("p10", "Ten of Pentacles", "Minor", "Pentacles", ["legacy", "wealth", "family"], "Long-term security and shared legacy. Stability spans generations."),
  card("p11", "Page of Pentacles", "Minor", "Pentacles", ["study", "opportunity", "ambition"], "A practical student energy arrives. Study the craft; tend the seed."),
  card("p12", "Knight of Pentacles", "Minor", "Pentacles", ["reliability", "steady", "duty"], "Slow, dependable progress wins. Consistency is your quiet strength."),
  card("p13", "Queen of Pentacles", "Minor", "Pentacles", ["nurture", "abundance", "practicality"], "Warm practicality creates comfort. Nurture people and resources wisely."),
  card("p14", "King of Pentacles", "Minor", "Pentacles", ["prosperity", "stewardship", "stability"], "Seasoned stewardship grows wealth that lasts. Lead with generosity and sense."),
];

export function getCardById(id) {
  return DECK.find((c) => c.id === id);
}
