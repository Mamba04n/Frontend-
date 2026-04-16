import sys

path = 'src/pages/Reports.jsx'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Fix Header actions (make them stack on very small screens, or at least be flexible)
text = text.replace(
    '<div className="hidden sm:flex gap-3 mt-4">',
    '<div className="flex flex-wrap sm:flex-nowrap gap-3 mt-6 sm:mt-4 w-full sm:w-auto">'
)

text = text.replace(
    '<div className="flex items-center justify-between">',
    '<div className="flex flex-col sm:flex-row sm:items-center justify-between w-full">'
)

text = text.replace(
    '<div className="grid grid-cols-1 md:grid-cols-4 gap-4">',
    '<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">'
)

text = text.replace(
    '<div className="flex items-center gap-2 border-b border-slate-200 pb-1">',
    '<div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto whitespace-nowrap scrollbar-hide w-full">'
)

text = text.replace(
    '<div className="flex items-center gap-2 mb-3">',
    '<div className="flex flex-wrap items-center gap-2 mb-3">'
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

print("Reports fixed")