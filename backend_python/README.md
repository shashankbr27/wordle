# Python Backend

Flask backend for Wordle with smart word tracking.

## Quick Start

```bash
# Windows
start.bat

# Mac/Linux
chmod +x start.sh
./start.sh
```

## Manual Setup

```bash
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your API keys
python server.py
```

## Test

```bash
python check_setup.py  # Verify configuration
python test_api.py     # Test API endpoints
```

## Features

- Gemini 2.5 Flash for word generation
- Tracks last 50 words per length to prevent repetition
- MongoDB for persistence
- Custom word support
