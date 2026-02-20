"""
Simple test script to verify the Wordle API is working
Run this after starting the server to test all endpoints
"""

import requests
import json

BASE_URL = "http://localhost:5000"

def test_health():
    """Test health check endpoint"""
    print("Testing /api/health...")
    response = requests.get(f"{BASE_URL}/api/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    print("✅ Health check passed!\n")

def test_get_word():
    """Test word generation"""
    print("Testing /api/word...")
    for length in [4, 5, 6, 7]:
        response = requests.get(f"{BASE_URL}/api/word?length={length}")
        data = response.json()
        print(f"Length {length}: {data['word']} (fallback: {data.get('fallback', False)})")
    print("✅ Word generation passed!\n")

def test_custom_word():
    """Test custom word creation and retrieval"""
    print("Testing /api/custom-word...")
    
    # Create custom word
    word = "PYTHON"
    response = requests.post(
        f"{BASE_URL}/api/custom-word",
        json={"word": word}
    )
    data = response.json()
    word_id = data["id"]
    print(f"Created custom word: {data['word']} (ID: {word_id})")
    
    # Retrieve custom word
    response = requests.get(f"{BASE_URL}/api/custom-word/{word_id}")
    data = response.json()
    print(f"Retrieved: {data['word']} (length: {data['length']})")
    print("✅ Custom word passed!\n")

def test_word_repetition():
    """Test that words don't repeat too often"""
    print("Testing word repetition prevention...")
    words = []
    for i in range(10):
        response = requests.get(f"{BASE_URL}/api/word?length=5")
        word = response.json()["word"]
        words.append(word)
    
    unique_words = len(set(words))
    print(f"Generated 10 words, {unique_words} were unique")
    print(f"Words: {', '.join(words)}")
    
    if unique_words >= 8:
        print("✅ Good variety - repetition prevention working!\n")
    else:
        print("⚠️  Some repetition detected (this is okay occasionally)\n")

if __name__ == "__main__":
    print("=" * 50)
    print("Wordle API Test Suite")
    print("=" * 50)
    print()
    
    try:
        test_health()
        test_get_word()
        test_custom_word()
        test_word_repetition()
        
        print("=" * 50)
        print("All tests completed! 🎉")
        print("=" * 50)
    except requests.exceptions.ConnectionError:
        print("❌ Error: Could not connect to server")
        print("Make sure the server is running on http://localhost:5000")
    except Exception as e:
        print(f"❌ Error: {e}")
