import os
import glob
import re

def fix_api_final(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    orig = content
    
    # 1. Remove the complex getApiBase function and its call
    # Matches the function and the following const API_BASE = getApiBase();
    complex_fn_pattern = r'const getApiBase = \(\\) => \{.*?const API_BASE = getApiBase\(\\) \);'
    
    # Simple replacement for all patterns
    simplified_logic = """const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname.startsWith('192.168.')) 
            ? `http://${window.location.hostname}:3001/api` 
            : '/api';"""
            
    # Remove function if it exists
    if "const getApiBase =" in content:
        # Regex to find the whole block from const getApiBase to const API_BASE = getApiBase();
        content = re.sub(r'const getApiBase = \(\) => \{.*?const (API_BASE|API) = getApiBase\(\);', 
                        simplified_logic, 
                        content, 
                        flags=re.DOTALL)

    # 2. Fix fetch calls in support-request
    content = content.replace("fetch(getApiBase() + '/", "fetch(API_BASE + '/")
    
    # Fix dashboard specific var name if missed
    content = content.replace("const API = getApiBase();", simplified_logic.replace("API_BASE", "API"))

    if content != orig:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed {filepath}")

files = glob.glob('*.html') + glob.glob('ar/*.html') + glob.glob('backend/public/*.html')
for file in files:
    fix_api_final(file)
