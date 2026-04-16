import { useState, useEffect } from 'react';
import { SearchIcon, User, Tag, HelpCircle, Loader2, Users, FileText, ArrowRight, GraduationCap, Link as LinkIcon, CheckCircle } from 'lucide-react';
import api from '../api';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ users: [], groups: [], posts: [] });
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  
  // Join Group State
  const [joiningGroup, setJoiningGroup] = useState(null);
  const [inviteCode, setInviteCode] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (query.trim().length === 0) {
      setResults({ users: [], groups: [], posts: [] });
      setSearched(false);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      executeSearch();
    }, 200);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  const executeSearch = async () => {
    if (query.trim().length === 0) return;
    setLoading(true);
    try {
      const res = await api.get('/search?q=' + query);
      setResults(res.data.results || { users: [], groups: [], posts: [] });
      setSearched(true);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    executeSearch();
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!inviteCode || inviteCode.trim() === '') {
       toast.error('Por favor ingresa un código válido');
       return;
    }
    setJoinLoading(true);
    try {
       const res = await api.post('/groups/join/' + inviteCode);
       toast.success('¡Te has unido a ' + joiningGroup.name + ' exitosamente!');
       setJoiningGroup(null);
       setInviteCode('');
       
       // Force a full reload to the home feed to ensure context updates with the new group
       setTimeout(() => window.location.href = '/', 1000);
    } catch (err) {
       toast.error(err.response?.data?.message || 'Código incorrecto o no se pudo unir al grupo');
    } finally {
       setJoinLoading(false);
    }
  };

  const isEmpty = results.users.length === 0 && results.groups.length === 0 && results.posts.length === 0;

  return (
    <div className="space-y-6 slide-in pt-4 relative">
      {/* Join Group Modal */}
      {joiningGroup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative">
             <button 
                onClick={() => setJoiningGroup(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold"
             >
                ✕
             </button>
             <h3 className="text-xl font-bold text-slate-900 mb-2 mt-2">Unirse a la Clase</h3>
             <p className="text-sm font-medium text-slate-500 mb-6">Estás a punto de unirte a <span className="text-blue-600 font-bold">{joiningGroup.name}</span>. Ingresa el código de inscripción secreto entregado por el maestro.</p>
             <form onSubmit={handleJoin} className="flex flex-col gap-4">
                <input 
                   type="text" 
                   autoFocus
                   placeholder="Ej: A82B9X0"
                   className="h-12 border border-slate-200 rounded-xl px-4 text-center text-lg font-bold tracking-widest uppercase focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all"
                   value={inviteCode}
                   onChange={e => setInviteCode(e.target.value.toUpperCase())}
                />
                <button 
                   type="submit" 
                   disabled={joinLoading}
                   className="h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/20 disabled:opacity-70"
                >
                   {joinLoading ? <Loader2 className="w-5 h-5 animate-spin"/> : <CheckCircle className="w-5 h-5"/>}
                   Unirme al Grupo
                </button>
             </form>
          </div>
        </div>
      )}

      <div className="bg-white/30 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl p-6 md:p-8 overflow-hidden z-10">
        <h2 className="text-2xl font-black tracking-tight text-slate-800 mb-6 font-sans">
          Explorar la Escolaridad
        </h2>
        
        <form onSubmit={handleSearchSubmit} className="relative group z-20">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            {loading ? (
              <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            ) : (
              <SearchIcon className="w-6 h-6 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            )}
          </div>
          <input
            type="text"
            className="w-full h-14 pl-14 pr-4 bg-white/60 backdrop-blur-sm border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 rounded-2xl text-slate-800 font-bold placeholder:font-medium placeholder:text-slate-400 transition-all outline-none shadow-sm"
            placeholder="Buscar estudiantes, grupos o publicaciones..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </form>
      </div>

      {searched && !loading && isEmpty && (
         <div className="text-center py-16 px-4 bg-white/40 backdrop-blur-md rounded-3xl shadow-lg ring-1 ring-white/50 slide-in">
           <div className="w-20 h-20 bg-white shadow-sm rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
             <HelpCircle className="w-10 h-10 text-slate-300" />
           </div>
           <h3 className="text-xl font-bold text-slate-800 mb-1 tracking-tight">Sin resultados</h3>
           <p className="text-slate-500 font-medium">No encontramos nada para "<span className="text-slate-800 font-bold">{query}</span>"</p>
         </div>
      )}

      {(!isEmpty || loading) && query.length > 0 && (
         <div className="space-y-6">
            {/* Personas / Usuarios */}
            {results.users.length > 0 && (
              <div className="bg-white/40 backdrop-blur-md rounded-3xl p-6 shadow-lg ring-1 ring-white/50 slide-in block">
                 <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2"><User className="w-4 h-4"/> Estudiantes / Maestros</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                   {results.users.map(user => (
                      <Link key={user.id} to={'/profile/' + user.id} className="flex items-center gap-4 p-3 bg-white/60 hover:bg-white rounded-2xl transition-all cursor-pointer group shadow-sm border border-transparent hover:border-blue-100 hover:shadow-md">
                         <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 shrink-0">
                           <img src={user.avatar_url || 'https://ui-avatars.com/api/?name=' + user.name + '&background=random'} className="w-full h-full object-cover" alt="avatar" />
                         </div>
                         <div className="flex-1 min-w-0">
                           <h4 className="font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">{user.name}</h4>
                           <p className="text-xs font-semibold text-slate-500 truncate capitalize flex items-center gap-1 mt-0.5">
                              {user.role === 'teacher' ? <GraduationCap className="w-3.5 h-3.5 text-blue-500" /> : <Tag className="w-3.5 h-3.5" />}
                              {user.role === 'teacher' ? 'Maestro' : 'Estudiante'}
                           </p>
                         </div>
                         <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors mr-2" />
                      </Link>
                   ))}
                 </div>
              </div>
            )}

            {/* Grupos / Clases */}
            {results.groups.length > 0 && (
              <div className="bg-white/40 backdrop-blur-md rounded-3xl p-6 shadow-lg ring-1 ring-white/50 slide-in block">
                 <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2"><Users className="w-4 h-4"/> Grupos / Clases</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                   {results.groups.map(group => (
                      <div key={group.id} className="flex items-center gap-4 p-3 bg-white/60 hover:bg-white rounded-2xl shadow-sm border border-transparent transition-all group-hover:border-emerald-100 hover:shadow-md relative">
                         <div className="w-12 h-12 rounded-2xl overflow-hidden bg-emerald-100 shrink-0 flex items-center justify-center text-emerald-600 font-black text-xl">
                            {group.name.substring(0,2).toUpperCase()}
                         </div>
                         <div className="flex-1 min-w-0 pr-4">
                           <h4 className="font-bold text-slate-900 truncate">{group.name}</h4>
                           <p className="text-xs font-semibold text-slate-500 truncate mt-0.5">Comunidad / Clase</p>
                         </div>
                         <button 
                           onClick={() => setJoiningGroup(group)}
                           className="bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors border border-emerald-100 flex items-center gap-1 shadow-sm"
                         >
                           <LinkIcon className="w-3.5 h-3.5"/> Unirse
                         </button>
                      </div>
                   ))}
                 </div>
              </div>
            )}

            {/* Publicaciones */}
            {results.posts.length > 0 && (
              <div className="bg-white/40 backdrop-blur-md rounded-3xl p-6 shadow-lg ring-1 ring-white/50 slide-in block">
                 <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2"><FileText className="w-4 h-4"/> Publicaciones</h3>
                 <div className="space-y-3">
                    {results.posts.map(post => (
                       <Link key={post.id} to="/" className="block p-4 bg-white/60 hover:bg-white rounded-2xl transition-all cursor-pointer group shadow-sm border border-transparent hover:border-purple-100 hover:shadow-md">
                          <p className="text-sm font-medium text-slate-700 line-clamp-2">"{post.body}"</p>
                          <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-400">
                             <img src={'https://ui-avatars.com/api/?name=' + (post.author?.name || '?')} className="w-4 h-4 rounded-full" alt="author"/>
                             <span>Por {post.author?.name}</span>
                             {post.group && <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">{post.group.name}</span>}
                          </div>
                       </Link>
                    ))}
                 </div>
              </div>
            )}
         </div>
      )}
    </div>
  );
}