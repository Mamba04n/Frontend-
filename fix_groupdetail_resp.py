import sys

path = 'src/pages/GroupDetail.jsx'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Make the main Group tabs responsive by allowing them to wrap or stack
text = text.replace(
    '<div className="flex border-t border-gray-100 mt-2">',
    '<div className="flex flex-col sm:flex-row border-t border-gray-100 mt-2 overflow-hidden rounded-b-2xl">'
)

# Fix input form container for new unit
text = text.replace(
    '<div className="flex gap-4">',
    '<div className="flex flex-col sm:flex-row gap-4">'
)

# Under teacher gradings, the status states
text = text.replace(
    '<div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex justify-between items-center w-full">',
    '<div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-3 w-full">'
)

text = text.replace(
    '<div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3 items-center w-full">',
    '<div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center w-full">'
)

text = text.replace(
    '<div className="flex gap-2">',
    '<div className="flex flex-wrap lg:flex-nowrap gap-2 items-center w-full sm:w-auto">'
)

# Adjust padding of the teacher grading header
text = text.replace(
    'className="w-full px-6 py-4 flex justify-between items-center',
    'className="w-full px-4 sm:px-6 py-4 flex justify-between items-center'
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

print("GroupDetail fixed")