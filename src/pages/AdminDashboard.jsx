import { useState, useEffect } from 'react';
// Toaster temporalmente oculto para evitar crasheos de hooks en React 19
// import toast, { Toaster } from 'react-hot-toast';
const toast = { success: (m) => alert(m), error: (m) => alert(m) };
import { Users, ShieldAlert, BarChart3, Database, Settings, LogOut, ArrowLeft, BookOpen, GraduationCap, CheckCircle, FileText, Download, Plus, Link as LinkIcon, Copy } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import api from '../api';

export default function AdminDashboard({ user, setToken, setUser }) {
  const [activeTab, setActiveTab] = useState('summary');
  
  // Stats
  const [stats, setStats] = useState({ users: 0, posts: 0, groups: 0, usersList: [] });
  const [loadingStats, setLoadingStats] = useState(true);

  // States for Groups & Evaluations Module
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [evaluations, setEvaluations] = useState([]);
  const [loadingEv, setLoadingEv] = useState(false);
  const [newEval, setNewEval] = useState({ title: '', description: '', due_date: '' });
  const [teams, setTeams] = useState([]);
  const [newTeamName, setNewTeamName] = useState('');

  // New Group State (Modal/Form)
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '' });

  useEffect(() => {
    document.title = "Panel de Administración - Voces Críticas";
    if (activeTab === 'summary') fetchStats();
    if (activeTab === 'grades') fetchGroups();
  }, [activeTab]);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await api.get('/admin/stats');
      setStats({
          users: res.data.users_count || 0,
          posts: res.data.posts_count || 0,
          groups: res.data.groups_count || 0,
          usersList: res.data.users || []
      });
    } catch(e) { console.error('Error fetching stats', e); }
    finally { setLoadingStats(false); }
  };

  const fetchGroups = async () => {
    try {
      const res = await api.get('/groups');
      setGroups(res.data.groups || []);
      if(res.data.groups?.length > 0 && !selectedGroup) {
         handleSelectGroup(res.data.groups[0].id);
      }
    } catch(e) { console.error('Error fetch groups', e); }
  };

  const handleSelectGroup = async (groupId) => {
     setSelectedGroup(groupId);
     setLoadingEv(true);
     setTeams([]);
     try {
       const [resEv, resTeams] = await Promise.all([
         api.get('/groups/' + groupId + '/evaluations'),
         api.get('/groups/' + groupId + '/teams').catch(() => ({ data: { teams: [] } }))
       ]);
       setEvaluations(resEv.data.evaluations || []);
       setTeams(resTeams.data.teams || []);
     } catch(e) {
       console.error('Error fetching group data', e);
     } finally {
       setLoadingEv(false);
     }
  };

  const handleCreateTeam = async (e) => {
      e.preventDefault();
      if (!newTeamName.trim() || !selectedGroup) return;
      try {
          const res = await api.post('/groups/' + selectedGroup + '/teams', { name: newTeamName });
          setTeams([...teams, res.data.team]);
          setNewTeamName('');
          toast.success('Equipo creado.');
      } catch (err) {
          toast.error('Error al crear equipo');
      }
  };

  const handleAddMemberToTeam = async (teamId, userId) => {
      if (!userId) return;
      try {
          const res = await api.post('/teams/' + teamId + '/members', { user_id: userId });
          setTeams(teams.map(t => t.id === teamId ? res.data.team : t));
          toast.success('Miembro agregado');
      } catch (err) {
          toast.error('Error al agregar miembro');
      }
  };
  
  const handleRemoveMember = async (teamId, userId) => {
      try {
          const res = await api.delete('/teams/' + teamId + '/members/' + userId);
          setTeams(teams.map(t => t.id === teamId ? res.data.team : t));
          toast.success('Miembro removido');
      } catch(err) {
          toast.error('Error al remover miembro');
      }
  };
  
  const handleDeleteTeam = async (teamId) => {
      if (!window.confirm("¿Borrar este equipo?")) return;
      try {
          await api.delete('/teams/' + teamId);
          setTeams(teams.filter(t => t.id !== teamId));
      } catch(e) { toast.error('Error eliminando equipo'); }
  };
  

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/groups', newGroup);
      setGroups(prev => [res.data.group, ...prev]);
      setNewGroup({ name: '', description: '' });
      setShowGroupForm(false);
      toast.success('Grupo Creado exitosamente.', { icon: '✨' });
      if(!selectedGroup) {
        handleSelectGroup(res.data.group.id);
      }
    } catch (e) {
      console.error(e);
      toast.error('Error al crear el grupo.');
    }
  };

  const copyInviteLink = (inviteCode) => {
    if(!inviteCode) {
      toast.error('No hay código disponible.');
      return;
    }
    const link = window.location.origin + '/join/' + inviteCode;
    navigator.clipboard.writeText(link);
    toast.success("Enlace copiado al portapapeles!", { icon: '🔗' });
  };

    const handleDeleteGroup = async (groupId) => {
     if(!window.confirm("¿Seguro que deseas eliminar este grupo?")) return;
     try {
        await api.delete('/groups/' + groupId);
        setGroups(prev => prev.filter(g => g.id !== groupId));
        if(selectedGroup === groupId) {
           setSelectedGroup(null);
           setEvaluations([]);
        }
        alert("Grupo eliminado exitosamente.");
     } catch (err) {
        console.error(err);
        alert("Error al eliminar grupo. Permisos insuficientes.");
     }
  };

  const createEvaluation = async (e) => {
    e.preventDefault();
    if(!selectedGroup) return;
    try {
       const res = await api.post('/groups/' + selectedGroup + '/evaluations', newEval);
       setEvaluations(prev => [...prev, { ...res.data.evaluation, submissions: [] }]);
       setNewEval({ title: '', description: '', due_date: '' });
       toast.success('Nueva evaluación asignada.', { icon: '📚' });
    } catch(err) {
       console.error(err);
       toast.error('Error al crear la evaluación.');
    }
  };

  const gradeSubmission = async (submissionId, grade, feedback) => {
     try {
        const payload = { grade: parseFloat(grade) };
        if(feedback) payload.feedback = feedback;
        const res = await api.post('/submissions/' + submissionId + '/grade', payload);
        
        // Update local state cleanly
        setEvaluations(prevEval => prevEval.map(ev => ({
           ...ev,
           submissions: ev.submissions.map(sub => sub.id === submissionId ? res.data.submission : sub)
        })));
        toast.success('Calificación guardada exitosamente.', { icon: '📝' });
     } catch(err) {
        console.error(err);
        toast.error('Error asignando la nota.');
     }
  };

  const handleLogout = async () => {
    try { await api.post('/logout');} catch (err) {}
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
  };


  if (!user || (!user.is_admin && user.role !== 'admin')) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* <Toaster toastOptions={{ style: { background: "rgba(255, 255, 255, 0.4)", backdropFilter: "blur(16px)", color: "#1e293b", border: "1px solid rgba(255,255,255,0.5)", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", borderRadius: "1rem" } }} /> */}
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-white border-b md:border-b-0 md:border-r border-slate-200 p-4 md:p-6 flex flex-col shrink-0 z-10 sticky top-0 md:relative">
         <div className="flex flex-col md:flex-row items-center md:items-start gap-4 mb-4 md:mb-10 w-full">
            <div className="flex items-center gap-3 w-full justify-center md:justify-start">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-xl shadow-lg flex items-center justify-center font-bold text-xl shrink-0">VC</div>
              <div>
                 <h1 className="font-black text-slate-800 tracking-tight leading-none text-xl">Panel Admin</h1>
                 <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block mt-0.5">Gestión Total</span>
              </div>
            </div>
         </div>

         <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide pb-2 md:pb-0 flex-1 md:space-y-2.5 w-full items-center md:items-stretch">
           <button onClick={() => setActiveTab('summary')} className={"flex-1 md:w-full flex items-center justify-center md:justify-start gap-2 md:gap-3 px-4 py-2.5 md:py-3 text-sm font-semibold rounded-xl transition-colors " + (activeTab === 'summary' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')}>
             <BarChart3 className="w-4 h-4 md:w-5 md:h-5 shrink-0"/> <span>Resumen</span>
           </button>
           <button onClick={() => setActiveTab('grades')} className={"flex-1 md:w-full flex items-center justify-center md:justify-start gap-2 md:gap-3 px-4 py-2.5 md:py-3 text-sm font-semibold rounded-xl transition-colors " + (activeTab === 'grades' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')}>
             <GraduationCap className="w-4 h-4 md:w-5 md:h-5 shrink-0"/> <span>Notas y Grupos</span>
           </button>
         </nav>

         <div className="mt-2 md:mt-auto border-t border-slate-100 pt-3 md:pt-6 flex flex-row md:flex-col gap-2 w-full">
           <Link to="/" className="flex-1 md:w-full flex items-center justify-center md:justify-start gap-2 px-4 py-2.5 md:py-3 text-sm font-semibold text-slate-600 border border-slate-200 md:border-0 hover:bg-slate-100 hover:text-slate-900 rounded-xl transition-colors mb-0 md:mb-2">
             <ArrowLeft className="w-4 h-4 shrink-0" /> <span className="hidden md:inline">Volver</span>
           </Link>
           <button onClick={handleLogout} className="flex items-center justify-center md:justify-start gap-2 px-4 py-2.5 md:py-3 text-sm font-semibold text-red-600 border border-red-200 md:border-0 hover:bg-red-50 rounded-xl transition-colors flex-1 md:w-full">
             <LogOut className="w-4 h-4 shrink-0" /> <span className="hidden md:inline">Salir</span>
           </button>
         </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 overflow-y-auto w-full min-h-screen pb-20 md:pb-10">
        {activeTab === 'summary' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <header className="mb-6 md:mb-10 mt-2 md:mt-0 text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Datos en Tiempo Real</h1>
                <p className="text-xs md:text-sm font-medium text-slate-500 mt-1">Monitorea y administra la plataforma rápida.</p>
              </header>

              {loadingStats ? (
                <div className="flex items-center gap-3 text-slate-400 font-bold p-10"><BarChart3 className="animate-bounce" /> Cargando métricas...</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between hover:shadow-md transition-shadow">
                      <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Usuarios / Estudiantes</p>
                          <h3 className="text-4xl font-black text-slate-900">{stats.users}</h3>
                      </div>
                      <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center"><Users className="text-blue-600 w-6 h-6"/></div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between hover:shadow-md transition-shadow">
                      <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Clases / Grupos Creados</p>
                          <h3 className="text-4xl font-black text-slate-900">{stats.groups}</h3>
                      </div>
                      <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center"><GraduationCap className="text-emerald-600 w-6 h-6"/></div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between hover:shadow-md transition-shadow">
                      <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Publicaciones en Feed</p>
                          <h3 className="text-4xl font-black text-slate-900">{stats.posts}</h3>
                      </div>
                      <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center"><FileText className="text-purple-600 w-6 h-6"/></div>
                    </div>
                  </div>

                  {/* Student List View */}
                  <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                     <div className="bg-slate-50 border-b border-slate-200 p-5">
                       <h3 className="text-sm font-black tracking-wide text-slate-800 uppercase flex items-center gap-2"><Users className="w-4 h-4"/> Directorio de Estudiantes</h3>
                     </div>
                     <div className="p-0 overflow-x-auto max-h-[500px]">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                           <thead className="uppercase tracking-wider border-b border-slate-200 text-[10px] font-black text-slate-400 bg-white sticky top-0">
                              <tr>
                                 <th className="px-6 py-4">Usuario / Estudiante</th>
                                 <th className="px-6 py-4">Email</th>
                                 <th className="px-6 py-4">Fecha de Ingreso</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-50">
                              {stats.usersList?.map(u => (
                                 <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-3 flex items-center gap-3">
                                       <img src={'https://ui-avatars.com/api/?name=' + (u.name || '?') + '&background=random'} className="w-8 h-8 rounded-full shadow-sm" alt="av"/>
                                       <span className="font-bold text-slate-700">{u.name}</span>
                                    </td>
                                    <td className="px-6 py-3 text-slate-500 font-medium">{u.email}</td>
                                    <td className="px-6 py-3 text-slate-400 text-xs font-bold">{new Date(u.created_at).toLocaleDateString()}</td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </div>
                </>
              )}
          </div>
        )}

        {activeTab === 'grades' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl">
              <header className="mb-6 md:mb-8 flex flex-col md:flex-row items-center md:items-end md:justify-between gap-4 mt-2 md:mt-0 text-center md:text-left">
                <div>
                   <h1 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight flex flex-col md:flex-row items-center gap-2 md:gap-3 leading-tight md:leading-normal">
                      <BookOpen className="w-6 h-6 md:w-8 md:h-8 text-blue-600 shrink-0"/>
                      Admin Grupos y Notas
                   </h1>
                   <p className="text-xs md:text-sm font-medium text-slate-500 mt-1">Crea grupos, genera links y califica trabajos.</p>
                </div>
                <button onClick={() => setShowGroupForm(!showGroupForm)} className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-colors shadow-sm shrink-0">
                   {showGroupForm ? <ArrowLeft className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                   {showGroupForm ? 'Volver a lista' : 'Crear Grupo'}
                </button>
              </header>

              {showGroupForm && (
                 <div className="bg-white p-8 rounded-3xl shadow-sm border border-blue-200 mb-8 max-w-2xl animate-in slide-in-from-top-4">
                    <h2 className="text-xl font-black text-slate-800 mb-4">Crea una nueva clase</h2>
                    <form onSubmit={handleCreateGroup} className="space-y-4">
                       <div>
                         <label className="block text-xs font-bold text-slate-500 mb-1">Nombre de la Clase/Grupo</label>
                         <input type="text" required value={newGroup.name} onChange={e => setNewGroup({...newGroup, name: e.target.value})} className="w-full text-sm border-slate-200 rounded-lg p-3 bg-slate-50" placeholder="Ej. Historia y Sociedad 101" />
                       </div>
                       <div>
                         <label className="block text-xs font-bold text-slate-500 mb-1">Descripción corta (Opcional)</label>
                         <textarea rows="2" value={newGroup.description} onChange={e => setNewGroup({...newGroup, description: e.target.value})} className="w-full text-sm border-slate-200 rounded-lg p-3 bg-slate-50" placeholder="Aprender sobre el siglo XX..."></textarea>
                       </div>
                       <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-sm transition-colors shadow-sm">
                         Publicar Grupo y Generar Link
                       </button>
                    </form>
                 </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                 {/* Group Selector */}
                 <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden h-fit">
                    <div className="bg-slate-50 border-b border-slate-200 p-4">
                       <h3 className="text-sm font-black text-slate-800">Tus Grupos</h3>
                    </div>
                    <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                       {groups.length === 0 ? <p className="p-4 text-xs text-slate-400">Sin grupos creados</p> : null}
                       {groups.map(g => (
                         <div 
                           key={g.id} 
                           className={"transition-colors border-l-4 " + (selectedGroup === g.id ? 'bg-blue-50 border-blue-600' : 'border-transparent hover:bg-slate-50')}
                         >
                            <div className="p-4 cursor-pointer" onClick={() => handleSelectGroup(g.id)}>
                               <div className="flex justify-between items-center w-full">
                                  <h4 className="font-bold text-sm text-slate-800 line-clamp-1">{g.name}</h4>
                                  {(user?.is_admin || user?.role === 'admin') && (
                                     <button onClick={(e) => { e.stopPropagation(); handleDeleteGroup(g.id); }} className="text-red-400 hover:text-red-700 hover:bg-red-50 rounded p-1 transition" title="Eliminar este grupo definitivamente">
                                         <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                                     </button>
                                  )}
                               </div>
                               <div className="flex items-center justify-between mt-1">
                                  <p className="text-[11px] text-slate-500 font-medium">{g.members_count || 0} Miembros unidos</p>
                                  {g.invite_code && (
                                     <div 
                                       className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 transition px-2 py-0.5 rounded cursor-pointer group/copy"
                                       title="Copiar código de inscripción"
                                       onClick={() => {
                                          navigator.clipboard.writeText(g.invite_code);
                                          toast.success('Código '+g.invite_code+' copiado!');
                                       }}
                                     >
                                        <span className="text-[10px] font-black text-slate-700 font-mono tracking-wider">{g.invite_code}</span>
                                        <Copy className="w-3 h-3 text-slate-400 group-hover/copy:text-blue-500" />
                                     </div>
                                  )}
                               </div>
                            </div>
                            
                            {/* Invite Code Sub-Section for the selected group */}
                            {selectedGroup === g.id && g.invite_code && (
                               <div className="px-4 pb-4">
                                  <button onClick={(e) => { e.stopPropagation(); copyInviteLink(g.invite_code); }} className="w-full py-1.5 px-3 bg-white border border-slate-200 rounded-md text-[10px] font-bold text-slate-600 flex items-center justify-center gap-1.5 hover:bg-slate-50 hover:text-blue-600 transition">
                                     <LinkIcon className="w-3 h-3" /> Copiar Link de Unión
                                  </button>
                               </div>
                            )}

                            {/* Expanded Students List under selected group */}
                            {selectedGroup === g.id && g.members && g.members.length > 0 && (
                               <div className="px-4 pb-4">
                                  <p className="text-[10px] font-black uppercase text-slate-400 mb-2 border-t border-slate-200 pt-2">Alumnos Registrados:</p>
                                  <ul className="space-y-1.5">
                                     {g.members.map(member => (
                                        <li key={member.id} className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                                           <img src={'https://ui-avatars.com/api/?name=' + (member.name || '?') + '&size=24'} className="w-4 h-4 rounded-full" alt="av"/> 
                                           <span>{member.name}</span>
                                        </li>
                                     ))}
                                  </ul>
                               </div>
                            )}
                         </div>
                       ))}
                    </div>
                 </div>

                 {/* Content Viewer */}
                 <div className="lg:col-span-3 space-y-6">
                    {selectedGroup ? (
                      <>
                        {/* Teams Section */}
                        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
                           <h3 className="font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2"><Users className="w-5 h-5 text-blue-600"/> Subgrupos / Equipos de Trabajo</h3>
                           
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                              {teams.map(team => (
                                <div key={team.id} className="border border-slate-200 rounded-xl p-4 relative bg-slate-50 relative group/team">
                                    <h4 className="font-black text-slate-700 text-sm mb-2">{team.name}</h4>
                                    <button onClick={() => handleDeleteTeam(team.id)} className="absolute top-2 right-2 text-red-400 hover:text-red-700 opacity-0 md:opacity-100"><LogOut className="w-3 h-3" /></button>
                                    <div className="space-y-1 mb-3 min-h-[40px]">
                                       {team.members?.map(m => (
                                          <div key={m.id} className="text-xs flex items-center justify-between bg-white px-2 py-1 rounded border border-slate-100">
                                            <span className="truncate pr-2">- {m.name}</span>
                                            <button onClick={() => handleRemoveMember(team.id, m.id)} className="text-red-400 hover:text-red-600"><LogOut className="w-3 h-3"/></button>
                                          </div>
                                       ))}
                                       {(!team.members || team.members.length === 0) && <p className="text-[10px] text-slate-400">Sin miembros</p>}
                                    </div>
                                    <div className="mt-auto">
                                       <select 
                                         className="w-full text-xs p-1.5 border border-slate-200 rounded bg-white" 
                                         onChange={(e) => { handleAddMemberToTeam(team.id, e.target.value); e.target.value=''; }}
                                         defaultValue=""
                                       >
                                         <option value="" disabled>+ Añadir miembro...</option>
                                         {(groups.find(g => g.id === selectedGroup)?.members || [])
                                            .filter(gm => !(team.members?.find(tm => tm.id === gm.id)))
                                            .map(m => (
                                              <option key={m.id} value={m.id}>{m.name}</option>
                                         ))}
                                       </select>
                                    </div>
                                </div>
                              ))}
                           </div>

                           <form onSubmit={handleCreateTeam} className="flex flex-col sm:flex-row gap-2">
                              <input type="text" required value={newTeamName} onChange={e => setNewTeamName(e.target.value)} className="flex-1 text-sm border-slate-200 rounded-lg p-2.5 bg-slate-50" placeholder="Ej. Equipo 1, Los Pumas..." />
                              <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm transition-colors shadow-sm shrink-0 flex justify-center items-center gap-2">
                                <Plus className="w-4 h-4"/> Crear Equipo
                              </button>
                           </form>
                        </div>

                        {/* Evaluations Viewer */}

                        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
                           <h3 className="font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">Crear Tarea / Evaluación</h3>
                           <form onSubmit={createEvaluation} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="col-span-2">
                                <label className="block text-xs font-bold text-slate-500 mb-1">Título de la Evaluación</label>
                                <input type="text" required value={newEval.title} onChange={e => setNewEval({...newEval, title: e.target.value})} className="w-full text-sm border-slate-200 rounded-lg p-2.5 bg-slate-50" placeholder="Ej. Ensayo sobre la Ilustración" />
                              </div>
                              <div className="col-span-2">
                                <label className="block text-xs font-bold text-slate-500 mb-1">Instrucciones</label>
                                <textarea rows="2" value={newEval.description} onChange={e => setNewEval({...newEval, description: e.target.value})} className="w-full text-sm border-slate-200 rounded-lg p-2.5 bg-slate-50"  placeholder="Tienen que subir un reporte..."></textarea>
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Fecha de Entrega (Opcional)</label>
                                <input type="datetime-local" value={newEval.due_date} onChange={e => setNewEval({...newEval, due_date: e.target.value})} className="w-full text-sm border-slate-200 rounded-lg p-2.5 bg-slate-50" />
                              </div>
                              <div className="flex items-end justify-end">
                                <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm transition-colors cursor-pointer w-full md:w-auto shadow-sm">
                                  Asignar Tarea al Grupo
                                </button>
                              </div>
                           </form>
                        </div>

                        {loadingEv ? (
                          <div className="p-10 text-center flex flex-col items-center justify-center text-blue-500">
                             <span className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></span>
                             <span className="text-sm font-bold text-slate-500">Cargando Calificaciones...</span>
                          </div>
                        ) : (
                           <div className="space-y-4">
                             <h3 className="text-sm font-black tracking-wide text-slate-800 uppercase mt-8 mb-4">Trabajos Entregados y Notas</h3>
                             {evaluations.length === 0 && <p className="text-sm text-slate-500 flex items-center gap-2"><BookOpen className="w-4 h-4"/> No has asignado tareas para este grupo aún.</p>}
                             
                             {evaluations.map(ev => (
                               <div key={ev.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                                  <div className="bg-slate-800 p-5 text-white">
                                     <h4 className="font-bold text-lg">{ev.title}</h4>
                                     <p className="text-slate-300 text-sm mt-1">{ev.description || 'Sin descripción'}</p>
                                  </div>
                                  
                                  <div className="p-0 bg-slate-50 flex-1 overflow-x-auto">
                                     <table className="w-full text-left text-sm whitespace-nowrap min-w-[700px]">
                                        <thead className="uppercase tracking-wider border-b border-slate-200 text-[10px] font-black text-slate-400 bg-white">
                                           <tr>
                                              <th className="px-5 py-3">Estudiante Entregó</th>
                                              <th className="px-5 py-3">Archivo del Trabajo</th>
                                              <th className="px-5 py-3 w-32">Puntuación (0-100)</th>
                                              <th className="px-5 py-3 w-48">Comentarios (Feedback)</th>
                                              <th className="px-5 py-3">Confirmar</th>
                                           </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {ev.submissions?.length === 0 && (
                                              <tr><td colSpan="5" className="px-5 py-6 text-center text-slate-400 font-medium">Nadie ha subido trabajos aquí.</td></tr>
                                            )}
                                            {ev.submissions?.map(sub => (
                                              <tr key={sub.id} className="hover:bg-white transition-colors bg-slate-50/50">
                                                 <td className="px-5 py-3 flex items-center gap-2 font-semibold text-slate-700">
                                                   <img src={'https://ui-avatars.com/api/?name=' + (sub.user?.name || '?')} className="w-6 h-6 rounded-full" alt="av"/>
                                                   {sub.user?.name}
                                                 </td>
                                                 <td className="px-5 py-3">
                                                    <a href={'http://localhost:8000/storage/' + sub.file_path} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded font-bold text-xs transition">
                                                      <Download className="w-3.5 h-3.5" /> Abrir Documento
                                                    </a>
                                                 </td>
                                                 <td className="px-5 py-3">
                                                   <input type="number" min="0" max="100" defaultValue={sub.grade || ''} 
                                                          id={"grade-"+sub.id}
                                                          className="w-16 p-1.5 border border-slate-200 rounded text-center text-sm font-bold bg-white focus:ring-blue-500 focus:border-blue-500" />
                                                 </td>
                                                 <td className="px-5 py-3">
                                                   <input type="text" placeholder="Excelente..." defaultValue={sub.feedback || ''}
                                                          id={"feedback-"+sub.id}
                                                          className="w-full min-w-[120px] p-1.5 border border-slate-200 rounded text-xs bg-white focus:ring-blue-500" />
                                                 </td>
                                                 <td className="px-5 py-3">
                                                   <button onClick={() => gradeSubmission(sub.id, document.getElementById('grade-'+sub.id).value, document.getElementById('feedback-'+sub.id).value)} className="w-8 h-8 flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white rounded-full transition shadow-sm">
                                                      <CheckCircle className="w-4 h-4" />
                                                   </button>
                                                 </td>
                                              </tr>
                                            ))}
                                        </tbody>
                                     </table>
                                  </div>
                               </div>
                             ))}
                           </div>
                        )}
                      </>
                    ) : (
                      <div className="bg-white border border-slate-200 border-dashed rounded-3xl p-16 text-center shadow-sm">
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                           <GraduationCap className="w-10 h-10 text-blue-500" />
                        </div>
                        <h2 className="text-xl font-black text-slate-800">Crea o Selecciona un Grupo</h2>
                        <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">Toca <strong className="font-bold text-slate-700">Crear Nuevo Grupo</strong> arriba o selecciona uno en el panel izquierdo para gestionar las notas y enviar el link de invitación a los estudiantes.</p>
                      </div>
                    )}
                 </div>
              </div>
          </div>
        )}
      </main>
    </div>
  );
}