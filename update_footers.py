import os
import re

html_files = [f for f in os.listdir('.') if f.endswith('.html')]

company_html = """<div class="footer-col-links">
                <h4 class="footer-heading">Company</h4>
                <a href="about.html">About Us</a>
                <a href="locations.html">Locations</a>
                <a href="faq.html">FAQ</a>
                <a href="gallery.html">Gallery</a>
                <a href="insights.html">Insights</a>
                <a href="support-request.html">Support Request</a>
            </div>"""

services_html = """<div class="footer-col-links">
                <h4 class="footer-heading">Services</h4>
                <a href="private-offices.html">Private Offices</a>
                <a href="private-suites.html">Private Suites</a>
                <a href="dedicated-desks.html">Dedicated Desks</a>
                <a href="shared-spaces.html">Shared Spaces</a>
                <a href="meeting-rooms.html">Meeting Rooms</a>
                <a href="back-offices.html">Back Offices</a>
            </div>"""

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Need to match the current indentation, but for safety just let the replacement have the 12 spaces
    # Wait, the string above misses leading spaces for the first line. Let's fix.
    
    fixed_company = company_html
    fixed_services = services_html

    new_content = re.sub(
        r'<div class="footer-col-links">\s*<h4 class="footer-heading">Company</h4>[\s\S]*?</div>',
        fixed_company,
        content
    )
    
    new_content = re.sub(
        r'<div class="footer-col-links">\s*<h4 class="footer-heading">Services</h4>[\s\S]*?</div>',
        fixed_services,
        new_content
    )
    
    if new_content != content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {file}")
