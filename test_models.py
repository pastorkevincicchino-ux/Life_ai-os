#!/usr/bin/env python3
"""
Query Google Gemini API to see what models are actually available
"""
import os
import sys

# Add the current directory to Python path to use the installed packages
sys.path.insert(0, '/workspaces/Life-ai')

try:
    import google.generativeai as genai
    
    # Configure API with your key
    api_key = os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        print("❌ GOOGLE_API_KEY not found in environment")
        sys.exit(1)
    
    genai.configure(api_key=api_key)
    print("✅ API configured successfully")
    print("=" * 60)
    
    print("🔍 Listing all available models...")
    models = list(genai.list_models())
    
    print(f"\n📊 Found {len(models)} total models")
    print("=" * 60)
    
    # Filter for generateContent models
    generation_models = []
    for model in models:
        if hasattr(model, 'supported_generation_methods') and 'generateContent' in model.supported_generation_methods:
            generation_models.append(model)
            print(f"✅ {model.name}")
            if hasattr(model, 'display_name'):
                print(f"   Display: {model.display_name}")
            print(f"   Methods: {model.supported_generation_methods}")
            print("   ---")
    
    print(f"\n🎯 Found {len(generation_models)} models that support generateContent")
    
    print("\n🧪 Testing common model names...")
    test_names = [
        'gemini-1.5-pro',
        'gemini-1.5-flash', 
        'gemini-pro',
        'models/gemini-1.5-pro',
        'models/gemini-1.5-flash',
        'gemini-1.5-pro-001',
        'gemini-1.5-flash-001'
    ]
    
    for name in test_names:
        try:
            test_model = genai.GenerativeModel(name)
            # Try a quick generation to test
            response = test_model.generate_content("Hello", generation_config={'max_output_tokens': 5})
            print(f"✅ {name} - WORKS!")
        except Exception as e:
            print(f"❌ {name} - Error: {str(e)[:100]}...")

except ImportError as e:
    print(f"❌ Import error: {e}")
    print("💡 Try: pip install google-generativeai")
except Exception as e:
    print(f"❌ Error: {e}")