# 💕 Wordle ♥ — A Letter in Code

A beautiful, fully-featured Wordle puzzle built with the MERN stack + Gemini AI.
Made to share with friends and loved ones 💌

---

## ✨ Features

- 🎲 **Random word generation** via Gemini AI (4–10 letters)
- 🌶️ **Custom word mode** — set a custom word for others to guess ("LET'S MAKE THINGS SPICY!")
- 🎨 **Gorgeous rose-gold dark theme** with animated background, confetti on win
- 📱 **Fully responsive** — works perfectly on phone, tablet, desktop
- 🎉 **Win popup**: "Yeeeeyyy you WON!"  |  ❌ **Lose popup**: "Oh no, well tried"
- 🔤 **On-screen keyboard** + physical keyboard support
- 🔁 **Play Again** button with fresh word each round
- ✅ Correct letter repeat handling (e.g., SHEEP)

---

## 🚀 Deployment Guide (Free, ~10 minutes)

### Step 1 — Get a Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click **Create API Key**
3. Copy the key — keep it safe!

### Step 2 — Get a Free MongoDB Database
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free account → New Project → Free M0 cluster
3. Under **Database Access**, create a user (username + password)
4. Under **Network Access**, allow access from anywhere (`0.0.0.0/0`)
5. Click **Connect** → **Drivers** → copy the connection string:
   ```
   mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/wordle
   ```
   (replace USERNAME and PASSWORD with what you created)

### Step 3 — Deploy Backend to Render (free)
1. Push this project to a **GitHub** repo
2. Go to [render.com](https://render.com) → Sign in with GitHub
3. Click **New +** → **Web Service**
4. Connect your repo → set **Root Directory** to `backend`
5. Set these:
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
6. Under **Environment Variables**, add:
   | Key | Value |
   |-----|-------|
   | `GEMINI_API_KEY` | your Gemini key |
   | `MONGO_URI` | your MongoDB Atlas URI |
   | `PORT` | `5000` |
7. Click **Create Web Service**
8. Wait ~2 min. Copy your backend URL: `https://wordle-backend-xxxx.onrender.com`

### Step 4 — Deploy Frontend to Vercel (free)
1. In the `frontend` folder, create a `.env` file:
   ```
   REACT_APP_API_URL=https://wordle-backend-xxxx.onrender.com
   ```
   (use your actual Render backend URL from Step 3)
2. Go to [vercel.com](https://vercel.com) → Import your GitHub repo
3. Set **Root Directory** to `frontend`
4. Add environment variable:
   - `REACT_APP_API_URL` = your Render backend URL
5. Click **Deploy**
6. Your game is live! 🎉 Share the Vercel link with friends 💌

---

## 🖥️ Run Locally

```bash
# 1. Clone this repo
git clone <your-repo-url>
cd wordle

# 2. Setup backend
cd backend
cp .env.example .env
# Fill in your GEMINI_API_KEY and MONGO_URI in .env
npm install
npm run dev

# 3. Setup frontend (new terminal)
cd frontend
npm install
npm start

# Open http://localhost:3000
```

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| AI Word Gen | Google Gemini 1.5 Flash |
| Fonts | Playfair Display + DM Sans |
| Deploy | Render (backend) + Vercel (frontend) |

---

## 🎮 How to Play

1. Guess a 5-letter word (default) in 6 tries
2. 🟩 **Green** = right letter, right spot
3. 🟨 **Yellow** = right letter, wrong spot
4. ⬜ **Gray** = letter not in word
5. Change word length (4–10 letters) using the picker
6. Hit 🌶️ **Custom Word** to set a secret word for others to guess!

---

Made with 💕 and way too much caffeine.
