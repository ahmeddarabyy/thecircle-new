import os
import glob
import re

def fix_safari_fetch(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    orig = content
    
    # 1. Update API_BASE definition
    # Targets the simplified version I added earlier
    api_base_pattern = r"const (API_BASE|API) = \(window\.location\.hostname === 'localhost' \|\| window\.location\.hostname\.startsWith\('192\.168\.'\)\) \s*\? `http://\${window\.location\.hostname}:3001/api` \s*: '/api';"
    api_base_replacement = r"const \1 = (window.location.hostname === 'localhost' || window.location.hostname.indexOf('192.168.') === 0) ? `http://${window.location.hostname}:3001/api` : window.location.origin + '/api';"
    
    content = re.sub(api_base_pattern, api_base_replacement, content, flags=re.MULTILINE | re.DOTALL)

    # 2. Fix fetch pattern in book-a-space (both en and ar)
    # The current pattern in book-a-space:
    # const res = await fetch(`${API_BASE}/bookings`, { ... });
    # const data = await res.json();
    # if (!res.ok) throw new Error(data.error || 'Booking failed');

    booking_fetch_pattern = r"(const res = await fetch\(`\$\{API_BASE\}/bookings`, \{.*?\}\);)\s+const data = await res\.json\(\);\s+if \(!res\.ok\) throw new Error\(data\.error \|\| '.*?'\);"
    booking_fetch_replacement = r"""\1
                if (!res.ok) {
                    const errorText = await res.text();
                    throw new Error(`Server Error (${res.status}): ${errorText.substring(0, 100)}`);
                }
                const data = await res.json();"""

    content = re.sub(booking_fetch_pattern, booking_fetch_replacement, content, flags=re.DOTALL)

    # 3. Fix fetch pattern in support-request (both en and ar)
    # The current pattern in support-request:
    # const response = await fetch(API_BASE + '/support', { ... });
    # if (response.ok) { ... } else { const errData = await response.json().catch(()=>({})); ... }

    support_fetch_pattern = r"(const response = await fetch\(API_BASE \+ '/support', \{.*?\}\);)\s+if \(response\.ok\) \{(.*?)\} else \{(.*?)alert\(.*?\);(.*?)\}"
    
    # We want to replace the whole if/else block to be safer
    # This regex is a bit risky if nested, but these files are simple.
    
    # Alternative: specific replacement for the error parsing
    content = content.replace(
        "const errData = await response.json().catch(()=>({})); alert('⚠️ Error: ' + (errData.error || 'Server error ' + response.status));",
        "const errorText = await response.text(); alert('⚠️ Error (' + response.status + '): ' + errorText.substring(0, 100));"
    )
    content = content.replace(
        "const errData = await response.json().catch(()=>({})); alert('⚠️ خطأ: ' + (errData.error || 'خطأ في السيرفر ' + response.status));",
        "const errorText = await response.text(); alert('⚠️ خطأ (' + response.status + '): ' + errorText.substring(0, 100));"
    )

    if content != orig:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed Safari fetch in {filepath}")

files = glob.glob('*.html') + glob.glob('ar/*.html') + glob.glob('backend/public/*.html')
for file in files:
    fix_safari_fetch(file)
