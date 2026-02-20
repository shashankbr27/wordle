# 💕 Wordle ♥ — A Letter in Code

A beautiful, fully-featured Wordle puzzle with React frontend + Python/Flask backend + Gemini AI.

---

## ✨ Features

- 🎲 **Random word generation** via Gemini AI (4–10 letters)
- 🔄 **Smart word tracking** — rarely repeats words (tracks last 50 per length!)
- 🌶️ **Custom word mode** — create your own Wordle and share it with a link!
- 🔗 **Shareable links** — send custom word challenges to friends
- 🎨 **Gorgeous rose-gold dark theme** with animated background, confetti on win
- 📱 **Fully responsive** — works perfectly on phone, tablet, desktop
- 🎉 **Win/lose popups** with beautiful animations
- � ***On-screen keyboard** + physical keyboard support
- 🔁 **Play Again** button with fresh word each round
- ✅ Correct letter repeat handling (e.g., SHEEP)
- 🐍 **Python backend** — clean, efficient, and easy to extend!

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

### Step 3 — Deploy Python Backend to Render (free)
1. Push this project to a **GitHub** repo
2. Go to [render.com](https://render.com) → Sign in with GitHub
3. Click **New +** → **Web Service**
4. Connect your repo → set **Root Directory** to `backend_python`
5. Set these:
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python server.py`
6. Under **Environment Variables**, add:
   | Key | Value |
   |-----|-------|
   | `GEMINI_API_KEY` | your Gemini key |
   | `MONGO_URI` | your MongoDB Atlas URI |
   | `PORT` | `5000` |
   | `PYTHON_VERSION` | `3.11.0` |
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

# 2. Setup Python backend
cd backend_python
python -m venv venv
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Fill in your GEMINI_API_KEY and MONGO_URI in .env
python server.py

# 3. Setup frontend (new terminal)
cd frontend
npm install
npm start

# Open http://localhost:3000
```

### Alternative: Node.js Backend
If you prefer Node.js, the original backend is still in the `backend` folder:
```bash
cd backend
npm install
npm run dev
```

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 |
| Backend | Python 3.11 + Flask |
| Database | MongoDB + PyMongo |
| AI Word Gen | Google Gemini 2.5 Flash |
| Word Tracking | Smart repetition prevention (last 50 words) |
| Fonts | Playfair Display + DM Sans |
| Deploy | Render (backend) + Vercel (frontend) |

---

## 🎮 How to Play

1. Guess a 5-letter word (default) in 6 tries
2. 🟩 **Green** = right letter, right spot
3. 🟨 **Yellow** = right letter, wrong spot
4. ⬜ **Gray** = letter not in word
5. Change word length (4–10 letters) using the picker
6. Hit 🌶️ **Custom Word** to create your own Wordle challenge

### Creating Custom Wordles

1. Click the **🌶️ Custom Word** button
2. Enter any 4-10 letter word
3. Click **🔥 Create Link**
4. Copy and share the link with friends!
5. They'll have to guess YOUR word 😎

Example: `https://yoursite.com?word=abc123`

---

## 📁 Project Structure

```
wordle/
├── backend/              # Node.js backend (alternative)
├── backend_python/       # Python/Flask backend (recommended)
│   ├── server.py        # Main Flask application
│   ├── requirements.txt # Python dependencies
│   ├── check_setup.py   # Setup verification script
│   └── test_api.py      # API testing script
├── frontend/            # React frontend
│   ├── src/
│   │   ├── App.js      # Main game logic
│   │   └── App.css     # Styling
│   └── public/
└── README.md
```

---

Made with 💕 and Python.
