#!/usr/bin/env python3
"""
Debug script to list available Gemini models
"""
import os
import google.generativeai as genai

# Configure API
api_key = os.environ.get("GOOGLE_API_KEY")
if not api_key:
    print("ERROR: GOOGLE_API_KEY not found in environment")
    exit(1)

genai.configure(api_key=api_key)

print("=== Available Gemini Models ===")
try:
    models = genai.list_models()
    for model in models:
        print(f"Name: {model.name}")
        print(f"  Display Name: {model.display_name}")
        print(f"  Supported Methods: {model.supported_generation_methods}")
        print("---")
except Exception as e:
    print(f"Error listing models: {e}")

print("\n=== Testing Common Model Names ===")
common_names = [
    'gemini-1.5-pro',
    'gemini-1.5-pro-latest', 
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-pro',
    'gemini-1.0-pro-latest'
]

for name in common_names:
    try:
        model = genai.GenerativeModel(name)
        print(f"✅ {name} - Available")
    except Exception as e:
        print(f"❌ {name} - Error: {e}")