import { useState, useEffect } from 'react';
import { Bell, Heart, MessageSquare, UserPlus, FileWarning, CheckCircle2 } from 'lucide-react';
import api from '../api';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      let payload = response.data?.data?.data || response.data?.data || response.data;
      setNotifications(Array.isArray(payload) ? payload : []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'App\\Notifications\\PostLiked': return <Heart className="w-5 h-5 text-red-500" />;
      case 'App\\Notifications\\PostCommented': return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case 'App\\Notifications\\NewFollower': return <UserPlus className="w-5 h-5 text-emerald-500" />;
      case 'App\\Notifications\\PostReported': return <FileWarning className="w-5 h-5 text-amber-500" />;
      default: return <Bell className="w-5 h-5 text-slate-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
         <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 slide-in pt-4 bg-white/30 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl p-6 relative overflow-hidden">
      <div className="bg-white/40 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-lg ring-1 ring-white/50 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-800 mb-1 font-sans">
            Notificaciones
          </h2>
          <p className="text-slate-500 font-medium text-sm">Mantente al tanto de la actividad</p>
        </div>
        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100 text-blue-600">
           <Bell className="w-6 h-6" />
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white/40 backdrop-blur-md rounded-3xl shadow-lg ring-1 ring-white/50">
           <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
             <CheckCircle2 className="w-10 h-10 text-emerald-500" />
           </div>
           <h3 className="text-xl font-bold text-slate-800 mb-2 tracking-tight">Todo al dÃ­a</h3>
           <p className="text-slate-500 font-medium max-w-sm mx-auto">No tienes notificaciones pendientes. Vuelve mÃ¡s tarde.</p>
        </div>
      ) : (
        <div className="bg-white/40 backdrop-blur-md rounded-3xl shadow-lg ring-1 ring-white/50 divide-y divide-white/20 overflow-hidden">
          {notifications.map((notification) => (
             <div 
               key={notification.id} 
               onClick={() => markAsRead(notification.id)}
               className={`p-5 flex gap-4 transition-colors cursor-pointer group hover:bg-slate-50 ${!notification.read_at ? 'bg-blue-50/30' : ''}`}
             >
                <div className="mt-1 w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm border border-slate-100 shrink-0 group-hover:scale-110 transition-transform duration-300">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!notification.read_at ? 'font-bold text-slate-900' : 'font-medium text-slate-600'}`}>
                    {notification.data.message || 'Nueva actividad en tu perfil'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1 font-medium flex items-center gap-1.5">
                    {new Date(notification.created_at).toLocaleDateString()}
                    {!notification.read_at && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 block"></span>}
                  </p>
                </div>
             </div>
          ))}
        </div>
      )}
    </div>
  );
}
