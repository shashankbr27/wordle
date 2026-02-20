#!/bin/bash

echo "Starting Wordle Python Backend..."
echo ""

if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing dependencies..."
pip install -r requirements.txt

if [ ! -f ".env" ]; then
    echo "Creating .env file from example..."
    cp .env.example .env
    echo ""
    echo "⚠️  Please edit .env file with your API keys before running!"
    echo ""
    exit 1
fi

echo ""
echo "Starting server..."
python server.py
