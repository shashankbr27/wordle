"""
Demo script to show how word tracking prevents repetition
This simulates getting words without actually calling the API
"""

import random
from collections import Counter

# Simulated word lists
WORDS_5_LETTER = [
    "HEART", "BLUSH", "CHARM", "SMILE", "DREAM",
    "GRACE", "PEACE", "LIGHT", "MAGIC", "SWEET",
    "HAPPY", "LUCKY", "SHINE", "SPARK", "GLORY"
]

def simulate_old_system(num_words=20):
    """Simulate the old system (random selection, no tracking)"""
    words = []
    for _ in range(num_words):
        word = random.choice(WORDS_5_LETTER)
        words.append(word)
    return words

def simulate_new_system(num_words=20, track_last=10):
    """Simulate the new system (with word tracking)"""
    words = []
    recent = []
    
    for _ in range(num_words):
        # Try to find a word not in recent history
        attempts = 0
        while attempts < 10:
            word = random.choice(WORDS_5_LETTER)
            if word not in recent:
                break
            attempts += 1
        
        words.append(word)
        recent.append(word)
        
        # Keep only last N words
        if len(recent) > track_last:
            recent.pop(0)
    
    return words

def analyze_words(words, system_name):
    """Analyze word distribution"""
    print(f"\n{'='*60}")
    print(f"{system_name}")
    print(f"{'='*60}")
    
    print(f"\nWords generated: {', '.join(words)}")
    
    # Count occurrences
    counter = Counter(words)
    unique = len(counter)
    total = len(words)
    
    print(f"\nStatistics:")
    print(f"  Total words: {total}")
    print(f"  Unique words: {unique}")
    print(f"  Repetition rate: {((total - unique) / total * 100):.1f}%")
    
    # Show most common
    most_common = counter.most_common(3)
    print(f"\nMost repeated words:")
    for word, count in most_common:
        if count > 1:
            print(f"  {word}: {count} times")
    
    # Calculate variety score
    variety_score = (unique / total) * 100
    print(f"\nVariety score: {variety_score:.1f}%")
    
    if variety_score >= 90:
        print("  ✅ Excellent variety!")
    elif variety_score >= 75:
        print("  👍 Good variety")
    elif variety_score >= 60:
        print("  😐 Moderate variety")
    else:
        print("  😕 Poor variety")

def main():
    print("=" * 60)
    print("Word Tracking Demo - Repetition Prevention")
    print("=" * 60)
    print("\nThis demo shows how the new system prevents word repetition")
    print("by tracking recently used words.\n")
    
    # Simulate both systems
    num_words = 20
    
    print(f"Generating {num_words} words with each system...\n")
    
    # Old system
    old_words = simulate_old_system(num_words)
    analyze_words(old_words, "OLD SYSTEM (No Tracking)")
    
    # New system
    new_words = simulate_new_system(num_words, track_last=10)
    analyze_words(new_words, "NEW SYSTEM (Tracks Last 10 Words)")
    
    # Summary
    print(f"\n{'='*60}")
    print("Summary")
    print(f"{'='*60}")
    
    old_unique = len(set(old_words))
    new_unique = len(set(new_words))
    
    improvement = ((new_unique - old_unique) / old_unique * 100) if old_unique > 0 else 0
    
    print(f"\nUnique words:")
    print(f"  Old system: {old_unique}/{num_words}")
    print(f"  New system: {new_unique}/{num_words}")
    print(f"  Improvement: +{improvement:.1f}%")
    
    print(f"\n💡 In the actual backend:")
    print(f"  - Tracks last 50 words (not just 10)")
    print(f"  - Separate tracking for each word length (4-10)")
    print(f"  - Persists across server restarts")
    print(f"  - Shared across all players")
    
    print(f"\n🎮 Result: Much better gameplay experience!")
    print()

if __name__ == "__main__":
    main()
