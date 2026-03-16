import os
import glob
import re

def fix_vercel_api(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    orig = content
    
    # Pattern to match the Railway-specific API_BASE logic
    pattern = r"const (API_BASE|API) = \(.*?\) \? `http://\${window\.location\.hostname}:3001/api` : 'https://thecircle-new-production\.up\.railway\.app/api';"
    
    # Replacement points back to /api for Vercel production
    replacement = r"""const \1 = (
            window.location.hostname === 'localhost' || 
            window.location.hostname === '127.0.0.1' || 
            window.location.hostname.startsWith('10.') || 
            window.location.hostname.startsWith('192.168.') || 
            /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(window.location.hostname)
        ) ? `http://${window.location.hostname}:3001/api` : '/api';"""
            
    content = re.sub(pattern, replacement, content, flags=re.MULTILINE | re.DOTALL)

    if content != orig:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated API_BASE to /api in {filepath}")

files = glob.glob('*.html') + glob.glob('ar/*.html') + glob.glob('backend/public/*.html')
for file in files:
    fix_vercel_api(file)
