"""
Setup verification script
Run this to check if everything is configured correctly
"""

import sys
import os

def check_python_version():
    """Check Python version"""
    print("Checking Python version...")
    version = sys.version_info
    if version.major >= 3 and version.minor >= 8:
        print(f"✅ Python {version.major}.{version.minor}.{version.micro} (Good!)")
        return True
    else:
        print(f"❌ Python {version.major}.{version.minor}.{version.micro} (Need 3.8+)")
        return False

def check_env_file():
    """Check if .env file exists and has required keys"""
    print("\nChecking .env file...")
    if not os.path.exists(".env"):
        print("❌ .env file not found")
        print("   Run: cp .env.example .env")
        return False
    
    with open(".env", "r") as f:
        content = f.read()
    
    required_keys = ["GEMINI_API_KEY", "MONGO_URI"]
    missing = []
    
    for key in required_keys:
        if key not in content:
            missing.append(key)
        elif f"{key}=your_" in content or f"{key}=" in content.replace(f"{key}=mongodb://", ""):
            print(f"⚠️  {key} needs to be set (still has placeholder value)")
            missing.append(key)
    
    if missing:
        print(f"❌ Missing or incomplete: {', '.join(missing)}")
        return False
    else:
        print("✅ .env file configured")
        return True

def check_dependencies():
    """Check if required packages are installed"""
    print("\nChecking dependencies...")
    required = ["flask", "flask_cors", "pymongo", "dotenv", "google.generativeai"]
    missing = []
    
    for package in required:
        try:
            __import__(package.replace(".", "_") if "." in package else package)
            print(f"✅ {package}")
        except ImportError:
            print(f"❌ {package} not installed")
            missing.append(package)
    
    if missing:
        print("\nInstall missing packages:")
        print("pip install -r requirements.txt")
        return False
    return True

def check_mongodb_connection():
    """Try to connect to MongoDB"""
    print("\nChecking MongoDB connection...")
    try:
        from pymongo import MongoClient
        from dotenv import load_dotenv
        
        load_dotenv()
        mongo_uri = os.getenv("MONGO_URI")
        
        if not mongo_uri or "your_" in mongo_uri:
            print("⚠️  MONGO_URI not configured in .env")
            return False
        
        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
        client.server_info()  # Force connection
        print("✅ MongoDB connected successfully")
        return True
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        return False

def check_gemini_api():
    """Check if Gemini API key is valid"""
    print("\nChecking Gemini API...")
    try:
        import google.generativeai as genai
        from dotenv import load_dotenv
        
        load_dotenv()
        api_key = os.getenv("GEMINI_API_KEY")
        
        if not api_key or "your_" in api_key:
            print("⚠️  GEMINI_API_KEY not configured in .env")
            return False
        
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        # Try a simple request
        response = model.generate_content("Say 'OK'")
        if response.text:
            print("✅ Gemini API working (using gemini-2.5-flash)")
            return True
        else:
            print("❌ Gemini API returned empty response")
            return False
    except Exception as e:
        print(f"❌ Gemini API error: {e}")
        return False

def main():
    print("=" * 60)
    print("Wordle Python Backend - Setup Verification")
    print("=" * 60)
    print()
    
    checks = [
        ("Python Version", check_python_version),
        ("Environment File", check_env_file),
        ("Dependencies", check_dependencies),
        ("MongoDB", check_mongodb_connection),
        ("Gemini API", check_gemini_api),
    ]
    
    results = []
    for name, check_func in checks:
        try:
            result = check_func()
            results.append((name, result))
        except Exception as e:
            print(f"❌ Error checking {name}: {e}")
            results.append((name, False))
    
    print("\n" + "=" * 60)
    print("Summary")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✅" if result else "❌"
        print(f"{status} {name}")
    
    print()
    print(f"Passed: {passed}/{total}")
    
    if passed == total:
        print("\n🎉 All checks passed! You're ready to run the server!")
        print("\nRun: python server.py")
    else:
        print("\n⚠️  Some checks failed. Please fix the issues above.")
        print("\nQuick fixes:")
        print("1. Copy .env.example to .env: cp .env.example .env")
        print("2. Edit .env with your API keys")
        print("3. Install dependencies: pip install -r requirements.txt")
    
    print()

if __name__ == "__main__":
    main()
