import os
import glob
import re

def refactor_api_logic(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    orig = content
    
    # This logic handles local testing via IP and production relative paths
    robust_logic = """
        const getApiBase = () => {
            const h = window.location.hostname;
            const p = window.location.port;
            if (p === '8000' || h === 'localhost' || h === '127.0.0.1' || h.match(/^192\\.168\\./) || h.match(/^10\\./) || h.match(/^172\\.(1[6-9]|2[0-9]|3[0-1])\\./)) {
                return `http://${h}:3001/api`;
            }
            return '/api';
        };
        const API_BASE = getApiBase();"""

    # Replace defined API_BASE
    content = re.sub(
        r"const API_BASE = window\.location\.hostname === 'localhost' \|\| window\.location\.hostname === '127\.0\.0\.1' \s*\? 'http://localhost:3001/api' \s*: '/api';",
        robust_logic.strip(),
        content,
        flags=re.MULTILINE | re.DOTALL
    )
    
    # Handles already modified one in ar/book-a-space
    content = content.replace(
        "const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:3001/api' : '/api';",
        robust_logic.strip()
    )

    # Replace defined API in dashboard
    content = content.replace(
        "const API = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:3001/api' : '/api';",
        robust_logic.replace("API_BASE", "API").strip()
    )

    # 2. Fix support-request.html pattern
    direct_fetch_pattern = "fetch((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:3001/api' : '/api') + '/"
    
    if direct_fetch_pattern in content:
        if "const getApiBase =" not in content:
            script_start = "<script>"
            replacement_script = script_start + "\n" + robust_logic.replace("const API_BASE = getApiBase();", "")
            content = content.replace(script_start, replacement_script)
        
        content = content.replace(direct_fetch_pattern, "fetch(getApiBase() + '/")

    if content != orig:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Refactored {filepath}")

files = glob.glob('*.html') + glob.glob('ar/*.html') + glob.glob('backend/public/*.html')
for file in files:
    refactor_api_logic(file)
