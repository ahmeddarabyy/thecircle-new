import os
import re

html_files = [f for f in os.listdir('.') if f.endswith('.html')]

# 1. Pattern to remove the old logo
logo_img_pattern = r'<img src="assets/logocircletransparentwhite\.png" alt="The Circle" class="footer-logo-main">'

# 2. Pattern to find the copyright section
# We'll look for the start of <div class="footer-copyright">
copyright_pattern = r'<div class="footer-copyright">'
# We'll replace it with a logo div + the copyright div
new_copyright_block = r'''<div class="footer-copyright">
                <img src="assets/logocircletransparentwhite.png" alt="The Circle" class="footer-logo-tiny" style="height: 32px; width: auto; margin-bottom: 12px; opacity: 0.6;">'''

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Skip files that don't have the footer
    if 'footer-main' not in content:
        continue

    # Remove the old logo if it exists
    new_content = re.sub(logo_img_pattern, '', content)
    
    # Add the tiny logo above the copyright line
    # Note: searching for the div and inserting the img inside it or above the p
    new_content = re.sub(copyright_pattern, new_copyright_block, new_content)

    if new_content != content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {file}")
