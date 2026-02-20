import os
import random
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

app = Flask(__name__)
CORS(app)

# MongoDB setup
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/wordle")
client = MongoClient(MONGO_URI)
db = client.wordle
custom_words = db.custom_words
used_words = db.used_words

# Gemini setup
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Fallback words by length
"""FALLBACK_WORDS = {
    4: ["LOVE", "GLOW", "KISS", "BOLD", "FIRE", "HOPE", "STAR", "MOON", "ROSE", "WISH"],
    5: ["HEART", "BLUSH", "CHARM", "SMILE", "DREAM", "GRACE", "PEACE", "LIGHT", "MAGIC", "SWEET"],
    6: ["BEAUTY", "SPARKS", "WARMTH", "GOLDEN", "TENDER", "LOVELY", "BRIGHT", "GENTLE", "SERENE", "DIVINE"],
    7: ["BELOVED", "RADIANT", "GLOWING", "DARLING", "FANTASY", "AMAZING", "PERFECT", "ELEGANT", "HARMONY", "DELIGHT"],
    8: ["ADORABLE", "GORGEOUS", "ROMANTIC", "PRECIOUS", "SPLENDID", "CHARMING", "DAZZLING", "GRACEFUL", "LUMINOUS", "STUNNING"],
    9: ["WONDERFUL", "BEAUTIFUL", "ENCHANTED", "EXQUISITE", "GLAMOROUS", "MARVELOUS", "SPARKLING", "BRILLIANT", "FANTASTIC", "DELICIOUS"],
    10: ["BREATHLESS", "SPELLBOUND", "REMARKABLE", "PASSIONATE", "CAPTIVATED", "INCREDIBLE", "DELIGHTFUL", "MAGNIFICENT", "PHENOMENAL", "ATTRACTIVE"]
} """


def fetch_word_from_gemini(length):
    """Fetch a random word from Gemini AI"""
    model = genai.GenerativeModel('gemini-2.5-flash')
    prompt = f"""Give me exactly one random common English word that is exactly {length} letters long.
Rules:
- Return ONLY the single word, nothing else — no punctuation, no explanation, no sentence, no credits.
- The word must be a real, common English word.
- All uppercase letters.
Example valid response: DREAM"""
    
    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        # Extract only letters
        word = ''.join(c for c in text if c.isalpha()).upper()
        if len(word) == length:
            return word
        return None
    except Exception as e:
        print(f"Gemini error: {e}")
        return None


def is_word_recently_used(word, length):
    """Check if word was used in the last 50 words for this length"""
    recent = used_words.find_one({"length": length})
    if not recent:
        return False
    
    recent_list = recent.get("words", [])
    return word in recent_list


def mark_word_as_used(word, length):
    """Add word to recently used list (keep last 50)"""
    used_words.update_one(
        {"length": length},
        {
            "$push": {
                "words": {
                    "$each": [word],
                    "$slice": -50  # Keep only last 50
                }
            },
            "$set": {"updated_at": datetime.utcnow()}
        },
        upsert=True
    )


def get_random_word(length):
    """Get a random word that hasn't been used recently"""
    attempts = 0
    max_attempts = 10
    
    # Try Gemini first
    while attempts < 3:
        word = fetch_word_from_gemini(length)
        if word and not is_word_recently_used(word, length):
            mark_word_as_used(word, length)
            return word, False
        attempts += 1
    
    # Fallback to word list
    fallback_list = FALLBACK_WORDS.get(length, FALLBACK_WORDS[5])
    available_words = [w for w in fallback_list if not is_word_recently_used(w, length)]
    
    # If all words were used recently, reset and use any word
    if not available_words:
        available_words = fallback_list
    
    word = random.choice(available_words)
    mark_word_as_used(word, length)
    return word, True


@app.route("/api/word", methods=["GET"])
def get_word():
    """Get a random word of specified length"""
    length = int(request.args.get("length", 5))
    
    if length < 4 or length > 10:
        return jsonify({"error": "Length must be between 4 and 10"}), 400
    
    word, is_fallback = get_random_word(length)
    return jsonify({
        "word": word,
        "length": len(word),
        "fallback": is_fallback
    })


@app.route("/api/custom-word", methods=["POST"])
def create_custom_word():
    """Save a custom word"""
    data = request.get_json()
    word = data.get("word", "")
    
    if not word or not isinstance(word, str):
        return jsonify({"error": "Word is required"}), 400
    
    clean = ''.join(c for c in word.upper() if c.isalpha())
    
    if len(clean) < 4 or len(clean) > 10:
        return jsonify({"error": "Word must be between 4 and 10 letters"}), 400
    
    try:
        result = custom_words.insert_one({
            "word": clean,
            "created_at": datetime.utcnow()
        })
        word_id = str(result.inserted_id)
        print(f"Created custom word: {clean} with ID: {word_id}")
        return jsonify({
            "id": word_id,
            "word": clean
        })
    except Exception as e:
        print(f"Error creating custom word: {e}")
        return jsonify({"error": "Failed to save word"}), 500


@app.route("/api/custom-word/<word_id>", methods=["GET"])
def get_custom_word(word_id):
    """Retrieve a custom word by ID"""
    from bson.objectid import ObjectId
    from bson.errors import InvalidId
    
    try:
        doc = custom_words.find_one({"_id": ObjectId(word_id)})
        if not doc:
            return jsonify({"error": "Word not found"}), 404
        
        return jsonify({
            "word": doc["word"],
            "length": len(doc["word"])
        })
    except InvalidId:
        return jsonify({"error": "Invalid word ID"}), 400
    except Exception as e:
        print(f"Error retrieving custom word: {e}")
        return jsonify({"error": "Failed to retrieve word"}), 500


@app.route("/api/health", methods=["GET"])
def health():
    """Health check endpoint"""
    return jsonify({"ok": True})


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
