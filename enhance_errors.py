import os
import glob
import re

def enhance_error_handling(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    orig = content
    
    # 1. Update Booking Submit Error Handling
    if 'submitBooking' in content:
        # English alert
        content = content.replace(
            "alert('⚠️ ' + err.message);",
            "console.error('Booking Error:', err); alert('⚠️ ' + (err.message === 'Failed to fetch' ? 'Unable to connect to server. If testing on mobile, ensure your computer is reachable on the network and port 3001 is open.' : err.message));"
        )
        # Arabic alert (if translated)
        content = content.replace(
            "alert('⚠️ ' + err.message);", # It seems the Arabic version also used English for the alert part in some places or same string
            "console.error('Booking Error:', err); alert('⚠️ ' + (err.message === 'Failed to fetch' ? 'عذراً، فشل الاتصال بالسيرفر. يرجى التأكد من اتصال الموبايل بنفس الشبكة وفتح بورت 3001.' : err.message));"
        )

    # 2. Update Support Request Error Handling
    if 'handleSubmit' in content:
        # Handle non-ok response
        content = content.replace(
            "alert('Something went wrong. Please try again.');",
            "const errData = await response.json().catch(()=>({})); alert('⚠️ Error: ' + (errData.error || 'Server error ' + response.status));"
        )
        content = content.replace(
            "alert('عذراً، حدث خطأ ما. يرجى المحاولة مرة أخرى.');",
            "const errData = await response.json().catch(()=>({})); alert('⚠️ خطأ: ' + (errData.error || 'خطأ في السيرفر ' + response.status));"
        )
        # Handle catch block
        content = content.replace(
            "alert('Could not reach the server. Please try again later.');",
            "console.error('Support Error:', error); alert('⚠️ Network Error: Could not reach the server. Please check your connection.');"
        )
        content = content.replace(
            "alert('تعذر الاتصال بالسيرفر. يرجى المحاولة لاحقاً.');",
            "console.error('Support Error:', error); alert('⚠️ خطأ في الاتصال: فشل الوصول للسيرفر.');"
        )

    if content != orig:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Enhanced error handling in {filepath}")

files = glob.glob('*.html') + glob.glob('ar/*.html')
for file in files:
    enhance_error_handling(file)
