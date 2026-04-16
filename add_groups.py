import sys

path = 'src/layouts/AppLayout.jsx'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Add Grupos to navLinks
old_nav = """const navLinks = [
    { to: '/', icon: <Home className="w-5 h-5" />, label: 'Inicio' },
    { to: '/search', icon: <Search className="w-5 h-5" />, label: 'Explorar' },
    { to: '/bookmarks', icon: <Bookmark className="w-5 h-5" />, label: 'Guardados' },
    { to: '/profile', icon: <User className="w-5 h-5" />, label: 'Perfil' },
  ];"""

new_nav = """const navLinks = [
    { to: '/', icon: <Home className="w-5 h-5" />, label: 'Inicio' },
    { to: '/search', icon: <Search className="w-5 h-5" />, label: 'Explorar' },
    { to: '/groups', icon: <Users className="w-5 h-5" />, label: 'Grupos' },
    { to: '/bookmarks', icon: <Bookmark className="w-5 h-5" />, label: 'Guardados' },
    { to: '/profile', icon: <User className="w-5 h-5" />, label: 'Perfil' },
  ];"""

text = text.replace(old_nav, new_nav)

# Fix the mobile slice to include 4 items instead of 3
old_mobile = "navLinks.filter(l => l.to !== '/profile' && l.to !== '/admin').slice(0, 3).map"
new_mobile = "navLinks.filter(l => l.to !== '/profile' && l.to !== '/admin').slice(0, 4).map"

text = text.replace(old_mobile, new_mobile)

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

print("Updated AppLayout")