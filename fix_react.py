with open("src/pages/AdminDashboard.jsx", "r", encoding="utf-8") as f:
    text = f.read()

# Add states
old_states = """  const [loadingEv, setLoadingEv] = useState(false);
  const [newEval, setNewEval] = useState({ title: '', description: '', due_date: '' });"""
new_states = """  const [loadingEv, setLoadingEv] = useState(false);
  const [newEval, setNewEval] = useState({ title: '', description: '', due_date: '' });
  const [teams, setTeams] = useState([]);
  const [newTeamName, setNewTeamName] = useState('');"""
text = text.replace(old_states, new_states)

# Update handleSelectGroup
old_hsg = """  const handleSelectGroup = async (groupId) => {
     setSelectedGroup(groupId);
     setLoadingEv(true);
     try {
       const res = await api.get('/groups/' + groupId + '/evaluations');
       setEvaluations(res.data.evaluations || []);
     } catch(e) {
       console.error('Error fetching evaluations', e);
     } finally {
       setLoadingEv(false);
     }
  };"""
new_hsg = """  const handleSelectGroup = async (groupId) => {
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
  """
text = text.replace(old_hsg, new_hsg)

# Update DOM
old_dom = """                 {/* Evaluations Viewer */}
                 <div className="lg:col-span-3 space-y-6">
                    {selectedGroup ? ("""

new_dom = """                 {/* Content Viewer */}
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
"""
text = text.replace(old_dom, new_dom)

with open("src/pages/AdminDashboard.jsx", "w", encoding="utf-8") as f:
    f.write(text)
