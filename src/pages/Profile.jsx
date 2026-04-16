import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { User, Mail, ShieldCheck, Star, Camera, UserPlus, Users, Loader2 } from 'lucide-react';
import api from '../api';
import { toAssetUrl } from '../utils/assetUrl';

export default function Profile({ user, setUser }) {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get(id ? '/users/' + id : '/user');
        setProfile(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  const handleAvatarUpload = async (e) => {
     if (!e.target.files || !e.target.files[0]) return;
     const file = e.target.files[0];
     setUploading(true);

     try {
       const formData = new FormData();
       formData.append('avatar', file);
       
       const res = await api.post('/user/profile', formData, {
         headers: { 'Content-Type': 'multipart/form-data' }
       });
       
       if (res.data.user) {
         setProfile(res.data.user);
         if (setUser) setUser(res.data.user);
         alert('Foto de perfil actualizada.');
       }
     } catch (err) {
       console.error('Error al subir foto:', err);
       alert('Hubo un error al actualizar la foto de perfil.');
     } finally {
       setUploading(false);
     }
  };

  const handleFriendRequest = async () => {
     try {
        await api.post('/users/' + profile.id + '/request');
        alert('Solicitud de amistad enviada!');
     } catch(err) {
        alert(err.response?.data?.message || 'Error al enviar solicitud');
     }
  };

  const triggerUpload = () => {
     if (fileInputRef.current) fileInputRef.current.click();
  };

  if (loading) {
     return (
       <div className="flex justify-center items-center py-32">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
       </div>
     );
  }

  if (!profile) return <div className="text-center py-20 text-slate-500 font-bold">Perfil no encontrado</div>;

  const isCurrentUser = (!id) || (user && user.id === profile.id);

  return (
    <div className="space-y-6 slide-in pt-4 pb-20">
       <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] ring-1 ring-slate-100 relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-blue-600 to-indigo-700 opacity-90 z-0"></div>
         
         <div className="relative z-10 flex flex-col items-center mt-12">
            <div className="relative group hover:scale-105 transition-transform duration-500">
                <div className="w-32 h-32 bg-white rounded-full p-2 shadow-xl shrink-0">
                  <img src={profile.avatar_url ? toAssetUrl(profile.avatar_url) : ('https://ui-avatars.com/api/?name=' + profile.name + '&background=eff6ff&color=2563eb&bold=true&size=200')} alt="Avatar" className="w-full h-full object-cover rounded-full border-4 border-slate-50" />
                </div>
                
                {isCurrentUser && (
                  <>
                    <input type="file" className="hidden" ref={fileInputRef} accept="image/*" onChange={handleAvatarUpload} />
                    <button 
                      onClick={triggerUpload} 
                      disabled={uploading}
                      className="absolute bottom-2 right-2 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Camera className="w-4 h-4" />}
                    </button>
                  </>
                )}
            </div>
            
            <h2 className="text-2xl font-black mt-4 text-slate-900 tracking-tight text-center">{profile.name}</h2>
            <p className="text-blue-600 font-bold mt-1 uppercase text-sm tracking-widest flex items-center justify-center gap-1.5">
               {profile.role === 'admin' ? <ShieldCheck className="w-4 h-4" /> : <Star className="w-4 h-4" />}
               {profile.role || 'Estudiante'}
            </p>
            
            {!isCurrentUser && (
              <div className="mt-4 flex gap-3">
                 <button onClick={handleFriendRequest} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow hover:bg-blue-700 flex items-center gap-2 transition">
                   <UserPlus className="w-4 h-4" /> Añadir amigo
                 </button>
              </div>
            )}
         </div>

         <div className="mt-8 pt-6 border-t border-slate-100/50 mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
               <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-400">
                  <Mail className="w-5 h-5" />
               </div>
               <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Correo Electrónico</p>
                  <p className="text-sm font-semibold text-slate-800">{profile.email}</p>
               </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
               <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-400">
                  <User className="w-5 h-5" />
               </div>
               <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Biografía</p>
                  <p className="text-sm font-semibold text-slate-800 line-clamp-1">{profile.bio || 'Sin biografía disponible'}</p>
               </div>
            </div>
         </div>
       </div>

       <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-100 flex items-center justify-between group cursor-pointer hover:bg-slate-50 transition-colors">
          <div>
            <h3 className="text-lg font-black tracking-tight text-slate-800 mb-1">Reputación</h3>
            <p className="text-slate-500 font-medium text-sm">Puntos ganados aportando a la comunidad</p>
          </div>
          <div className="text-3xl font-black text-blue-600 tracking-tighter bg-blue-50 px-6 py-2 rounded-2xl group-hover:bg-blue-100 transition-colors">
            {profile.reputation || 0}
          </div>
       </div>
    </div>
  );
}