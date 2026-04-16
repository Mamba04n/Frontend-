import sys

path = 'src/layouts/AppLayout.jsx'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

old_mobile_header = """           <div className="flex items-center gap-3 relative" ref={notifRef}>
             <button 
               onClick={() => { setIsNotifOpen(!isNotifOpen); if (unreadCount > 0) handleMarkAsRead(); }}
               className="relative text-gray-500 focus:outline-none"
               title="Notificaciones"
             >
               <Bell className="w-5 h-5" />
               {unreadCount > 0 && <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-blue-500 rounded-full border border-white"></span>}
             </button>"""

new_mobile_header = """           <div className="flex items-center gap-4 relative" ref={notifRef}>
             <button 
               onClick={() => { setIsNotifOpen(!isNotifOpen); if (unreadCount > 0) handleMarkAsRead(); }}
               className="relative text-gray-500 focus:outline-none"
               title="Notificaciones"
             >
               <Bell className="w-5 h-5" />
               {unreadCount > 0 && <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-blue-500 rounded-full border border-white"></span>}
             </button>
             
             <button 
               onClick={handleLogout}
               className="relative text-gray-500 hover:text-red-500 focus:outline-none"
               title="Cerrar Sesión"
             >
               <LogOut className="w-5 h-5" />
             </button>"""

if old_mobile_header in text:
    text = text.replace(old_mobile_header, new_mobile_header)
else:
    print("Not found! Trying with regex")
    import re
    text = re.sub(
        r'<div className="flex items-center gap-3 relative" ref=\{notifRef\}>\s*<button[-\s\w="\'\(\)\{\}>\.\;\!:]*?<Bell className="w-5 h-5" />\s*\{unreadCount > 0.*?</button>',
        new_mobile_header,
        text,
        flags=re.MULTILINE
    )

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

print("Logout added to mobile header")