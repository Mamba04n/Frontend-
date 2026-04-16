import { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Home, User, Bell, Bookmark, Search, LogOut, ShieldAlert, Menu, X, Library, Crown, Users, MessageSquare } from 'lucide-react';
import useSWR from 'swr';
import api from '../api';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);
dayjs.locale('es');

const fetcher = url => api.get(url).then(res => res.data);

export default function AppLayout({ user, setToken, setUser }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);

  const { data: myGroupsData } = useSWR('/groups/mine', fetcher);
  const myGroupsArray = myGroupsData?.groups || myGroupsData || [];
  const myGroups = Array.isArray(myGroupsArray) ? myGroupsArray : [];

  const { data: notificationsData, mutate: mutateNotif } = useSWR('/notifications', fetcher);
  
  const notificationsArray = notificationsData?.data || notificationsData || [];
  const notifications = Array.isArray(notificationsArray) ? notificationsArray : [];
  const unreadCount = notifications?.filter(n => n && !n.read_at)?.length || 0;

  // Cerrar dropdown de notifs al clickear afuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notifRef]);

  const handleMarkAsRead = async () => {
    try {
      await api.post('/notifications/mark-read');
      mutateNotif();
    } catch(err) { console.error(err) }
  };

  const handleLogout = async () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    navigate('/');
  };

  const navLinks = [
    { to: '/', icon: <Home className="w-5 h-5" />, label: 'Inicio' },
    { to: '/search', icon: <Search className="w-5 h-5" />, label: 'Explorar' },
    { to: '/groups', icon: <Users className="w-5 h-5" />, label: 'Grupos' },
    { to: '/bookmarks', icon: <Bookmark className="w-5 h-5" />, label: 'Guardados' },
    { to: '/profile', icon: <User className="w-5 h-5" />, label: 'Perfil' },
  ];

  if (user?.is_admin) {
    navLinks.push({ to: '/admin', icon: <Crown className="w-5 h-5 text-amber-500" />, label: 'Panel SuperAdmin' });
  }

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans antialiased overflow-hidden">
      
      {/* HEADER ESCRITORIO CON MENÚ HAMBURGUESA */}
      <header className="hidden md:flex fixed top-0 w-full bg-white border-b border-gray-200 z-40 px-6 py-3 items-center justify-between">
        <div className="flex items-center gap-4">
           <button 
             onClick={toggleSidebar}
             className="p-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-600 focus:outline-none"
           >
             <Menu className="w-5 h-5" />
           </button>
           <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
             <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center text-white">
               <Library className="w-4 h-4" />
             </div>
             <h1 className="text-lg font-semibold tracking-tight text-gray-900">VocesCríticas</h1>
           </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="relative" ref={notifRef}>
             <button 
               onClick={() => { setIsNotifOpen(!isNotifOpen); if (unreadCount > 0) handleMarkAsRead(); }}
               className="relative p-1.5 text-gray-500 hover:text-gray-900 focus:outline-none transition-colors"
               title="Notificaciones"
             >
               <Bell className="w-5 h-5" />
               {unreadCount > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-blue-500 rounded-full border border-white"></span>}
             </button>
             
             {isNotifOpen && (
               <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden transform origin-top-right">
                 <div className="p-3 border-b border-gray-100 flex justify-between items-center">
                   <h3 className="font-bold text-gray-900">Notificaciones</h3>
                   {unreadCount > 0 && (
                     <button onClick={handleMarkAsRead} className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                       Marcar como leídas
                     </button>
                   )}
                 </div>
                 <div className="max-h-[350px] overflow-y-auto">
                   {notifications.length === 0 ? (
                     <p className="p-4 text-center text-sm text-gray-500">No tienes notificaciones nuevas</p>
                   ) : (
                     <div className="divide-y divide-gray-50">
                       {notifications.slice(0, 10).map((n) => (
                         <div key={n.id} className={`p-3 flex items-start gap-3 hover:bg-gray-50 transition-colors ${!n.read_at ? 'bg-blue-50/30' : ''}`} onClick={() => setIsNotifOpen(false)}>
                           <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 mt-0.5">
                             <img src={n.data?.avatar || `https://ui-avatars.com/api/?name=${n.data?.user_name || 'U'}&background=f3f4f6`} alt="" />
                           </div>
                           <div className="flex-1 min-w-0">
                             <p className="text-sm text-gray-800 leading-snug">
                               <span className="font-semibold text-gray-900">{n.data?.user_name}</span> {n.data?.message}
                             </p>
                             <span className="text-xs text-blue-600 font-medium mt-1 inline-block">{dayjs(n.created_at).fromNow()}</span>
                           </div>
                           {!n.read_at && <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 self-center"></div>}
                         </div>
                       ))}
                     </div>
                   )}
                 </div>
                 <div className="p-2 border-t border-gray-100 bg-gray-50/50">
                   <button 
                     onClick={() => { setIsNotifOpen(false); navigate('/notifications'); }}
                     className="w-full text-center p-2 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                   >
                     Ver todas las notificaciones
                   </button>
                 </div>
               </div>
             )}
           </div>
           <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 cursor-pointer hover:ring-2 hover:ring-blue-100 transition-all" onClick={() => navigate('/profile')}>
             <img src={user?.avatar_url || `https://ui-avatars.com/api/?name=${user?.name}&background=f3f4f6&color=111827`} alt="Avatar" className="w-full h-full object-cover" />
           </div>
        </div>
      </header>

      {/* OVERLAY SIDEBAR (ESCRITORIO) */}
      {isSidebarOpen && (
        <div 
          className="hidden md:block fixed inset-0 bg-gray-900/40 z-40 transition-opacity" 
          onClick={toggleSidebar}
        />
      )}

      {/* SIDEBAR TIPO CAJÓN (DESKTOP) */}
      <aside 
        className={`hidden md:flex fixed top-0 left-0 h-full w-64 bg-white flex-col shadow-xl z-50 transform transition-transform duration-200 ease-in-out border-r border-gray-200 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center text-white">
               <Library className="w-4 h-4" />
            </div>
            <h1 className="text-lg font-semibold tracking-tight text-gray-900">VocesCríticas</h1>
          </div>
          <button onClick={toggleSidebar} className="p-1.5 text-gray-400 hover:text-gray-800 rounded-md hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navLinks.map(({ to, icon, label }) => (
             <NavLink
               key={to}
               to={to}
               onClick={() => setIsSidebarOpen(false)} // cerrar al clickear
               className={({ isActive }) =>
                 `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                   isActive 
                     ? 'bg-blue-50 text-blue-700' 
                     : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                 }`
               }
             >
               {icon}
               <span className={to === '/admin' ? 'text-amber-600 font-bold' : ''}>{label}</span>
             </NavLink>
          ))}

          {/* Sección de Mis Grupos */}
          <div className="pt-6 pb-2">
            <h3 className="px-3 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Mis Grupos</h3>
            <div className="space-y-1">
              {!myGroupsData ? (
                <p className="px-3 text-xs text-gray-400">Cargando grupos...</p>
              ) : myGroups.length === 0 ? (
                <p className="px-3 text-xs text-gray-400">No estás en ningún grupo</p>
              ) : (
                myGroups.map(g => (
                  <button key={g.id} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors" onClick={() => { setIsSidebarOpen(false); navigate(`/groups/${g.id}`); }}>
                    <Users className="w-5 h-5 opacity-60" />
                    <span className="truncate">{g.name}</span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Sección de Foros */}
          <div className="pt-4 pb-2">
            <h3 className="px-3 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Foros / Debates</h3>
            <div className="space-y-1">
              <button 
                 onClick={() => { navigate('/search'); setIsSidebarOpen(false); }} 
                 className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors"
              >
                <MessageSquare className="w-5 h-5 opacity-60" />
                Foro General
              </button>
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden shrink-0 border border-gray-300">
              <img src={user?.avatar_url || `https://ui-avatars.com/api/?name=${user?.name}&background=f3f4f6&color=111827`} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 overflow-hidden leading-tight">
              <p className="text-sm font-semibold truncate text-gray-900">{user?.name || 'Usuario'}</p>
              <p className="text-xs text-gray-500 truncate capitalize">{user?.role || 'Académico'}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center w-full gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 rounded-md transition-colors border border-gray-200 shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* HEADER MÓVIL */}
      <header className="md:hidden fixed top-0 w-full flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 z-30">
         <div className="flex items-center gap-2">
           <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white">
             <Library className="w-3 h-3" />
           </div>
           <h1 className="text-base font-semibold text-gray-900 tracking-tight">VocesCríticas</h1>
         </div>
         <div className="flex items-center gap-3 relative" ref={notifRef}>
           <button 
             onClick={() => { setIsNotifOpen(!isNotifOpen); if (unreadCount > 0) handleMarkAsRead(); }}
             className="relative text-gray-500 focus:outline-none"
             title="Notificaciones"
           >
             <Bell className="w-5 h-5" />
             {unreadCount > 0 && <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-blue-500 rounded-full border border-white"></span>}
           </button>
           
           {isNotifOpen && (
             <div className="absolute right-0 top-full mt-2 w-[calc(100vw-32px)] max-w-sm sm:w-80 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden transform origin-top-right">
               <div className="p-3 border-b border-gray-100 flex justify-between items-center">
                 <h3 className="font-bold text-gray-900">Notificaciones</h3>
               </div>
               <div className="max-h-[350px] overflow-y-auto">
                 {notifications.length === 0 ? (
                   <p className="p-4 text-center text-sm text-gray-500">No hay notificaciones</p>
                 ) : (
                   <div className="divide-y divide-gray-50">
                     {notifications.slice(0, 10).map((n) => (
                       <div key={n.id} className={`p-3 flex items-start gap-3 hover:bg-gray-50 transition-colors ${!n.read_at ? 'bg-blue-50/30' : ''}`} onClick={() => setIsNotifOpen(false)}>
                         <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 mt-0.5">
                           <img src={n.data?.avatar || `https://ui-avatars.com/api/?name=${n.data?.user_name || 'U'}&background=f3f4f6`} alt="" />
                         </div>
                         <div className="flex-1 min-w-0">
                           <p className="text-sm text-gray-800 leading-snug">
                             <span className="font-semibold text-gray-900">{n.data?.user_name}</span> {n.data?.message}
                           </p>
                           <span className="text-xs text-blue-600 font-medium mt-1 inline-block">{dayjs(n.created_at).fromNow()}</span>
                         </div>
                       </div>
                     ))}
                   </div>
                 )}
               </div>
               <div className="p-2 border-t border-gray-100 bg-gray-50/50">
                 <button 
                   onClick={() => { setIsNotifOpen(false); navigate('/notifications'); }}
                   className="w-full text-center p-2 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                 >
                   Ver todas las notificaciones
                 </button>
               </div>
             </div>
           )}

           <div className="w-7 h-7 rounded-full overflow-hidden border border-gray-200" onClick={() => navigate('/profile')}>
             <img src={user?.avatar_url || `https://ui-avatars.com/api/?name=${user?.name}&background=f3f4f6&color=111827`} alt="Avatar" />
           </div>

           <button 
             onClick={handleLogout} 
             className="text-gray-500 hover:text-red-500 transition-colors"
             title="Cerrar sesión"
             type="button"
           >
             <LogOut className="w-5 h-5" />
           </button>
         </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden pt-14 md:pt-[60px]">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 md:bg-gray-50">
          <div className="max-w-4xl mx-auto w-full pb-20 md:pb-8">
            <Outlet />
          </div>
        </div>
      </main>
      
      {/* NAVEGACIÓN INFERIOR (MÓVIL) */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around px-2 py-1 z-50 pb-safe">
        {navLinks.filter(l => l.to !== '/profile' && l.to !== '/admin').slice(0, 4).map(({ to, icon, label }) => {
          const isActive = location.pathname === to;
          return (
            <NavLink key={to} to={to} className="flex flex-col items-center p-2 rounded-lg min-w-[64px]">
              <div className={`p-1 rounded-md transition-colors ${isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-500'}`}>
                 {icon}
              </div>
              <span className={`text-[10px] mt-1 font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                {label === 'Guardados' ? 'Favoritos' : label === 'Notificaciones' ? 'Alertas' : label}
              </span>
            </NavLink>
          )
        })}
        {/* Siempre mostrar el tab de admin en nav inferior movil en vez de perfil si eres admin */}
        {user?.is_admin ? (
           <NavLink key={'/admin'} to={'/admin'} className="flex flex-col items-center p-2 rounded-lg min-w-[64px]">
              <div className={`p-1 rounded-md transition-colors ${location.pathname==='/admin' ? 'text-amber-500 bg-amber-50' : 'text-gray-500'}`}>
                 <Crown className="w-5 h-5 text-amber-500" />
              </div>
              <span className={`text-[10px] mt-1 font-bold text-amber-600`}>Admin</span>
           </NavLink>
        ) : (
           <NavLink key={'/profile'} to={'/profile'} className="flex flex-col items-center p-2 rounded-lg min-w-[64px]">
              <div className={`p-1 rounded-md transition-colors ${location.pathname==='/profile' ? 'text-blue-600 bg-blue-50' : 'text-gray-500'}`}>
                 <User className="w-5 h-5" />
              </div>
              <span className={`text-[10px] mt-1 font-medium ${location.pathname==='/profile' ? 'text-blue-600' : 'text-gray-500'}`}>Perfil</span>
           </NavLink>
        )}
      </nav>
    </div>
  );
}
