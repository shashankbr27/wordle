@echo off
echo Starting Wordle Python Backend...
echo.

if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate

echo Installing dependencies...
pip install -r requirements.txt

if not exist .env (
    echo Creating .env file from example...
    copy .env.example .env
    echo.
    echo ⚠️  Please edit .env file with your API keys before running!
    echo.
    pause
    exit
)

echo.
echo Starting server...
python server.py
