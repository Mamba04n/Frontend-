import sys

path = 'src/pages/GroupDetail.jsx'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

old_string = '<div className="flex flex-col sm:flex-row border-t border-gray-100 mt-2 overflow-hidden rounded-b-2xl">'
new_string = '<div className="flex flex-row overflow-x-auto whitespace-nowrap scrollbar-hide border-t border-gray-100 mt-2 rounded-b-2xl">'

if old_string in text:
    text = text.replace(old_string, new_string)
else:
    # Fallback to similar
    import re
    text = re.sub(
        r'<div className="flex flex-col sm:flex-row[^>]*">',
        '<div className="flex flex-row overflow-x-auto whitespace-nowrap scrollbar-hide border-t border-gray-100 mt-2 rounded-b-2xl">',
        text
    )

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

print("Navbar style applied")