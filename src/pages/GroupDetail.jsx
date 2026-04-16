import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useSWR from 'swr';
import api from '../api';
import { Users, FileText, ChevronLeft, Image as ImageIcon, Send, X, Heart, MessageCircle, FileBadge, CheckCircle, Clock } from 'lucide-react';
import GroupPost from '../components/GroupPost';
import { toAssetUrl } from '../utils/assetUrl';

const fetcher = url => api.get(url).then(res => res.data);

export default function GroupDetail({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, error, isLoading, mutate } = useSWR(`/groups/${id}`, fetcher);
  const { data: evaluationsData, mutate: mutateEvals } = useSWR(`/groups/${id}/evaluations`, fetcher);

  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'units'

  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  // Estados Formulario Unidad/Evaluacion
  const [unitTitle, setUnitTitle] = useState('');
  const [unitDesc, setUnitDesc] = useState('');
  const [unitMaxGrade, setUnitMaxGrade] = useState(100);
  const [unitFile, setUnitFile] = useState(null);
  const [unitIsSubmitting, setUnitIsSubmitting] = useState(false);
  const unitFileRef = useRef(null);
  const [showUnitForm, setShowUnitForm] = useState(false);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const removeImage = () => {
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!content.trim() && !image) return;
    
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('body', content);
      formData.append('group_id', id);
      if (image) {
        formData.append('file', image);
      }
      
      await api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setContent('');
      setImage(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      await mutate();
    } catch (error) {
      console.error('Error creating post', error);
      alert('Error publicando el mensaje. Revisa tu conexión o el tamaño del archivo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateUnit = async (e) => {
    e.preventDefault();
    if (!unitTitle.trim()) return;
    setUnitIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('title', unitTitle);
      fd.append('max_grade', unitMaxGrade);
      if(unitDesc) fd.append('description', unitDesc);
      if(unitFile) fd.append('file', unitFile);
      
      await api.post(`/groups/${id}/evaluations`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      
      setUnitTitle('');
        setUnitDesc('');
        setUnitMaxGrade(100);
      setUnitFile(null);
      setShowUnitForm(false);
      if (unitFileRef.current) unitFileRef.current.value = '';
      await mutateEvals();
    } catch (e) {
      console.error(e);
      alert('Error al crear la unidad educativa.');
    } finally {
      setUnitIsSubmitting(false);
    }
  };

  if (isLoading) return (
    <div className="flex justify-center items-center py-20">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (error) return (
    <div className="text-center py-12">
      <p className="text-red-500">No se pudo cargar el grupo. Verifica tus permisos.</p>
      <button onClick={() => navigate('/feed')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Volver al Inicio</button>
    </div>
  );

  const group = data?.group;
  const posts = data?.posts;
  const userTeam = data?.userTeam;
  const evaluations = evaluationsData?.evaluations || [];
  const isTeacher = user?.id === group?.created_by || user?.role === 'admin';

  return (
    <div className="max-w-3xl mx-auto py-6 slide-in">
      <button 
        onClick={() => navigate('/groups')}
        className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Volver a Mis Grupos
      </button>

      {/* Cabecera Corporativa del Grupo */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 mb-6">
         <div className="h-32 bg-gradient-to-r from-blue-700 to-blue-900 relative">
            <div className="absolute inset-0 bg-blue-900/20 backdrop-blur-[2px]"></div>
         </div>
         <div className="px-6 pb-6 relative">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 -mt-10">
               <div className="flex items-end gap-4">
                  <div className="w-24 h-24 bg-white p-1.5 rounded-xl shadow-md z-10 shrink-0">
                    <div className="w-full h-full bg-blue-50 rounded-lg flex items-center justify-center border border-blue-100">
                      <span className="text-3xl font-black text-blue-600">{(group?.name || 'G').substring(0, 2).toUpperCase()}</span>
                    </div>
                  </div>
                  <div className="mb-1">
                     <h1 className="text-2xl font-black text-gray-900 leading-tight">{group?.name}</h1>
                        {userTeam && (
                           <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                              <Users className="w-3.5 h-3.5 mr-1" />
                              Equipo: {userTeam.name}
                           </div>
                        )}
                     <p className="text-sm font-medium text-gray-500 capitalize flex items-center gap-1.5 mt-1">
                        <Users className="w-3.5 h-3.5" /> Generación Académica
                     </p>
                  </div>
               </div>
            </div>
            
            {group?.description && (
               <div className="mt-5 text-sm text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100">
                 {group.description}
               </div>
            )}
         </div>

         {/* Pestañas Navegación */}
         <div className="flex flex-row overflow-x-auto whitespace-nowrap scrollbar-hide border-t border-gray-100 mt-2 rounded-b-2xl">
            <button onClick={() => setActiveTab('feed')} className={`flex-1 py-3 text-sm font-bold text-center border-b-2 transition-colors ${activeTab === 'feed' ? 'border-blue-600 text-blue-700 bg-blue-50/50' : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}>Muro de Publicaciones</button>
            <button onClick={() => setActiveTab('units')} className={`flex-1 py-3 text-sm font-bold text-center border-b-2 transition-colors ${activeTab === 'units' ? 'border-blue-600 text-blue-700 bg-blue-50/50' : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}>Unidades y Calificaciones</button>
         </div>
      </div>

      {activeTab === 'feed' && (
        <div className="animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-sm mb-6">
            <div className="flex gap-3 mb-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                <img src={user?.avatar_url ? toAssetUrl(user.avatar_url) : `https://ui-avatars.com/api/?name=${user?.name}&background=f3f4f6`} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Comparte algo con el grupo..."
                  className="w-full bg-transparent resize-none focus:outline-none min-h-[60px] text-gray-800 text-[15px] placeholder:text-gray-400"
                  rows="2"
                />
              </div>
            </div>

            {image && (
              <div className="ml-13 mb-4 relative inline-block">
                {image.type.startsWith('video/') ? (
                  <video src={URL.createObjectURL(image)} className="h-32 rounded-lg object-cover border border-gray-200" />
                ) : image.type.includes('pdf') || image.type.includes('doc') ? (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg pr-8">
                     <FileText className="w-5 h-5 text-blue-600" />
                     <span className="text-sm font-bold text-gray-800 truncate max-w-[200px]">{image.name}</span>
                  </div>
                ) : (
                  <img src={URL.createObjectURL(image)} alt="Preview" className="h-32 rounded-lg object-cover border border-gray-200" />
                )}
                <button
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full p-1 shadow-md hover:bg-red-500 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex gap-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*,video/*,.pdf,.doc,.docx"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-blue-600 transition-colors text-sm font-medium"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Adjuntar</span>
                </button>
              </div>
              <button
                onClick={handleCreatePost}
                disabled={isSubmitting || (!content.trim() && !image)}
                className="px-5 py-2 bg-blue-600 text-white rounded-full font-bold text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center gap-2"
              >
                {isSubmitting ? 'Publicando...' : 'Publicar'}
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {posts?.data?.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-200 border-dashed">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-gray-100">
                <Users className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-gray-900 font-bold mb-1">Aún no hay publicaciones</h3>
              <p className="text-gray-500 text-sm">Sé el primero en compartir contenido formalmente.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {posts?.data?.map(post => (
                <GroupPost key={post.id} post={post} user={user} mutate={mutate} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'units' && (
         <div className="animate-in fade-in duration-300">
            {isTeacher && (
               <div className="mb-6 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                  <div 
                    onClick={() => setShowUnitForm(!showUnitForm)}
                    className="bg-slate-50 px-6 py-4 flex justify-between items-center cursor-pointer border-b border-gray-100 hover:bg-slate-100 transition"
                  >
                     <div>
                        <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                           <FileBadge className="w-5 h-5 text-blue-600" />
                           Crear Unidad / Evaluación
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">Asigna un tema, adjunta PDF y recibe las entregas de los estudiantes.</p>
                     </div>
                     <button className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold shadow-sm">{showUnitForm ? 'Cancelar' : 'Nueva Unidad'}</button>
                  </div>
                  
                  {showUnitForm && (
                     <form onSubmit={handleCreateUnit} className="p-6 bg-white">
                        <div className="space-y-4">
                           <div>
                             <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Título del Tema</label>
                             <input type="text" value={unitTitle} onChange={e=>setUnitTitle(e.target.value)} required className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 text-sm shadow-sm" placeholder="Ej: Unidad 1: Fundamentos..." />
                           </div>
                           <div>
                             <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Instrucciones y Descripción</label>
                             <textarea value={unitDesc} onChange={e=>setUnitDesc(e.target.value)} required className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 text-sm shadow-sm" rows="3" placeholder="Sube tus entregas en formato PDF antes de la siguiente clase..."></textarea>
                           </div>
                           <div>
                             <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Material Didáctico (Opcional)</label>
                             <input type="file" ref={unitFileRef} onChange={e => setUnitFile(e.target.files[0])} accept=".pdf,.doc,.docx" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                           </div>
                           <button disabled={unitIsSubmitting} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition">Confirmar y Publicar Unidad</button>
                        </div>
                     </form>
                  )}
               </div>
            )}

            <div className="space-y-5">
               {evaluations.length === 0 ? (
                  <div className="text-center py-12 px-4 bg-white rounded-3xl border border-slate-100 shadow-sm">
                     <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
                       <FileBadge className="w-8 h-8 text-blue-400" />
                     </div>
                     <h3 className="text-xl font-bold text-slate-800 mb-2">No hay unidades activas</h3>
                     <p className="text-slate-500 font-medium text-sm max-w-sm mx-auto">La profesora todavía no ha subido temas, material didáctico o asignaciones de curso.</p>
                  </div>
               ) : evaluations.map(unit => (
                  <UnitCard key={unit.id} unit={unit} isTeacher={isTeacher} user={user} mutateEvals={mutateEvals} userTeam={userTeam} />
               ))}
            </div>
         </div>
      )}
    </div>
  );
}

function UnitCard({ unit, isTeacher, user, mutateEvals, userTeam }) {
   const [uploading, setUploading] = useState(false);
   const [studentFile, setStudentFile] = useState(null);
   const [showTeacherSub, setShowTeacherSub] = useState(false);

   // Grading
   const [gradeSubIdx, setGradeSubIdx] = useState(null);
   const [gradeInput, setGradeInput] = useState('');
   
   const ref = useRef(null);

   const myTeamIds = userTeam ? userTeam.members.map(m => m.id) : [user.id];
   const mySubmission = unit.submissions?.find(s => myTeamIds.includes(s.user_id));

   const handleTurnIn = async (e) => {
      e.preventDefault();
      if(!studentFile) return;
      setUploading(true);
      try {
         const fd = new FormData();
         fd.append('file', studentFile);
         await api.post(`/evaluations/${unit.id}/submissions`, fd, { headers: { 'Content-Type': 'multipart/form-data' }});
         alert('Trabajo enviado con éxito.');
         await mutateEvals();
      } catch(e) { console.error(e); alert('Error al enviar el archivo.'); }
      finally { setUploading(false); }
   };

   const handleGrade = async (subId, maxGrade = 100) => {
      if(!gradeInput) return;
      if(parseFloat(gradeInput) < 0 || parseFloat(gradeInput) > maxGrade) {
          alert(`La calificación debe estar entre 0 y ${maxGrade}`);
          return;
      }
      try {
         await api.post(`/submissions/${subId}/grade`, { grade: gradeInput, feedback: "Calificado automáticamente" });
         setGradeSubIdx(null); setGradeInput('');
         await mutateEvals();
      } catch(e) { console.error(e); alert('Error al calificar'); }
   };

   return (
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden group">
          <div className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-slate-50 border-b border-gray-100">
             <div className="flex gap-4 mb-4 md:mb-0">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-200 flex items-center justify-center shrink-0 text-blue-600">
                   <Clock className="w-6 h-6" />
                </div>
                <div>
                   <h2 className="text-lg font-black text-slate-800 leading-tight">{unit.title}</h2>
                   <div className="mt-1 flex gap-3 text-xs font-bold text-slate-500 uppercase">
                     <span>Unidad Evaluativa</span>
                     <span>&#8226;</span>
                     <span>{unit.submissions?.length || 0} Entregas</span>
                   </div>
                </div>
             </div>
             {unit.file_path && (
                <a href={toAssetUrl(unit.file_path)} target="_blank" rel="noreferrer" className="w-full md:w-auto text-center px-4 py-2 bg-white border border-blue-200 text-blue-700 text-sm font-bold rounded-xl shadow-sm hover:bg-blue-50 transition">
                   Ver Material Adjunto
                </a>
             )}
          </div>
          
          {unit.description && (
             <div className="p-6 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
               {unit.description}
             </div>
          )}

          {!isTeacher && (
             <div className="p-6 bg-white border-t border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                {mySubmission ? (
                   <div className="w-full">
                      {mySubmission.grade ? (
                         <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-3 w-full">
                             <div className="flex gap-3 items-center">
                                <CheckCircle className="w-6 h-6 text-emerald-600" />
                                <div><p className="text-sm font-bold text-emerald-800">Calificado - ¡Felicidades!</p><p className="text-xs text-emerald-600 font-medium">El profesor ha emitido tu calificación.</p></div>
                             </div>
                             <div className="text-3xl font-black text-emerald-700">{mySubmission.grade}/100</div>
                         </div>
                      ) : (
                         <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center w-full">
                             <Clock className="w-5 h-5 text-amber-600" />
                             <div><p className="text-sm font-bold text-amber-800">{mySubmission.user_id !== user.id ? 'Subido por tu equipo (${mySubmission.user?.name || "Companero"}). ' : 'Trabajo Entregado. '} Pendiente de calificación.</p></div>
                         </div>
                      )}
                   </div>
                ) : (
                   <form onSubmit={handleTurnIn} className="flex flex-col sm:flex-row gap-3 w-full">
                       <input type="file" ref={ref} onChange={e=>setStudentFile(e.target.files[0])} accept=".pdf,.doc,.docx" required className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-slate-200 rounded-lg p-1.5" />
                       <button className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold text-sm shadow-sm hover:bg-blue-700 shrink-0 inline-flex items-center justify-center disabled:opacity-50" disabled={uploading}>
                          {uploading ? 'Enviando...' : 'Subir Respuesta'}
                       </button>
                   </form>
                )}
             </div>
          )}

          {isTeacher && (
             <div className="border-t border-gray-100 bg-slate-50">
                <button onClick={()=>setShowTeacherSub(!showTeacherSub)} className="w-full px-4 sm:px-6 py-4 flex justify-between items-center text-sm font-bold text-slate-700 hover:bg-slate-100 transition">
                   <span>Ver Entregas de Alumnos ({unit.submissions?.length || 0})</span>
                   <ChevronLeft className={`w-4 h-4 transition-transform ${showTeacherSub ? '-rotate-90' : ''}`} />
                </button>
                {showTeacherSub && unit.submissions?.length > 0 && (
                   <div className="p-6 pt-0 space-y-3">
                      {unit.submissions.map(sub => (
                         <div key={sub.id} className="bg-white p-4 border border-gray-200 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
                             <div className="flex gap-3 w-full md:w-auto items-center">
                                <img src={sub.user?.avatar_url ? toAssetUrl(sub.user.avatar_url) : `https://ui-avatars.com/api/?name=${sub.user?.name}&background=f3f4f6`} className="w-10 h-10 rounded-full object-cover" alt="av" />
                                <div>
                                   <p className="text-sm font-bold text-slate-800 leading-none">{sub.user?.name} <span className="text-xs text-blue-600 ml-1">{sub.user?.teams?.length > 0 ? ('' + sub.user.teams[0].name + '') : ''}</span></p>
                                   <a href={toAssetUrl(sub.file_path)} target="_blank" rel="noreferrer" className="text-xs text-blue-600 font-bold hover:underline mt-1 inline-block">Ver Documento Entregado</a>
                                </div>
                             </div>
                             
                             <div className="flex gap-2 w-full md:w-auto justify-end">
                                {sub.grade ? (
                                   <span className="bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-lg text-sm font-black border border-emerald-200">Nota: {sub.grade}/100</span>
                                ) : (
                                   <>
                                      {gradeSubIdx === sub.id ? (
                                         <div className="flex flex-wrap lg:flex-nowrap gap-2 items-center w-full sm:w-auto">
                                            <input type="number" min="0" step="0.01" max={unit.max_grade || 100} value={gradeInput} onChange={e=>setGradeInput(e.target.value)} placeholder={`/${unit.max_grade || 100}`} className="w-20 px-3 py-1 border border-slate-300 rounded-lg text-sm font-bold" />
                                            <button onClick={()=>handleGrade(sub.id, unit.max_grade || 100)} className="bg-blue-600 px-4 py-1 flex items-center text-white rounded-lg text-xs font-bold hover:bg-blue-700">Guardar</button>
                                            <button onClick={()=>setGradeSubIdx(null)} className="text-slate-400 hover:text-slate-600 px-2"><X className="w-4 h-4"/></button>
                                         </div>
                                      ) : (
                                         <button onClick={()=>setGradeSubIdx(sub.id)} className="bg-slate-900 border border-slate-900 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-800 transition">Calificar Oportunidad</button>
                                      )}
                                   </>
                                )}
                             </div>
                         </div>
                      ))}
                   </div>
                )}
             </div>
          )}
      </div>
   );
}
