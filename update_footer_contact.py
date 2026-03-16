import os
import re

html_files = [f for f in os.listdir('.') if f.endswith('.html')]

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Search for the old contact info block
    old_contact = r'<p>contact@circleworkspace\.com</p>\s*<p>\+20 10 34708850</p>'
    new_contact = '<p style="margin-bottom: 4px;"><strong style="color: #fff; font-weight: 500;">Email:</strong> contact@circleworkspace.com</p>\n                    <p><strong style="color: #fff; font-weight: 500;">Phone:</strong> +20 10 34708850</p>'

    new_content = re.sub(old_contact, new_contact, content)

    if new_content != content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {file}")
