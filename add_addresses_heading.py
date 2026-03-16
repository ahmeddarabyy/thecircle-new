import os
import re

html_files = [f for f in os.listdir('.') if f.endswith('.html')]

# We want to insert <h4 class="footer-heading">Addresses</h4> above the contact info
# The current pattern is <div class="footer-col-brand">\s+<div class="footer-contact-info">
pattern = r'(<div class="footer-col-brand">)\s+(<div class="footer-contact-info">)'
replacement = r'\1\n                <h4 class="footer-heading">Addresses</h4>\n                \2'

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'footer-main' not in content:
        continue
        
    new_content = re.sub(pattern, replacement, content)
    
    if new_content != content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Added Addresses heading to {file}")
