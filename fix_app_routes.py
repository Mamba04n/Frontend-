import re

path = 'src/App.jsx'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Add Groups to lazy imports
text = text.replace(
    'const GroupDetail = lazy(() => import(\'./pages/GroupDetail\'));',
    "const GroupDetail = lazy(() => import('./pages/GroupDetail'));\nconst Groups = lazy(() => import('./pages/Groups'));"
)

# Add Groups route inside AppLayout
text = text.replace(
    '<Route path="profile/:id" element={<Profile />} />',
    '<Route path="profile/:id" element={<Profile />} />\n              <Route path="groups" element={<Groups user={user} />} />'
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

print("Updated App.jsx routing")