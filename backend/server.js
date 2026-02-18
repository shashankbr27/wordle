require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

// ── MongoDB (optional – stores custom words) ──────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/wordle";
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((e) => console.warn("MongoDB not connected:", e.message));

const CustomWordSchema = new mongoose.Schema({
  word: { type: String, required: true, uppercase: true },
  createdAt: { type: Date, default: Date.now },
});
const CustomWord = mongoose.model("CustomWord", CustomWordSchema);

// ── Gemini helper ─────────────────────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function fetchWordFromGemini(length) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `Give me exactly one random common English word that is exactly ${length} letters long.
Rules:
- Return ONLY the single word, nothing else — no punctuation, no explanation, no sentence, no credits.
- The word must be a real, common English word.
- All uppercase letters.
Example valid response: DREAM`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  // Extract only the first word-like token (letters only)
  const match = text.match(/[A-Za-z]+/);
  if (!match) throw new Error("Gemini returned no valid word");
  const word = match[0].toUpperCase();
  if (word.length !== length)
    throw new Error(`Gemini returned wrong length: ${word}`);
  return word;
}

// ── Routes ────────────────────────────────────────────────────────────────────

// GET /api/word?length=5  → random word of given length (default 5)
app.get("/api/word", async (req, res) => {
  const length = parseInt(req.query.length) || 5;
  if (length < 4 || length > 10) {
    return res.status(400).json({ error: "Length must be between 4 and 10" });
  }

  let attempts = 0;
  while (attempts < 3) {
    try {
      const word = await fetchWordFromGemini(length);
      return res.json({ word, length: word.length });
    } catch (e) {
      attempts++;
      if (attempts === 3) {
        // Fallback word list
        const fallbacks = {
          4: ["LOVE", "GLOW", "KISS", "BOLD", "FIRE"],
          5: ["HEART", "BLUSH", "CHARM", "SMILE", "DREAM"],
          6: ["BEAUTY", "SPARKS", "WARMTH", "GOLDEN", "TENDER"],
          7: ["BELOVED", "RADIANT", "GLOWING", "DARLING", "FANTASY"],
          8: ["ADORABLE", "GORGEOUS", "ROMANTIC", "PRECIOUS", "SPLENDID"],
          9: ["WONDERFUL", "BEAUTIFUL", "ENCHANTED", "EXQUISITE", "GLAMOROUS"],
          10: ["BREATHLESS", "SPELLBOUND", "REMARKABLE", "PASSIONATE", "CAPTIVATED"],
        };
        const list = fallbacks[length] || fallbacks[5];
        const word = list[Math.floor(Math.random() * list.length)];
        return res.json({ word, length: word.length, fallback: true });
      }
    }
  }
});

// POST /api/custom-word  → save a custom word
app.post("/api/custom-word", async (req, res) => {
  const { word } = req.body;
  if (!word || typeof word !== "string") {
    return res.status(400).json({ error: "Word is required" });
  }
  const clean = word.trim().toUpperCase().replace(/[^A-Z]/g, "");
  if (clean.length < 4 || clean.length > 10) {
    return res
      .status(400)
      .json({ error: "Word must be between 4 and 10 letters" });
  }
  try {
    const doc = await CustomWord.create({ word: clean });
    res.json({ id: doc._id, word: clean });
  } catch (e) {
    res.status(500).json({ error: "Failed to save word" });
  }
});

// GET /api/custom-word/:id  → retrieve a custom word
app.get("/api/custom-word/:id", async (req, res) => {
  try {
    const doc = await CustomWord.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Word not found" });
    res.json({ word: doc.word, length: doc.word.length });
  } catch (e) {
    res.status(500).json({ error: "Failed to retrieve word" });
  }
});

// Health check
app.get("/api/health", (_, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
