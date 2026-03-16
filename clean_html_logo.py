import os
import re

html_files = [f for f in os.listdir('.') if f.endswith('.html')]

# Target the specific inline-styled img tag from my previous script
# <img src="assets/logocircletransparentwhite.png" alt="The Circle" class="footer-logo-tiny" style="height: 32px; width: auto; margin-bottom: 12px; opacity: 0.6;">
# Change to just the class
old_tag = r'<img src="assets/logocircletransparentwhite\.png" alt="The Circle" class="footer-logo-tiny" style="height: 32px; width: auto; margin-bottom: 12px; opacity: 0.6;">'
new_tag = r'<img src="assets/logocircletransparentwhite.png" alt="The Circle" class="footer-logo-tiny">'

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = re.sub(old_tag, new_tag, content)
    
    if new_content != content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Cleaned {file}")
