import { useState, useRef } from 'react';
import { Heart, MessageCircle, Bookmark, FileText, CheckCircle, Image as ImageIcon, SendIcon, Send, X, Loader2, PlusCircle, ThumbsUp } from 'lucide-react';
import useSWR from 'swr';
import api from '../api';
import GroupPost from '../components/GroupPost';

const fetcher = url => api.get(url).then(res => {
  let payload = res.data?.data?.data || res.data?.data || res.data;
  return Array.isArray(payload) ? payload : [];
});

export default function Feed({ user }) {
  const { data: feed, mutate: setFeed, isValidating: loading } = useSWR('/feed', fetcher, { 
     fallbackData: [],
     revalidateOnFocus: false,
  });
  const { data: myGroupsData } = useSWR('/groups/mine', url => api.get(url).then(res => res.data?.groups || res.data || []), {
     fallbackData: [],
     revalidateOnFocus: false,
  });
  
  const myGroupsArray = myGroupsData?.groups || myGroupsData;
  const myGroups = Array.isArray(myGroupsArray) ? myGroupsArray : [];

  const [body, setBody] = useState('');
  const [file, setFile] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const fileInputRef = useRef(null);

  const handlePublish = async () => {
    if (!body.trim() && !file) return;
    setPublishing(true);
    try {
      const formData = new FormData();
      if(body) formData.append('body', body);
      if(file) formData.append('file', file);
      
      const response = await api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if(response.data?.data) {
        setFeed([response.data.data, ...feed]);
      }
      
      setBody('');
      setFile(null);
      if(fileInputRef.current) fileInputRef.current.value = '';
    } catch(err) {
       console.error(err);
       alert('Hubo un error al publicar.');
    } finally {
      setPublishing(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const response = await api.post('/posts/' + postId + '/like');
      setFeed(prev => prev.map(p => {
        if (p.id === postId) {
          return { 
            ...p, 
            likes_count: response.data.liked ? (p.likes_count || 0) + 1 : Math.max(0, (p.likes_count || 0) - 1)
          };
        }
        return p;
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookmark = async (postId) => {
     try {
       await api.post('/posts/' + postId + '/bookmark');
     } catch (err) {
       console.error(err);
     }
  };

  const handleCreateGroup = async () => {
     const name = prompt('Nombre del nuevo grupo:');
     if (!name) return;
     const desc = prompt('Descripción del grupo:');
     
     try {
       await api.post('/groups', { name, description: desc || '' });
       alert('Grupo creado exitosamente!');
     } catch (err) {
       console.error(err);
       alert('Hubo un error al crear el grupo.');
     }
  };

  const handleFileChange = (e) => {
    if(e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const triggerFileInput = (acceptType) => {
    if(fileInputRef.current) {
      fileInputRef.current.accept = acceptType;
      fileInputRef.current.click();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
         <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex gap-6 max-w-5xl mx-auto pt-4 md:pt-0">
      
      <div className="flex-1 w-full md:max-w-2xl space-y-4">
        
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex gap-3 h-full">
            <div className="w-10 h-10 rounded-full border border-gray-200 overflow-hidden shrink-0 mt-0.5">
              <img src={user?.avatar_url ? ('http://localhost:8000/storage/' + user.avatar_url) : ('https://ui-avatars.com/api/?name=' + (user?.name || '') + '&background=f3f4f6&color=111827')} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
               <textarea 
                 placeholder="¿Qué hallazgos o debates quieres compartir con la comunidad?" 
                 className="w-full bg-transparent border-0 ring-0 focus:ring-0 p-1 text-gray-900 placeholder-gray-500 text-[15px] resize-none outline-none min-h-[60px]"
                 style={{ boxShadow: 'none' }}
                 value={body}
                 onChange={(e) => setBody(e.target.value)}
                 disabled={publishing}
               />
               
               {file && (
                 <div className="mt-3 p-2 border flex items-center justify-between rounded-lg bg-gray-50 border-gray-200">
                    <div className="flex items-center gap-2 truncate">
                      {file.type.includes('image') || file.type.includes('video') ? <ImageIcon className="w-4 h-4 text-blue-500" /> : <FileText className="w-4 h-4 text-blue-500" />}
                      <span className="text-sm font-medium text-gray-700 truncate">{file.name}</span>
                      <span className="text-xs text-gray-500">({Math.round(file.size / 1024)} KB)</span>
                    </div>
                    <button 
                       onClick={() => setFile(null)} 
                       className="p-1 rounded-full hover:bg-gray-200 text-gray-500 flex items-center justify-center"
                    >
                      <X className="w-4 h-4" />
                    </button>
                 </div>
               )}
            </div>
          </div>
          
          <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-1 ml-13">
              <div className="flex items-center gap-1">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleFileChange} 
                />
                
                <button 
                  onClick={() => triggerFileInput('image/*,video/mp4')}
                  disabled={publishing}
                  className="flex items-center gap-1.5 px-2 py-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded text-xs font-medium transition-colors cursor-pointer outline-none disabled:opacity-50"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Media</span>
                </button>
                <button 
                  onClick={() => triggerFileInput('.pdf,.doc,.docx')}
                  disabled={publishing}
                  className="flex items-center gap-1.5 px-2 py-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded text-xs font-medium transition-colors cursor-pointer outline-none disabled:opacity-50"
                 >
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">Documento</span>
                </button>
              </div>
              <button 
                 onClick={handlePublish}
                 disabled={(!body.trim() && !file) || publishing}
                 className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300 text-sm font-semibold rounded-md shadow-sm transition-colors outline-none cursor-pointer"
              >
                {publishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <SendIcon className="w-3.5 h-3.5" />}
                {publishing ? 'Publicando...' : 'Publicar'}
              </button>
          </div>
        </div>

        <div className="flex items-center justify-between px-2 pt-2">
           <h2 className="text-sm font-semibold text-gray-900">Actividad Reciente</h2>
        </div>

        <div className="space-y-4 pb-10">
          {feed.length === 0 ? (
             <div className="text-center py-16 border border-gray-200 border-dashed rounded-lg bg-gray-50">
               <p className="text-gray-500 text-sm font-medium">El flujo de actividad está vacío.</p>
             </div>
          ) : (
            feed.map(post => (
              <GroupPost key={post.id} post={post} user={user} mutate={setFeed} feedState={feed} />
            ))
          )}
        </div>
      </div>
      
      <div className="hidden lg:block w-72 space-y-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
           <div className="flex items-center justify-between mb-4">
             <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Mis Grupos</h3>
           </div>
           <div className="space-y-3">
             {myGroups.length === 0 ? <p className="text-xs text-gray-500">No te has unido a ningún grupo todavía.</p> : myGroups.map(myGroup => (
                  <div key={myGroup.id} onClick={() => { window.location.href = `/groups/${myGroup.id}` }} className="flex items-center justify-between cursor-pointer group hover:bg-gray-50 p-2 rounded-lg -mx-2 transition-colors">
                   <div className="flex items-center gap-2">
                     <div className="w-6 h-6 rounded bg-emerald-100 flex items-center justify-center font-black text-[9px] text-emerald-600">{(myGroup.name || 'G').substring(0,2).toUpperCase()}</div>
                     <span className="text-sm font-semibold text-gray-700 group-hover:text-emerald-600 truncate max-w-[170px]">{myGroup.name}</span>
                   </div>
                 </div>
             ))}
           </div>
        </div>
      </div>
      
    </div>
  );
}
