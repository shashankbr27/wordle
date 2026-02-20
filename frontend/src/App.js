import React, { useState, useEffect, useCallback, useRef } from "react";
import "./App.css";

const API_BASE = process.env.REACT_APP_API_URL || "";

// ── Utility ────────────────────────────────────────────────────────────────────
function evaluateGuess(guess, target) {
  const result = Array(guess.length).fill("absent");
  const targetArr = target.split("");
  const guessArr = guess.split("");
  const used = Array(target.length).fill(false);

  // First pass: correct positions
  guessArr.forEach((ch, i) => {
    if (ch === targetArr[i]) {
      result[i] = "correct";
      used[i] = true;
    }
  });
  // Second pass: present but wrong position
  guessArr.forEach((ch, i) => {
    if (result[i] === "correct") return;
    const j = targetArr.findIndex((t, k) => t === ch && !used[k]);
    if (j !== -1) {
      result[i] = "present";
      used[j] = true;
    }
  });
  return result;
}

function buildKeyStates(guesses, evaluations) {
  const state = {};
  guesses.forEach((g, gi) => {
    g.split("").forEach((ch, ci) => {
      const ev = evaluations[gi][ci];
      const prev = state[ch];
      if (ev === "correct") state[ch] = "correct";
      else if (ev === "present" && prev !== "correct") state[ch] = "present";
      else if (!prev) state[ch] = "absent";
    });
  });
  return state;
}

const KEYBOARD_ROWS = [
  ["Q","W","E","R","T","Y","U","I","O","P"],
  ["A","S","D","F","G","H","J","K","L"],
  ["ENTER","Z","X","C","V","B","N","M","⌫"],
];

// ── Tile ───────────────────────────────────────────────────────────────────────
function Tile({ letter, state, delay = 0, revealed, wordLen }) {
  const size = wordLen <= 5 ? "big" : wordLen <= 7 ? "med" : "sm";
  return (
    <div
      className={`tile tile--${size} ${state ? `tile--${state}` : ""} ${revealed ? "tile--revealed" : ""} ${letter && !state ? "tile--filled" : ""}`}
      style={{ animationDelay: `${delay}ms`, "--reveal-delay": `${delay}ms` }}
    >
      <div className="tile-inner">
        <div className="tile-front">{letter}</div>
        <div className="tile-back">{letter}</div>
      </div>
    </div>
  );
}

// ── Grid ───────────────────────────────────────────────────────────────────────
function Grid({ guesses, evaluations, currentGuess, wordLen, maxTries, shake, revealRow }) {
  const rows = Array(maxTries).fill(null);
  return (
    <div className="grid" style={{ "--word-len": wordLen }}>
      {rows.map((_, rowIdx) => {
        const submitted = guesses[rowIdx];
        const isCurrent = rowIdx === guesses.length;
        const letters = submitted
          ? submitted.split("")
          : isCurrent
          ? currentGuess.split("")
          : [];

        return (
          <div
            key={rowIdx}
            className={`grid-row ${shake && isCurrent ? "shake" : ""}`}
          >
            {Array(wordLen).fill(null).map((_, ci) => (
              <Tile
                key={ci}
                letter={letters[ci] || ""}
                state={submitted ? evaluations[rowIdx]?.[ci] : undefined}
                delay={ci * 120}
                revealed={submitted && revealRow === rowIdx ? true : submitted && revealRow > rowIdx ? true : false}
                wordLen={wordLen}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ── Keyboard ───────────────────────────────────────────────────────────────────
function Keyboard({ onKey, keyStates, disabled }) {
  return (
    <div className="keyboard">
      {KEYBOARD_ROWS.map((row, ri) => (
        <div key={ri} className="keyboard-row">
          {row.map((k) => (
            <button
              key={k}
              className={`key ${k.length > 1 ? "key--wide" : ""} ${keyStates[k] ? `key--${keyStates[k]}` : ""}`}
              onClick={() => !disabled && onKey(k)}
              disabled={disabled}
            >
              {k}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Popup ──────────────────────────────────────────────────────────────────────
function Popup({ won, word, onPlayAgain, onClose }) {
  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup" onClick={(e) => e.stopPropagation()}>
        <div className="popup-emoji">{won ? "🎉" : "💔"}</div>
        <h2 className="popup-title">{won ? "Yeeeeyyy you WON!" : "Oh no, well tried"}</h2>
        <p className="popup-word">
          {won ? "The word was" : "The word was"}{" "}
          <span className="popup-word-highlight">{word}</span>
        </p>
        <div className="popup-actions">
          <button className="btn btn--primary" onClick={onPlayAgain}>
            ✨ Play Again
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Custom Word Modal ──────────────────────────────────────────────────────────
function CustomWordModal({ onSubmit, onClose }) {
  const [input, setInput] = useState("");
  const [err, setErr] = useState("");
  const [shareLink, setShareLink] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSubmit = async () => {
    const clean = input.trim().toUpperCase().replace(/[^A-Z]/g, "");
    if (clean.length < 4 || clean.length > 10) {
      setErr("Word must be 4–10 letters long!");
      return;
    }
    
    try {
      const res = await fetch(`${API_BASE}/api/custom-word`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: clean })
      });
      const data = await res.json();
      
      // Generate shareable link
      const link = `${window.location.origin}?word=${data.id}`;
      setShareLink(link);
    } catch (e) {
      setErr("Failed to create custom word. Try again!");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePlayNow = () => {
    const wordId = shareLink.split("word=")[1];
    onSubmit(wordId);
  };

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup popup--custom" onClick={(e) => e.stopPropagation()}>
        {!shareLink ? (
          <>
            <div className="popup-emoji">🌶️</div>
            <h2 className="popup-title spicy">CREATE YOUR WORDLE!</h2>
            <p className="popup-sub">Enter a word and share it with friends</p>
            <input
              className="custom-input"
              maxLength={10}
              value={input}
              onChange={(e) => { setInput(e.target.value); setErr(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="Type a 4–10 letter word..."
              autoFocus
            />
            {err && <p className="custom-error">{err}</p>}
            <div className="popup-actions">
              <button className="btn btn--spicy" onClick={handleSubmit}>
                🔥 Create Link
              </button>
              <button className="btn btn--ghost" onClick={onClose}>Cancel</button>
            </div>
          </>
        ) : (
          <>
            <div className="popup-emoji">🎉</div>
            <h2 className="popup-title">Link Created!</h2>
            <p className="popup-sub">Share this link with your friends</p>
            <div className="share-link-container">
              <input
                className="share-link-input"
                value={shareLink}
                readOnly
                onClick={(e) => e.target.select()}
              />
              <button className="btn btn--copy" onClick={handleCopy}>
                {copied ? "✓ Copied!" : "📋 Copy"}
              </button>
            </div>
            <div className="popup-actions">
              <button className="btn btn--primary" onClick={handlePlayNow}>
                ▶️ Play Now
              </button>
              <button className="btn btn--ghost" onClick={onClose}>Close</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Length Picker ──────────────────────────────────────────────────────────────
function LengthPicker({ value, onChange }) {
  return (
    <div className="length-picker">
      <span className="length-label">Word length:</span>
      {[4,5,6,7,8,9,10].map((n) => (
        <button
          key={n}
          className={`length-btn ${value === n ? "length-btn--active" : ""}`}
          onClick={() => onChange(n)}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

// ── Toast ──────────────────────────────────────────────────────────────────────
function Toast({ msg }) {
  if (!msg) return null;
  return <div className="toast">{msg}</div>;
}

// ── Main App ───────────────────────────────────────────────────────────────────
export default function App() {
  const [wordLen, setWordLen] = useState(5);
  const [maxTries] = useState(6);
  const [targetWord, setTargetWord] = useState("");
  const [guesses, setGuesses] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [shake, setShake] = useState(false);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);
  const [revealRow, setRevealRow] = useState(-1);
  const [particles, setParticles] = useState([]);
  const revealTimer = useRef(null);

  // ── Fetch word ───────────────────────────────────────────────────────────────
  const fetchWord = useCallback(async (len) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/word?length=${len}`);
      const data = await res.json();
      setTargetWord(data.word);
    } catch {
      // hard fallback
      const fallbacks = {
        4:"LOVE",5:"DREAM",6:"BEAUTY",7:"DARLING",8:"ADORABLE",9:"WONDERFUL",10:"BREATHLESS"
      };
      setTargetWord(fallbacks[len] || "DREAM");
    }
    setLoading(false);
  }, []);

  const resetGame = useCallback((len, customWord) => {
    setGuesses([]);
    setEvaluations([]);
    setCurrentGuess("");
    setGameOver(false);
    setWon(false);
    setShowPopup(false);
    setRevealRow(-1);
    setParticles([]);
    if (customWord) {
      setTargetWord(customWord);
      setWordLen(customWord.length);
      setLoading(false);
    } else {
      fetchWord(len || wordLen);
    }
  }, [fetchWord, wordLen]);

  useEffect(() => { fetchWord(wordLen); }, []);

  // ── Confetti ─────────────────────────────────────────────────────────────────
  const spawnConfetti = () => {
    const items = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: ["#ff6b9d","#ff9eb5","#ffd700","#ff4444","#ff8c00","#ff69b4"][Math.floor(Math.random()*6)],
      delay: Math.random() * 600,
      size: 8 + Math.random() * 8,
    }));
    setParticles(items);
    setTimeout(() => setParticles([]), 3000);
  };

  // ── Key handler ──────────────────────────────────────────────────────────────
  const handleKey = useCallback((key) => {
    if (gameOver || loading) return;

    if (key === "⌫" || key === "BACKSPACE") {
      setCurrentGuess((g) => g.slice(0, -1));
      return;
    }
    if (key === "ENTER") {
      if (currentGuess.length !== wordLen) {
        setShake(true);
        showToast(`Word must be ${wordLen} letters!`);
        setTimeout(() => setShake(false), 600);
        return;
      }
      const ev = evaluateGuess(currentGuess, targetWord);
      const newGuesses = [...guesses, currentGuess];
      const newEvals = [...evaluations, ev];
      setGuesses(newGuesses);
      setEvaluations(newEvals);
      setCurrentGuess("");

      // Reveal animation row index
      const ri = newGuesses.length - 1;
      setRevealRow(ri);

      const didWin = currentGuess === targetWord;
      const didLose = !didWin && newGuesses.length === maxTries;

      clearTimeout(revealTimer.current);
      revealTimer.current = setTimeout(() => {
        if (didWin || didLose) {
          setGameOver(true);
          setWon(didWin);
          if (didWin) spawnConfetti();
          setTimeout(() => setShowPopup(true), 400);
        }
      }, wordLen * 120 + 400);
      return;
    }
    if (/^[A-Z]$/.test(key) && currentGuess.length < wordLen) {
      setCurrentGuess((g) => g + key);
    }
  }, [gameOver, loading, currentGuess, wordLen, guesses, evaluations, targetWord, maxTries]);

  // Physical keyboard
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key.toUpperCase();
      if (k === "BACKSPACE") handleKey("⌫");
      else if (k === "ENTER") handleKey("ENTER");
      else if (/^[A-Z]$/.test(k)) handleKey(k);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleKey]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 1800);
  };

  const handleCustomWord = async (wordId) => {
    setShowCustom(false);
    
    try {
      const res = await fetch(`${API_BASE}/api/custom-word/${wordId}`);
      const data = await res.json();
      resetGame(null, data.word);
      showToast(`Playing custom word! ${data.word.length} letters 🔥`);
    } catch (e) {
      showToast("Failed to load custom word!");
    }
  };

  // Check URL for shared word on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const wordId = params.get("word");
    if (wordId) {
      handleCustomWord(wordId);
    } else {
      fetchWord(wordLen);
    }
  }, []);

  const keyStates = buildKeyStates(guesses, evaluations);

  return (
    <div className="app">
      {/* Background blobs */}
      <div className="bg-blob blob1" />
      <div className="bg-blob blob2" />
      <div className="bg-blob blob3" />

      {/* Confetti */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.x}%`,
            background: p.color,
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}ms`,
          }}
        />
      ))}

      {/* Header */}
      <header className="header">
        <div className="header-left">
          <button className="btn btn--spicy btn--sm" onClick={() => setShowCustom(true)}>
            🌶️ Custom Word
          </button>
        </div>
        <h1 className="logo">
          <span className="logo-w">W</span>
          <span className="logo-o">O</span>
          <span className="logo-r">R</span>
          <span className="logo-d">D</span>
          <span className="logo-l">L</span>
          <span className="logo-e">E</span>
          <span className="logo-heart">♥</span>
        </h1>
        <div className="header-right">
          <button className="btn btn--ghost btn--sm" onClick={() => resetGame()}>
            ↺ New Word
          </button>
        </div>
      </header>

      {/* Length picker */}
      <LengthPicker
        value={wordLen}
        onChange={(n) => { setWordLen(n); resetGame(n); }}
      />

      {/* Toast */}
      <Toast msg={toast} />

      {/* Loading */}
      {loading ? (
        <div className="loading">
          <div className="loading-heart">♥</div>
          <p>Finding the perfect word…</p>
        </div>
      ) : (
        <>
          <Grid
            guesses={guesses}
            evaluations={evaluations}
            currentGuess={currentGuess}
            wordLen={wordLen}
            maxTries={maxTries}
            shake={shake}
            revealRow={revealRow}
          />
          <Keyboard onKey={handleKey} keyStates={keyStates} disabled={gameOver || loading} />
        </>
      )}

      {/* Popups */}
      {showPopup && (
        <Popup
          won={won}
          word={targetWord}
          onPlayAgain={() => resetGame()}
          onClose={() => setShowPopup(false)}
        />
      )}
      {showCustom && (
        <CustomWordModal
          onSubmit={handleCustomWord}
          onClose={() => setShowCustom(false)}
        />
      )}
    </div>
  );
}
