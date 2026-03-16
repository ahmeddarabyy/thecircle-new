import os
import glob
import re

def fix_railway_api(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    orig = content
    
    # Robust replacement that covers:
    # 1. localhost
    # 2. 127.0.0.1
    # 3. 10.x.x.x
    # 4. 172.16.x.x - 172.31.x.x
    # 5. 192.168.x.x
    # Points to Railway URL for production
    
    # Pattern to match any version of the simplified API_BASE/API logic we've used
    pattern = r"const (API_BASE|API) = \(.*?\) \? `http://\${window\.location\.hostname}:3001/api` : .*?;"
    
    replacement = r"""const \1 = (
            window.location.hostname === 'localhost' || 
            window.location.hostname === '127.0.0.1' || 
            window.location.hostname.startsWith('10.') || 
            window.location.hostname.startsWith('192.168.') || 
            /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(window.location.hostname)
        ) ? `http://${window.location.hostname}:3001/api` : 'https://thecircle-api.up.railway.app/api';"""
            
    content = re.sub(pattern, replacement, content, flags=re.MULTILINE | re.DOTALL)

    if content != orig:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated API_BASE to Railway in {filepath}")

files = glob.glob('*.html') + glob.glob('ar/*.html') + glob.glob('backend/public/*.html')
for file in files:
    fix_railway_api(file)
